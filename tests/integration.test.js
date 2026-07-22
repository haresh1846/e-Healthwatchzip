/**
 * integration.test.js
 *
 * End-to-end tests against the real server (spawned as a child process on an
 * isolated throwaway database via DB_PATH). Covers:
 *
 *  1. CSRF — POSTs without a token are rejected, with a token they succeed.
 *  2. /mpresult.asp is retired (404) — it only ever existed as a clinic-
 *     session bypass around the forecast paywall, and clinic sessions no
 *     longer exist now that BMD is a free public tool.
 *  3. Public BMD calculator — works with no login, computes the published
 *     formula/WHO classification correctly, the printable report is reachable
 *     by its private guid (and a bogus guid is not), retired clinic URLs
 *     redirect to /bmd.asp instead of 404ing, and the calculator's own rate
 *     limit trips after the cap.
 *  4. Historical-data protection — a plain-text bmdlogin password (from
 *     before the bcrypt migration, or before BMD went login-free) is hashed
 *     by db.js's startup migration, without needing a login route to trigger
 *     it — the migration itself is unconditional.
 *  5. Password reset — emailed link works once, respects expiry, and the new
 *     password replaces the old one.
 *  6. Rate limiting — the 11th rapid login attempt from one IP gets a 429.
 */

'use strict';

const assert   = require('assert/strict');
const path     = require('path');
const fs       = require('fs');
const os       = require('os');
const { spawn } = require('child_process');

const PORT = 5150;
const BASE = `http://localhost:${PORT}`;
const DB_PATH = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'ehw-test-')), 'test.db');

let serverProc;
let serverLog = '';

function form(o) {
  return Object.entries(o).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
}

// GET a page and return its session cookie + CSRF token
async function freshSession(pagePath) {
  const r = await fetch(BASE + pagePath);
  const cookie = r.headers.get('set-cookie').split(';')[0];
  const html = await r.text();
  const token = html.match(/name="_csrf" value="([^"]+)"/)[1];
  return { cookie, token };
}

async function post(pagePath, cookie, body) {
  return fetch(BASE + pagePath, {
    method: 'POST',
    headers: { cookie, 'content-type': 'application/x-www-form-urlencoded' },
    body: form(body),
    redirect: 'manual',
  });
}

