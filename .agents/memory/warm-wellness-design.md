---
name: Warm Wellness Design System
description: Design system choices, graduation details, and gotchas for the e-healthwatch Node/EJS app
---

## Design Tokens
- Background: `#FFFBF5` (cream), Accent: `#E11D48` (rose), Text: `#78716C` (warm stone), Headings: `#44403C`
- Fonts: Lora (serif headings) + Nunito (sans body) — loaded from Google Fonts in header.ejs
- Pricing: ₹49 offer / ₹199 regular — one-time, NOT a subscription

## Graduation approach
- Bootstrap 3 dropped entirely; replaced with custom CSS in `public/css/custom.css`
- A minimal Bootstrap-compat grid (`.container`, `.row`, `.col-md-X` etc.) is included in custom.css so inner pages still render without rewriting their HTML
- Hero image: `artifacts/mockup-sandbox/public/images/warm-hero.jpg` → `public/images/warm-hero.jpg`
- Icons: inline SVG (lucide-style paths) throughout — no external icon CDN dependency
- Homepage sections: hero → social proof strip → info cards → how it works → BMD feature → pricing → contact → footer

## Known gotcha
- `better-sqlite3` is a native module: run `npm rebuild better-sqlite3` whenever Node.js version changes (saw this fail on Node v24.13.0 upgrade).

**Why:** The `.node` binding is compiled for a specific Node ABI; a version bump breaks the binding silently until rebuilt.

## Session-aware nav
- `locals.userid` truthy → show Logout link; falsy → show BMD Login CTA
- This is set in the Express middleware in `server.js` from `req.session.userid`

## Contact form
- Homepage form POSTs to `/` with fields: fname, lname, email, phone, comment
- Server logs submission and re-renders index with `contactSuccess: true`
- No email sending yet — could be wired to nodemailer/SendGrid later
