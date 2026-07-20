/**
 * clinic-auth.test.js
 *
 * Verifies the three security-relevant behaviours introduced by the bcrypt
 * migration for clinic (BMD) accounts:
 *
 *  1. Legacy plain-text password → login succeeds, password is rehashed.
 *  2. Admin password-change → stores a bcrypt hash, new password works on login.
 *  3. Default-credentials warning → fires when "admin" account has admin123
 *     stored as a bcrypt hash (not just as plain text).
 *
 * The tests use an isolated in-memory SQLite database so they never touch the
 * production DB and can run safely at any time.
 */

'use strict';

const assert  = require('assert/strict');
const bcrypt  = require('bcryptjs');
const Database = require('better-sqlite3');

// ─── Minimal in-memory DB that mirrors bmdlogin schema ────────────────────────
function makeDb() {
  const db = new Database(':memory:');
  db.exec(`
    CREATE TABLE bmdlogin (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      username        TEXT NOT NULL UNIQUE,
      pwd             TEXT NOT NULL,
      expirydate      TEXT,
      limitavailable  INTEGER DEFAULT 999
    )
  `);
  return db;
}

// ─── Logic extracted from server.js (kept in sync) ────────────────────────────

/**
 * Simulates POST /bmdlogin.asp password-check + rehash logic.
 * Returns { valid: boolean } and, as a side-effect, rehashes plain-text
 * passwords in the DB on first successful login.
 */
async function attemptLogin(db, username, plaintextPassword) {
  const user = db.prepare(
    'SELECT username, pwd FROM bmdlogin WHERE username = ?'
  ).get(username);

  if (!user) return { valid: false };

  const isHashed = user.pwd && user.pwd.startsWith('$2');
  let passwordValid = false;

  if (isHashed) {
    passwordValid = await bcrypt.compare(plaintextPassword, user.pwd);
  } else {
    passwordValid = user.pwd === plaintextPassword;
    if (passwordValid) {
      const newHash = await bcrypt.hash(plaintextPassword, 12);
      db.prepare('UPDATE bmdlogin SET pwd = ? WHERE username = ?')
        .run(newHash, user.username);
    }
  }

  return { valid: passwordValid };
}

/**
 * Simulates POST /admin/clinic/:username/password logic.
 * Hashes the new password and persists it.
 */
async function adminChangePassword(db, username, newPassword) {
  const hash = await bcrypt.hash(newPassword, 12);
  db.prepare('UPDATE bmdlogin SET pwd = ? WHERE username = ?')
    .run(hash, username);
}

/**
 * Simulates the isDefault check in GET /admin/clinic.
 */
function hasDefaultCredentials(db) {
  const rows = db.prepare('SELECT username, pwd FROM bmdlogin').all();
  return rows.some(r =>
    r.username === 'admin' && (
      r.pwd === 'admin123' ||
      (r.pwd && r.pwd.startsWith('$2') && bcrypt.compareSync('admin123', r.pwd))
    )
  );
}

// ─── Test runner ──────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓  ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗  ${name}`);
    console.error(`     ${err.message}`);
    failed++;
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

