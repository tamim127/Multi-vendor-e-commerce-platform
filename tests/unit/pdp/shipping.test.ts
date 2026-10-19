import { describe, it, expect } from 'vitest';
import { formatShippingEstimate, isValidDayRange } from '@/features/product-detail/utils/shipping';
import type { ShippingEstimate } from '@/domains/catalog/types/seller-offer';
import { getTranslation } from '@/lib/i18n';

describe('Phase 2E: Shipping Formatting & Delivery Window Validation', () => {
  describe('isValidDayRange', () => {
    it('accepts valid, finite, non-negative, non-decreasing integer day ranges', () => {
      expect(isValidDayRange(1, 3)).toBe(true);
      expect(isValidDayRange(0, 0)).toBe(true);
      expect(isValidDayRange(2, 2)).toBe(true);
      expect(isValidDayRange(14, 21)).toBe(true);
    });

    it('rejects negative day values', () => {
      expect(isValidDayRange(-1, 3)).toBe(false);
      expect(isValidDayRange(0, -2)).toBe(false);
      expect(isValidDayRange(-5, -1)).toBe(false);
    });

    it('rejects fractional day values', () => {
      expect(isValidDayRange(1.5, 3)).toBe(false);
      expect(isValidDayRange(1, 4.2)).toBe(false);
      expect(isValidDayRange(0.1, 0.9)).toBe(false);
    });

    it('rejects non-finite day values', () => {
      expect(isValidDayRange(NaN, 5)).toBe(false);
      expect(isValidDayRange(1, NaN)).toBe(false);
      expect(isValidDayRange(Infinity, 5)).toBe(false);
      expect(isValidDayRange(1, Infinity)).toBe(false);
      expect(isValidDayRange(-Infinity, 5)).toBe(false);
    });

    it('rejects reversed day ranges where minDays > maxDays', () => {
      expect(isValidDayRange(5, 2)).toBe(false);
      expect(isValidDayRange(10, 1)).toBe(false);
    });

    it('rejects non-numeric inputs', () => {
      expect(isValidDayRange('1', '3')).toBe(false);
      expect(isValidDayRange(null, undefined)).toBe(false);
    });
  });

  describe('formatShippingEstimate', () => {
    it('returns Free Delivery strictly when isFreeShipping is true', () => {
      const estimate: ShippingEstimate = {
        minDays: 1,
        maxDays: 2,
        isFreeShipping: true,
      };

      const result = formatShippingEstimate(estimate);
      expect(result.isFree).toBe(true);
      expect(result.label).toBe('Free Delivery');
      expect(result.detail).toBe('(1–2 days)');
      expect(result.isCalculatedAtCheckout).toBe(false);
    });

    it('omits turnaround detail for free shipping if day range is invalid', () => {
      const invalidRanges: [number, number][] = [
        [-1, 3],
        [1.5, 4],
        [5, 2],
        [NaN, 5],
        [1, Infinity],
      ];

      for (const [minDays, maxDays] of invalidRanges) {
        const estimate: ShippingEstimate = {
          minDays,
          maxDays,
          isFreeShipping: true,
        };

        const result = formatShippingEstimate(estimate);
        expect(result.isFree).toBe(true);
        expect(result.label).toBe('Free Delivery');
        expect(result.detail).toBeUndefined();
      }
    });

    it('formats paid delivery when cost is positive integer and currency supported', () => {
      const estimate: ShippingEstimate = {
        minDays: 3,
        maxDays: 5,
        isFreeShipping: false,
        shippingCost: { amountMinor: 1500, currency: 'USD' },
      };

      const result = formatShippingEstimate(estimate);
      expect(result.isFree).toBe(false);
      expect(result.label).toBe('+ $15.00');
      expect(result.detail).toBe('(3–5 days)');
      expect(result.isCalculatedAtCheckout).toBe(false);
    });

    it('omits turnaround detail for paid delivery if day range is invalid but cost is valid', () => {
      const estimate: ShippingEstimate = {
        minDays: 5,
        maxDays: 2, // reversed!
        isFreeShipping: false,
        shippingCost: { amountMinor: 1500, currency: 'USD' },
      };

      const result = formatShippingEstimate(estimate);
      expect(result.isFree).toBe(false);
      expect(result.label).toBe('+ $15.00');
      expect(result.detail).toBeUndefined();
      expect(result.isCalculatedAtCheckout).toBe(false);
    });

    it('falls back to Shipping calculated at checkout when estimate is missing', () => {
      expect(formatShippingEstimate(null).isCalculatedAtCheckout).toBe(true);
      expect(formatShippingEstimate(undefined).isCalculatedAtCheckout).toBe(true);
      expect(formatShippingEstimate(null).label).toBe('Shipping calculated at checkout');
    });

    it('falls back to Shipping calculated at checkout when paid delivery lacks shippingCost', () => {
      const estimate: ShippingEstimate = {
        minDays: 2,
        maxDays: 4,
        isFreeShipping: false,
      };

      const result = formatShippingEstimate(estimate);
      expect(result.isCalculatedAtCheckout).toBe(true);
      expect(result.label).toBe('Shipping calculated at checkout');
      expect(result.detail).toBe('(2–4 days)');
    });

    it('falls back to calculated at checkout for non-positive or non-integer shipping cost', () => {
      const nonPositiveCosts = [0, -100, -1, 15.5, NaN, Infinity];

      for (const amountMinor of nonPositiveCosts) {
        const estimate: ShippingEstimate = {
          minDays: 2,
          maxDays: 4,
          isFreeShipping: false,
          shippingCost: { amountMinor: amountMinor as number, currency: 'USD' },
        };

        const result = formatShippingEstimate(estimate);
        expect(result.isCalculatedAtCheckout).toBe(true);
        expect(result.label).toBe('Shipping calculated at checkout');
      }
    });

    it('falls back to calculated at checkout for unsupported or unknown currency', () => {
      const estimate: ShippingEstimate = {
        minDays: 2,
        maxDays: 4,
        isFreeShipping: false,
        shippingCost: { amountMinor: 1500, currency: 'XYZ' },
      };

      const result = formatShippingEstimate(estimate);
      expect(result.isCalculatedAtCheckout).toBe(true);
      expect(result.label).toBe('Shipping calculated at checkout');
    });

    it('supports localized options across all 4 supported locales (EN, BN, AR, HI)', () => {
      const locales = ['en', 'bn', 'ar', 'hi'] as const;

      for (const loc of locales) {
        const freeText = getTranslation(loc, 'pdp.freeDelivery');
        const calculatedText = getTranslation(loc, 'pdp.shippingCalculatedAtCheckout');

        const freeResult = formatShippingEstimate(
          { minDays: 1, maxDays: 2, isFreeShipping: true },
          { locale: loc, freeDeliveryText: freeText, calculatedAtCheckoutText: calculatedText }
        );
        expect(freeResult.label).toBe(freeText);

        const fallbackResult = formatShippingEstimate(null, {
          locale: loc,
          freeDeliveryText: freeText,
          calculatedAtCheckoutText: calculatedText,
        });
        expect(fallbackResult.label).toBe(calculatedText);
      }
    });
  });
});
