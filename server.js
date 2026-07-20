const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');
const db = require('./db');
const SqliteSessionStore = require('./session-store');

// ─── Email transporter ────────────────────────────────────────────────────────
// Lazily created so missing secrets don't crash startup; only contact form
// submissions attempt to send, and failures are caught and logged.
function createMailTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

// Lazily created for the same reason as the mail transporter: the constructor
// throws without keys, which would prevent the whole site from starting.
let razorpayClient = null;
function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayClient;
}

const app = express();
const PORT = process.env.PORT || 5000;

// Behind Replit's (or any host's) TLS-terminating proxy — needed so
// `secure: 'auto'` session cookies detect HTTPS from X-Forwarded-Proto.
app.set('trust proxy', 1);

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Razorpay webhook — must be registered before bodyParser.json so it receives the raw body for HMAC verification
app.post('/razorpay-webhook', express.raw({ type: 'application/json' }), (req, res) => {
  // Signature verification is mandatory. If RAZORPAY_WEBHOOK_SECRET is not set,
  // reject all webhook calls — the endpoint is effectively disabled until configured.
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn('[Razorpay webhook] RAZORPAY_WEBHOOK_SECRET not configured — rejecting request');
    return res.status(503).json({ error: 'Webhook not configured on this server' });
  }

  const sig = req.headers['x-razorpay-signature'];
  if (!sig) {
    return res.status(400).json({ error: 'Missing signature header' });
  }

  const expected = crypto
    .createHmac('sha256', webhookSecret)
    .update(req.body)
    .digest('hex');

  // Guard against length/type mismatch before timingSafeEqual (throws on different lengths)
  let webhookSigValid = false;
  try {
    const sigBuf      = Buffer.from(sig,      'hex');
    const expectedBuf = Buffer.from(expected, 'hex');
    if (sigBuf.length > 0 && sigBuf.length === expectedBuf.length) {
      webhookSigValid = crypto.timingSafeEqual(sigBuf, expectedBuf);
    }
  } catch (_) {
    webhookSigValid = false;
  }
  if (!webhookSigValid) {
    console.warn('[Razorpay webhook] Signature mismatch — request rejected');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  let event;
  try {
    event = JSON.parse(req.body.toString());
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  if (event.event === 'payment.captured') {
    const payment   = event?.payload?.payment?.entity;
    if (!payment || !payment.order_id || !payment.id) {
      console.warn('[Razorpay webhook] Malformed payment.captured payload');
      return res.status(400).json({ error: 'Malformed payload' });
    }

    const orderId   = payment.order_id;
    const paymentId = payment.id;

    // Validate the order belongs to us, has the expected amount and currency,
    // and is in a state that allows transitioning to paid (idempotent guard).
    const orderRow = db.prepare(
      "SELECT id, status, amount_paise FROM consumer_orders WHERE gateway_order_id = ?"
    ).get(orderId);

    if (!orderRow) {
      console.warn('[Razorpay webhook] Order not found for gateway_order_id:', orderId);
      // Return 200 to prevent Razorpay from retrying for unknown orders
      return res.json({ status: 'unknown_order' });
    }

    // Guard: amount and currency must match our product (4900 paise, INR)
    if (payment.amount !== 4900 || payment.currency !== 'INR') {
      console.error('[Razorpay webhook] Amount/currency mismatch for order', orderId, {
        amount: payment.amount, currency: payment.currency,
      });
      return res.status(400).json({ error: 'Amount or currency mismatch' });
    }

    // Idempotent: only update if not already paid
    if (orderRow.status !== 'paid') {
      db.prepare(
        "UPDATE consumer_orders SET status = 'paid', gateway_payment_id = ?, paid_at = CURRENT_TIMESTAMP WHERE id = ?"
      ).run(paymentId, orderRow.id);
      console.log('[Razorpay webhook] Order marked paid via webhook:', orderId);
    } else {
      console.log('[Razorpay webhook] Order already paid, skipping update:', orderId);
    }
  }

  res.json({ status: 'ok' });
});

// Body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session
// A fixed fallback secret would let anyone forge session cookies, so without
// SESSION_SECRET we use a random per-boot secret (sessions reset on restart).
const sessionSecret = process.env.SESSION_SECRET || (() => {
  console.warn('[session] SESSION_SECRET is not set — using a random per-boot secret. Set it in production so sessions survive restarts.');
  return crypto.randomBytes(32).toString('hex');
})();

app.use(session({
  store: new SqliteSessionStore(db),
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    secure: 'auto',
  }
}));

// Helper: make session available in all templates
app.use((req, res, next) => {
  res.locals.userid       = req.session.userid       || '';
  res.locals.consumerId   = req.session.consumerId   || null;
  res.locals.consumerName = req.session.consumerName || '';
  next();
});

// ─── CSRF protection ─────────────────────────────────────────────────────────
// Every session gets a random token, exposed to all templates as csrfToken.
// Every POST must echo it back in a hidden `_csrf` field. The Razorpay
// webhook is unaffected: it is registered before the session middleware and
// authenticates with an HMAC signature over the raw body instead.
app.use((req, res, next) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(24).toString('hex');
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
});

