import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import {
  ThemeProvider,
  useTheme,
  isValidTheme,
  THEME_STORAGE_KEY,
  themeInitScript,
  useReducedMotion,
} from '@/lib/theme';
import fs from 'fs';
import path from 'path';

describe('Phase 1C Theme Engine & Typography Suite', () => {
  let matchMediaListeners: Array<(e: MediaQueryListEvent) => void> = [];
  let currentPrefersDark = false;
  let currentPrefersReducedMotion = false;

  beforeEach(() => {
    localStorage.clear();
    matchMediaListeners = [];
    currentPrefersDark = false;
    currentPrefersReducedMotion = false;
    document.documentElement.className = '';
    document.documentElement.style.colorScheme = '';

    // Mock window.matchMedia for deterministic test execution
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => {
        const isDarkMode = query.includes('prefers-color-scheme: dark');
        const isReducedMotion = query.includes('prefers-reduced-motion: reduce');

        return {
          matches: isDarkMode
            ? currentPrefersDark
            : isReducedMotion
              ? currentPrefersReducedMotion
              : false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn((event: string, callback: (e: MediaQueryListEvent) => void) => {
            if (event === 'change') {
              matchMediaListeners.push(callback);
            }
          }),
          removeEventListener: vi.fn(
            (event: string, callback: (e: MediaQueryListEvent) => void) => {
              if (event === 'change') {
                matchMediaListeners = matchMediaListeners.filter((l) => l !== callback);
              }
            }
          ),
          dispatchEvent: vi.fn(),
        };
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Theme Preference Validation', () => {
    it('should validate allowed theme values and reject invalid values', () => {
      expect(isValidTheme('light')).toBe(true);
      expect(isValidTheme('dark')).toBe(true);
      expect(isValidTheme('system')).toBe(true);

      expect(isValidTheme('invalid')).toBe(false);
      expect(isValidTheme('')).toBe(false);
      expect(isValidTheme(null)).toBe(false);
      expect(isValidTheme(undefined)).toBe(false);
      expect(isValidTheme(123)).toBe(false);
    });
  });

  describe('2. Light Theme Selection', () => {
    it('should apply light theme class and style when explicit light is chosen', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider defaultTheme="light">{children}</ThemeProvider>,
      });

      act(() => {
        result.current.setTheme('light');
      });

      expect(result.current.theme).toBe('light');
      expect(result.current.resolvedTheme).toBe('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(document.documentElement.style.colorScheme).toBe('light');
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    });
  });

  describe('3. Dark Theme Selection', () => {
    it('should apply dark theme class and style when explicit dark is chosen', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider defaultTheme="dark">{children}</ThemeProvider>,
      });

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
      expect(result.current.resolvedTheme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.style.colorScheme).toBe('dark');
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    });
  });

  describe('4. System Theme Resolution', () => {
    it('should resolve to dark when system preference is dark and theme is system', () => {
      currentPrefersDark = true;

      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider defaultTheme="system">{children}</ThemeProvider>,
      });

      expect(result.current.theme).toBe('system');
      expect(result.current.resolvedTheme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.style.colorScheme).toBe('dark');
    });

    it('should resolve to light when system preference is light and theme is system', () => {
      currentPrefersDark = false;

      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider defaultTheme="system">{children}</ThemeProvider>,
      });

      expect(result.current.theme).toBe('system');
      expect(result.current.resolvedTheme).toBe('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(document.documentElement.style.colorScheme).toBe('light');
    });
  });

  describe('5. Invalid Persisted Theme Fallback', () => {
    it('should fallback gracefully to system theme if localStorage contains corrupted data', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'corrupted_theme_value');

      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider defaultTheme="system">{children}</ThemeProvider>,
      });

      expect(result.current.theme).toBe('system');
    });
  });

  describe('6. Theme Persistence Behavior', () => {
    it('should restore previously saved preference from localStorage on mount', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');

      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      expect(result.current.theme).toBe('dark');
      expect(result.current.resolvedTheme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should support toggleTheme convenience method', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider defaultTheme="light">{children}</ThemeProvider>,
      });

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('dark');
      expect(result.current.resolvedTheme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('light');
      expect(result.current.resolvedTheme).toBe('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('7. System Preference Change Handling', () => {
    it('should dynamically update document theme when OS color scheme changes while in system mode', () => {
      currentPrefersDark = false;

      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider defaultTheme="system">{children}</ThemeProvider>,
      });

      expect(result.current.resolvedTheme).toBe('light');

      // Simulate OS switching to dark mode
      act(() => {
        for (const listener of matchMediaListeners) {
          listener({ matches: true } as MediaQueryListEvent);
        }
      });

      expect(result.current.resolvedTheme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.style.colorScheme).toBe('dark');
    });

    it('should NOT update document theme on OS change when explicit light theme is set', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider defaultTheme="light">{children}</ThemeProvider>,
      });

      act(() => {
        for (const listener of matchMediaListeners) {
          listener({ matches: true } as MediaQueryListEvent);
        }
      });

      expect(result.current.resolvedTheme).toBe('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('8. Reduced-Motion Preference Handling', () => {
    it('should detect prefers-reduced-motion preference via useReducedMotion hook', () => {
      currentPrefersReducedMotion = true;

      const { result } = renderHook(() => useReducedMotion());
      expect(result.current).toBe(true);
    });
  });

  describe('9. Typography Token & Font Variable Availability', () => {
    it('should define typography utility classes and reduced-motion CSS rules', () => {
      const typographyCss = fs.readFileSync(
        path.resolve(import.meta.dirname, '../../src/styles/typography/typography.css'),
        'utf-8'
      );

      expect(typographyCss).toContain('.font-sans');
      expect(typographyCss).toContain('.font-serif');
      expect(typographyCss).toContain('.font-mono');
      expect(typographyCss).toContain('.text-display-lg');
      expect(typographyCss).toContain('.text-heading-xl');
      expect(typographyCss).toContain('.text-price');
      expect(typographyCss).toContain('@media (prefers-reduced-motion: reduce)');
      expect(typographyCss).toContain('animation-duration: 0.01ms !important');
    });
  });

  describe('10. SSR/Hydration-Safe Theme Initialization Script', () => {
    it('should contain deterministic script string matching the theme storage key', () => {
      expect(themeInitScript).toContain(THEME_STORAGE_KEY);
      expect(themeInitScript).toContain('prefers-color-scheme: dark');
      expect(themeInitScript).toContain("root.classList.add('dark')");
      expect(themeInitScript).toContain("root.classList.remove('dark')");
    });
  });
});
