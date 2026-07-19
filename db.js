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