app.use((req, res, next) => {
  if (req.method !== 'POST') return next();
  const submitted = (req.body && req.body._csrf) || req.headers['x-csrf-token'] || '';
  let valid = false;
  try {
    const a = Buffer.from(String(submitted));
    const b = Buffer.from(req.session.csrfToken || '');
    valid = a.length > 0 && a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch (_) {
    valid = false;
  }
  if (!valid) {
    console.warn('[CSRF] Rejected POST to', req.path);
    return res.status(403).send('Invalid or missing security token. Please go back, refresh the page, and try again.');
  }
  next();
});

// ─── Login rate limiting ─────────────────────────────────────────────────────
// Fixed-window in-memory limiter — enough to blunt credential stuffing on a
// single-process deployment without adding a dependency.
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const rateBuckets = new Map();

function rateLimited(bucket) {
  const now = Date.now();
  const entry = rateBuckets.get(bucket);
  if (!entry || now - entry.start > RATE_LIMIT_WINDOW_MS) {
    rateBuckets.set(bucket, { start: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

const rateLimitSweep = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateBuckets) {
    if (now - entry.start > RATE_LIMIT_WINDOW_MS) rateBuckets.delete(key);
  }
}, 60 * 1000);
if (rateLimitSweep.unref) rateLimitSweep.unref();

const RATE_LIMIT_MESSAGE = 'Too many attempts. Please wait 15 minutes and try again.';

// Consumer auth guard
function requireConsumer(req, res, next) {
  if (!req.session.consumerId) {
    return res.redirect('/login?next=' + encodeURIComponent(req.originalUrl));
  }
  next();
}

// Clinic auth guard — accounts still on the seeded default password are
// forced through /clinic-password before they can use any clinic page.
function requireClinic(req, res, next) {
  if (!req.session.userid) return res.redirect('/bmdlogin.asp');
  if (req.session.mustChangePassword) return res.redirect('/clinic-password');
  next();
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// Home – GET
app.get(['/', '/index.asp'], (req, res) => {
  res.render('index', { contactSuccess: false });
});

// Shared contact-form email delivery, used by the home page and /contact.asp.
// Failures are logged, never surfaced — a send failure must never break the page.
async function sendContactEmail({ fname, lname, email, phone, comment }) {
  console.log('[Contact Form]', { fname, lname, email, phone, comment });
  try {
    const transporter = createMailTransporter();
    if (!transporter) {
      console.warn('[Contact Form] GMAIL_USER or GMAIL_APP_PASSWORD not set — email not sent');
      return;
    }
    const ownerEmail = process.env.GMAIL_USER;
    const senderName = [fname, lname].filter(Boolean).join(' ') || 'A visitor';
    await transporter.sendMail({
      from:     `"e-healthwatch Contact Form" <${ownerEmail}>`,
      to:       ownerEmail,
      replyTo:  email || ownerEmail,
      subject:  `New enquiry from ${senderName} — e-healthwatch`,
      text: [
        `You have received a new contact form submission on e-healthwatch.`,
        ``,
        `Name:    ${senderName}`,
        `Email:   ${email || '(not provided)'}`,
        `Phone:   ${phone || '(not provided)'}`,
        ``,
        `Message:`,
        comment || '(no message)',
        ``,
        `---`,
        `Reply directly to this email to respond to the sender.`,
      ].join('\n'),
    });
    console.log('[Contact Form] Email sent to', ownerEmail);
  } catch (err) {
    console.error('[Contact Form] Failed to send email:', err.message);
  }
}

// Home – POST (contact form)
app.post(['/', '/index.asp'], async (req, res) => {
  await sendContactEmail(req.body);
  res.render('index', { contactSuccess: true });
});

// ─── Account emails (verification / password reset) ─────────────────────────

function appBaseUrl(req) {
  return process.env.APP_BASE_URL || `${req.protocol}://${req.get('host')}`;
}

// Generates and stores a fresh token, then emails the verification link.
// Without email configuration the link is logged so a developer/operator can
// still complete the flow manually; the account works fine unverified.
async function sendVerificationEmail(req, consumer) {
  const token   = crypto.randomBytes(24).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  db.prepare('UPDATE consumers SET verification_token = ?, verification_token_expires = ? WHERE id = ?')
    .run(token, expires, consumer.id);

  const link = `${appBaseUrl(req)}/verify-email?token=${token}`;
  const transporter = createMailTransporter();
  if (!transporter) {
    console.warn('[verify-email] Email not configured — verification link for', consumer.email, 'is:', link);
    return;
  }
  try {
    await transporter.sendMail({
      from:    `"e-healthwatch" <${process.env.GMAIL_USER}>`,
      to:      consumer.email,
      subject: 'Verify your email — e-healthwatch',
      text: [
        `Hello${consumer.full_name ? ' ' + consumer.full_name : ''},`,
        ``,
        `Please confirm your email address for your e-healthwatch account by opening this link:`,
        ``,
        link,
        ``,
        `The link is valid for 24 hours. If you did not create this account, you can ignore this email.`,
      ].join('\n'),
    });
    console.log('[verify-email] Verification email sent to', consumer.email);
  } catch (err) {
    console.error('[verify-email] Failed to send:', err.message);
  }
}

// Static content pages
app.get('/health.asp', (req, res) => res.render('health'));
app.get('/menopause.asp', (req, res) => res.render('menopause'));
app.get('/gynaecology.asp', (req, res) => res.render('gynaecology'));
app.get('/pregnancy.asp', (req, res) => res.render('pregnancy'));
app.get('/organ.asp', (req, res) => res.render('organ'));
app.get('/data.asp', (req, res) => res.render('data'));

// Contact
app.get(['/contact.asp', '/Contact.asp'], (req, res) => res.render('contact', { contactSuccess: false }));
app.post(['/contact.asp', '/Contact.asp'], async (req, res) => {
  await sendContactEmail(req.body);
  res.render('contact', { contactSuccess: true });
});

// BMD Login – GET
app.get('/bmdlogin.asp', (req, res) => {
  const msg = req.query.msg || '';
  res.render('bmdlogin', { msg });
});

// BMD Login – POST
app.post('/bmdlogin.asp', async (req, res) => {
  if (rateLimited('bmdlogin:' + req.ip)) {
    return res.status(429).render('bmdlogin', { msg: RATE_LIMIT_MESSAGE });
  }

  const { validate1, txtusername, txtpwd } = req.body;

  if (validate1 !== 'T') {
    return res.render('bmdlogin', { msg: '' });
  }

  const user = db.prepare(
    "SELECT username, pwd, expirydate, limitavailable FROM bmdlogin WHERE username = ?"
  ).get(txtusername);

  if (!user) {
    return res.render('bmdlogin', { msg: 'Invalid user credentials. Please try again.' });
  }

  // Determine whether the stored value is a bcrypt hash or a legacy plain-text password.
  const isHashed = user.pwd && user.pwd.startsWith('$2');
  let passwordValid = false;

  if (isHashed) {
    passwordValid = await bcrypt.compare(txtpwd, user.pwd);
  } else {
    // Legacy plain-text match
    passwordValid = user.pwd === txtpwd;
    if (passwordValid) {
      // Transparently rehash on first successful login so the plain-text value
      // is replaced and will never be stored again.
      const newHash = await bcrypt.hash(txtpwd, 12);
      db.prepare('UPDATE bmdlogin SET pwd = ? WHERE username = ?').run(newHash, user.username);
      console.log(`[BMD] Rehashed plain-text password for clinic account: ${user.username}`);
    }
  }

  if (!passwordValid) {
    return res.render('bmdlogin', { msg: 'Invalid user credentials. Please try again.' });
  }

  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const expiry = user.expirydate ? user.expirydate.replace(/-/g, '') : '99991231';

  if (expiry < today) {
    return res.render('bmdlogin', { msg: 'Demo version expired. Please contact the administrator.' });
  }

  req.session.userid = user.username;

  // The seeded default credentials are publicly documented — force a change
  // before this account can use any clinic page.
  if (user.username === 'admin' && txtpwd === 'admin123') {
    req.session.mustChangePassword = true;
    return res.redirect('/clinic-password');
  }

  return res.redirect('/clinic-dashboard');
});

// Forced password change for clinic accounts on default credentials
app.get('/clinic-password', (req, res) => {
  if (!req.session.userid) return res.redirect('/bmdlogin.asp');
  res.render('clinic-password', { error: null, username: req.session.userid });
});
app.post('/clinic-password', async (req, res) => {
  if (!req.session.userid) return res.redirect('/bmdlogin.asp');
  const username = req.session.userid;
  const { new_password, confirm_password } = req.body;
  if (!new_password || new_password.length < 8) {
    return res.render('clinic-password', { error: 'Password must be at least 8 characters.', username });
  }
  if (new_password !== confirm_password) {
    return res.render('clinic-password', { error: 'Passwords do not match.', username });
  }
  if (new_password === 'admin123') {
    return res.render('clinic-password', { error: 'Please choose a password different from the default one.', username });
  }
  const hash = await bcrypt.hash(new_password, 12);
  db.prepare('UPDATE bmdlogin SET pwd = ? WHERE username = ?').run(hash, username);
  console.log(`[BMD] Default password replaced for clinic account: ${username}`);
  req.session.mustChangePassword = false;
  res.redirect('/clinic-dashboard');
});

// BMD Logout
app.get('/bmdlogout', (req, res) => {
  req.session.userid = null;
  res.redirect('/bmdlogin.asp');
});

// Clinic Dashboard – GET (auth required)
app.get('/clinic-dashboard', requireClinic, (req, res) => {
  const account = db.prepare(
    'SELECT username, limitavailable, expirydate FROM bmdlogin WHERE username = ?'
  ).get(req.session.userid);

  if (!account) {
    req.session.userid = null;
    return res.redirect('/bmdlogin.asp');
  }

  const scansUsed = (db.prepare(
    'SELECT COUNT(*) as cnt FROM bmd WHERE clinic_username = ?'
  ).get(req.session.userid) || {}).cnt || 0;

  const recent = db.prepare(
    'SELECT * FROM bmd WHERE clinic_username = ? ORDER BY id DESC LIMIT 5'
  ).all(req.session.userid).map(r => {
    const h = parseFloat(r.height), w = parseFloat(r.weight);
    const a = parseFloat(r.age), hal = parseFloat(r.hal), nsa = parseFloat(r.nsa);
    let score = null;
    if (![h, w, a, hal, nsa].some(isNaN)) {
      score = (1.06861 * Math.pow(h * 0.01, 0.326842) * Math.pow(w, 0.211909) *
               Math.pow(hal, 0.0608258) * Math.pow(a, -0.332916) *
               Math.pow(nsa * 0.0174533, -0.239446)).toFixed(4);
    }
    return { ...r, score, dateStr: r.created_at ? r.created_at.slice(0, 10) : '—' };
  });

  // Expiry warning: flag if expiry is within 30 days or already past
  const today = new Date();
  let expiryWarning = false;
  let expiryLabel = account.expirydate || 'No expiry set';
  if (account.expirydate) {
    const exp = new Date(account.expirydate);
    const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
    if (diffDays <= 30) expiryWarning = true;
  }

  res.render('clinic-dashboard', {
    account,
    scansUsed,
    recent,
    expiryWarning,
    expiryLabel,
  });
});

// BMD Calculator – GET (auth required)
app.get('/bmd.asp', requireClinic, (req, res) => {
  req.session.guid = uuidv4();
  res.render('bmd', { bmdError: req.query.error || null });
});

// BMD Save – POST
app.post('/bmdsave.asp', requireClinic, (req, res) => {
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

  // Server-side validation: all numeric fields must be positive numbers
  const ageV    = parseFloat(Txt_age);
  const heightV = parseFloat(Txt_height);
  const weightV = parseFloat(Txt_weight);
  const halV    = parseFloat(Txt_hal);
  const nsaV    = parseFloat(Txt_nsa);

  const bmdInputError =
    !Txt_name || Txt_name.trim() === ''              ? 'Name is required.' :
    isNaN(ageV)    || ageV    <= 0                   ? 'Age must be a positive number.' :
    isNaN(heightV) || heightV <= 0                   ? 'Height must be a positive number.' :
    isNaN(weightV) || weightV <= 0                   ? 'Weight must be a positive number.' :
    isNaN(halV)    || halV    <= 0                   ? 'HAL must be a positive number.' :
    isNaN(nsaV)    || nsaV    <= 0                   ? 'NSA must be a positive number.' :
    null;

  if (bmdInputError) {
    return res.redirect('/bmd.asp?error=' + encodeURIComponent(bmdInputError));
  }

  db.prepare(
    "INSERT INTO bmd (name, age, height, weight, hal, nsa, guid, clinic_username) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(Txt_name, Txt_age, Txt_height, Txt_weight, Txt_hal, Txt_nsa, guid, req.session.userid);

  db.prepare(
    "UPDATE bmdlogin SET limitavailable = limitavailable - 1 WHERE username = ?"
  ).run(req.session.userid);

  return res.redirect('/result.asp');
});

// BMD Result
app.get('/result.asp', requireClinic, (req, res) => {
  if (!req.session.guid) return res.redirect('/bmd.asp');

  const guid = req.session.guid;
  const row = db.prepare("SELECT * FROM bmd WHERE guid = ?").get(guid);

  if (!row) return res.redirect('/bmd.asp');

  const height = parseFloat(row.height);
  const weight = parseFloat(row.weight);
  const age    = parseFloat(row.age);
  const hal    = parseFloat(row.hal);
  const nsa    = parseFloat(row.nsa);

  const bmdScore = parseFloat((
    1.06861 *
    Math.pow(height * 0.01, 0.326842) *
    Math.pow(weight, 0.211909) *
    Math.pow(hal, 0.0608258) *
    Math.pow(age, -0.332916) *
    Math.pow(nsa * 0.0174533, -0.239446)
  ).toFixed(4));

  // WHO classification thresholds for femoral neck BMD (g/cm²)
  // Based on NHANES III reference data: young adult mean 0.858, SD 0.120
  //   T-score −1.0  →  BMD ≥ 0.738  → Normal
  //   T-score −2.5  →  BMD ≥ 0.558  → Osteopenia
  //                    BMD  < 0.558  → Osteoporosis
  let classification, classColor, classNote;
  if (bmdScore >= 0.738) {
    classification = 'Normal';
    classColor     = 'green';
    classNote      = 'Bone density is within the normal range. Maintain with regular weight-bearing exercise and adequate calcium intake.';
  } else if (bmdScore >= 0.558) {
    classification = 'Osteopenia';
    classColor     = 'amber';
    classNote      = 'Bone density is lower than normal. Consider lifestyle modifications, dietary calcium, vitamin D supplementation, and a DEXA scan for monitoring.';
  } else {
    classification = 'Osteoporosis';
    classColor     = 'rose';
    classNote      = 'Bone density is significantly reduced. Refer to a specialist for DEXA scan, pharmacological assessment, and fracture risk evaluation.';
  }

  // Records are now kept permanently — no DELETE here.
  // Clear the guid from the session so Back → /bmd.asp gets a fresh form.
  req.session.guid = null;

  res.render('result', {
    result: bmdScore.toFixed(4),
    name: row.name,
    recordId: row.id,
    classification,
    classColor,
    classNote,
  });
});

// BMD Report – printable page for a specific record
app.get('/bmd-report/:id', requireClinic, (req, res) => {
  const record = db.prepare(
    'SELECT * FROM bmd WHERE id = ? AND clinic_username = ?'
  ).get(req.params.id, req.session.userid);

  if (!record) return res.redirect('/bmd-history');

  const h = parseFloat(record.height), w = parseFloat(record.weight);
  const a = parseFloat(record.age), hal = parseFloat(record.hal), nsa = parseFloat(record.nsa);

  const bmdScore = parseFloat((
    1.06861 *
    Math.pow(h * 0.01, 0.326842) *
    Math.pow(w, 0.211909) *
    Math.pow(hal, 0.0608258) *
    Math.pow(a, -0.332916) *
    Math.pow(nsa * 0.0174533, -0.239446)
  ).toFixed(4));

  let classification, classColor, classNote;
  if (bmdScore >= 0.738) {
    classification = 'Normal';       classColor = 'green';
    classNote = 'Bone density is within the normal range. Maintain with regular weight-bearing exercise and adequate calcium intake.';
  } else if (bmdScore >= 0.558) {
    classification = 'Osteopenia';   classColor = 'amber';
    classNote = 'Bone density is lower than normal. Consider lifestyle modifications, dietary calcium, vitamin D supplementation, and a DEXA scan for monitoring.';
  } else {
    classification = 'Osteoporosis'; classColor = 'rose';
    classNote = 'Bone density is significantly reduced. Refer to a specialist for DEXA scan, pharmacological assessment, and fracture risk evaluation.';
  }

  const printDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  res.render('bmd-report', {
    record,
    result: bmdScore.toFixed(4),
    classification,
    classColor,
    classNote,
    clinicUser: req.session.userid,
    printDate,
  });
});

// BMD History – all records for this clinic
app.get('/bmd-history', requireClinic, (req, res) => {
  const records = db.prepare(
    "SELECT * FROM bmd WHERE clinic_username = ? ORDER BY id DESC"
  ).all(req.session.userid);
  res.render('bmd-history', { records, clinicUser: req.session.userid, patientFilter: null });
});

// BMD History – per-patient view
app.get('/bmd-patient/:name', requireClinic, (req, res) => {
  const name = req.params.name;
  const records = db.prepare(
    "SELECT * FROM bmd WHERE clinic_username = ? AND LOWER(name) = LOWER(?) ORDER BY id DESC"
  ).all(req.session.userid, name);
  res.render('bmd-history', { records, clinicUser: req.session.userid, patientFilter: name });
});

// ─── Consumer Account Routes ─────────────────────────────────────────────────

// Sign up
app.get('/signup', (req, res) => {
  if (req.session.consumerId) return res.redirect('/dashboard');
  res.render('signup', { error: null });
});
app.post('/signup', async (req, res) => {
  if (rateLimited('signup:' + req.ip)) {
    return res.status(429).render('signup', { error: RATE_LIMIT_MESSAGE });
  }
  const { full_name, email, password, confirm_password, consent } = req.body;
  if (!consent)                   return res.render('signup', { error: 'You must accept the privacy policy to continue.' });
  if (!password || password.length < 8) return res.render('signup', { error: 'Password must be at least 8 characters.' });
  if (password !== confirm_password)    return res.render('signup', { error: 'Passwords do not match.' });
  try {
    const existing = db.prepare('SELECT id FROM consumers WHERE email = ?').get(email);
    if (existing) return res.render('signup', { error: 'An account with this email already exists. Sign in instead.' });
    const password_hash = await bcrypt.hash(password, 12);
    const r = db.prepare('INSERT INTO consumers (email, password_hash, full_name, consent_given_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)').run(email, password_hash, full_name || null);
    req.session.consumerId   = r.lastInsertRowid;
    req.session.consumerName = full_name || email.split('@')[0];
    await sendVerificationEmail(req, { id: r.lastInsertRowid, email, full_name });
    res.redirect('/dashboard');
  } catch (err) {
    console.error('[signup error]', err);
    res.render('signup', { error: 'Something went wrong. Please try again.' });
  }
});

// Sign in
app.get('/login', (req, res) => {
  if (req.session.consumerId) return res.redirect('/dashboard');
  res.render('consumer-login', { error: null, next: req.query.next || '/dashboard' });
});
app.post('/login', async (req, res) => {
  const { email, password, next } = req.body;
  const safeNext = (next && next.startsWith('/') && !next.startsWith('//')) ? next : '/dashboard';
  if (rateLimited('login:' + req.ip)) {
    return res.status(429).render('consumer-login', { error: RATE_LIMIT_MESSAGE, next: safeNext });
  }
  try {
    const consumer = db.prepare('SELECT * FROM consumers WHERE email = ?').get(email);
    if (!consumer) return res.render('consumer-login', { error: 'No account found with this email.', next: safeNext });
    const match = await bcrypt.compare(password, consumer.password_hash);
    if (!match)    return res.render('consumer-login', { error: 'Incorrect password. Please try again.', next: safeNext });
    req.session.consumerId   = consumer.id;
    req.session.consumerName = consumer.full_name || consumer.email.split('@')[0];
    res.redirect(safeNext);
  } catch (err) {
    console.error('[login error]', err);
    res.render('consumer-login', { error: 'Something went wrong. Please try again.', next: safeNext });
  }
});

// Email verification — link target from the verification email
app.get('/verify-email', (req, res) => {
  const token = String(req.query.token || '');
  let status = 'invalid';
  if (token) {
    const row = db.prepare('SELECT id, verification_token_expires FROM consumers WHERE verification_token = ?').get(token);
    if (row) {
      if (row.verification_token_expires && row.verification_token_expires < new Date().toISOString()) {
        status = 'expired';
      } else {
        db.prepare('UPDATE consumers SET email_verified = 1, verification_token = NULL, verification_token_expires = NULL WHERE id = ?').run(row.id);
        status = 'success';
      }
    }
  }
  res.render('verify-email', { status });
});

// Resend verification email (from the dashboard banner)
app.post('/resend-verification', requireConsumer, async (req, res) => {
  if (rateLimited('resend-verify:' + req.ip)) return res.redirect('/dashboard');
  const consumer = db.prepare('SELECT id, email, full_name, email_verified FROM consumers WHERE id = ?').get(req.session.consumerId);
  if (consumer && !consumer.email_verified) {
    await sendVerificationEmail(req, consumer);
  }
  res.redirect('/dashboard?verifySent=1');
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
  const consumer = db.prepare('SELECT email_verified FROM consumers WHERE id = ?').get(req.session.consumerId);
  res.render('dashboard', {
    profiles: profilesWithStatus,
    consumerName: req.session.consumerName,
    emailVerified: !!(consumer && consumer.email_verified),
    verifySent: req.query.verifySent === '1',
  });
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
  res.render('forecast-gated', { profile, error: null, razorpayOrder: null, razorpayKeyId: null });
});

// Step 1: Validate form inputs → create Razorpay order → re-render with widget data
app.post('/forecast/:profileId', requireConsumer, async (req, res) => {
  const profile = db.prepare('SELECT * FROM consumer_profiles WHERE id = ? AND consumer_id = ?').get(req.params.profileId, req.session.consumerId);
  if (!profile) return res.redirect('/dashboard');

  const { Txt_age, cmbperiods, Txt_amh } = req.body;
  if (!Txt_age || !cmbperiods || !Txt_amh) {
    return res.render('forecast-gated', { profile, error: 'All fields are required.', razorpayOrder: null, razorpayKeyId: null });
  }

  const ageNum = parseFloat(Txt_age);
  const amhNum = parseFloat(Txt_amh);
  if (isNaN(ageNum) || ageNum < 18 || ageNum > 60) {
    return res.render('forecast-gated', { profile, error: 'Please enter a valid age between 18 and 60.', razorpayOrder: null, razorpayKeyId: null });
  }
  if (isNaN(amhNum) || amhNum <= 0 || amhNum > 20) {
    return res.render('forecast-gated', { profile, error: 'Please enter a valid AMH value between 0.01 and 20 ng/mL.', razorpayOrder: null, razorpayKeyId: null });
  }
  if (cmbperiods !== 'R' && cmbperiods !== 'I') {
    return res.render('forecast-gated', { profile, error: 'Please select a menstrual cycle type.', razorpayOrder: null, razorpayKeyId: null });
  }

  // Store form inputs in session for use after payment verification
  req.session.pendingForecast = { profileId: profile.id, Txt_age, cmbperiods, Txt_amh };

  const razorpay = getRazorpay();
  if (!razorpay) {
    console.error('[Razorpay] RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not configured');
    return res.render('forecast-gated', { profile, error: 'Payments are not configured on this server. Please contact support.', razorpayOrder: null, razorpayKeyId: null });
  }

  try {
    const consumer = db.prepare('SELECT email, full_name FROM consumers WHERE id = ?').get(req.session.consumerId);
    const receipt  = `ehw_${profile.id}_${Date.now()}`;

    // Create order in Razorpay
    const rzpOrder = await razorpay.orders.create({
      amount:   4900,
      currency: 'INR',
      receipt,
      notes: {
        consumer_id: String(req.session.consumerId),
        profile_id:  String(profile.id),
      },
    });

    // Persist the order record (status = created)
    db.prepare(
      'INSERT INTO consumer_orders (consumer_id, profile_id, status, gateway_order_id) VALUES (?, ?, ?, ?)'
    ).run(req.session.consumerId, profile.id, 'created', rzpOrder.id);

    // Key pendingForecast by gateway_order_id so multi-tab/multi-order scenarios
    // cannot mix up form inputs belonging to different orders.
    req.session.pendingForecast = {
      gatewayOrderId: rzpOrder.id,
      profileId: profile.id,
      Txt_age, cmbperiods, Txt_amh,
    };

    res.render('forecast-gated', {
      profile,
      error: null,
      razorpayOrder: {
        id:     rzpOrder.id,
        amount: rzpOrder.amount,
      },
      razorpayKeyId:    process.env.RAZORPAY_KEY_ID,
      consumerEmail:    consumer ? consumer.email    : '',
      consumerName:     consumer ? consumer.full_name || req.session.consumerName : req.session.consumerName,
      formValues: { Txt_age, cmbperiods, Txt_amh },
    });
  } catch (err) {
    console.error('[Razorpay order create error]', err);
    res.render('forecast-gated', { profile, error: 'Payment gateway error. Please try again.', razorpayOrder: null, razorpayKeyId: null });
  }
});

// Step 2: Verify Razorpay signature → run forecast → save result → redirect
app.post('/forecast/:profileId/verify', requireConsumer, (req, res) => {
  const profile = db.prepare('SELECT * FROM consumer_profiles WHERE id = ? AND consumer_id = ?').get(req.params.profileId, req.session.consumerId);
  if (!profile) return res.redirect('/dashboard');

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).render('payment-error', { message: 'Missing payment fields. Please try again.', profileId: profile.id });
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    console.error('[Razorpay verify] RAZORPAY_KEY_SECRET not configured');
    return res.status(503).render('payment-error', { message: 'Payments are not configured on this server. Please contact support.', profileId: profile.id });
  }

  // Verify HMAC signature using timing-safe comparison
  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  // Guard: signature must be a non-empty even-length hex string before calling timingSafeEqual
  let sigValid = false;
  if (razorpay_signature && razorpay_signature.length > 0 && razorpay_signature.length % 2 === 0) {
    try {
      const sigBuf = Buffer.from(razorpay_signature, 'hex');
      const expBuf = Buffer.from(expectedSig, 'hex');
      if (sigBuf.length === expBuf.length) {
        sigValid = crypto.timingSafeEqual(sigBuf, expBuf);
      }
    } catch (_) {
      sigValid = false;
    }
  }
  if (!sigValid) {
    console.error('[Razorpay verify] Signature mismatch', { razorpay_order_id });
    return res.status(400).render('payment-error', { message: 'Payment verification failed. If you were charged, please contact support.', profileId: profile.id });
  }

  // Retrieve pending forecast inputs — must be keyed to this exact gateway order
  const pending = req.session.pendingForecast;
  if (!pending || pending.gatewayOrderId !== razorpay_order_id || pending.profileId !== profile.id) {
    return res.status(400).render('payment-error', { message: 'Session mismatch or expired. Please fill in the form again.', profileId: profile.id });
  }

  // Require the local order row to exist, belong to this consumer + profile, and still be in 'created' state.
  // No fallback creation — fulfillment is only possible for server-created orders.
  const orderRow = db.prepare(
    "SELECT id, status, amount_paise FROM consumer_orders WHERE gateway_order_id = ? AND consumer_id = ? AND profile_id = ? AND status = 'created'"
  ).get(razorpay_order_id, req.session.consumerId, profile.id);

  if (!orderRow) {
    // Order may have already been fulfilled via webhook before the browser callback arrived.
    // Check if paid — if so, ensure a result row exists (backfill if session inputs are still present).
    const alreadyPaid = db.prepare(
      "SELECT id FROM consumer_orders WHERE gateway_order_id = ? AND consumer_id = ? AND profile_id = ? AND status = 'paid'"
    ).get(razorpay_order_id, req.session.consumerId, profile.id);

    if (alreadyPaid) {
      // Check whether result was already written
      const existingResult = db.prepare(
        'SELECT id FROM mp_results_v2 WHERE order_id = ?'
      ).get(alreadyPaid.id);

      if (!existingResult) {
        // Webhook marked order paid but result was never written (webhook-wins race).
        // Backfill using session inputs if available.
        const backfillPending = req.session.pendingForecast;
        if (backfillPending && backfillPending.gatewayOrderId === razorpay_order_id && backfillPending.profileId === profile.id) {
          const { Txt_age: bAge, cmbperiods: bPeriods, Txt_amh: bAmh } = backfillPending;
          const bb0    = bPeriods === 'R' ? 35.49 : 41.41;
          const bb1    = bPeriods === 'R' ? 0.15  : 0.17;
          const bP     = bPeriods === 'R' ? 'Regular' : 'Irregular';
          const bAmhV  = parseFloat(bAmh);
          const bFm    = Math.round(bb0 * Math.pow(bAmhV, bb1));
          db.prepare(
            'INSERT OR IGNORE INTO mp_results_v2 (order_id, profile_id, input_json, result_json) VALUES (?, ?, ?, ?)'
          ).run(
            alreadyPaid.id, profile.id,
            JSON.stringify({ age: bAge, amh: bAmhV, periods: bP }),
            JSON.stringify({ forecastAge: bFm, periods: bP, amhvalue: bAmhV })
          );
          console.log('[Razorpay verify] Backfilled result for webhook-paid order:', razorpay_order_id);
        } else {
          // Session expired — result cannot be computed; user must contact support.
          console.error('[Razorpay verify] Webhook-paid order missing result and session expired:', razorpay_order_id);
          return res.status(400).render('payment-error', {
            message: 'Your payment was received but your session expired before the result could be saved. Please contact support — we will generate your result manually within 24 hours.',
            profileId: profile.id,
          });
        }
      }

      req.session.pendingForecast = null;
      return res.redirect('/my-result/' + profile.id);
    }

    console.error('[Razorpay verify] No matching created order for', razorpay_order_id);
    return res.status(400).render('payment-error', { message: 'Order not found or already processed. Please contact support if you were charged.', profileId: profile.id });
  }

  // Enforce expected amount for this product (4900 paise = ₹49)
  if (orderRow.amount_paise !== 4900) {
    console.error('[Razorpay verify] Amount mismatch on order', orderRow.id, orderRow.amount_paise);
    return res.status(400).render('payment-error', { message: 'Order amount mismatch. Please contact support.', profileId: profile.id });
  }

  const { Txt_age, cmbperiods, Txt_amh } = pending;
  const b0      = cmbperiods === 'R' ? 35.49 : 41.41;
  const b1      = cmbperiods === 'R' ? 0.15  : 0.17;
  const periods = cmbperiods === 'R' ? 'Regular' : 'Irregular';
  const amhvalue = parseFloat(Txt_amh);
  const fmvalue  = Math.round(b0 * Math.pow(amhvalue, b1));

  // Mark order paid and persist result — both in one synchronous SQLite transaction
  db.transaction(() => {
    db.prepare(
      "UPDATE consumer_orders SET status = 'paid', gateway_payment_id = ?, paid_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).run(razorpay_payment_id, orderRow.id);

    db.prepare(
      'INSERT OR IGNORE INTO mp_results_v2 (order_id, profile_id, input_json, result_json) VALUES (?, ?, ?, ?)'
    ).run(
      orderRow.id, profile.id,
      JSON.stringify({ age: Txt_age, amh: amhvalue, periods }),
      JSON.stringify({ forecastAge: fmvalue, periods, amhvalue })
    );
  })();

  // Clear pending forecast from session
  req.session.pendingForecast = null;
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
// Kept for backward compatibility with BMD clinic workflow only.
// Consumers must go through the paid /forecast/:profileId flow — allowing a
// consumer session here would let them compute the forecast without paying.
app.post('/mpresult.asp', (req, res) => {
  if (!req.session.userid) {
    return res.redirect(req.session.consumerId ? '/dashboard' : '/forecasting.asp');
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

// ─── Admin Panel ─────────────────────────────────────────────────────────────

// Middleware: require admin session
function requireAdmin(req, res, next) {
  if (!req.session.adminLoggedIn) {
    return res.redirect('/admin/login');
  }
  next();
}

// Helper: escape a single CSV cell value
function csvCell(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

// Helper: render CSV from array of objects with given column keys
function sendCsv(res, filename, columns, rows) {
  const header = columns.map(c => csvCell(c.label)).join(',');
  const body   = rows.map(r => columns.map(c => csvCell(r[c.key])).join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(header + '\n' + body);
}

// GET /admin  → redirect to users
app.get('/admin', requireAdmin, (req, res) => res.redirect('/admin/users'));

// GET /admin/login
app.get('/admin/login', (req, res) => {
  if (req.session.adminLoggedIn) return res.redirect('/admin/users');
  res.render('admin/login', { error: null });
});

// POST /admin/login
app.post('/admin/login', (req, res) => {
  if (rateLimited('admin:' + req.ip)) {
    return res.status(429).render('admin/login', { error: RATE_LIMIT_MESSAGE });
  }
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    // ADMIN_PASSWORD secret not set — refuse login rather than accepting any password
    return res.render('admin/login', { error: 'Admin access is not configured on this server.' });
  }

  // Constant-time comparison to prevent timing attacks
  let match = false;
  try {
    const a = Buffer.from(password || '');
    const b = Buffer.from(adminPassword);
    if (a.length === b.length) {
      match = crypto.timingSafeEqual(a, b);
    }
  } catch (_) {
    match = false;
  }

  if (!match) {
    return res.render('admin/login', { error: 'Incorrect password. Please try again.' });
  }

  req.session.adminLoggedIn = true;
  res.redirect('/admin/users');
});

// GET /admin/logout
app.get('/admin/logout', (req, res) => {
  req.session.adminLoggedIn = false;
  res.redirect('/admin/login');
});

// Shared counts helper (used in tab badges across all pages)
function getTabCounts() {
  return {
    userCount:   (db.prepare('SELECT COUNT(*) as c FROM consumers').get() || {}).c || 0,
    orderCount:  (db.prepare('SELECT COUNT(*) as c FROM consumer_orders').get() || {}).c || 0,
    resultCount: (db.prepare('SELECT COUNT(*) as c FROM mp_results_v2').get() || {}).c || 0,
    bmdCount:    (db.prepare('SELECT COUNT(*) as c FROM bmd').get() || {}).c || 0,
    clinicCount: (db.prepare('SELECT COUNT(*) as c FROM bmdlogin').get() || {}).c || 0,
  };
}

// GET /admin/users
app.get('/admin/users', requireAdmin, (req, res) => {
  const users = db.prepare(`
    SELECT c.id, c.email, c.full_name, c.email_verified, c.created_at,
           COUNT(p.id) as profile_count
    FROM consumers c
    LEFT JOIN consumer_profiles p ON p.consumer_id = c.id
    GROUP BY c.id
    ORDER BY c.id DESC
  `).all();

  if (req.query.export === 'csv') {
    return sendCsv(res, 'users.csv', [
      { key: 'id',            label: 'ID' },
      { key: 'full_name',     label: 'Name' },
      { key: 'email',         label: 'Email' },
      { key: 'email_verified',label: 'Email Verified' },
      { key: 'profile_count', label: 'Profiles' },
      { key: 'created_at',    label: 'Joined' },
    ], users);
  }

  const verifiedUsers = users.filter(u => u.email_verified).length;
  res.render('admin/users', {
    users,
    totalUsers: users.length,
    verifiedUsers,
    ...getTabCounts(),
  });
});

// GET /admin/orders
app.get('/admin/orders', requireAdmin, (req, res) => {
  const orders = db.prepare(`
    SELECT o.id, o.amount_paise, o.status, o.gateway_order_id, o.gateway_payment_id,
           o.created_at, o.paid_at,
           c.full_name as consumer_name, c.email as consumer_email,
           p.display_name as profile_name
    FROM consumer_orders o
    LEFT JOIN consumers c ON c.id = o.consumer_id
    LEFT JOIN consumer_profiles p ON p.id = o.profile_id
    ORDER BY o.id DESC
  `).all();

  if (req.query.export === 'csv') {
    return sendCsv(res, 'orders.csv', [
      { key: 'id',               label: 'Order ID' },
      { key: 'consumer_name',    label: 'Consumer Name' },
      { key: 'consumer_email',   label: 'Consumer Email' },
      { key: 'profile_name',     label: 'Profile' },
      { key: 'amount_paise',     label: 'Amount (paise)' },
      { key: 'status',           label: 'Status' },
      { key: 'gateway_order_id', label: 'Gateway Order ID' },
      { key: 'paid_at',          label: 'Paid At' },
      { key: 'created_at',       label: 'Created At' },
    ], orders);
  }

  const paidOrders       = orders.filter(o => o.status === 'paid').length;
  const paidRevenuePaise = orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + (o.amount_paise || 0), 0);

  res.render('admin/orders', {
    orders,
    totalOrders: orders.length,
    paidOrders,
    paidRevenuePaise,
    ...getTabCounts(),
  });
});

// GET /admin/results
app.get('/admin/results', requireAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT r.id, r.input_json, r.result_json, r.created_at,
           c.full_name as consumer_name, c.email as consumer_email,
           p.display_name as profile_name
    FROM mp_results_v2 r
    LEFT JOIN consumer_profiles p ON p.id = r.profile_id
    LEFT JOIN consumers c ON c.id = p.consumer_id
    ORDER BY r.id DESC
  `).all();

  // Parse JSON columns server-side — never expose raw JSON to the template
  const results = rows.map(r => {
    let input = {}, result = {};
    try { input  = JSON.parse(r.input_json  || '{}'); } catch (_) {}
    try { result = JSON.parse(r.result_json || '{}'); } catch (_) {}
    return {
      id:              r.id,
      consumer_name:   r.consumer_name,
      consumer_email:  r.consumer_email,
      profile_name:    r.profile_name,
      input_age:       input.age,
      input_amh:       input.amh,
      input_periods:   input.periods,
      forecast_age:    result.forecastAge,
      created_at:      r.created_at,
    };
  });

  if (req.query.export === 'csv') {
    return sendCsv(res, 'results.csv', [
      { key: 'id',             label: 'Result ID' },
      { key: 'consumer_name',  label: 'Consumer Name' },
      { key: 'consumer_email', label: 'Consumer Email' },
      { key: 'profile_name',   label: 'Profile' },
      { key: 'input_age',      label: 'Age at Test' },
      { key: 'input_amh',      label: 'AMH (ng/mL)' },
      { key: 'input_periods',  label: 'Cycle Type' },
      { key: 'forecast_age',   label: 'Forecast Menopause Age' },
      { key: 'created_at',     label: 'Test Date' },
    ], results);
  }

  res.render('admin/results', { results, ...getTabCounts() });
});

// GET /admin/bmd
app.get('/admin/bmd', requireAdmin, (req, res) => {
  const records = db.prepare('SELECT * FROM bmd ORDER BY id DESC').all();

  if (req.query.export === 'csv') {
    return sendCsv(res, 'bmd-records.csv', [
      { key: 'id',     label: 'ID' },
      { key: 'name',   label: 'Patient Name' },
      { key: 'age',    label: 'Age' },
      { key: 'height', label: 'Height (cm)' },
      { key: 'weight', label: 'Weight (kg)' },
      { key: 'hal',    label: 'HAL' },
      { key: 'nsa',    label: 'NSA (degrees)' },
      { key: 'guid',   label: 'Session ID' },
    ], records);
  }

  res.render('admin/bmd', { records, ...getTabCounts() });
});

// GET /admin/clinic
app.get('/admin/clinic', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT id, username, expirydate, limitavailable, pwd FROM bmdlogin ORDER BY id').all();

  const accounts = rows.map(r => ({
    ...r,
    // Expose whether this account still has the known-insecure default credentials.
    // Works for both legacy plain-text storage and post-migration bcrypt hashes.
    isDefault: r.username === 'admin' && (
      r.pwd === 'admin123' ||
      (r.pwd && r.pwd.startsWith('$2') && bcrypt.compareSync('admin123', r.pwd))
    ),
    // Strip pwd from the object passed to the template — never render passwords
    pwd: undefined,
  }));

  const hasDefaultCredentials = accounts.some(a => a.isDefault);

  res.render('admin/clinic', {
    accounts,
    hasDefaultCredentials,
    flash: req.session.clinicFlash || null,
    ...getTabCounts(),
  });
  req.session.clinicFlash = null;
});

// POST /admin/clinic/:username/password
app.post('/admin/clinic/:username/password', requireAdmin, async (req, res) => {
  const { username } = req.params;
  const { new_password } = req.body;

  if (!new_password || new_password.length < 8) {
    req.session.clinicFlash = { type: 'error', message: 'Password must be at least 8 characters.' };
    return res.redirect('/admin/clinic');
  }

  const account = db.prepare('SELECT id FROM bmdlogin WHERE username = ?').get(username);
  if (!account) {
    req.session.clinicFlash = { type: 'error', message: `Account "${username}" not found.` };
    return res.redirect('/admin/clinic');
  }

  const hash = await bcrypt.hash(new_password, 12);
  db.prepare('UPDATE bmdlogin SET pwd = ? WHERE username = ?').run(hash, username);
  console.log(`[Admin] Password hashed and updated for clinic account: ${username}`);
  req.session.clinicFlash = { type: 'success', message: `Password for "${username}" updated successfully.` };
  res.redirect('/admin/clinic');
});

// POST /admin/clinic/:username/settings
app.post('/admin/clinic/:username/settings', requireAdmin, (req, res) => {
  const { username } = req.params;
  const { expirydate, limitavailable } = req.body;

  const limit = parseInt(limitavailable, 10);
  if (isNaN(limit) || limit < 0) {
    req.session.clinicFlash = { type: 'error', message: 'Scan limit must be a non-negative whole number.' };
    return res.redirect('/admin/clinic');
  }

  // Validate date format (YYYY-MM-DD) if provided
  if (expirydate && !/^\d{4}-\d{2}-\d{2}$/.test(expirydate)) {
    req.session.clinicFlash = { type: 'error', message: 'Expiry date must be in YYYY-MM-DD format.' };
    return res.redirect('/admin/clinic');
  }

  const account = db.prepare('SELECT id FROM bmdlogin WHERE username = ?').get(username);
  if (!account) {
    req.session.clinicFlash = { type: 'error', message: `Account "${username}" not found.` };
    return res.redirect('/admin/clinic');
  }

  db.prepare('UPDATE bmdlogin SET expirydate = ?, limitavailable = ? WHERE username = ?')
    .run(expirydate || null, limit, username);
  console.log(`[Admin] Settings updated for clinic account: ${username} (expiry=${expirydate}, limit=${limit})`);
  req.session.clinicFlash = { type: 'success', message: `Settings for "${username}" saved.` };
  res.redirect('/admin/clinic');
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`e-healthwatch running on port ${PORT}`);
});
