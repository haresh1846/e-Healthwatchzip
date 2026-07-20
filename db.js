const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'ehealthwatch.db'));

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

// Seed a default user if none exists
const existing = db.prepare("SELECT COUNT(*) as cnt FROM bmdlogin").get();
if (existing.cnt === 0) {
  db.prepare(`
    INSERT INTO bmdlogin (username, pwd, expirydate, limitavailable)
    VALUES ('admin', 'admin123', '2099-12-31', 999)
  `).run();
  console.log('Database seeded with default user: admin / admin123');
}

module.exports = db;
