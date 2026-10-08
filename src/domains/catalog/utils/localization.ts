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
