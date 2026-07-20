# e-healthwatch

A women's health platform — converted from Classic ASP to Node.js/Express — with two products:

- **Menopause Forecasting** (consumer): free account → up to 3 profiles → ₹49 one-time payment per test (Razorpay) → result stored permanently, viewable and printable any time.
- **BMD Calculator** (clinic-licensed): login-gated Bone Mineral Density calculator with per-account scan limits, expiry dates, history, and printable reports.

## Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Template engine**: EJS
- **Database**: SQLite (via better-sqlite3, auto-created on first run; also stores sessions)
- **Sessions**: express-session backed by a SQLite store (`session-store.js`)
- **Payments**: Razorpay (hosted checkout + server-side signature verification + webhook)
- **Email**: Nodemailer via Gmail (contact form, verification, password reset, receipts)
- **CSS**: single custom design system in `public/css/custom.css` (no Bootstrap; a small grid shim covers legacy page markup)

## Running the App

```bash
npm install
node server.js
```

The app runs on port 5000 by default.

```bash
npm test   # runs the test suite in tests/
```

## Project Structure

```
server.js         # Main Express app + all routes
db.js             # SQLite database setup, migrations, and seeding
session-store.js  # SQLite-backed express-session store
views/            # EJS templates (admin/ for the admin panel, partials/ shared)
public/           # Static assets (css, images)
tests/            # Node test scripts (no framework), run via npm test
ehealthwatch.db   # SQLite database (auto-created on first run; gitignored)
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SESSION_SECRET` | production | Secret for session cookie signing. Without it a random per-boot secret is used (sessions reset on restart). |
| `PORT` | no | Port to listen on (default: 5000) |
| `ADMIN_PASSWORD` | for admin panel | Password for `/admin` login. Admin login is refused if unset. |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | for email | Gmail account + app password used for contact form, verification, password reset, and receipt emails. Without them, links are logged to the console instead. |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | for payments | Razorpay API keys. Without them payment routes show a friendly error. |
| `RAZORPAY_WEBHOOK_SECRET` | for payments | HMAC secret for `/razorpay-webhook`. The webhook rejects everything until it is set. |
| `APP_BASE_URL` | no | Absolute base URL used in emailed links (defaults to the request's host). |

## Routes

### Public
| URL | Description |
|-----|-------------|
| `/` | Home page (hero, sample result, pricing, contact form) |
| `/health.asp`, `/menopause.asp`, `/gynaecology.asp`, `/pregnancy.asp`, `/organ.asp`, `/data.asp` | Info pages (original .asp URLs preserved) |
| `/contact.asp` | Contact page with working form (emails the owner) |
| `/privacy` | Privacy policy / DPDP notice |
| `/forecasting.asp` | Menopause forecast landing (legacy URL) |

### Consumer accounts
| URL | Description |
|-----|-------------|
| `/signup`, `/login`, `/consumer-logout` | Account auth (bcrypt, rate-limited) |
| `/forgot-password`, `/reset-password/:token` | Password reset (1-hour single-use emailed link) |
| `/verify-email`, `POST /resend-verification` | Email verification |
| `/dashboard` | Profile picker (max 3 profiles) |
| `/profile/new`, `/profile/:id` | Profile management |
| `/forecast/:profileId` (+ `/verify`) | Paid forecast flow: form → Razorpay order → server-side signature verification → stored result |
| `/my-result/:profileId` | Stored result (free forever after paying) |
| `/forecast-report/:profileId` | Printable / save-as-PDF report |
| `/orders` | Order history with receipts |
| `POST /razorpay-webhook` | Razorpay webhook (HMAC-verified, source of truth for payment status) |

### BMD clinic
| URL | Description |
|-----|-------------|
| `/bmdlogin.asp` | Clinic login (rate-limited; default credentials force a password change at `/clinic-password`) |
| `/clinic-dashboard` | Scan usage, recent records, expiry warning |
| `/bmd.asp`, `/bmdsave.asp`, `/result.asp` | BMD calculator flow |
| `/bmd-history`, `/bmd-patient/:name`, `/bmd-report/:id` | History, per-patient view, printable report |
| `/logout.asp` | Logout |

### Admin panel (`ADMIN_PASSWORD` required)
| URL | Description |
|-----|-------------|
| `/admin/login` | Admin login (timing-safe compare, rate-limited) |
| `/admin/users`, `/admin/orders`, `/admin/results`, `/admin/bmd` | Data views, each with CSV export |
| `/admin/clinic` | Clinic accounts: create, disable/re-enable, change password (bcrypt, min 8 chars), expiry & scan limits |

## Security notes

- All queries are parameterized (better-sqlite3 prepared statements).
- All passwords bcrypt-hashed (cost 12); legacy plaintext clinic passwords are migrated on startup and on login.
- CSRF token required on every POST (except the HMAC-verified Razorpay webhook).
- Session cookie: `httpOnly`, `sameSite=lax`, `secure` on HTTPS (behind `trust proxy`).
- Login/signup/reset endpoints rate-limited (10 attempts / 15 min per IP).
- Payment fulfillment only after server-side signature verification; webhook validates amount/currency and is idempotent.

## Default BMD Login

The database is seeded with a default clinic account on first run:

| Username | Password |
|----------|----------|
| `admin`  | `admin123` |

Logging in with these credentials forces an immediate password change before any clinic page can be used.

## Medical Formulas (preserved from original)

**BMD Formula:**
```
result = 1.06861 × (height×0.01)^0.326842 × weight^0.211909 × hal^0.0608258 × age^−0.332916 × (nsa×0.0174533)^−0.239446
```

**Menopause Forecasting:**
- Regular periods: `fmvalue = round(35.49 × AMH^0.15)`
- Irregular periods: `fmvalue = round(41.41 × AMH^0.17)`

## User Preferences

- Keep the original .asp URL paths for all routes
- Do not change content/details during conversion
