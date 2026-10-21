/**
 * ==============================================================================
 * CATALOG DOMAIN TEST SUITE — MONEY & PRICING
 * ==============================================================================
 * Verifies strict integer minor-unit financial calculations and zero-floating-drift.
 */

import { describe, expect, it } from 'vitest';
import {
  addMoney,
  calculateDiscount,
  createMoney,
  formatMoneyMinor,
  isValidMoney,
  multiplyMoney,
  subtractMoney,
} from '@/domains/catalog/utils';

describe('Money & Pricing Calculations (Integer Minor Units)', () => {
  it('creates money and enforces strict integer minor units', () => {
    const valid = createMoney(19999, 'USD');
    expect(valid.amountMinor).toBe(19999);
    expect(valid.currency).toBe('USD');

    expect(() => createMoney(19.99, 'USD')).toThrow(/integer/i);
  });

  it('adds two money amounts of identical currency with zero precision drift', () => {
    const a = createMoney(10050, 'USD'); // $100.50
    const b = createMoney(2525, 'USD'); // $25.25
    const result = addMoney(a, b);
    expect(result.amountMinor).toBe(12575); // $125.75
    expect(result.currency).toBe('USD');
  });

  it('rejects addition and subtraction of mismatched currencies', () => {
    const usd = createMoney(10000, 'USD');
    const bdt = createMoney(10000, 'BDT');
    expect(() => addMoney(usd, bdt)).toThrow(/mismatched/i);
    expect(() => subtractMoney(usd, bdt)).toThrow(/mismatched/i);
  });

  it('multiplies money by quantity and rounds to nearest integer minor unit', () => {
    const unitPrice = createMoney(3333, 'USD'); // $33.33
    const total = multiplyMoney(unitPrice, 3);
    expect(total.amountMinor).toBe(9999); // $99.99
    expect(Number.isInteger(total.amountMinor)).toBe(true);
  });

  it('calculates percentage discounts accurately', () => {
    const compareAt = createMoney(249900, 'USD'); // $2,499.00
    const sale = createMoney(219900, 'USD'); // $2,199.00
    const discount = calculateDiscount(compareAt, sale);

    expect(discount.savings.amountMinor).toBe(30000); // $300.00
    expect(discount.type).toBe('percentage');
    expect(discount.value).toBe(12); // ~12.00%
  });

  it('formats money minor units into localized string', () => {
    const money = createMoney(19999, 'USD');
    const formatted = formatMoneyMinor(money, { locale: 'en-US' });
    expect(formatted).toMatch(/\$199\.99/);
  });

  describe('Strict Money Validation (isValidMoney)', () => {
    it('accepts valid Money objects across all canonical currencies', () => {
      const validCurrencies = ['USD', 'BDT', 'INR', 'SAR', 'AED', 'EUR', 'GBP'] as const;
      for (const curr of validCurrencies) {
        expect(isValidMoney({ amountMinor: 5000, currency: curr })).toBe(true);
      }
      expect(isValidMoney({ amountMinor: 0, currency: 'USD' })).toBe(true);
    });

    it('rejects invalid, negative, fractional, or non-finite values', () => {
      expect(isValidMoney(null)).toBe(false);
      expect(isValidMoney(undefined)).toBe(false);
      expect(isValidMoney('1000')).toBe(false);
      expect(isValidMoney({})).toBe(false);
      expect(isValidMoney({ amountMinor: 100.5, currency: 'USD' })).toBe(false);
      expect(isValidMoney({ amountMinor: -50, currency: 'USD' })).toBe(false);
      expect(isValidMoney({ amountMinor: NaN, currency: 'USD' })).toBe(false);
      expect(isValidMoney({ amountMinor: Infinity, currency: 'USD' })).toBe(false);
      expect(isValidMoney({ amountMinor: -Infinity, currency: 'USD' })).toBe(false);
      expect(isValidMoney({ amountMinor: Number.MAX_SAFE_INTEGER + 1000, currency: 'USD' })).toBe(
        false
      );
    });

    it('rejects unsupported currencies and prototype injection', () => {
      expect(isValidMoney({ amountMinor: 1000, currency: 'JPY' as unknown as never })).toBe(false);
      expect(isValidMoney({ amountMinor: 1000, currency: 'XYZ' as unknown as never })).toBe(false);
      expect(isValidMoney({ amountMinor: 1000, currency: 'toString' as unknown as never })).toBe(
        false
      );
      expect(isValidMoney({ amountMinor: 1000, currency: '__proto__' as unknown as never })).toBe(
        false
      );
    });
  });

  describe('Discount Calculation Edge Cases', () => {
    it('rounds sub-1% discounts deterministically to 0%', () => {
      // compareAt $2,499.00 vs sale $2,489.00 -> savings $10.00 (1000 minor)
      // 1000 / 249900 = 0.40016% -> rounds to 0%
      const compareAt = createMoney(249900, 'USD');
      const sale = createMoney(248900, 'USD');
      const discount = calculateDiscount(compareAt, sale);

      expect(discount.savings.amountMinor).toBe(1000);
      expect(discount.value).toBe(0);
    });

    it('handles zero compareAtPrice without dividing by zero', () => {
      const compareAt = createMoney(0, 'USD');
      const sale = createMoney(0, 'USD');
      const discount = calculateDiscount(compareAt, sale);

      expect(discount.value).toBe(0);
      expect(discount.savings.amountMinor).toBe(0);
    });

    it('enforces strict currency matching during discount calculation', () => {
      const compareAt = createMoney(10000, 'USD');
      const sale = createMoney(8000, 'EUR');
      expect(() => calculateDiscount(compareAt, sale)).toThrow(/mismatched/i);
    });
  });
});
