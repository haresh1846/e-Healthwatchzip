// @ts-check
const { chrome } = require('./common');
const { home } = require('./pages/home');

/** @type {import('../schema').LocaleBundle} */
const bundle = {
  locale: 'en',
  chrome,
  pages: { home },
};

module.exports = bundle;