(async () => {

console.log('\nClinic login & password-change security tests\n');

await test('1a. Legacy plain-text password is accepted on login', async () => {
  const db = makeDb();
  db.prepare("INSERT INTO bmdlogin (username, pwd, expirydate) VALUES ('clinic1', 'secret99', '2099-12-31')")
    .run();

  const { valid } = await attemptLogin(db, 'clinic1', 'secret99');
  assert.equal(valid, true, 'login should succeed with the correct plain-text password');
});

await test('1b. Plain-text password is rehashed in DB after first login', async () => {
  const db = makeDb();
  db.prepare("INSERT INTO bmdlogin (username, pwd, expirydate) VALUES ('clinic1', 'secret99', '2099-12-31')")
    .run();

  await attemptLogin(db, 'clinic1', 'secret99');

  const row = db.prepare('SELECT pwd FROM bmdlogin WHERE username = ?').get('clinic1');
  assert.ok(row.pwd.startsWith('$2'), `password should now be a bcrypt hash; got: ${row.pwd}`);
});

await test('1c. Wrong plain-text password is rejected', async () => {
  const db = makeDb();
  db.prepare("INSERT INTO bmdlogin (username, pwd, expirydate) VALUES ('clinic1', 'secret99', '2099-12-31')")
    .run();

  const { valid } = await attemptLogin(db, 'clinic1', 'wrongpassword');
  assert.equal(valid, false, 'login should fail with the wrong password');
});

await test('1d. After rehash, account can still log in with the same password', async () => {
  const db = makeDb();
  db.prepare("INSERT INTO bmdlogin (username, pwd, expirydate) VALUES ('clinic1', 'secret99', '2099-12-31')")
    .run();

  // First login — triggers rehash
  await attemptLogin(db, 'clinic1', 'secret99');

  // Second login — password now stored as hash
  const { valid } = await attemptLogin(db, 'clinic1', 'secret99');
  assert.equal(valid, true, 'login should still succeed after transparent rehash');
});

await test('2a. Admin password-change stores a bcrypt hash', async () => {
  const db = makeDb();
  db.prepare("INSERT INTO bmdlogin (username, pwd, expirydate) VALUES ('clinic2', 'oldpass', '2099-12-31')")
    .run();

  await adminChangePassword(db, 'clinic2', 'NewSecure#7');

  const row = db.prepare('SELECT pwd FROM bmdlogin WHERE username = ?').get('clinic2');
  assert.ok(row.pwd.startsWith('$2'), `stored value should be a bcrypt hash; got: ${row.pwd}`);
});

await test('2b. Account can log in with the password set via admin change', async () => {
  const db = makeDb();
  db.prepare("INSERT INTO bmdlogin (username, pwd, expirydate) VALUES ('clinic2', 'oldpass', '2099-12-31')")
    .run();

  await adminChangePassword(db, 'clinic2', 'NewSecure#7');

  const { valid } = await attemptLogin(db, 'clinic2', 'NewSecure#7');
  assert.equal(valid, true, 'login should succeed with the admin-set password');
});

await test('2c. Old password is rejected after admin password-change', async () => {
  const db = makeDb();
  db.prepare("INSERT INTO bmdlogin (username, pwd, expirydate) VALUES ('clinic2', 'oldpass', '2099-12-31')")
    .run();

  await adminChangePassword(db, 'clinic2', 'NewSecure#7');

  const { valid } = await attemptLogin(db, 'clinic2', 'oldpass');
  assert.equal(valid, false, 'old password should be rejected after a change');
});

await test('3a. hasDefaultCredentials = true when admin123 stored as plain text', () => {
  const db = makeDb();
  db.prepare("INSERT INTO bmdlogin (username, pwd) VALUES ('admin', 'admin123')").run();
  assert.equal(hasDefaultCredentials(db), true);
});

await test('3b. hasDefaultCredentials = true when admin123 stored as bcrypt hash', () => {
  const db = makeDb();
  const hash = bcrypt.hashSync('admin123', 12);
  db.prepare("INSERT INTO bmdlogin (username, pwd) VALUES ('admin', ?)").run(hash);
  assert.equal(hasDefaultCredentials(db), true,
    'warning should fire even when admin123 is stored as a bcrypt hash');
});

await test('3c. hasDefaultCredentials = false after admin password is changed', async () => {
  const db = makeDb();
  const hash = bcrypt.hashSync('admin123', 12);
  db.prepare("INSERT INTO bmdlogin (username, pwd) VALUES ('admin', ?)").run(hash);

  await adminChangePassword(db, 'admin', 'Str0ngNewPass!');

  assert.equal(hasDefaultCredentials(db), false,
    'warning should disappear once the default password is changed');
});

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);

})();
