const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'ehealthwatch-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Helper: make session available in all templates
app.use((req, res, next) => {
  res.locals.userid       = req.session.userid       || '';
  res.locals.consumerId   = req.session.consumerId   || null;
  res.locals.consumerName = req.session.consumerName || '';
  next();
});

// Consumer auth guard
function requireConsumer(req, res, next) {
  if (!req.session.consumerId) {
    return res.redirect('/login?next=' + encodeURIComponent(req.originalUrl));
  }
  next();
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// Home – GET
app.get(['/', '/index.asp'], (req, res) => {
  res.render('index', { contactSuccess: false });
});

// Home – POST (contact form)
app.post(['/', '/index.asp'], (req, res) => {
  // Basic server-side handling — log and confirm
  const { fname, lname, email, phone, comment } = req.body;
  console.log('[Contact Form]', { fname, lname, email, phone, comment });
  res.render('index', { contactSuccess: true });
});

// Static content pages
app.get('/health.asp', (req, res) => res.render('health'));
app.get('/menopause.asp', (req, res) => res.render('menopause'));
app.get('/gynaecology.asp', (req, res) => res.render('gynaecology'));
app.get('/pregnancy.asp', (req, res) => res.render('pregnancy'));
app.get('/organ.asp', (req, res) => res.render('organ'));
app.get('/data.asp', (req, res) => res.render('data'));

// Contact
app.get(['/contact.asp', '/Contact.asp'], (req, res) => res.render('contact'));

// BMD Login – GET
app.get('/bmdlogin.asp', (req, res) => {
  const msg = req.query.msg || '';
  res.render('bmdlogin', { msg });
});

// BMD Login – POST
app.post('/bmdlogin.asp', (req, res) => {
  const { validate1, txtusername, txtpwd } = req.body;

  if (validate1 !== 'T') {
    return res.render('bmdlogin', { msg: '' });
  }

  const user = db.prepare(
    "SELECT username, pwd, expirydate, limitavailable FROM bmdlogin WHERE username = ? AND pwd = ?"
  ).get(txtusername, txtpwd);

  if (!user) {
    return res.render('bmdlogin', { msg: 'Invalid user credentials. Please try again.' });
  }

  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const expiry = user.expirydate ? user.expirydate.replace(/-/g, '') : '99991231';

  if (expiry < today) {
    return res.render('bmdlogin', { msg: 'Demo version expired. Please contact the administrator.' });
  }

  req.session.userid = user.username;
  return res.redirect('/bmd.asp');
});

// BMD Calculator – GET (auth required)
app.get('/bmd.asp', (req, res) => {
  if (!req.session.userid) return res.redirect('/bmdlogin.asp');
  req.session.guid = uuidv4();
  res.render('bmd');
});

// BMD Save – POST
app.post('/bmdsave.asp', (req, res) => {
  if (!req.session.userid) return res.redirect('/bmdlogin.asp');
  if (!req.session.guid) return res.redirect('/bmd.asp');

  const user = db.prepare(
    "SELECT limitavailable FROM bmdlogin WHERE username = ?"
  ).get(req.session.userid);

  if (!user) {
    req.session.userid = '';
    return res.redirect('/bmdlogin.asp?msg=Invalid+user+credentials.+Please+try+again.');
  }

  if (parseInt(user.limitavailable) === 0) {
    req.session.userid = '';
    return res.redirect('/bmdlogin.asp?msg=You+have+exceeded+your+limit.+Please+contact+the+administrator.');
  }

  const { Txt_name, Txt_age, Txt_height, Txt_weight, Txt_hal, Txt_nsa } = req.body;
  const guid = req.session.guid;

  db.prepare(
    "INSERT INTO bmd (name, age, height, weight, hal, nsa, guid) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(Txt_name, Txt_age, Txt_height, Txt_weight, Txt_hal, Txt_nsa, guid);

  db.prepare(
    "UPDATE bmdlogin SET limitavailable = limitavailable - 1 WHERE username = ?"
  ).run(req.session.userid);

  return res.redirect('/result.asp');
});

// BMD Result
app.get('/result.asp', (req, res) => {
  if (!req.session.userid) return res.redirect('/bmdlogin.asp');
  if (!req.session.guid) return res.redirect('/bmd.asp');

  const guid = req.session.guid;
  const row = db.prepare("SELECT * FROM bmd WHERE guid = ?").get(guid);

  if (!row) return res.redirect('/bmd.asp');

  const height = parseFloat(row.height);
  const weight = parseFloat(row.weight);
  const age    = parseFloat(row.age);
  const hal    = parseFloat(row.hal);
  const nsa    = parseFloat(row.nsa);

  const result = (
    1.06861 *
    Math.pow(height * 0.01, 0.326842) *
    Math.pow(weight, 0.211909) *
    Math.pow(hal, 0.0608258) *
    Math.pow(age, -0.332916) *
    Math.pow(nsa * 0.0174533, -0.239446)
  ).toFixed(4);

  db.prepare("DELETE FROM bmd WHERE guid = ?").run(guid);

  res.render('result', { result, name: row.name });
});

// ─── Consumer Account Routes ─────────────────────────────────────────────────

// Sign up
app.get('/signup', (req, res) => {
  if (req.session.consumerId) return res.redirect('/dashboard');
  res.render('signup', { error: null });
});
app.post('/signup', async (req, res) => {
  const { full_name, email, password, confirm_password, consent } = req.body;
  if (!consent)                   return res.render('signup', { error: 'You must accept the privacy policy to continue.' });
  if (!password || password.length < 8) return res.render('signup', { error: 'Password must be at least 8 characters.' });
  if (password !== confirm_password)    return res.render('signup', { error: 'Passwords do not match.' });
  const existing = db.prepare('SELECT id FROM consumers WHERE email = ?').get(email);
  if (existing) return res.render('signup', { error: 'An account with this email already exists. Sign in instead.' });
  const password_hash = await bcrypt.hash(password, 12);
  const r = db.prepare('INSERT INTO consumers (email, password_hash, full_name, consent_given_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)').run(email, password_hash, full_name || null);
  req.session.consumerId   = r.lastInsertRowid;
  req.session.consumerName = full_name || email.split('@')[0];
  res.redirect('/dashboard');
});

// Sign in
app.get('/login', (req, res) => {
  if (req.session.consumerId) return res.redirect('/dashboard');
  res.render('consumer-login', { error: null, next: req.query.next || '/dashboard' });
});
app.post('/login', async (req, res) => {
  const { email, password, next } = req.body;
  const safeNext = (next && next.startsWith('/') && !next.startsWith('//')) ? next : '/dashboard';
  const consumer = db.prepare('SELECT * FROM consumers WHERE email = ?').get(email);
  if (!consumer) return res.render('consumer-login', { error: 'No account found with this email.', next: safeNext });
  const match = await bcrypt.compare(password, consumer.password_hash);
  if (!match)    return res.render('consumer-login', { error: 'Incorrect password. Please try again.', next: safeNext });
  req.session.consumerId   = consumer.id;
  req.session.consumerName = consumer.full_name || consumer.email.split('@')[0];
  res.redirect(safeNext);
});

// Consumer logout
app.get('/consumer-logout', (req, res) => {
  req.session.consumerId   = null;
  req.session.consumerName = null;
  res.redirect('/');
});

// Dashboard – profile picker
app.get('/dashboard', requireConsumer, (req, res) => {
  const profiles = db.prepare('SELECT * FROM consumer_profiles WHERE consumer_id = ? ORDER BY created_at').all(req.session.consumerId);
  const profilesWithStatus = profiles.map((p, i) => {
    const paid = db.prepare('SELECT id FROM consumer_orders WHERE profile_id = ? AND status = ? ORDER BY paid_at DESC LIMIT 1').get(p.id, 'paid');
    return { ...p, hasPaidResult: !!paid };
  });
  res.render('dashboard', { profiles: profilesWithStatus, consumerName: req.session.consumerName });
});

// New profile
app.get('/profile/new', requireConsumer, (req, res) => {
  const count = db.prepare('SELECT COUNT(*) as cnt FROM consumer_profiles WHERE consumer_id = ?').get(req.session.consumerId).cnt;
  if (count >= 3) return res.redirect('/dashboard');
  res.render('profile-new', { error: null });
});
app.post('/profile/new', requireConsumer, (req, res) => {
  const count = db.prepare('SELECT COUNT(*) as cnt FROM consumer_profiles WHERE consumer_id = ?').get(req.session.consumerId).cnt;
  if (count >= 3) return res.redirect('/dashboard');
  const { display_name, relationship_label, date_of_birth } = req.body;
  const r = db.prepare('INSERT INTO consumer_profiles (consumer_id, display_name, relationship_label, date_of_birth) VALUES (?, ?, ?, ?)').run(req.session.consumerId, display_name, relationship_label || 'Self', date_of_birth || null);
  res.redirect('/profile/' + r.lastInsertRowid);
});

// Profile detail
app.get('/profile/:id', requireConsumer, (req, res) => {
  const profile = db.prepare('SELECT * FROM consumer_profiles WHERE id = ? AND consumer_id = ?').get(req.params.id, req.session.consumerId);
  if (!profile) return res.redirect('/dashboard');
  const paidOrder = db.prepare('SELECT * FROM consumer_orders WHERE profile_id = ? AND status = ? ORDER BY paid_at DESC LIMIT 1').get(profile.id, 'paid');
  let testResult = null;
  if (paidOrder) {
    const row = db.prepare('SELECT * FROM mp_results_v2 WHERE order_id = ?').get(paidOrder.id);
    if (row) testResult = { ...JSON.parse(row.result_json), input: JSON.parse(row.input_json), createdAt: row.created_at };
  }
  res.render('profile', { profile, testResult, hasPaidResult: !!paidOrder });
});

// Forecast form (gated – requires consumer login)
app.get('/forecast/:profileId', requireConsumer, (req, res) => {
  const profile = db.prepare('SELECT * FROM consumer_profiles WHERE id = ? AND consumer_id = ?').get(req.params.profileId, req.session.consumerId);
  if (!profile) return res.redirect('/dashboard');
  res.render('forecast-gated', { profile, error: null });
});
app.post('/forecast/:profileId', requireConsumer, (req, res) => {
  const profile = db.prepare('SELECT * FROM consumer_profiles WHERE id = ? AND consumer_id = ?').get(req.params.profileId, req.session.consumerId);
  if (!profile) return res.redirect('/dashboard');
  const { Txt_age, cmbperiods, Txt_amh } = req.body;
  if (!Txt_age || !cmbperiods || !Txt_amh) return res.render('forecast-gated', { profile, error: 'All fields are required.' });
  const b0 = cmbperiods === 'R' ? 35.49 : 41.41;
  const b1 = cmbperiods === 'R' ? 0.15  : 0.17;
  const periods   = cmbperiods === 'R' ? 'Regular' : 'Irregular';
  const amhvalue  = parseFloat(Txt_amh);
  const fmvalue   = Math.round(b0 * Math.pow(amhvalue, b1));
  // Phase 1: simulate payment (Razorpay integration in Phase 2)
  const order = db.prepare('INSERT INTO consumer_orders (consumer_id, profile_id, status, paid_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)').run(req.session.consumerId, profile.id, 'paid');
  db.prepare('INSERT INTO mp_results_v2 (order_id, profile_id, input_json, result_json) VALUES (?, ?, ?, ?)').run(
    order.lastInsertRowid, profile.id,
    JSON.stringify({ age: Txt_age, amh: amhvalue, periods }),
    JSON.stringify({ forecastAge: fmvalue, periods, amhvalue })
  );
  res.redirect('/my-result/' + profile.id);
});

// View stored result (always free after paying once)
app.get('/my-result/:profileId', requireConsumer, (req, res) => {
  const profile = db.prepare('SELECT * FROM consumer_profiles WHERE id = ? AND consumer_id = ?').get(req.params.profileId, req.session.consumerId);
  if (!profile) return res.redirect('/dashboard');
  const paidOrder = db.prepare('SELECT * FROM consumer_orders WHERE profile_id = ? AND status = ? ORDER BY paid_at DESC LIMIT 1').get(profile.id, 'paid');
  if (!paidOrder) return res.redirect('/profile/' + profile.id);
  const row = db.prepare('SELECT * FROM mp_results_v2 WHERE order_id = ?').get(paidOrder.id);
  if (!row) return res.redirect('/profile/' + profile.id);
  res.render('my-result', { profile, input: JSON.parse(row.input_json), result: JSON.parse(row.result_json), createdAt: row.created_at });
});

// ─── Menopause Forecasting (legacy public form) ───────────────────────────────

// Menopause Forecasting – GET (gate landing)
app.get('/forecasting.asp', (req, res) => {
  if (req.session.consumerId) return res.redirect('/dashboard');
  res.render('forecasting');
});

// Menopause Forecasting Result – POST
// Kept for backward compatibility with BMD clinic workflow.
// Unauthenticated consumer requests are redirected to the gate landing.
app.post('/mpresult.asp', (req, res) => {
  // Require either a BMD clinic session or a consumer session.
  // This prevents unauthenticated users from bypassing the gate by POSTing directly.
  if (!req.session.userid && !req.session.consumerId) {
    return res.redirect('/forecasting.asp');
  }

  const { Txt_name, Txt_age, cmbperiods, Txt_amh } = req.body;

  let b0, b1, periods;
  if (cmbperiods === 'R') {
    periods = 'Regular';
    b0 = 35.49;
    b1 = 0.15;
  } else {
    periods = 'Irregular';
    b0 = 41.41;
    b1 = 0.17;
  }

  const amhvalue = parseFloat(Txt_amh);
  const fmvalue = Math.round(b0 * Math.pow(amhvalue, b1));

  res.render('mpresult', {
    name: Txt_name,
    age: Txt_age,
    periods,
    amhvalue,
    fmvalue
  });
});

// Logout
app.get('/logout.asp', (req, res) => {
  req.session.destroy();
  res.redirect('/bmdlogin.asp');
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`e-healthwatch running on port ${PORT}`);
});
