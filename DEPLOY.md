# Deployment

Two environments run the same code. Everything that differs between them is an
environment variable — there is no separate branch, build flag or config file.

| | Vercel | Fly.io |
|---|---|---|
| Role | development and testing | **production** |
| Entry point | `api/index.js` (serverless) | `Dockerfile` → `node server.js` |
| Config | `vercel.json` | `fly.toml` |
| Region | Vercel default | `bom` (Mumbai) |
| Domain | `*.vercel.app` | `ehealthwatch.in` |

`server.js` exports the Express app and only calls `listen()` when run directly,
so the same file works both ways without a switch.

---

## The variables that MUST differ

Getting these wrong is how a test run ends up writing to production.

### `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` — **use two separate databases**

This is the one that matters most. If Vercel points at the production database,
every test signup, test payment and test deletion hits real customer data.

Create a second Turso database for the Vercel environment and point it there.
Put the production database in **`ap-south-1`** so it sits alongside the Fly
machine in Mumbai; otherwise every query still crosses a continent and the
region move buys you nothing.

### `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET`

Test keys (`rzp_test_…`) on Vercel, live keys (`rzp_live_…`) on Fly. Register
the webhook `https://ehealthwatch.in/razorpay-webhook` against the live account,
and the Vercel URL against the test account.

### `APP_BASE_URL`

`https://ehealthwatch.in` on Fly. On Vercel, its own URL. This drives canonical
tags, `og:image`, `robots.txt` and `sitemap.xml` — if it points at the wrong
host, search engines are told the content lives somewhere else.

### `CLARITY_PROJECT_ID` — **leave unset on Vercel**

Set only on Fly. Unset means no script loads at all and the analytics section of
the privacy policy stays hidden, so your test clicks never reach the production
Clarity project and the policy never describes tracking that isn't happening.

### `SESSION_SECRET`

Different random value per environment, so a session from one is not valid on
the other.

### `NODE_ENV`

Both platforms set this to `production` automatically. Note the consequence: in
production, password-reset links are **not** written to the logs. If you need to
complete a reset on the Vercel test environment without mail configured, set
`GMAIL_USER`/`GMAIL_APP_PASSWORD` there rather than trying to read the link from
a log.

## The variables that should match

`BUSINESS_NAME`, `BUSINESS_EMAIL`, `BUSINESS_PHONE`, `BUSINESS_ADDRESS`,
`GRIEVANCE_OFFICER_NAME`, `GRIEVANCE_OFFICER_EMAIL`, `ADMIN_PASSWORD` (or use a
different admin password per environment, which is safer).

See `.env.example` for the full list and what breaks when each is missing.

---

## First deploy to Fly

```bash
fly auth login
fly launch --no-deploy        # reads fly.toml; keep the app name and region

# Secrets — set every one before the first deploy, not after.
fly secrets set \
  SESSION_SECRET="$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")" \
  TURSO_DATABASE_URL="libsql://…" \
  TURSO_AUTH_TOKEN="…" \
  RAZORPAY_KEY_ID="rzp_live_…" \
  RAZORPAY_KEY_SECRET="…" \
  RAZORPAY_WEBHOOK_SECRET="…" \
  GMAIL_USER="…" GMAIL_APP_PASSWORD="…" \
  ADMIN_PASSWORD="…" \
  APP_BASE_URL="https://ehealthwatch.in" \
  BUSINESS_NAME="ehealthwatch" BUSINESS_EMAIL="…" BUSINESS_PHONE="…" \
  BUSINESS_ADDRESS="…" \
  GRIEVANCE_OFFICER_NAME="…" GRIEVANCE_OFFICER_EMAIL="…" \
  CLARITY_PROJECT_ID="xz702eyf30"

fly deploy
```

### Custom domain

```bash
fly certs add ehealthwatch.in
fly certs add www.ehealthwatch.in
```

Then add the A/AAAA records Fly prints at your registrar. Certificates issue
automatically once DNS resolves.

---

## Operational notes

**Single machine on purpose.** The rate limiter (`server.js`, `rateBuckets`) is
an in-memory `Map`, so its counters are per-process. On two machines the login
and payment throttles silently become twice as permissive. Before scaling past
one, move the limiter into the database.

**`min_machines_running = 1`.** No scale-to-zero: a customer part-way through a
₹149 payment should never wait on a cold start.

**Health check.** `/healthz` is registered *before* the `db.ready` gate, so a
machine still running migrations returns 503 rather than hanging. Fly waits for
200 before routing traffic to it.

**Graceful shutdown.** `SIGTERM` stops new connections, lets in-flight requests
finish (a Razorpay verification is not something to cut mid-flight), then exits,
with a 10s backstop. Verified: the handler logs, closes and releases the port.

**Never rely on the container filesystem.** With `TURSO_DATABASE_URL` unset the
app falls back to a local SQLite file, which a Fly deploy discards along with the
old machine. Confirm the Turso variables are set before the first real customer.

**The Docker image has not been built in CI.** `fly deploy` builds it remotely;
if it fails, the usual cause is a file excluded by `.dockerignore` that turns out
to be needed at runtime.
