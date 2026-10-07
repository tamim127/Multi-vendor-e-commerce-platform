'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Theme, ResolvedTheme, ThemeContextValue } from './types';
import { THEME_STORAGE_KEY, isValidTheme } from './types';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyThemeToDocument(resolved: ResolvedTheme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
}: ThemeProviderProps): React.JSX.Element {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  // 1. Initial hydration sync with persisted storage and system preference
  useEffect(() => {
    let initialTheme = defaultTheme;
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (isValidTheme(stored)) {
        initialTheme = stored;
      }
    } catch {
      // Storage unavailable or restricted (private mode / sandboxed)
    }

    const systemTheme = getSystemTheme();
    const effectiveResolved =
      initialTheme === 'system' ? systemTheme : initialTheme === 'dark' ? 'dark' : 'light';

    setThemeState(initialTheme);
    setResolvedTheme(effectiveResolved);
    applyThemeToDocument(effectiveResolved);
  }, [defaultTheme]);

  // 2. Dynamic listener for operating system color-scheme changes
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent): void => {
      if (theme === 'system') {
        const nextResolved: ResolvedTheme = e.matches ? 'dark' : 'light';
        setResolvedTheme(nextResolved);
        applyThemeToDocument(nextResolved);
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => {
      mediaQuery.removeEventListener('change', handleSystemChange);
    };
  }, [theme]);

  // 3. User theme modifier
  const setTheme = useCallback((newTheme: Theme): void => {
    setThemeState(newTheme);

    const system = getSystemTheme();
    const nextResolved: ResolvedTheme =
      newTheme === 'system' ? system : newTheme === 'dark' ? 'dark' : 'light';

    setResolvedTheme(nextResolved);
    applyThemeToDocument(nextResolved);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // Graceful fallback if storage quota exceeded or disabled
    }
  }, []);

  // 4. Convenience toggle between light and dark
  const toggleTheme = useCallback((): void => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
