const session = require('express-session');

// express-session store backed by the app's libSQL database (Turso in
// production, a local SQLite file in development), so sessions survive
// restarts and serverless cold starts. The sessions table is created by
// db.js during init.
class SqliteSessionStore extends session.Store {
  constructor(db, { ttlMs = 24 * 60 * 60 * 1000, pruneIntervalMs = 60 * 60 * 1000 } = {}) {
    super();
    this.db = db;
    this.ttlMs = ttlMs;

    const prune = () => {
      this.db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now())
        .catch(err => console.error('[sessions] prune failed:', err.message));
    };
    this.db.ready.then(prune, () => {});
    const timer = setInterval(prune, pruneIntervalMs);
    if (timer.unref) timer.unref();
  }

  expiresAt(sess) {
    const expires = sess && sess.cookie && sess.cookie.expires;
    return expires ? new Date(expires).getTime() : Date.now() + this.ttlMs;
  }

  get(sid, cb) {
    this.db.prepare('SELECT sess, expires_at FROM sessions WHERE sid = ?').get(sid)
      .then(row => {
        if (!row || row.expires_at < Date.now()) return cb(null, null);
        cb(null, JSON.parse(row.sess));
      })
      .catch(cb);
  }

  set(sid, sess, cb = () => {}) {
    this.db.prepare(
      'INSERT INTO sessions (sid, sess, expires_at) VALUES (?, ?, ?) ' +
      'ON CONFLICT(sid) DO UPDATE SET sess = excluded.sess, expires_at = excluded.expires_at'
    ).run(sid, JSON.stringify(sess), this.expiresAt(sess))
      .then(() => cb(null))
      .catch(cb);
  }

  destroy(sid, cb = () => {}) {
    this.db.prepare('DELETE FROM sessions WHERE sid = ?').run(sid)
      .then(() => cb(null))
      .catch(cb);
  }

  touch(sid, sess, cb = () => {}) {
    this.db.prepare('UPDATE sessions SET expires_at = ? WHERE sid = ?').run(this.expiresAt(sess), sid)
      .then(() => cb(null))
      .catch(cb);
  }
}

module.exports = SqliteSessionStore;
