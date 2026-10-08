/**
 * ==============================================================================
 * CATALOG DISCOVERY TEST SUITE — REPOSITORY ADAPTER
 * ==============================================================================
 * Tests deterministic fixture-backed discovery filtering, recursive descendant
 * category matches, multi-attribute filtering, sorting, pagination, and facets.
 */

import { describe, expect, it } from 'vitest';
import { MOCK_PRODUCTS } from '@/domains/catalog/fixtures';
import { getCatalogProducts } from '@/features/catalog-discovery/repository';

describe('Catalog Discovery Repository Adapter', () => {
  it('returns all mock products with default parameters', async () => {
    const result = await getCatalogProducts();

    expect(result.total).toBe(MOCK_PRODUCTS.length);
    expect(result.page).toBe(1);
    expect(result.products.length).toBeGreaterThan(0);
    expect(result.facets.categories.length).toBeGreaterThan(0);
    expect(result.facets.brands.length).toBeGreaterThan(0);
    expect(typeof result.facets.inStockCount).toBe('number');
  });

  it('filters by category including recursive descendants', async () => {
    // 'laptops' (level 2) contains child 'ultraportable-laptops' (level 3) and 'workstation-ultrabooks' (level 4)
    const result = await getCatalogProducts({ categorySlug: 'laptops' });

    expect(result.total).toBeGreaterThan(0);
    // Every product in result must be in the laptops hierarchy
    for (const product of result.products) {
      expect(product.categoryPath).toContain('/laptops');
    }
  });

  it('filters by brand slug correctly', async () => {
    const result = await getCatalogProducts({ brandSlugs: ['apple'] });

    expect(result.total).toBeGreaterThan(0);
    for (const product of result.products) {
      expect(product.brand.slug).toBe('apple');
    }
  });

  it('filters by price range using integer minor units', async () => {
    // $1000 to $2500 -> 100000 to 250000
    const result = await getCatalogProducts({
      minPriceMinor: 100000,
      maxPriceMinor: 250000,
    });

    expect(result.total).toBeGreaterThan(0);
    for (const product of result.products) {
      expect(product.offerSummary.lowestPrice.amountMinor).toBeGreaterThanOrEqual(100000);
      expect(product.offerSummary.lowestPrice.amountMinor).toBeLessThanOrEqual(250000);
    }
  });

  it('filters by minimum rating', async () => {
    const result = await getCatalogProducts({ minRating: 4.8 });

    expect(result.total).toBeGreaterThan(0);
    for (const product of result.products) {
      expect(product.ratingSummary.average).toBeGreaterThanOrEqual(4.8);
    }
  });

  it('filters by in_stock inventory state', async () => {
    const result = await getCatalogProducts({ inventoryStates: ['in_stock'] });

    expect(result.total).toBeGreaterThan(0);
    expect(result.total).toBe(result.facets.inStockCount);
  });

  it('sorts deterministically by price_asc', async () => {
    const result = await getCatalogProducts({ sort: 'price_asc' });

    expect(result.products.length).toBeGreaterThan(1);
    for (let i = 1; i < result.products.length; i++) {
      const prevPrice = result.products[i - 1]!.offerSummary.lowestPrice.amountMinor;
      const currPrice = result.products[i]!.offerSummary.lowestPrice.amountMinor;
      expect(currPrice).toBeGreaterThanOrEqual(prevPrice);
    }
  });

  it('sorts deterministically by price_desc', async () => {
    const result = await getCatalogProducts({ sort: 'price_desc' });

    expect(result.products.length).toBeGreaterThan(1);
    for (let i = 1; i < result.products.length; i++) {
      const prevPrice = result.products[i - 1]!.offerSummary.lowestPrice.amountMinor;
      const currPrice = result.products[i]!.offerSummary.lowestPrice.amountMinor;
      expect(currPrice).toBeLessThanOrEqual(prevPrice);
    }
  });

  it('sorts deterministically by rating_desc', async () => {
    const result = await getCatalogProducts({ sort: 'rating_desc' });

    expect(result.products.length).toBeGreaterThan(1);
    for (let i = 1; i < result.products.length; i++) {
      const prevRating = result.products[i - 1]!.ratingSummary.average;
      const currRating = result.products[i]!.ratingSummary.average;
      expect(currRating).toBeLessThanOrEqual(prevRating);
    }
  });

  it('handles pagination slicing correctly', async () => {
    const page1 = await getCatalogProducts({ page: 1, limit: 2 });
    const page2 = await getCatalogProducts({ page: 2, limit: 2 });

    expect(page1.products.length).toBe(2);
    expect(page2.products.length).toBeGreaterThan(0);
    expect(page1.products[0]!.id).not.toBe(page2.products[0]!.id);
  });
});
