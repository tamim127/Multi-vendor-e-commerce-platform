/**
 * ==============================================================================
 * CATALOG DOMAIN TEST SUITE — SELLER OFFERS SEPARATION
 * ==============================================================================
 * Verifies clean decoupling between Canonical Product and Seller Commercial Offers.
 */

import { describe, expect, it } from 'vitest';
import { MOCK_PRODUCTS, MOCK_SELLER_OFFERS } from '@/domains/catalog/fixtures';

describe('Seller Offers & Commercial Decoupling', () => {
  it('separates Canonical Product identity from SellerOffer transactional state', () => {
    const mbpProduct = MOCK_PRODUCTS.find((p) => p.id === 'prod-macbook-pro-16')!;
    expect(mbpProduct).toBeDefined();

    // Canonical product holds specifications, brand, and media
    expect(mbpProduct.brand.name).toBe('Apple');
    expect(mbpProduct.variants.length).toBe(4);

    // Offers are external entities referencing the product
    const mbpOffers = MOCK_SELLER_OFFERS.filter((o) => o.productId === mbpProduct.id);
    expect(mbpOffers.length).toBeGreaterThanOrEqual(3);
  });

  it('supports multiple sellers competing for the same variant with different prices', () => {
    const variantId = 'var-mbp-16-blk-512';
    const variantOffers = MOCK_SELLER_OFFERS.filter((o) => o.variantId === variantId);

    expect(variantOffers.length).toBe(3);

    const prices = variantOffers.map((o) => o.price.amountMinor);
    // Prices: $2,499.00 (flagship), $2,399.00 (techdirect), $2,099.00 (refurbished)
    expect(prices).toContain(249900);
    expect(prices).toContain(239900);
    expect(prices).toContain(209900);

    const conditions = variantOffers.map((o) => o.condition);
    expect(conditions).toContain('new');
    expect(conditions).toContain('refurbished_excellent');
  });

  it('identifies exact Buy Box winner among competing offers', () => {
    const variantId = 'var-mbp-16-blk-512';
    const variantOffers = MOCK_SELLER_OFFERS.filter((o) => o.variantId === variantId);

    const buyBoxWinners = variantOffers.filter((o) => o.isBuyBoxWinner);
    expect(buyBoxWinners.length).toBe(1);
    expect(buyBoxWinners[0]?.seller.slug).toBe('official-flagship-store');
  });

  it('validates derived offerSummary consistency on canonical product', () => {
    const mbpProduct = MOCK_PRODUCTS.find((p) => p.id === 'prod-macbook-pro-16')!;
    const mbpOffers = MOCK_SELLER_OFFERS.filter((o) => o.productId === mbpProduct.id);

    const minPrice = Math.min(...mbpOffers.map((o) => o.price.amountMinor));
    const maxPrice = Math.max(...mbpOffers.map((o) => o.price.amountMinor));

    expect(mbpProduct.offerSummary.lowestPrice.amountMinor).toBe(minPrice);
    expect(mbpProduct.offerSummary.highestPrice.amountMinor).toBe(maxPrice);
    expect(mbpProduct.offerSummary.hasMultipleOffers).toBe(true);
    expect(mbpProduct.offerSummary.offerCount).toBe(mbpOffers.length);
  });
});
