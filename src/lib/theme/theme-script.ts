import { THEME_STORAGE_KEY } from './types';

/**
 * ==============================================================================
 * ZERO-FOUC INLINE THEME INITIALIZER SCRIPT
 * ==============================================================================
 * Evaluated synchronously in <head> before DOM paint.
 * Resolves persisted theme or OS system preference immediately.
 * Completely immune to hydration mismatches when coupled with suppressHydrationWarning.
 */
export const themeInitScript: string = `(function() {
  try {
    var storageKey = '${THEME_STORAGE_KEY}';
    var stored = localStorage.getItem(storageKey);
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = stored === 'dark' || ((!stored || stored === 'system') && prefersDark);
    var root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
    }
  } catch (e) {
    // Graceful fallback if localStorage is blocked by sandbox or private mode
  }
})();`;
