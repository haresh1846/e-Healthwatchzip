const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
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
  res.locals.userid = req.session.userid || '';
  next();
});

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

// Menopause Forecasting – GET
app.get('/forecasting.asp', (req, res) => {
  res.render('forecasting');
});

// Menopause Forecasting Result – POST
app.post('/mpresult.asp', (req, res) => {
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
