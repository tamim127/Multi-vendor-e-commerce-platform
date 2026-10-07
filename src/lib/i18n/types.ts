/**
 * ==============================================================================
 * INTERNATIONALIZATION, LOCALIZATION & RTL TYPES
 * ==============================================================================
 * Strictly typed contracts for marketplace locales, text directions,
 * monetary structures, and internationalization contexts.
 */

export type Locale = 'en' | 'bn' | 'ar' | 'hi';

export type TextDirection = 'ltr' | 'rtl';

export type ScriptType = 'Latn' | 'Beng' | 'Arab' | 'Deva';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'BDT' | 'AED' | 'SAR' | 'INR' | (string & {});

export interface LocaleConfig {
  code: Locale;
  name: string;
  nativeName: string;
  direction: TextDirection;
  defaultCurrency: CurrencyCode;
  localeString: string;
  script: ScriptType;
}

export interface MoneyDisplay {
  amount: number;
  currency: CurrencyCode;
  formatted?: string;
}

export interface I18nContextValue {
  locale: Locale;
  direction: TextDirection;
  isRtl: boolean;
  config: LocaleConfig;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatDate: (date: Date | number | string, options?: Intl.DateTimeFormatOptions) => string;
  formatPercent: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatMoney: (
    amount: number,
    currency?: CurrencyCode,
    options?: Intl.NumberFormatOptions
  ) => string;
}
