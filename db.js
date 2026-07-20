const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

// DB_PATH override lets tests run against an isolated throwaway database
const db = new Database(process.env.DB_PATH || path.join(__dirname, 'ehealthwatch.db'));

// Create tables
db.exec(`
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
`);

// Consumer account tables
db.exec(`
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
`);

// Add email_verified column if it doesn't exist yet (safe for both fresh and existing DBs)
try { db.exec("ALTER TABLE consumers ADD COLUMN email_verified INTEGER DEFAULT 0"); } catch (_) {}
try { db.exec("ALTER TABLE consumers ADD COLUMN verification_token TEXT"); } catch (_) {}
try { db.exec("ALTER TABLE consumers ADD COLUMN verification_token_expires DATETIME"); } catch (_) {}

// Password reset token columns (same pattern as verification above)
try { db.exec("ALTER TABLE consumers ADD COLUMN reset_token TEXT"); } catch (_) {}
try { db.exec("ALTER TABLE consumers ADD COLUMN reset_token_expires DATETIME"); } catch (_) {}

// Clinic accounts can be disabled by the admin without deleting their data
try { db.exec("ALTER TABLE bmdlogin ADD COLUMN disabled INTEGER DEFAULT 0"); } catch (_) {}

// Add clinic_username and created_at to bmd table so records persist and can be
// associated with the logged-in clinic account (safe no-op if columns already exist)
try { db.exec("ALTER TABLE bmd ADD COLUMN clinic_username TEXT"); } catch (_) {}
try { db.exec("ALTER TABLE bmd ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP"); } catch (_) {}

// Seed a default user if none exists — password stored as bcrypt hash from the start
const existing = db.prepare("SELECT COUNT(*) as cnt FROM bmdlogin").get();
if (existing.cnt === 0) {
  const defaultHash = bcrypt.hashSync('admin123', 12);
  db.prepare(`
    INSERT INTO bmdlogin (username, pwd, expirydate, limitavailable)
    VALUES ('admin', ?, '2099-12-31', 999)
  `).run(defaultHash);
  console.log('Database seeded with default clinic account: admin (password hashed)');
}

// One-time startup migration: hash any bmdlogin passwords still stored as plain text.
// This covers dormant accounts that have never logged in since the bcrypt change.
{
  const plainRows = db.prepare("SELECT id, pwd FROM bmdlogin").all()
    .filter(r => r.pwd && !r.pwd.startsWith('$2'));
  if (plainRows.length > 0) {
    const update = db.prepare('UPDATE bmdlogin SET pwd = ? WHERE id = ?');
    const migrate = db.transaction(() => {
      for (const row of plainRows) {
        const hash = bcrypt.hashSync(row.pwd, 12);
        update.run(hash, row.id);
      }
    });
    migrate();
    console.log(`[DB] Migrated ${plainRows.length} plain-text bmdlogin password(s) to bcrypt hashes`);
  }
}

module.exports = db;
