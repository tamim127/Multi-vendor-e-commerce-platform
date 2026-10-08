/**
 * ==============================================================================
 * CATALOG DOMAIN — LOCALIZATION TYPES
 * ==============================================================================
 * Extensible localized content structures for multi-language marketplace entities.
 * Fully aligned with Phase 1F locales (en, bn, ar, hi) and extensible for future locales.
 */

export type CatalogLocale = 'en' | 'bn' | 'ar' | 'hi' | (string & {});

export interface LocalizedText {
  /** English text serves as canonical fallback */
  en: string;
  /** Bengali */
  bn?: string;
  /** Arabic (RTL) */
  ar?: string;
  /** Hindi */
  hi?: string;
  /** Extensible for future marketplace locales */
  [locale: string]: string | undefined;
}

export interface LocalizedMarkdown {
  en: string;
  bn?: string;
  ar?: string;
  hi?: string;
  [locale: string]: string | undefined;
}
