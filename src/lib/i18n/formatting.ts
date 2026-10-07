import type { Locale, CurrencyCode, MoneyDisplay } from './types';
import { getLocaleConfig } from './config';

/**
 * Formats a numeric value according to locale conventions.
 */
export function formatNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions
): string {
  try {
    const config = getLocaleConfig(locale);
    return new Intl.NumberFormat(config.localeString, options).format(value);
  } catch {
    return String(value);
  }
}

/**
 * Formats a decimal as a percentage (e.g. 0.19 -> 19%).
 */
export function formatPercent(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions
): string {
  try {
    const config = getLocaleConfig(locale);
    return new Intl.NumberFormat(config.localeString, {
      style: 'percent',
      maximumFractionDigits: 1,
      ...options,
    }).format(value);
  } catch {
    return `${(value * 100).toFixed(0)}%`;
  }
}

/**
 * Formats a Date or timestamp according to locale conventions.
 */
export function formatDate(
  date: Date | number | string,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const config = getLocaleConfig(locale);
    const parsed = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat(config.localeString, {
      dateStyle: 'medium',
      ...options,
    }).format(parsed);
  } catch {
    return String(date);
  }
}

/**
 * Formats monetary amounts with the appropriate currency symbol and placement.
 * Note: Performs formatting only, not currency conversion.
 */
export function formatMoney(
  amount: number,
  currency: CurrencyCode,
  locale: Locale,
  options?: Intl.NumberFormatOptions
): string {
  try {
    const config = getLocaleConfig(locale);
    return new Intl.NumberFormat(config.localeString, {
      style: 'currency',
      currency,
      ...options,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Helper to construct a MoneyDisplay object.
 */
export function createMoney(amount: number, currency: CurrencyCode, locale: Locale): MoneyDisplay {
  return {
    amount,
    currency,
    formatted: formatMoney(amount, currency, locale),
  };
}
