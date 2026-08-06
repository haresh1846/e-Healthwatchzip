// @ts-check
/**
 * Content adapter.
 *
 * The single seam between the templates and wherever copy actually lives.
 * Today that is the `content/<locale>/` directories; swapping to a CMS means
 * rewriting only this file, so long as it keeps returning a
 * {@link import('../content/schema').LocaleBundle}.
 *
 * Templates never require content modules directly — they read `res.locals.t`,
 * populated once by middleware in server.js.
 */

const DEFAULT_LOCALE = 'en';

/** Locales that ship with the app. Add a directory, add it here. */
const AVAILABLE_LOCALES = ['en'];

/** @type {Object.<string, import('../content/schema').LocaleBundle>} */
const cache = {};

/**
 * Resolve a locale bundle, falling back to the default locale when the
 * requested one is unknown. Bundles are cached after first load — they are
 * static requires, so this costs one read per locale per process.
 *
 * @param {string} [locale]
 * @returns {import('../content/schema').LocaleBundle}
 */
function getContent(locale) {
  const key = AVAILABLE_LOCALES.includes(String(locale)) ? String(locale) : DEFAULT_LOCALE;
  if (!cache[key]) {
    cache[key] = require(`../content/${key}`);
  }
  return cache[key];
}

/**
 * Read a page's content by key. Returns null when the page has not been
 * migrated to the content layer yet, which lets templates be converted one at
 * a time instead of in a single sweep.
 *
 * @param {string} pageKey
 * @param {string} [locale]
 * @returns {{meta: {title: string, description: string}, sections: import('../content/schema').Section[]} | null}
 */
function getPage(pageKey, locale) {
  const bundle = getContent(locale);
  return bundle.pages[pageKey] || null;
}

module.exports = { getContent, getPage, DEFAULT_LOCALE, AVAILABLE_LOCALES };
