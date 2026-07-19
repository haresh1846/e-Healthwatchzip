# e-healthwatch

A women's health information and medical calculator web application, converted from Classic ASP to Node.js/Express.

## Overview

This is the **e-healthwatch** platform — a health-focused website covering gynaecology, pregnancy, menopause, and disease awareness. It includes two medical calculators:

- **BMD Calculator** — Bone Mineral Density calculator (login required)
- **Menopause Forecasting** — Predicts menopause onset age using AMH values

## Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Template engine**: EJS
- **Database**: SQLite (via better-sqlite3)
- **Sessions**: express-session
- **CSS**: Bootstrap 3 (CDN) + custom CSS

## Running the App

```bash
node server.js
```

The app runs on port 5000.

## Project Structure

```
server.js        # Main Express app + all routes
db.js            # SQLite database setup and seeding
views/           # EJS templates
  partials/      # Shared header/footer
public/css/      # Custom CSS
ehealthwatch.db  # SQLite database (auto-created on first run)
```

## Pages / Routes

| URL | Description |
|-----|-------------|
| `/` | Home page with carousel and info sections |
| `/health.asp` | About health |
| `/menopause.asp` | About menopause |
| `/gynaecology.asp` | Gynaecology info |
| `/pregnancy.asp` | Pregnancy info |
| `/organ.asp` | About disease |
| `/data.asp` | About data modelling |
| `/contact.asp` | Contact page |
| `/bmdlogin.asp` | BMD Calculator login |
| `/bmd.asp` | BMD Calculator form (auth required) |
| `/bmdsave.asp` | POST endpoint for BMD form |
| `/result.asp` | BMD result |
| `/forecasting.asp` | Menopause forecasting form |
| `/mpresult.asp` | Menopause forecast result |
| `/logout.asp` | Logout |

## Default BMD Login

The database is seeded with a default admin account on first run:

| Username | Password |
|----------|----------|
| `admin`  | `admin123` |

## Medical Formulas (preserved from original)

**BMD Formula:**
```
result = 1.06861 × (height×0.01)^0.326842 × weight^0.211909 × hal^0.0608258 × age^−0.332916 × (nsa×0.0174533)^−0.239446
```

**Menopause Forecasting:**
- Regular periods: `fmvalue = round(35.49 × AMH^0.15)`
- Irregular periods: `fmvalue = round(41.41 × AMH^0.17)`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SESSION_SECRET` | Secret key for Express session signing |
| `PORT` | Port to listen on (default: 5000) |

## User Preferences

- Keep the original .asp URL paths for all routes
- Do not change content/details during conversion
