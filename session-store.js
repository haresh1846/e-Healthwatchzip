const session = require('express-session');

// Minimal express-session store backed by the app's existing better-sqlite3
// database, so sessions survive server restarts (the default MemoryStore
// drops every login on each deploy and leaks memory under load).
class SqliteSessionStore extends session.Store {
  constructor(db, { ttlMs = 24 * 60 * 60 * 1000, pruneIntervalMs = 60 * 60 * 1000 } = {}) {
    super();
    this.db = db;
    this.ttlMs = ttlMs;

    db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid        TEXT PRIMARY KEY,
        sess       TEXT NOT NULL,
        expires_at INTEGER NOT NULL
      )
    `);

    this.getStmt     = db.prepare('SELECT sess, expires_at FROM sessions WHERE sid = ?');
    this.setStmt     = db.prepare(
      'INSERT INTO sessions (sid, sess, expires_at) VALUES (?, ?, ?) ' +
      'ON CONFLICT(sid) DO UPDATE SET sess = excluded.sess, expires_at = excluded.expires_at'
    );
    this.destroyStmt = db.prepare('DELETE FROM sessions WHERE sid = ?');
    this.touchStmt   = db.prepare('UPDATE sessions SET expires_at = ? WHERE sid = ?');
    this.pruneStmt   = db.prepare('DELETE FROM sessions WHERE expires_at < ?');

    this.pruneStmt.run(Date.now());
    const timer = setInterval(() => this.pruneStmt.run(Date.now()), pruneIntervalMs);
    if (timer.unref) timer.unref();
  }

  expiresAt(sess) {
    const expires = sess && sess.cookie && sess.cookie.expires;
    return expires ? new Date(expires).getTime() : Date.now() + this.ttlMs;
  }

  get(sid, cb) {
    try {
      const row = this.getStmt.get(sid);
      if (!row || row.expires_at < Date.now()) return cb(null, null);
      cb(null, JSON.parse(row.sess));
    } catch (err) {
      cb(err);
    }
  }

  set(sid, sess, cb = () => {}) {
    try {
      this.setStmt.run(sid, JSON.stringify(sess), this.expiresAt(sess));
      cb(null);
    } catch (err) {
      cb(err);
    }
  }

  destroy(sid, cb = () => {}) {
    try {
      this.destroyStmt.run(sid);
      cb(null);
    } catch (err) {
      cb(err);
    }
  }

  touch(sid, sess, cb = () => {}) {
    try {
      this.touchStmt.run(this.expiresAt(sess), sid);
      cb(null);
    } catch (err) {
      cb(err);
    }
  }
}

module.exports = SqliteSessionStore;
