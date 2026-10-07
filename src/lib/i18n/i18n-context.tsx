'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { Locale, TextDirection, LocaleConfig, CurrencyCode, I18nContextValue } from './types';
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, isValidLocale, getLocaleConfig } from './config';
import { isRtl, getDirection, applyDirectionToDocument } from './direction';
import {
  formatNumber as intlFormatNumber,
  formatPercent as intlFormatPercent,
  formatDate as intlFormatDate,
  formatMoney as intlFormatMoney,
} from './formatting';
import { getTranslation } from './translations';

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export interface I18nProviderProps {
  children: React.ReactNode;
  defaultLocale?: Locale;
}

export function I18nProvider({
  children,
  defaultLocale = DEFAULT_LOCALE,
}: I18nProviderProps): React.JSX.Element {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  // 1. Initial hydration sync with persisted localStorage
  useEffect(() => {
    let initialLocale = defaultLocale;
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (isValidLocale(stored)) {
        initialLocale = stored;
      }
    } catch {
      // Storage unavailable or restricted
    }

    setLocaleState(initialLocale);
    const dir = getDirection(initialLocale);
    applyDirectionToDocument(dir, initialLocale);
  }, [defaultLocale]);

  // 2. Set locale handler with persistence and document attribute update
  const setLocale = useCallback((newLocale: Locale): void => {
    setLocaleState(newLocale);
    const dir = getDirection(newLocale);
    applyDirectionToDocument(dir, newLocale);

    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    } catch {
      // Storage unavailable or restricted
    }
  }, []);

  const direction: TextDirection = useMemo(() => getDirection(locale), [locale]);
  const isRtlMode: boolean = useMemo(() => isRtl(locale), [locale]);
  const config: LocaleConfig = useMemo(() => getLocaleConfig(locale), [locale]);

  // Memoized translation and formatting functions bound to current locale
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      return getTranslation(locale, key, params);
    },
    [locale]
  );

  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions): string => {
      return intlFormatNumber(value, locale, options);
    },
    [locale]
  );

  const formatDate = useCallback(
    (date: Date | number | string, options?: Intl.DateTimeFormatOptions): string => {
      return intlFormatDate(date, locale, options);
    },
    [locale]
  );

  const formatPercent = useCallback(
    (value: number, options?: Intl.NumberFormatOptions): string => {
      return intlFormatPercent(value, locale, options);
    },
    [locale]
  );

  const formatMoney = useCallback(
    (amount: number, currency?: CurrencyCode, options?: Intl.NumberFormatOptions): string => {
      const effectiveCurrency = currency || config.defaultCurrency;
      return intlFormatMoney(amount, effectiveCurrency, locale, options);
    },
    [locale, config.defaultCurrency]
  );

  const contextValue: I18nContextValue = useMemo(
    () => ({
      locale,
      direction,
      isRtl: isRtlMode,
      config,
      setLocale,
      t,
      formatNumber,
      formatDate,
      formatPercent,
      formatMoney,
    }),
    [
      locale,
      direction,
      isRtlMode,
      config,
      setLocale,
      t,
      formatNumber,
      formatDate,
      formatPercent,
      formatMoney,
    ]
  );

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
