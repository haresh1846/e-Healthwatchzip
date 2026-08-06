// @ts-check
/**
 * Content schema.
 *
 * These typedefs are the contract between the content layer and the templates.
 * They are checked by `npm run typecheck` (tsc with checkJs), so a malformed
 * locale bundle or a section descriptor missing a required prop is a build
 * error rather than a blank patch of page.
 *
 * Adding a locale means adding a directory under `content/` that satisfies
 * {@link LocaleBundle}. Moving to a CMS means rewriting `lib/content.js` to
 * return the same shape — nothing else changes.
 */

/**
 * @typedef {Object} Link
 * @property {string} label  Visible text.
 * @property {string} href   Destination.
 */

/**
 * @typedef {Object} Action
 * @property {string} label
 * @property {string} href
 * @property {'primary'|'secondary'|'quiet'} [variant]
 */

/**
 * A single clinical band. `level` selects the semantic colour; it is the only
 * thing in the system permitted to introduce saturated colour.
 * @typedef {Object} SignalBand
 * @property {'calm'|'watch'|'act'} level
 * @property {string} label
 */

/* ── Section descriptors ─────────────────────────────────────────────────
   Each landing section is a plain object with a `type` that maps to
   `views/sections/<type>.ejs`. Page order is array order, so re-ordering or
   removing a section is a content edit, never a template edit.            */

/**
 * @typedef {Object} HeroSection
 * @property {'hero'} type
 * @property {string} eyebrow
 * @property {string} headline
 * @property {string} [headlineAccent]  Rendered in the figure face for contrast.
 * @property {string} body
 * @property {Action[]} actions
 * @property {string[]} [assurances]    Short trust lines under the actions.
 * @property {SpecimenCard} [specimen]  The product's own output, used as the hero visual.
 */

/**
 * A real result rendered at display size — the product as its own hero image.
 * @typedef {Object} SpecimenCard
 * @property {string} caption
 * @property {string} figure          The number itself, e.g. "47".
 * @property {string} figureUnit
 * @property {string} figureLabel
 * @property {SignalBand} band
 * @property {{label: string, value: string}[]} rows
 * @property {string} [footnote]
 */

/**
 * @typedef {Object} StatStripSection
 * @property {'stat-strip'} type
 * @property {{value: string, label: string}[]} stats
 */

/**
 * @typedef {Object} SpecimenSection
 * @property {'specimen'} type
 * @property {string} eyebrow
 * @property {string} heading
 * @property {string} body
 * @property {SpecimenCard} specimen
 * @property {Action} [action]
 */

/**
 * @typedef {Object} TopicIndexSection
 * @property {'topic-index'} type
 * @property {string} eyebrow
 * @property {string} heading
 * @property {string} body
 * @property {{title: string, body: string, href: string}[]} topics  Not a sequence, so deliberately unnumbered.
 */

/**
 * @typedef {Object} MethodSection
 * @property {'method'} type
 * @property {string} eyebrow
 * @property {string} heading
 * @property {string} body
 * @property {{title: string, body: string}[]} steps  Genuinely ordinal — numbering is meaningful here.
 */

/**
 * @typedef {Object} ToolCalloutSection
 * @property {'tool-callout'} type
 * @property {string} eyebrow
 * @property {string} heading
 * @property {string} body
 * @property {string[]} points
 * @property {Action} action
 * @property {{heading: string, bands: {level: 'calm'|'watch'|'act', label: string, range: string}[]}} scale
 */

/**
 * @typedef {Object} PricingSection
 * @property {'pricing'} type
 * @property {string} eyebrow
 * @property {string} heading
 * @property {string} body
 * @property {string} price
 * @property {string} priceWas
 * @property {string} priceNote
 * @property {string[]} includes
 * @property {Action} action
 * @property {string} [footnote]
 */

/**
 * @typedef {Object} ContactSection
 * @property {'contact'} type
 * @property {string} eyebrow
 * @property {string} heading
 * @property {string} body
 * @property {{label: string, value: string}[]} details
 * @property {{fname: string, lname: string, email: string, phone: string, message: string, submit: string, success: string}} form
 */

/**
 * @typedef {HeroSection|StatStripSection|SpecimenSection|TopicIndexSection|MethodSection|ToolCalloutSection|PricingSection|ContactSection} Section
 */

/**
 * @typedef {Object} SiteChrome
 * @property {string} brand
 * @property {Link[]} nav
 * @property {Action} navAction
 * @property {string} skipToContent
 * @property {{tagline: string, groups: {heading: string, links: Link[]}[], legal: string}} footer
 */

/**
 * @typedef {Object} LocaleBundle
 * @property {string} locale
 * @property {SiteChrome} chrome
 * @property {Object.<string, {meta: {title: string, description: string}, sections: Section[]}>} pages
 */

module.exports = {};