// Pre-seed a plain-text bmdlogin row before the server ever starts, so
// db.js's startup migration (which runs unconditionally, not in response to
// a login attempt) has something real to hash.
function seedPlaintextClinicRow() {
  const Database = require('better-sqlite3');
  const db = new Database(DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS bmdlogin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      pwd TEXT NOT NULL,
      expirydate TEXT,
      limitavailable INTEGER DEFAULT 999
    )
  `);
  db.prepare("INSERT INTO bmdlogin (username, pwd, expirydate) VALUES ('legacy-clinic', 'plaintext99', '2099-12-31')").run();
  db.close();
}

async function startServer() {
  serverProc = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], {
    env: { ...process.env, PORT: String(PORT), DB_PATH, SESSION_SECRET: 'integration-test-secret' },
  });
  serverProc.stdout.on('data', d => { serverLog += d.toString(); });
  serverProc.stderr.on('data', d => { serverLog += d.toString(); });
  for (let i = 0; i < 50; i++) {
    try { await fetch(BASE + '/'); return; } catch (_) { await new Promise(r => setTimeout(r, 200)); }
  }
  throw new Error('Server did not start. Log:\n' + serverLog);
}

// ─── Tiny test runner (same style as clinic-auth.test.js) ────────────────────
const results = [];
async function test(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`  ✓  ${name}`);
  } catch (err) {
    results.push({ name, ok: false, err });
    console.error(`  ✗  ${name}\n     ${err.message}`);
  }
}

(async () => {
  seedPlaintextClinicRow();
  await startServer();
  const db = require('better-sqlite3')(DB_PATH);

  const email = 'consumer@test.local';
  const password = 'consumerpass1';
  let consumerCookie;

  await test('1a. POST without CSRF token is rejected with 403', async () => {
    const { cookie } = await freshSession('/signup');
    const r = await fetch(BASE + '/signup', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/x-www-form-urlencoded' },
      body: form({ email, password, confirm_password: password, consent: 'on' }),
      redirect: 'manual',
    });
    assert.equal(r.status, 403);
  });

  await test('1b. Signup with CSRF token succeeds and logs in', async () => {
    const { cookie, token } = await freshSession('/signup');
    const r = await post('/signup', cookie, {
      _csrf: token, email, password, confirm_password: password, consent: 'on', full_name: 'Test Consumer',
    });
    assert.equal(r.status, 302);
    assert.equal(r.headers.get('location'), '/dashboard');
    consumerCookie = cookie;
  });

  await test('1c. Historical plain-text bmdlogin password is bcrypt-hashed on startup', async () => {
    const row = db.prepare("SELECT pwd FROM bmdlogin WHERE username = 'legacy-clinic'").get();
    assert.ok(row.pwd.startsWith('$2'), `expected a bcrypt hash after startup migration, got: ${row.pwd}`);
  });

  await test('2. Retired /mpresult.asp route no longer exists', async () => {
    const g = await fetch(BASE + '/mpresult.asp', { redirect: 'manual' });
    assert.equal(g.status, 404);
    const { cookie, token } = await freshSession('/bmd.asp');
    const p = await post('/mpresult.asp', cookie, {
      _csrf: token, Txt_name: 'X', Txt_age: '34', cmbperiods: 'R', Txt_amh: '2.0',
    });
    assert.equal(p.status, 404);
  });

  await test('3a. Public BMD calculator computes the published formula/classification with no login', async () => {
    const { cookie, token } = await freshSession('/bmd.asp');
    const height = 160, weight = 60, age = 45, hal = 100, nsa = 130;
    const expectedScore = (
      1.06861 *
      Math.pow(height * 0.01, 0.326842) *
      Math.pow(weight, 0.211909) *
      Math.pow(hal, 0.0608258) *
      Math.pow(age, -0.332916) *
      Math.pow(nsa * 0.0174533, -0.239446)
    ).toFixed(4);
    const expectedClass = parseFloat(expectedScore) >= 0.738 ? 'Normal' : parseFloat(expectedScore) >= 0.558 ? 'Osteopenia' : 'Osteoporosis';

    const save = await post('/bmdsave.asp', cookie, {
      _csrf: token, Txt_name: 'BMD Formula Test', Txt_age: String(age), Txt_height: String(height),
      Txt_weight: String(weight), Txt_hal: String(hal), Txt_nsa: String(nsa),
    });
    assert.equal(save.status, 302);
    assert.equal(save.headers.get('location'), '/result.asp');

    const result = await fetch(BASE + '/result.asp', { headers: { cookie } });
    const html = await result.text();
    assert.ok(html.includes(expectedScore), `expected BMD score ${expectedScore} in result page`);
    assert.ok(html.includes(expectedClass), `expected classification ${expectedClass} in result page`);

    const guidMatch = html.match(/bmd-report\/([a-f0-9-]+)/);
    assert.ok(guidMatch, 'result page must link to /bmd-report/:guid');
    const report = await fetch(BASE + '/bmd-report/' + guidMatch[1]);
    assert.equal(report.status, 200);
    assert.ok((await report.text()).includes('BMD Formula Test'));
  });

  await test('3b. BMD report is not reachable by a guessed/bogus guid', async () => {
    const r = await fetch(BASE + '/bmd-report/00000000-0000-0000-0000-000000000000', { redirect: 'manual' });
    assert.equal(r.status, 302);
    assert.equal(r.headers.get('location'), '/bmd.asp');
  });

  await test('3c. Retired clinic URLs redirect to /bmd.asp instead of 404ing', async () => {
    for (const p of ['/bmdlogin.asp', '/clinic-dashboard', '/clinic-password', '/bmd-history', '/bmd-patient/anyone']) {
      const r = await fetch(BASE + p, { redirect: 'manual' });
      assert.equal(r.status, 302, p);
      assert.equal(r.headers.get('location'), '/bmd.asp', p);
    }
  });

  await test('3d. BMD calculator rate limiter trips after the cap', async () => {
    let lastLocation;
    for (let i = 0; i < 11; i++) {
      const { cookie, token } = await freshSession('/bmd.asp'); // fresh guid each time — bmd.guid is UNIQUE
      const r = await post('/bmdsave.asp', cookie, {
        _csrf: token, Txt_name: 'Rate Test', Txt_age: '40', Txt_height: '160', Txt_weight: '60', Txt_hal: '100', Txt_nsa: '130',
      });
      lastLocation = r.headers.get('location');
    }
    assert.ok(lastLocation.startsWith('/bmd.asp?error='), `11th attempt should be rate-limited, got redirect to ${lastLocation}`);
  });

  let resetLink;

  await test('5a. Forgot-password issues an emailed (logged) reset link', async () => {
    const { cookie, token } = await freshSession('/forgot-password');
    const r = await post('/forgot-password', cookie, { _csrf: token, email });
    assert.equal(r.status, 200);
    assert.ok((await r.text()).includes('sent a password reset link'));
    const m = serverLog.match(/reset link for \S+ is: (\S+)/);
    assert.ok(m, 'reset link must be logged when email is not configured');
    resetLink = m[1].replace(/^https?:\/\/[^/]+/, BASE);
  });

  await test('5b. Expired reset token is rejected', async () => {
    db.prepare("UPDATE consumers SET reset_token_expires = '2000-01-01T00:00:00.000Z' WHERE email = ?").run(email);
    const r = await fetch(resetLink);
    assert.ok((await r.text()).includes('no longer valid'));
    // restore a valid expiry for the next test
    db.prepare("UPDATE consumers SET reset_token_expires = ? WHERE email = ?")
      .run(new Date(Date.now() + 3600e3).toISOString(), email);
  });

  await test('5c. Valid reset link changes the password exactly once', async () => {
    const r0 = await fetch(resetLink);
    const cookie = r0.headers.get('set-cookie').split(';')[0];
    const token = (await r0.text()).match(/name="_csrf" value="([^"]+)"/)[1];
    const tok = resetLink.split('/').pop();
    const r = await post('/reset-password/' + tok, cookie, {
      _csrf: token, password: 'brandnewpass2', confirm_password: 'brandnewpass2',
    });
    assert.equal(r.headers.get('location'), '/login?reset=1');
    // token is single-use
    const reuse = await fetch(resetLink);
    assert.ok((await reuse.text()).includes('no longer valid'));
    // old password fails, new password works
    const s1 = await freshSession('/login');
    const bad = await post('/login', s1.cookie, { _csrf: s1.token, email, password });
    assert.equal(bad.status, 200, 'old password must be rejected');
    const s2 = await freshSession('/login');
    const good = await post('/login', s2.cookie, { _csrf: s2.token, email, password: 'brandnewpass2' });
    assert.equal(good.headers.get('location'), '/dashboard');
  });

  await test('6. Rate limiter returns 429 after 10 attempts', async () => {
    const { cookie, token } = await freshSession('/admin/login');
    let last;
    for (let i = 0; i < 11; i++) {
      last = await post('/admin/login', cookie, { _csrf: token, password: 'wrong' });
    }
    assert.equal(last.status, 429);
  });

  serverProc.kill();
  const failed = results.filter(r => !r.ok).length;
  console.log(`\n${results.length} tests: ${results.length - failed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(err => {
  console.error(err);
  if (serverProc) serverProc.kill();
  process.exit(1);
});
