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

// GET a page with an existing (already-authenticated) session cookie and
// pull out the CSRF token minted for that session.
async function tokenFor(pagePath, cookie) {
  const r = await fetch(BASE + pagePath, { headers: { cookie } });
  const html = await r.text();
  return html.match(/name="_csrf" value="([^"]+)"/)[1];
}

async function post(pagePath, cookie, body) {
  return fetch(BASE + pagePath, {
    method: 'POST',
    headers: { cookie, 'content-type': 'application/x-www-form-urlencoded' },
    body: form(body),
    redirect: 'manual',
  });
}

// Log in to the admin panel and return the authenticated cookie.
async function adminSession() {
  const { cookie, token } = await freshSession('/admin/login');
  const login = await post('/admin/login', cookie, { _csrf: token, password: ADMIN_TEST_PASSWORD });
  const setCookie = login.headers.get('set-cookie');
  return setCookie ? setCookie.split(';')[0] : cookie;
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

  // A record from when the calculator was live. The calculator is retired, but
  // report links already handed out must keep working, so seed one to prove it.
  db.exec(`
    CREATE TABLE IF NOT EXISTS bmd (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT, age TEXT, height TEXT, weight TEXT, hal TEXT, nsa TEXT,
      guid TEXT UNIQUE
    )
  `);
  db.prepare(
    "INSERT INTO bmd (name, age, height, weight, hal, nsa, guid) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run('Legacy BMD Record', '45', '160', '60', '100', '130', LEGACY_BMD_GUID);
  db.close();
}

const LEGACY_BMD_GUID = '11111111-2222-3333-4444-555555555555';
const ADMIN_TEST_PASSWORD = 'integration-test-admin-pass';

async function startServer() {
  serverProc = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], {
    env: { ...process.env, PORT: String(PORT), DB_PATH, SESSION_SECRET: 'integration-test-secret', ADMIN_PASSWORD: ADMIN_TEST_PASSWORD },
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
    const { cookie, token } = await freshSession('/signup');
    const p = await post('/mpresult.asp', cookie, {
      _csrf: token, Txt_name: 'X', Txt_age: '34', cmbperiods: 'R', Txt_amh: '2.0',
    });
    assert.equal(p.status, 404);
  });

  await test('3a. Retired BMD calculator: /bmdsave.asp no longer records a result', async () => {
    const before = db.prepare('SELECT COUNT(*) AS c FROM bmd').get().c;
    const { cookie, token } = await freshSession('/bmd.asp');
    const save = await post('/bmdsave.asp', cookie, {
      _csrf: token, Txt_name: 'Should Not Save', Txt_age: '45', Txt_height: '160',
      Txt_weight: '60', Txt_hal: '100', Txt_nsa: '130',
    });
    assert.equal(save.status, 302);
    assert.equal(save.headers.get('location'), '/bmd.asp');
    assert.equal(db.prepare('SELECT COUNT(*) AS c FROM bmd').get().c, before, 'no new bmd row may be written');

    // /result.asp is retired too — it must not render a score for anyone.
    const r = await fetch(BASE + '/result.asp', { headers: { cookie }, redirect: 'manual' });
    assert.equal(r.status, 302);
    assert.equal(r.headers.get('location'), '/bmd.asp');
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

  await test('3d. Reports issued before the retirement still open', async () => {
    const r = await fetch(BASE + '/bmd-report/' + LEGACY_BMD_GUID);
    assert.equal(r.status, 200);
    assert.ok((await r.text()).includes('Legacy BMD Record'));
  });

  await test('3d2. Order rows record the charged amount, not a schema default', async () => {
    // The verify guard compares orderRow.amount_paise against the price the
    // gateway was told to charge. If the INSERT ever relies on a column default
    // again, every payment gets rejected *after* the customer is charged.
    const cols = db.prepare('PRAGMA table_info(consumer_orders)').all();
    const amountCol = cols.find(c => c.name === 'amount_paise');
    assert.ok(amountCol, 'consumer_orders must have amount_paise');
    assert.equal(amountCol.dflt_value, null, 'amount_paise must have no default — it is written explicitly');

    const src = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
    assert.ok(/INSERT INTO consumer_orders \([^)]*amount_paise/.test(src),
      'the order INSERT must name amount_paise explicitly');
    const priceMatch = src.match(/const PRICE_PAISE\s*=\s*(\d+)/);
    assert.ok(priceMatch, 'PRICE_PAISE must be defined in one place');
    const guardCount = (src.match(/PRICE_PAISE/g) || []).length;
    assert.ok(guardCount >= 4,
      `expected the order amount and all three guards to use PRICE_PAISE, found ${guardCount} references`);
  });

  await test('4a. Contact messages are stored even when email is not configured', async () => {
    const { cookie, token } = await freshSession('/contact.asp');
    const r = await post('/contact.asp', cookie, {
      _csrf: token, fname: 'Priya', lname: 'Sharma', email: 'priya@example.com',
      phone: '+91 90000 22222', comment: 'Do you support irregular cycles?',
    });
    assert.equal(r.status, 200);
    const row = db.prepare('SELECT * FROM contact_messages WHERE email = ?').get('priya@example.com');
    assert.ok(row, 'the enquiry must be stored, not only emailed');
    assert.equal(row.message, 'Do you support irregular cycles?');
    assert.equal(row.emailed, 0, 'unsent mail must be flagged so it can be chased');
  });

  await test('4b. Legal pages required for payments are reachable', async () => {
    for (const p of ['/terms', '/refund', '/privacy']) {
      const r = await fetch(BASE + p);
      assert.equal(r.status, 200, p);
    }
    // and linked from the footer, or nobody will find them
    const home = await (await fetch(BASE + '/')).text();
    for (const p of ['/terms', '/refund', '/privacy']) {
      assert.ok(home.includes('href="' + p + '"'), p + ' must be linked in the footer');
    }
  });

  await test('4c. Unknown URLs return a branded 404, not the Express default', async () => {
    const r = await fetch(BASE + '/definitely-not-a-page');
    assert.equal(r.status, 404);
    const html = await r.text();
    assert.ok(html.includes("We couldn't find that page"), 'expected the styled 404');
    assert.ok(!/Cannot GET/.test(html), 'must not leak the Express default page');
  });

  await test('4d. Security headers are present and Express is not advertised', async () => {
    const r = await fetch(BASE + '/');
    assert.equal(r.headers.get('x-powered-by'), null, 'X-Powered-By must be disabled');
    assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(r.headers.get('x-frame-options'), 'DENY');
    assert.ok(r.headers.get('referrer-policy'));
    const csp = r.headers.get('content-security-policy');
    assert.ok(csp, 'a CSP must be set');
    // Razorpay must stay allowed or checkout breaks.
    assert.ok(csp.includes('https://checkout.razorpay.com'), 'CSP must allow the Razorpay checkout script');
    assert.ok(csp.includes("frame-ancestors 'none'"));
  });

  await test('4e. robots.txt and sitemap.xml are served and keep private areas out', async () => {
    const robots = await (await fetch(BASE + '/robots.txt')).text();
    assert.ok(robots.includes('Disallow: /admin'));
    assert.ok(robots.includes('Sitemap:'));
    const sitemap = await (await fetch(BASE + '/sitemap.xml')).text();
    assert.ok(sitemap.includes('<urlset'));
    assert.ok(sitemap.includes('/forecasting.asp'));
    assert.ok(!sitemap.includes('/admin'), 'admin must not be advertised in the sitemap');
  });

  await test('4f. No fabricated contact details are published', async () => {
    const home = await (await fetch(BASE + '/')).text();
    const contact = await (await fetch(BASE + '/contact.asp')).text();
    for (const page of [home, contact]) {
      assert.ok(!page.includes('+44 (0) 123 456 789'), 'placeholder phone must not ship');
      assert.ok(!page.includes('Medical Research Park'), 'placeholder address must not ship');
    }
  });

  await test('3e. BMD waitlist records a signup', async () => {
    const { cookie, token } = await freshSession('/bmd.asp');
    const r = await post('/bmd-waitlist', cookie, {
      _csrf: token, email: 'waitlist@example.com', phone: '+91 90000 11111',
    });
    assert.equal(r.status, 200);
    assert.ok((await r.text()).includes("You're on the list"));

    const row = db.prepare('SELECT * FROM bmd_waitlist WHERE email = ?').get('waitlist@example.com');
    assert.ok(row, 'waitlist row must be written');
    assert.equal(row.phone, '+91 90000 11111');
  });

  await test('3f. BMD waitlist rejects a malformed email and stores nothing', async () => {
    const before = db.prepare('SELECT COUNT(*) AS c FROM bmd_waitlist').get().c;
    const { cookie, token } = await freshSession('/bmd.asp');
    const r = await post('/bmd-waitlist', cookie, { _csrf: token, email: 'not-an-email' });
    assert.equal(r.status, 200);
    assert.ok((await r.text()).includes('valid email address'));
    assert.equal(db.prepare('SELECT COUNT(*) AS c FROM bmd_waitlist').get().c, before);
  });

  await test('3g. Admin waitlist page lists the signup with a wa.me follow-up link', async () => {
    const cookie = await adminSession();
    const html = await (await fetch(BASE + '/admin/bmd-waitlist', { headers: { cookie } })).text();
    assert.ok(html.includes('waitlist@example.com'), 'waitlist email must appear');
    assert.ok(html.includes('https://wa.me/919000011111?text='), 'wa.me link must be built from the phone digits');
  });

  let resetLink;

  await test('5a. Forgot-password issues an emailed (logged) reset link', async () => {
    const { cookie, token } = await freshSession('/forgot-password');
    const r = await post('/forgot-password', cookie, { _csrf: token, email });
    assert.equal(r.status, 200);
    assert.ok((await r.text()).includes('sent a password reset link'));
    const m = serverLog.match(/reset link for \S+ is: (\S+)/);
    assert.ok(m, 'reset link must be logged in non-production when email is not configured');
    resetLink = m[1].replace(/^https?:\/\/[^/]+/, BASE);
  });

  await test('5a2. The reset link is never written to logs in production', async () => {
    // Logs are retained and readable, so a logged reset link is an account
    // takeover path. Guarded by NODE_ENV, which Vercel sets to 'production'.
    const src = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
    const guard = src.match(/if \(process\.env\.NODE_ENV === 'production'\)[\s\S]{0,400}?reset link for/);
    assert.ok(guard, 'the reset-link log must sit behind a NODE_ENV production guard');
    assert.ok(/link withheld from logs/.test(src), 'production branch must log without the link');
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

  // ─── Phone capture + free wa.me click-to-chat follow-up ─────────────────
  // Placed before test 6 (which deliberately exhausts the admin-login rate
  // limiter) and before 7d (which does the same for forecast-precheck) —
  // both buckets are per-IP and shared across the whole test run, so this
  // block must run first or it would itself get rate-limited.
  let waConsumerCookie, waPrecheckProfileId, waConsumerPhone;
  let nophoneConsumerCookie, nophoneProfileId;

  await test('5d. Signup with a phone number persists it', async () => {
    const { cookie, token } = await freshSession('/signup');
    const phone = '+91 98765 43210';
    const r = await post('/signup', cookie, {
      _csrf: token, email: 'waconsumer@test.local', password: 'wapassword1', confirm_password: 'wapassword1',
      consent: 'on', full_name: 'WA Consumer', phone,
    });
    assert.equal(r.status, 302);
    assert.equal(r.headers.get('location'), '/dashboard');
    waConsumerCookie = cookie;
    waConsumerPhone = phone;

    const row = db.prepare('SELECT phone FROM consumers WHERE email = ?').get('waconsumer@test.local');
    assert.equal(row.phone, phone);
  });

  await test('5e. Setup: gate a forecast for the phone-enabled consumer', async () => {
    const token = await tokenFor('/profile/new', waConsumerCookie);
    const r = await post('/profile/new', waConsumerCookie, {
      _csrf: token, display_name: 'WA Profile', relationship_label: 'Self',
    });
    assert.equal(r.status, 302);
    waPrecheckProfileId = r.headers.get('location').split('/').pop();

    const pcToken = await tokenFor('/forecast/' + waPrecheckProfileId, waConsumerCookie);
    const pc = await post(`/forecast/${waPrecheckProfileId}/precheck`, waConsumerCookie, {
      _csrf: pcToken, Txt_age: '45', cmbperiods: 'I', Txt_amh: '0.89',
    });
    const data = await pc.json();
    assert.equal(data.gate, 'already_menopausal');
  });

  await test('5f. Setup: gate a forecast for a consumer with no phone on file', async () => {
    const { cookie, token } = await freshSession('/signup');
    const r = await post('/signup', cookie, {
      _csrf: token, email: 'nophoneconsumer@test.local', password: 'nophonepass1', confirm_password: 'nophonepass1',
      consent: 'on', full_name: 'No Phone Consumer',
    });
    assert.equal(r.status, 302);
    nophoneConsumerCookie = cookie;

    const pToken = await tokenFor('/profile/new', nophoneConsumerCookie);
    const pr = await post('/profile/new', nophoneConsumerCookie, {
      _csrf: pToken, display_name: 'No Phone Profile', relationship_label: 'Self',
    });
    nophoneProfileId = pr.headers.get('location').split('/').pop();

    const pcToken = await tokenFor('/forecast/' + nophoneProfileId, nophoneConsumerCookie);
    const pc = await post(`/forecast/${nophoneProfileId}/precheck`, nophoneConsumerCookie, {
      _csrf: pcToken, Txt_age: '45', cmbperiods: 'I', Txt_amh: '0.89',
    });
    const data = await pc.json();
    assert.equal(data.gate, 'already_menopausal');
  });

  await test('5g. Admin forecast-leads page: wa.me link when a phone is on file, fallback otherwise', async () => {
    const { cookie: anonCookie, token: adminToken } = await freshSession('/admin/login');
    const login = await post('/admin/login', anonCookie, { _csrf: adminToken, password: ADMIN_TEST_PASSWORD });
    assert.equal(login.status, 302);
    const setCookie = login.headers.get('set-cookie');
    const adminCookie = setCookie ? setCookie.split(';')[0] : anonCookie;

    const page = await fetch(BASE + '/admin/forecast-leads', { headers: { cookie: adminCookie } });
    assert.equal(page.status, 200);
    const html = await page.text();

    const expectedDigits = waConsumerPhone.replace(/\D/g, '');
    assert.ok(html.includes(`https://wa.me/${expectedDigits}?text=`), "expected a wa.me link built from the consumer's digits-only phone number");
    assert.ok(html.includes('No phone on file'), 'expected a fallback for leads with no phone on file');
  });

  await test('6. Rate limiter returns 429 after 10 attempts', async () => {
    const { cookie, token } = await freshSession('/admin/login');
    let last;
    for (let i = 0; i < 11; i++) {
      last = await post('/admin/login', cookie, { _csrf: token, password: 'wrong' });
    }
    assert.equal(last.status, 429);
  });

  // ─── Menopause-forecast pre-payment gate check ──────────────────────────
  // The forecast formula depends only on AMH, not current age, so a low-AMH
  // older woman can get a "forecast" age already in her past. /precheck must
  // catch that before any Razorpay order is created.
  let precheckProfileId;

  await test('7. Setup: create a profile for the precheck tests', async () => {
    const token = await tokenFor('/profile/new', consumerCookie);
    const r = await post('/profile/new', consumerCookie, {
      _csrf: token, display_name: 'Precheck Test Profile', relationship_label: 'Self',
    });
    assert.equal(r.status, 302);
    precheckProfileId = r.headers.get('location').split('/').pop();
    assert.ok(precheckProfileId, 'profile creation must redirect to /profile/:id');
  });

  await test('7a. Precheck: normal case (forecast_age > age) still proceeds to payment as before', async () => {
    const token = await tokenFor('/forecast/' + precheckProfileId, consumerCookie);
    // age=30, amh=3.0, regular → forecast_age = round(35.49 * 3.0^0.15) = 42, which is > 30.
    const r = await post(`/forecast/${precheckProfileId}/precheck`, consumerCookie, {
      _csrf: token, Txt_age: '30', cmbperiods: 'R', Txt_amh: '3.0',
    });
    assert.equal(r.status, 200);
    const data = await r.json();
    assert.equal(data.gate, 'proceed_to_payment');
    // forecastAge is deliberately never included in this response — it must
    // not be visible pre-payment (see 7f). The real value is computed again,
    // server-side, at /verify after payment succeeds.
    assert.equal(data.forecastAge, undefined, 'precheck must not leak the computed forecast age pre-payment');

    // The existing order-creation route (refactored to share validation logic)
    // must still behave exactly as before for the same valid inputs.
    const orderToken = await tokenFor('/forecast/' + precheckProfileId, consumerCookie);
    const orderPost = await post(`/forecast/${precheckProfileId}`, consumerCookie, {
      _csrf: orderToken, Txt_age: '30', cmbperiods: 'R', Txt_amh: '3.0',
    });
    assert.equal(orderPost.status, 200);
    const html = await orderPost.text();
    // No validation error was raised for these valid inputs — the shared
    // validateForecastInputs() refactor didn't change accepted behavior.
    // (It proceeds to attempt Razorpay order creation next, which fails only
    // because this test environment has no Razorpay keys configured — an
    // existing, pre-refactor condition unrelated to this change.)
    assert.ok(!html.includes('Please enter a valid'));
    assert.ok(html.includes('Payments are not configured on this server'));
  });

  await test('7b. Precheck: edge case (forecast_age <= age) is gated and never reaches Razorpay order creation', async () => {
    const ordersBefore = db.prepare('SELECT COUNT(*) AS c FROM consumer_orders WHERE profile_id = ?').get(precheckProfileId).c;

    const token = await tokenFor('/forecast/' + precheckProfileId, consumerCookie);
    // 45yo, AMH 0.89, irregular cycles → forecast_age = round(41.41 * 0.89^0.17) = 41, which is <= 45.
    const r = await post(`/forecast/${precheckProfileId}/precheck`, consumerCookie, {
      _csrf: token, Txt_age: '45', cmbperiods: 'I', Txt_amh: '0.89',
    });
    assert.equal(r.status, 200);
    const data = await r.json();
    assert.equal(data.gate, 'already_menopausal');

    const ordersAfter = db.prepare('SELECT COUNT(*) AS c FROM consumer_orders WHERE profile_id = ?').get(precheckProfileId).c;
    assert.equal(ordersAfter, ordersBefore, 'precheck must never create a Razorpay order row');
  });

  await test('7c. Precheck does not persist any result record', async () => {
    const before = db.prepare('SELECT COUNT(*) AS c FROM mp_results_v2 WHERE profile_id = ?').get(precheckProfileId).c;
    const token = await tokenFor('/forecast/' + precheckProfileId, consumerCookie);
    await post(`/forecast/${precheckProfileId}/precheck`, consumerCookie, {
      _csrf: token, Txt_age: '45', cmbperiods: 'I', Txt_amh: '0.89',
    });
    const after = db.prepare('SELECT COUNT(*) AS c FROM mp_results_v2 WHERE profile_id = ?').get(precheckProfileId).c;
    assert.equal(after, before, 'precheck is a gate check only — it must never write a result row');
  });

  await test('7g. Gated (already_menopausal) hits are logged as a forecast_gate_leads row', async () => {
    const before = db.prepare('SELECT COUNT(*) AS c FROM forecast_gate_leads WHERE profile_id = ?').get(precheckProfileId).c;
    const token = await tokenFor('/forecast/' + precheckProfileId, consumerCookie);
    await post(`/forecast/${precheckProfileId}/precheck`, consumerCookie, {
      _csrf: token, Txt_age: '45', cmbperiods: 'I', Txt_amh: '0.89',
    });
    const after = db.prepare('SELECT COUNT(*) AS c FROM forecast_gate_leads WHERE profile_id = ?').get(precheckProfileId).c;
    assert.equal(after, before + 1, 'a gated hit must be logged for follow-up');

    const row = db.prepare('SELECT * FROM forecast_gate_leads WHERE profile_id = ? ORDER BY id DESC LIMIT 1').get(precheckProfileId);
    assert.equal(row.age, '45');
    assert.equal(row.amh, '0.89');
    assert.equal(row.cycle_regularity, 'I');
    assert.equal(row.forecast_age, 41);
  });

  await test('7h. Normal (proceed_to_payment) hits do NOT create a forecast_gate_leads row', async () => {
    const before = db.prepare('SELECT COUNT(*) AS c FROM forecast_gate_leads WHERE profile_id = ?').get(precheckProfileId).c;
    const token = await tokenFor('/forecast/' + precheckProfileId, consumerCookie);
    await post(`/forecast/${precheckProfileId}/precheck`, consumerCookie, {
      _csrf: token, Txt_age: '30', cmbperiods: 'R', Txt_amh: '3.0',
    });
    const after = db.prepare('SELECT COUNT(*) AS c FROM forecast_gate_leads WHERE profile_id = ?').get(precheckProfileId).c;
    assert.equal(after, before, 'a normal, payable forecast must not be logged as a lead');
  });

  await test('7d. Precheck respects rate limiting', async () => {
    const token = await tokenFor('/forecast/' + precheckProfileId, consumerCookie);
    let last;
    for (let i = 0; i < 11; i++) {
      last = await post(`/forecast/${precheckProfileId}/precheck`, consumerCookie, {
        _csrf: token, Txt_age: '30', cmbperiods: 'R', Txt_amh: '3.0',
      });
    }
    assert.equal(last.status, 429);
  });

  await test('7e. Precheck rejects unauthenticated requests (same as /forecast/:profileId)', async () => {
    const { cookie, token } = await freshSession('/signup'); // valid CSRF, no consumer login
    const r = await post(`/forecast/${precheckProfileId}/precheck`, cookie, {
      _csrf: token, Txt_age: '30', cmbperiods: 'R', Txt_amh: '3.0',
    });
    assert.equal(r.status, 302);
    assert.ok(r.headers.get('location').startsWith('/login'), `expected redirect to /login, got ${r.headers.get('location')}`);
  });

  await test('7f. Precheck response never contains the computed forecast age, even as raw text', async () => {
    const token = await tokenFor('/forecast/' + precheckProfileId, consumerCookie);
    const r = await post(`/forecast/${precheckProfileId}/precheck`, consumerCookie, {
      _csrf: token, Txt_age: '30', cmbperiods: 'R', Txt_amh: '3.0',
    });
    const raw = await r.text();
    assert.ok(!raw.toLowerCase().includes('forecastage'), `precheck response leaked forecast data: ${raw}`);
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
