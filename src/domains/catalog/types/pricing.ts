/**
 * ==============================================================================
 * CATALOG DOMAIN — PRICING & MONEY TYPES
 * ==============================================================================
 * Canonical integer minor-unit money abstraction.
 * All amounts are strictly integers (e.g. 19999 for $199.99, 150000 for ৳1,500.00).
 * Floating-point arithmetic is strictly prohibited in commercial contracts.
 * Currency conversion is explicitly out of scope for Phase 2A.
 */

export type CurrencyCode = 'USD' | 'BDT' | 'INR' | 'SAR' | 'AED' | 'EUR' | 'GBP' | (string & {});

/**
 * Canonical monetary value in integer minor units (e.g. cents, paisa, pence).
 */
export interface Money {
  /**
   * Price in integer minor currency units.
   * e.g. 19999 represents $199.99 for USD (exponent 2).
   * e.g. 150000 represents ৳1,500.00 for BDT (exponent 2).
   */
  amountMinor: number;
  /** ISO 4217 Currency Code */
  currency: CurrencyCode;
}

export interface PriceRange {
  min: Money;
  max: Money;
}

export type DiscountType = 'percentage' | 'fixed';

export interface Discount {
  type: DiscountType;
  /** Percentage (e.g. 15 for 15%) or fixed discount value in minor units */
  value: number;
  /** Minor-unit absolute savings amount */
  savings: Money;
}

/**
 * Purely declarative currency metadata (no FX or conversion logic).
 */
export interface CurrencyMetadata {
  code: CurrencyCode;
  symbol: string;
  minorUnitDigits: number; // e.g. 2 for USD/EUR/BDT, 0 for JPY, 3 for KWD/BHD
  symbolPosition: 'prefix' | 'suffix';
  spaceBetweenSymbol: boolean;
}
