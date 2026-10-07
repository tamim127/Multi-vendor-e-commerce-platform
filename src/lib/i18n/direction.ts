import type { Locale, TextDirection } from './types';
import { getLocaleConfig } from './config';

/**
 * Returns true if the given locale uses Right-to-Left text direction.
 */
export function isRtl(locale: Locale): boolean {
  return getLocaleConfig(locale).direction === 'rtl';
}

/**
 * Returns the direction ('ltr' | 'rtl') for a given locale.
 */
export function getDirection(locale: Locale): TextDirection {
  return getLocaleConfig(locale).direction;
}

/**
 * Reusable utility class for directional icons (chevrons, arrows, back/forward).
 * Applies horizontal mirroring only when active in RTL mode.
 */
export function mirrorIcon(isRTL: boolean): string {
  return isRTL ? 'scale-x-[-1]' : '';
}

/**
 * Updates <html> root attributes with the appropriate direction and language code.
 */
export function applyDirectionToDocument(direction: TextDirection, locale: Locale): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dir = direction;
  root.lang = locale;
}
