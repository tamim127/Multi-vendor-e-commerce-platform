/**
 * ==============================================================================
 * CATALOG DOMAIN TEST SUITE — FIXTURES INTEGRITY
 * ==============================================================================
 * Validates that 100% of mock fixtures conform to Zod schemas and maintain
 * strict relational consistency.
 */

import { describe, expect, it } from 'vitest';
import {
  MOCK_BRANDS,
  MOCK_CATEGORIES,
  MOCK_COLLECTIONS,
  MOCK_PRODUCTS,
  MOCK_SELLER_OFFERS,
  MOCK_SELLERS,
  MOCK_VARIANTS,
} from '@/domains/catalog/fixtures';
import {
  BrandSchema,
  CatalogCollectionSchema,
  CategorySchema,
  ProductSchema,
  ProductVariantSchema,
  SellerOfferSchema,
  SellerSummarySchema,
} from '@/domains/catalog/schemas';

describe('Catalog Fixtures Integrity & Relational Invariants', () => {
  it('validates all mock brands against BrandSchema', () => {
    expect(MOCK_BRANDS.length).toBeGreaterThanOrEqual(5);
    for (const brand of MOCK_BRANDS) {
      const result = BrandSchema.safeParse(brand);
      expect(result.success, `Brand failed schema: ${brand.id}`).toBe(true);
    }
  });

  it('validates all mock categories against CategorySchema', () => {
    expect(MOCK_CATEGORIES.length).toBeGreaterThanOrEqual(10);
    for (const cat of MOCK_CATEGORIES) {
      const result = CategorySchema.safeParse(cat);
      expect(result.success, `Category failed schema: ${cat.id}`).toBe(true);
    }
  });

  it('validates all mock sellers against SellerSummarySchema', () => {
    expect(MOCK_SELLERS.length).toBeGreaterThanOrEqual(4);
    for (const seller of MOCK_SELLERS) {
      const result = SellerSummarySchema.safeParse(seller);
      expect(result.success, `Seller failed schema: ${seller.id}`).toBe(true);
    }
  });

  it('validates all mock variants against ProductVariantSchema', () => {
    expect(MOCK_VARIANTS.length).toBeGreaterThanOrEqual(8);
    for (const variant of MOCK_VARIANTS) {
      const result = ProductVariantSchema.safeParse(variant);
      expect(result.success, `Variant failed schema: ${variant.id}`).toBe(true);
    }
  });

  it('validates all mock seller offers against SellerOfferSchema', () => {
    expect(MOCK_SELLER_OFFERS.length).toBeGreaterThanOrEqual(8);
    for (const offer of MOCK_SELLER_OFFERS) {
      const result = SellerOfferSchema.safeParse(offer);
      expect(result.success, `Offer failed schema: ${offer.offerId}`).toBe(true);
    }
  });

  it('validates all mock products against ProductSchema', () => {
    expect(MOCK_PRODUCTS.length).toBeGreaterThanOrEqual(6);
    for (const product of MOCK_PRODUCTS) {
      const result = ProductSchema.safeParse(product);
      expect(result.success, `Product failed schema: ${product.id}`).toBe(true);
    }
  });

  it('validates all mock collections against CatalogCollectionSchema', () => {
    expect(MOCK_COLLECTIONS.length).toBeGreaterThanOrEqual(3);
    for (const col of MOCK_COLLECTIONS) {
      const result = CatalogCollectionSchema.safeParse(col);
      expect(result.success, `Collection failed schema: ${col.id}`).toBe(true);
    }
  });

  describe('Relational References & Uniqueness', () => {
    it('enforces SKU uniqueness across all variants', () => {
      const skus = MOCK_VARIANTS.map((v) => v.sku);
      const uniqueSkus = new Set(skus);
      expect(uniqueSkus.size).toBe(skus.length);
    });

    it('enforces Product ID and slug uniqueness', () => {
      const ids = MOCK_PRODUCTS.map((p) => p.id);
      const slugs = MOCK_PRODUCTS.map((p) => p.slug);
      expect(new Set(ids).size).toBe(ids.length);
      expect(new Set(slugs).size).toBe(slugs.length);
    });

    it('enforces Category ID and slug uniqueness', () => {
      const ids = MOCK_CATEGORIES.map((c) => c.id);
      const slugs = MOCK_CATEGORIES.map((c) => c.slug);
      expect(new Set(ids).size).toBe(ids.length);
      expect(new Set(slugs).size).toBe(slugs.length);
    });

    it('verifies that every product references an existing category and brand', () => {
      const categoryIds = new Set(MOCK_CATEGORIES.map((c) => c.id));
      const brandIds = new Set(MOCK_BRANDS.map((b) => b.id));

      for (const product of MOCK_PRODUCTS) {
        expect(
          categoryIds.has(product.categoryId),
          `Missing category for product ${product.id}`
        ).toBe(true);
        expect(brandIds.has(product.brand.id), `Missing brand for product ${product.id}`).toBe(
          true
        );
      }
    });

    it('verifies that every defaultVariantId references a variant inside that product', () => {
      for (const product of MOCK_PRODUCTS) {
        if (product.defaultVariantId) {
          const matchingVariant = product.variants.find((v) => v.id === product.defaultVariantId);
          expect(
            matchingVariant,
            `Default variant not found in product ${product.id}`
          ).toBeDefined();
        }
      }
    });

    it('verifies that all seller offers link to valid sellers and products', () => {
      const sellerIds = new Set(MOCK_SELLERS.map((s) => s.id));
      const productIds = new Set(MOCK_PRODUCTS.map((p) => p.id));
      const variantIds = new Set(MOCK_VARIANTS.map((v) => v.id));

      for (const offer of MOCK_SELLER_OFFERS) {
        expect(sellerIds.has(offer.sellerId), `Invalid seller in offer ${offer.offerId}`).toBe(
          true
        );
        expect(productIds.has(offer.productId), `Invalid product in offer ${offer.offerId}`).toBe(
          true
        );
        if (offer.variantId) {
          expect(variantIds.has(offer.variantId), `Invalid variant in offer ${offer.offerId}`).toBe(
            true
          );
        }
      }
    });

    it('verifies that curated collections reference valid products', () => {
      const productIds = new Set(MOCK_PRODUCTS.map((p) => p.id));
      for (const col of MOCK_COLLECTIONS) {
        for (const prodId of col.productIds) {
          expect(
            productIds.has(prodId),
            `Collection ${col.id} references invalid product ${prodId}`
          ).toBe(true);
        }
      }
    });
  });
});
