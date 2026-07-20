// With a remote Turso URL use the fetch-based web client — pure JS, no native
// bindings, which is what serverless bundlers (Vercel) can actually ship. The
// default client (which supports file: URLs) is only needed for local files.
const { createClient } = process.env.TURSO_DATABASE_URL
  ? require('@libsql/client/web')
  : require('@libsql/client');
const bcrypt = require('bcryptjs');
const path = require('path');

// Connection: Turso (hosted) when TURSO_DATABASE_URL is set, otherwise a local
// SQLite file — DB_PATH override lets tests run against an isolated database.
const url = process.env.TURSO_DATABASE_URL
  || `file:${process.env.DB_PATH || path.join(__dirname, 'ehealthwatch.db')}`;

const client = createClient({
  url,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// ─── Thin async wrapper mirroring the better-sqlite3 call shape ──────────────
// Every call site does `await db.prepare(sql).get/all/run(...)`.
function rowToObject(columns, row) {
  const obj = {};
  for (let i = 0; i < columns.length; i++) obj[columns[i]] = row[i];
  return obj;
}

const db = {
  prepare(sql) {
    return {
      async get(...args) {
        const rs = await client.execute({ sql, args });
        return rs.rows.length ? rowToObject(rs.columns, rs.rows[0]) : undefined;
      },
      async all(...args) {
        const rs = await client.execute({ sql, args });
        return rs.rows.map(r => rowToObject(rs.columns, r));
      },
      async run(...args) {
        const rs = await client.execute({ sql, args });
        return {
          changes: rs.rowsAffected,
          lastInsertRowid: rs.lastInsertRowid !== undefined ? Number(rs.lastInsertRowid) : undefined,
        };
      },
    };
  },
  async exec(sql) {
    await client.executeMultiple(sql);
  },
  // Atomic multi-statement write (replaces better-sqlite3's db.transaction)
  async batch(statements) {
    return client.batch(statements.map(s => ({ sql: s.sql, args: s.args || [] })), 'write');
  },
};

// ─── Schema, migrations, and seeding (runs once per process) ─────────────────
async function init() {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS bmdlogin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      pwd TEXT NOT NULL,
      expirydate TEXT,
      limitavailable INTEGER DEFAULT 999
    );

    CREATE TABLE IF NOT EXISTS bmd (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      age TEXT,
      height TEXT,
      weight TEXT,
      hal TEXT,
      nsa TEXT,
      guid TEXT UNIQUE
    );

    CREATE TABLE IF NOT EXISTS consumers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT,
      consent_given_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS consumer_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      consumer_id INTEGER NOT NULL,
      display_name TEXT NOT NULL,
      relationship_label TEXT DEFAULT 'Self',
      date_of_birth TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (consumer_id) REFERENCES consumers(id)
    );

    CREATE TABLE IF NOT EXISTS consumer_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      consumer_id INTEGER NOT NULL,
      profile_id INTEGER NOT NULL,
      product_code TEXT DEFAULT 'menopause_forecast',
      amount_paise INTEGER DEFAULT 4900,
      status TEXT DEFAULT 'created',
      gateway_order_id TEXT,
      gateway_payment_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      paid_at DATETIME,
      FOREIGN KEY (consumer_id) REFERENCES consumers(id),
      FOREIGN KEY (profile_id) REFERENCES consumer_profiles(id)
    );

    CREATE TABLE IF NOT EXISTS mp_results_v2 (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER UNIQUE,
      profile_id INTEGER NOT NULL,
      input_json TEXT,
      result_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES consumer_orders(id),
      FOREIGN KEY (profile_id) REFERENCES consumer_profiles(id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      sid        TEXT PRIMARY KEY,
      sess       TEXT NOT NULL,
      expires_at INTEGER NOT NULL
    );
  `);

  // Column migrations (safe no-ops when the column already exists)
  const addColumn = async (sql) => { try { await db.exec(sql); } catch (_) {} };
  await addColumn("ALTER TABLE consumers ADD COLUMN email_verified INTEGER DEFAULT 0");
  await addColumn("ALTER TABLE consumers ADD COLUMN verification_token TEXT");
  await addColumn("ALTER TABLE consumers ADD COLUMN verification_token_expires DATETIME");
  await addColumn("ALTER TABLE consumers ADD COLUMN reset_token TEXT");
  await addColumn("ALTER TABLE consumers ADD COLUMN reset_token_expires DATETIME");
  await addColumn("ALTER TABLE bmdlogin ADD COLUMN disabled INTEGER DEFAULT 0");
  await addColumn("ALTER TABLE bmd ADD COLUMN clinic_username TEXT");
  await addColumn("ALTER TABLE bmd ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP");

  // Seed a default clinic user if none exists — bcrypt-hashed from the start
  const existing = await db.prepare("SELECT COUNT(*) as cnt FROM bmdlogin").get();
  if (existing.cnt === 0) {
    const defaultHash = bcrypt.hashSync('admin123', 12);
    await db.prepare(
      "INSERT INTO bmdlogin (username, pwd, expirydate, limitavailable) VALUES ('admin', ?, '2099-12-31', 999)"
    ).run(defaultHash);
    console.log('Database seeded with default clinic account: admin (password hashed)');
  }

  // One-time migration: hash any bmdlogin passwords still stored as plain text
  const allLogins = await db.prepare("SELECT id, pwd FROM bmdlogin").all();
  const plainRows = allLogins.filter(r => r.pwd && !r.pwd.startsWith('$2'));
  if (plainRows.length > 0) {
    await db.batch(plainRows.map(row => ({
      sql: 'UPDATE bmdlogin SET pwd = ? WHERE id = ?',
      args: [bcrypt.hashSync(row.pwd, 12), row.id],
    })));
    console.log(`[DB] Migrated ${plainRows.length} plain-text bmdlogin password(s) to bcrypt hashes`);
  }
}

// Memoized: server code awaits db.ready before serving requests, so schema
// setup runs exactly once per process (including serverless cold starts).
db.ready = init().catch(err => {
  console.error('[DB] Initialisation failed:', err);
  throw err;
});

module.exports = db;
