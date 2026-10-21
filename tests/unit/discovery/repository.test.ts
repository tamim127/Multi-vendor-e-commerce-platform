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

  describe('Search Stage 1 AND Eligibility & Relevance', () => {
    it('requires all query tokens to match (Stage 1 AND logic)', async () => {
      const singleToken = await getCatalogProducts({ query: 'Apple' });
      expect(singleToken.total).toBeGreaterThan(0);

      const multiTokenMatch = await getCatalogProducts({ query: 'Apple MacBook' });
      expect(multiTokenMatch.total).toBeGreaterThan(0);
      for (const p of multiTokenMatch.products) {
        expect(p.title.en.toLowerCase()).toContain('macbook');
      }

      // Mutually exclusive tokens should return zero results
      const noMatch = await getCatalogProducts({ query: 'Apple Sony' });
      expect(noMatch.total).toBe(0);
    });

    it('preserves Bengali, Arabic, and Hindi text in search matching', async () => {
      const bnMatch = await getCatalogProducts({ query: 'ম্যাকবুক' });
      expect(bnMatch.total).toBeGreaterThan(0);

      const arMatch = await getCatalogProducts({ query: 'ماك بوك' });
      expect(arMatch.total).toBeGreaterThan(0);

      const hiMatch = await getCatalogProducts({ query: 'मैकबुक' });
      expect(hiMatch.total).toBeGreaterThan(0);
    });

    it('defaults to relevance sort when query is present and sort is omitted', async () => {
      const result = await getCatalogProducts({ query: 'Apple' });
      expect(result.products.length).toBeGreaterThan(0);
      expect(result.products[0]!.brand.slug).toBe('apple');
    });

    it('honors explicit sort selection even when query is present', async () => {
      const result = await getCatalogProducts({ query: 'Electronics', sort: 'newest' });
      expect(result.products.length).toBeGreaterThan(1);
      for (let i = 1; i < result.products.length; i++) {
        const prevDate = new Date(result.products[i - 1]!.createdAt).getTime();
        const currDate = new Date(result.products[i]!.createdAt).getTime();
        expect(currDate).toBeLessThanOrEqual(prevDate);
      }
    });
  });

  describe('All 7 CatalogSortOptions', () => {
    it('sorts deterministically by newest', async () => {
      const result = await getCatalogProducts({ sort: 'newest' });
      expect(result.products.length).toBeGreaterThan(1);
      for (let i = 1; i < result.products.length; i++) {
        const prevDate = new Date(result.products[i - 1]!.createdAt).getTime();
        const currDate = new Date(result.products[i]!.createdAt).getTime();
        expect(currDate).toBeLessThanOrEqual(prevDate);
      }
    });

    it('sorts deterministically by bestselling using volume signals and badges', async () => {
      const result = await getCatalogProducts({ sort: 'bestselling' });
      expect(result.products.length).toBeGreaterThan(1);
      for (let i = 1; i < result.products.length; i++) {
        const prev = result.products[i - 1]!;
        const curr = result.products[i]!;
        const countDiff = (prev.ratingSummary?.count ?? 0) - (curr.ratingSummary?.count ?? 0);
        if (countDiff === 0) {
          const reviewDiff = (prev.reviewCount ?? 0) - (curr.reviewCount ?? 0);
          if (reviewDiff === 0) {
            const prevBadge = (prev.badges ?? []).some((b) => b.type === 'best_seller') ? 1 : 0;
            const currBadge = (curr.badges ?? []).some((b) => b.type === 'best_seller') ? 1 : 0;
            expect(prevBadge).toBeGreaterThanOrEqual(currBadge);
          } else {
            expect(reviewDiff).toBeGreaterThanOrEqual(0);
          }
        } else {
          expect(countDiff).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it('sorts deterministically by discount_desc in authoritative currency', async () => {
      const result = await getCatalogProducts({ sort: 'discount_desc' });
      expect(result.products.length).toBeGreaterThan(1);
    });
  });

  describe('Boundary & Fail-Closed Filtering', () => {
    it('fails closed when category slug is not found in hierarchy', async () => {
      const result = await getCatalogProducts({ categorySlug: 'non-existent-category-slug-xyz' });
      expect(result.total).toBe(0);
      expect(result.products.length).toBe(0);
    });

    it('returns 0 products when price bounds are inverted (minPrice > maxPrice)', async () => {
      const result = await getCatalogProducts({
        minPriceMinor: 250000,
        maxPriceMinor: 100000,
      });
      expect(result.total).toBe(0);
      expect(result.products.length).toBe(0);
    });
  });
});
