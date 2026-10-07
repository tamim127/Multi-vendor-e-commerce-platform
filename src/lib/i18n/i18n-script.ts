import { LOCALE_STORAGE_KEY, DEFAULT_LOCALE } from './config';

/**
 * Inline script executed synchronously in <head> before page render.
 * Reads persisted locale from localStorage and applies lang and dir attributes
 * to <html> to guarantee zero direction/layout shift on load.
 */
export const i18nInitScript: string = `
(function() {
  try {
    var stored = localStorage.getItem('${LOCALE_STORAGE_KEY}');
    var valid = ['en', 'bn', 'ar', 'hi'];
    var locale = (stored && valid.indexOf(stored) !== -1) ? stored : '${DEFAULT_LOCALE}';
    var dir = (locale === 'ar') ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  } catch (e) {
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = '${DEFAULT_LOCALE}';
  }
})();
`.trim();
