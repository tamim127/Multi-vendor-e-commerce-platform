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
});
