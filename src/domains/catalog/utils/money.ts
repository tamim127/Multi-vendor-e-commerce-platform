/**
 * ==============================================================================
 * CATALOG DOMAIN — MONEY UTILITIES
 * ==============================================================================
 * Financial calculations using strict integer minor units.
 * Floating-point representation is strictly prohibited to prevent financial rounding drift.
 * Currency conversion / FX is explicitly out of scope for Phase 2A.
 */

import type { CurrencyCode, CurrencyMetadata, Discount, Money } from '../types/pricing';

export const CURRENCY_METADATA_REGISTRY: Record<string, CurrencyMetadata> = {
  USD: {
    code: 'USD',
    symbol: '$',
    minorUnitDigits: 2,
    symbolPosition: 'prefix',
    spaceBetweenSymbol: false,
  },
  BDT: {
    code: 'BDT',
    symbol: '৳',
    minorUnitDigits: 2,
    symbolPosition: 'prefix',
    spaceBetweenSymbol: false,
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    minorUnitDigits: 2,
    symbolPosition: 'prefix',
    spaceBetweenSymbol: false,
  },
  SAR: {
    code: 'SAR',
    symbol: 'SR',
    minorUnitDigits: 2,
    symbolPosition: 'suffix',
    spaceBetweenSymbol: true,
  },
  AED: {
    code: 'AED',
    symbol: 'AED',
    minorUnitDigits: 2,
    symbolPosition: 'prefix',
    spaceBetweenSymbol: true,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    minorUnitDigits: 2,
    symbolPosition: 'prefix',
    spaceBetweenSymbol: false,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    minorUnitDigits: 2,
    symbolPosition: 'prefix',
    spaceBetweenSymbol: false,
  },
};

/**
 * Creates a Money object enforcing integer minor units.
 */
export function createMoney(amountMinor: number, currency: CurrencyCode): Money {
  if (!Number.isInteger(amountMinor)) {
    throw new Error(`amountMinor must be an integer, received: ${amountMinor}`);
  }
  return { amountMinor, currency };
}

/**
 * Adds two Money values of identical currency.
 */
export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot add mismatched currencies: ${a.currency} and ${b.currency}`);
  }
  return {
    amountMinor: a.amountMinor + b.amountMinor,
    currency: a.currency,
  };
}

/**
 * Subtracts two Money values of identical currency.
 */
export function subtractMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot subtract mismatched currencies: ${a.currency} and ${b.currency}`);
  }
  return {
    amountMinor: Math.max(0, a.amountMinor - b.amountMinor),
    currency: a.currency,
  };
}

/**
 * Multiplies money by a factor, rounding deterministically to the nearest integer minor unit.
 */
export function multiplyMoney(money: Money, multiplier: number): Money {
  return {
    amountMinor: Math.round(money.amountMinor * multiplier),
    currency: money.currency,
  };
}

/**
 * Calculates discount and percentage savings without floating-point accumulation.
 */
export function calculateDiscount(compareAtPrice: Money, salePrice: Money): Discount {
  if (compareAtPrice.currency !== salePrice.currency) {
    throw new Error(
      `Cannot calculate discount for mismatched currencies: ${compareAtPrice.currency} vs ${salePrice.currency}`
    );
  }

  const savingsMinor = Math.max(0, compareAtPrice.amountMinor - salePrice.amountMinor);
  const percentage =
    compareAtPrice.amountMinor > 0
      ? Math.round((savingsMinor / compareAtPrice.amountMinor) * 100)
      : 0;

  return {
    type: 'percentage',
    value: percentage,
    savings: {
      amountMinor: savingsMinor,
      currency: compareAtPrice.currency,
    },
  };
}

/**
 * Formats integer minor units for display using Intl.NumberFormat where possible.
 */
export function formatMoneyMinor(
  money: Money,
  options?: { locale?: string; showCode?: boolean }
): string {
  const meta = CURRENCY_METADATA_REGISTRY[money.currency] ?? {
    code: money.currency,
    symbol: money.currency,
    minorUnitDigits: 2,
    symbolPosition: 'prefix',
    spaceBetweenSymbol: true,
  };

  const decimalValue = money.amountMinor / Math.pow(10, meta.minorUnitDigits);
  const locale = options?.locale ?? 'en-US';

  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: money.currency,
      minimumFractionDigits: meta.minorUnitDigits,
      maximumFractionDigits: meta.minorUnitDigits,
    }).format(decimalValue);

    return options?.showCode ? `${formatted} ${money.currency}` : formatted;
  } catch {
    // Fallback if Intl currency is unsupported in runtime
    const fixedDecimal = decimalValue.toFixed(meta.minorUnitDigits);
    const space = meta.spaceBetweenSymbol ? ' ' : '';
    const baseFormatted =
      meta.symbolPosition === 'prefix'
        ? `${meta.symbol}${space}${fixedDecimal}`
        : `${fixedDecimal}${space}${meta.symbol}`;
    return options?.showCode ? `${baseFormatted} ${money.currency}` : baseFormatted;
  }
}
