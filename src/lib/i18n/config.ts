import type { Locale, LocaleConfig } from './types';

export const SUPPORTED_LOCALES: readonly Locale[] = ['en', 'bn', 'ar', 'hi'] as const;

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_STORAGE_KEY: string = 'marketplace_locale';

export const LOCALE_CONFIGS: Record<Locale, LocaleConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    defaultCurrency: 'USD',
    localeString: 'en-US',
    script: 'Latn',
  },
  bn: {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    direction: 'ltr',
    defaultCurrency: 'BDT',
    localeString: 'bn-BD',
    script: 'Beng',
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
    defaultCurrency: 'AED',
    localeString: 'ar-AE',
    script: 'Arab',
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    direction: 'ltr',
    defaultCurrency: 'INR',
    localeString: 'hi-IN',
    script: 'Deva',
  },
};

export function isValidLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function getLocaleConfig(locale: Locale): LocaleConfig {
  return LOCALE_CONFIGS[locale] || LOCALE_CONFIGS[DEFAULT_LOCALE];
}
