/**
 * ==============================================================================
 * THEME ENGINE TYPES & CONSTANTS
 * ==============================================================================
 */

export type Theme = 'light' | 'dark' | 'system';

export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextValue {
  /** The user's explicit preference: 'light', 'dark', or 'system' */
  theme: Theme;
  /** The actively rendered theme: 'light' or 'dark' */
  resolvedTheme: ResolvedTheme;
  /** Set the user preference */
  setTheme: (theme: Theme) => void;
  /** Toggle between light and dark (sets explicit preference) */
  toggleTheme: () => void;
}

export const THEME_STORAGE_KEY = 'marketplace-theme-preference';

export const VALID_THEMES: readonly Theme[] = ['light', 'dark', 'system'] as const;

/**
 * Type guard to validate whether an unknown value is a valid Theme.
 */
export function isValidTheme(value: unknown): value is Theme {
  return typeof value === 'string' && VALID_THEMES.includes(value as Theme);
}
