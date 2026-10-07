import type { Locale } from '../types';
import type { TranslationKey, TranslationsContract } from './keys';
import { enTranslations } from './en';
import { bnTranslations } from './bn';
import { arTranslations } from './ar';
import { hiTranslations } from './hi';

export * from './keys';

const translationsMap: Record<Locale, TranslationsContract> = {
  en: enTranslations,
  bn: bnTranslations,
  ar: arTranslations,
  hi: hiTranslations,
};

/**
 * Resolves a translation string by key with automatic English fallback and parameter interpolation.
 */
export function getTranslation(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>
): string {
  const dictionary = translationsMap[locale] || translationsMap.en;
  let text =
    (dictionary as unknown as Record<string, string>)[key] ||
    enTranslations[key as TranslationKey] ||
    key;

  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      text = text.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
    });
  }

  return text;
}
