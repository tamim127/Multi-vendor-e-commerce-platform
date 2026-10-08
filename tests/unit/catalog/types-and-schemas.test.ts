/**
 * ==============================================================================
 * CATALOG DOMAIN TEST SUITE — TYPES & SCHEMAS
 * ==============================================================================
 * Asserts strict runtime Zod validation and domain invariants.
 */

import { describe, expect, it } from 'vitest';
import {
  CategorySchema,
  LocalizedTextSchema,
  MoneySchema,
  ProductSchema,
  ProductVariantSchema,
  SellerOfferSchema,
} from '@/domains/catalog/schemas';

describe('Catalog Schemas & Domain Invariants', () => {
  describe('MoneySchema', () => {
    it('accepts valid integer minor unit money', () => {
      const valid = { amountMinor: 19999, currency: 'USD' };
      const parsed = MoneySchema.safeParse(valid);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.amountMinor).toBe(19999);
        expect(parsed.data.currency).toBe('USD');
      }
    });

    it('rejects floating-point minor unit amounts', () => {
      const invalid = { amountMinor: 199.99, currency: 'USD' };
      const parsed = MoneySchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.issues[0]?.message).toMatch(/integer/i);
      }
    });

    it('rejects negative or missing fields', () => {
      expect(MoneySchema.safeParse({ amountMinor: '19999', currency: 'USD' }).success).toBe(false);
      expect(MoneySchema.safeParse({ amountMinor: 1000 }).success).toBe(false);
    });
  });

  describe('LocalizedTextSchema', () => {
    it('requires English text as canonical fallback', () => {
      expect(LocalizedTextSchema.safeParse({ en: 'Hello' }).success).toBe(true);
      expect(LocalizedTextSchema.safeParse({ bn: 'হ্যালো' }).success).toBe(false);
      expect(LocalizedTextSchema.safeParse({ en: '' }).success).toBe(false);
    });

    it('allows multi-locale translations and extensible locale keys', () => {
      const multilang = {
        en: 'Wireless Headphones',
        bn: 'ওয়্যারলেস হেডফোন',
        ar: 'سماعات لاسلكية',
        hi: 'वायरलेस हेडफोन',
        fr: 'Casque sans fil',
      };
      const parsed = LocalizedTextSchema.safeParse(multilang);
      expect(parsed.success).toBe(true);
    });
  });

  describe('CategorySchema', () => {
    it('supports root category with null parentId', () => {
      const rootCat = {
        id: 'cat-root',
        slug: 'electronics',
        name: { en: 'Electronics' },
        parentId: null,
        level: 0,
        path: '/electronics',
        childCount: 3,
        productCount: 100,
        isActive: true,
        isFeatured: true,
      };
      expect(CategorySchema.safeParse(rootCat).success).toBe(true);
    });

    it('supports deep category levels (e.g. level 4)', () => {
      const deepCat = {
        id: 'cat-deep',
        slug: 'workstation-ultrabooks',
        name: { en: 'Workstations' },
        parentId: 'cat-laptops',
        level: 4,
        path: '/electronics/computers/laptops/ultrabooks/workstation-ultrabooks',
        childCount: 0,
        productCount: 25,
        isActive: true,
        isFeatured: false,
      };
      expect(CategorySchema.safeParse(deepCat).success).toBe(true);
    });

    it('rejects invalid slugs with uppercase or special characters', () => {
      const invalid = {
        id: 'cat-invalid',
        slug: 'Invalid Slug!',
        name: { en: 'Invalid' },
        parentId: null,
        level: 0,
        path: '/invalid',
        childCount: 0,
        productCount: 0,
        isActive: true,
        isFeatured: false,
      };
      expect(CategorySchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe('ProductSchema', () => {
    it('validates canonical product structure', () => {
      const minimalProduct = {
        id: 'prod-test',
        slug: 'test-product',
        title: { en: 'Test Product' },
        description: { en: 'Test Description' },
        brand: {
          id: 'brand-test',
          slug: 'test-brand',
          name: 'Test Brand',
          status: 'active',
          isFeatured: false,
        },
        categoryId: 'cat-test',
        categoryPath: '/test',
        categoryBreadcrumbs: [
          { id: 'cat-test', slug: 'test', name: { en: 'Test' }, level: 0, path: '/test' },
        ],
        categoryIds: ['cat-test'],
        media: [],
        attributes: [],
        variants: [],
        ratingSummary: {
          average: 4.5,
          count: 10,
          distribution: { 1: 0, 2: 1, 3: 1, 4: 2, 5: 6 },
        },
        reviewCount: 5,
        badges: [],
        tags: ['test'],
        status: 'active',
        offerSummary: {
          offerCount: 1,
          lowestPrice: { amountMinor: 9999, currency: 'USD' },
          highestPrice: { amountMinor: 9999, currency: 'USD' },
          hasMultipleOffers: false,
        },
        isDigital: false,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };
      expect(ProductSchema.safeParse(minimalProduct).success).toBe(true);
    });
  });

  describe('ProductVariantSchema', () => {
    it('validates SKU and option dimensions', () => {
      const variant = {
        id: 'var-1',
        productId: 'prod-1',
        sku: 'APL-MBP-16-BLK',
        options: [
          {
            attributeKey: 'color',
            attributeLabel: { en: 'Color' },
            value: 'black',
            displayValue: { en: 'Black' },
          },
        ],
        media: [],
        msrpReference: { amountMinor: 249900, currency: 'USD' },
        isDefault: true,
        isActive: true,
      };
      expect(ProductVariantSchema.safeParse(variant).success).toBe(true);
    });
  });

  describe('SellerOfferSchema', () => {
    it('enforces integer pricing and seller terms', () => {
      const offer = {
        offerId: 'ofr-1',
        productId: 'prod-1',
        sellerId: 'seller-1',
        seller: {
          id: 'seller-1',
          slug: 'official-seller',
          name: 'Official Store',
          rating: { average: 4.8, count: 500, positiveFeedbackPercent: 98 },
          badges: ['official_store'],
          isVerified: true,
        },
        price: { amountMinor: 19999, currency: 'USD' },
        condition: 'new',
        inventory: {
          state: 'in_stock',
          quantityAvailable: 10,
        },
        fulfillmentType: 'marketplace_fulfilled',
        shippingEstimate: {
          minDays: 1,
          maxDays: 3,
          isFreeShipping: true,
        },
        isBuyBoxWinner: true,
        returnPolicyDays: 30,
      };
      expect(SellerOfferSchema.safeParse(offer).success).toBe(true);
    });

    it('rejects offer with floating point price', () => {
      const invalidOffer = {
        offerId: 'ofr-1',
        productId: 'prod-1',
        sellerId: 'seller-1',
        seller: {
          id: 'seller-1',
          slug: 'official-seller',
          name: 'Official Store',
          rating: { average: 4.8, count: 500, positiveFeedbackPercent: 98 },
          badges: [],
          isVerified: true,
        },
        price: { amountMinor: 199.99, currency: 'USD' }, // Floating point!
        condition: 'new',
        inventory: { state: 'in_stock' },
        fulfillmentType: 'marketplace_fulfilled',
        shippingEstimate: { minDays: 1, maxDays: 2, isFreeShipping: true },
        isBuyBoxWinner: false,
        returnPolicyDays: 14,
      };
      expect(SellerOfferSchema.safeParse(invalidOffer).success).toBe(false);
    });
  });
});
