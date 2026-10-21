/**
 * ==============================================================================
 * CATALOG DOMAIN — LOCALIZATION UTILITIES
 * ==============================================================================
 * Safe resolution of localized strings with graceful fallback chains.
 */

import type { LocalizedText } from '../types/localization';

/**
 * Resolves a localized text string based on preferred locale with fallback to English.
 */
export function resolveLocalizedText(
  text: LocalizedText,
  preferredLocale?: string,
  fallbackLocale: string = 'en'
): string {
  if (preferredLocale && text[preferredLocale]) {
    return text[preferredLocale]!;
  }

  if (text[fallbackLocale]) {
    return text[fallbackLocale]!;
  }

  // Fallback to first available non-empty string value
  const values = Object.values(text).filter(
    (v): v is string => typeof v === 'string' && v.length > 0
  );
  const fallback = values[0];
  return fallback !== undefined ? fallback : '';
}

/**
 * Normalizes text for search matching.
 * Performs whitespace trimming/collapsing, NFC Unicode composition, and case-folding.
 * Folds Latin diacritics (U+00C0 to U+024F) without altering Bengali, Arabic, or Devanagari Unicode sequences.
 */
export function normalizeSearchToken(text: string): string {
  if (!text) return '';
  const trimmed = text.trim().replace(/\s+/g, ' ').toLowerCase();
  // Canonical Unicode Composition (NFC) for consistent representation
  const nfc = trimmed.normalize('NFC');
  // Fold Latin diacritics ONLY (Latin-1 Supplement and Latin Extended-A/B: U+00C0 to U+024F)
  // Non-Latin scripts (Arabic: U+0600-U+06FF, Bengali: U+0980-U+09FF, Devanagari: U+0900-U+097F)
  // are completely untouched by this replacement, preserving all matras, nuktas, and tashkeel.
  return nfc.replace(/[\u00C0-\u024F]/g, (match) =>
    match.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  );
}
