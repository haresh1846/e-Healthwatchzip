/**
 * integration.test.js
 *
 * End-to-end tests against the real server (spawned as a child process on an
 * isolated throwaway database via DB_PATH). Covers:
 *
 *  1. CSRF — POSTs without a token are rejected, with a token they succeed.
 *  2. Payment-gate regression — a logged-in consumer can NOT compute a
 *     forecast through the legacy POST /mpresult.asp; clinic sessions can.
 *  3. Forecast formula — the real handler computes round(b0 × AMH^b1) with
 *     the published coefficients for regular and irregular cycles.
 *  4. Default clinic credentials force a password change before any clinic
 *     page is usable.
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

  await test('2a. Consumer session cannot compute forecast via POST /mpresult.asp', async () => {
    const page = await fetch(BASE + '/dashboard', { headers: { cookie: consumerCookie } });
    const token = (await page.text()).match(/name="_csrf" value="([^"]+)"/)[1];
    const r = await post('/mpresult.asp', consumerCookie, {
      _csrf: token, Txt_name: 'X', Txt_age: '34', cmbperiods: 'R', Txt_amh: '2.0',
    });
    assert.equal(r.status, 302, 'must redirect, not render a result');
    assert.equal(r.headers.get('location'), '/dashboard');
  });

  await test('2b. Unauthenticated POST /mpresult.asp redirects to the gate', async () => {
    // grab the session token from a page that has a form on it
    const { cookie, token } = await freshSession('/bmdlogin.asp');
    const r = await post('/mpresult.asp', cookie, {
      _csrf: token, Txt_name: 'X', Txt_age: '34', cmbperiods: 'R', Txt_amh: '2.0',
    });
    assert.equal(r.status, 302);
    assert.equal(r.headers.get('location'), '/forecasting.asp');
  });

  let clinicCookie, clinicToken;

  await test('3a. Default clinic credentials force a password change', async () => {
    const { cookie, token } = await freshSession('/bmdlogin.asp');
    clinicToken = token;
    const r = await post('/bmdlogin.asp', cookie, {
      _csrf: token, validate1: 'T', txtusername: 'admin', txtpwd: 'admin123',
    });
    assert.equal(r.headers.get('location'), '/clinic-password');
    const dash = await fetch(BASE + '/clinic-dashboard', { headers: { cookie }, redirect: 'manual' });
    assert.equal(dash.headers.get('location'), '/clinic-password', 'clinic pages must be blocked until changed');
    const change = await post('/clinic-password', cookie, {
      _csrf: token, new_password: 'clinicsecret1', confirm_password: 'clinicsecret1',
    });
    assert.equal(change.headers.get('location'), '/clinic-dashboard');
    clinicCookie = cookie;
  });

  await test('3b. Clinic session computes the published forecast formulas', async () => {
    const token = clinicToken; // CSRF token is per-session, unchanged since login
    for (const [periods, b0, b1] of [['R', 35.49, 0.15], ['I', 41.41, 0.17]]) {
      const amh = 2.5;
      const expected = Math.round(b0 * Math.pow(amh, b1));
      const r = await post('/mpresult.asp', clinicCookie, {
        _csrf: token, Txt_name: 'Formula Test', Txt_age: '34', cmbperiods: periods, Txt_amh: String(amh),
      });
      assert.equal(r.status, 200);
      const html = await r.text();
      assert.ok(html.includes(String(expected)), `expected forecast age ${expected} for periods=${periods}`);
    }
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
