# Content & design system

How the redesigned pages are put together, and where to change things.

## Where copy lives

Nothing user-facing is hardcoded in a template. All strings live under
`content/<locale>/`:

```
content/
  schema.js          Typedefs — the contract, checked by `npm run typecheck`
  en/
    index.js         Assembles the locale bundle
    common.js        Site chrome: nav, footer, brand
    pages/
      home.js        Home page: meta + ordered section array
```

`lib/content.js` is the **adapter** — the only seam between templates and
wherever copy actually lives. Templates never require content modules directly;
they read `res.locals.t`, populated once by middleware in `server.js`.

**Adding a locale:** create `content/<code>/` satisfying `LocaleBundle`, add the
code to `AVAILABLE_LOCALES` in `lib/content.js`. Unknown locales fall back to
`en`. Preview with `?lang=<code>`.

**Moving to a CMS:** rewrite `lib/content.js` so `getContent()` returns the same
shape from your CMS. Nothing else changes.

## Reordering a page

`content/en/pages/home.js` exports `sections` — an ordered array. The page
renders it top to bottom. **Re-order the array to re-order the page; delete an
entry to remove a section.** No template edit either way.

Each descriptor's `type` maps to `views/sections/<type>.ejs`, wired up by
`views/section-renderer.ejs`. Adding a new section type means adding that one
template plus a typedef in `schema.js`.

## Design tokens

`public/css/tokens.css` is the single source of truth for colour, spacing,
type scale, radii, and motion. **No other stylesheet may declare a literal
colour or a raw spacing value.** Dark mode is the same tokens redefined — under
both `prefers-color-scheme` and a `[data-theme]` override so the toggle wins in
either direction.

### The colour rule

The interface is near-monochrome. The **only** saturated colour on screen
belongs to a real clinical classification — the semantic triad
(`--signal-calm` / `--signal-watch` / `--signal-act`), surfaced solely through
the `badge` component.

Colour therefore always means something. Do not introduce an accent for
decoration, category coding, or emphasis; use weight, size, and space instead.

Every token pair is verified to clear **WCAG AA** in both themes. If you change
a colour, re-run the contrast sweep before shipping it.

## Components

`views/components/` — each takes explicit props, documented in a JSDoc block at
the top of the file:

| Component      | Purpose |
|----------------|---------|
| `button`       | Action link — `primary` / `secondary` / `quiet` |
| `badge`        | Clinical band. The only route to saturated colour. |
| `section-head` | Eyebrow + heading + supporting paragraph |
| `specimen`     | A real result at display size — the product as its own hero |
| `field`        | Labelled form control, always with a real `<label for>` |

Page chrome is `views/partials/base-head.ejs` and `base-foot.ejs`.

> Pages not yet migrated still use the original `views/partials/header.ejs` and
> `public/css/custom.css`. Both systems coexist deliberately so templates can be
> converted one at a time; `custom.css` retires once nothing references it.

## Checks

```
npm test        # 25 integration tests
npm run typecheck   # tsc over content/ and lib/ (JSDoc types, no .ts files)
```
