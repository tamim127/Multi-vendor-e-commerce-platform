/**
 * ==============================================================================
 * CATALOG DOMAIN TEST SUITE — API CONTRACTS & QUERY KEYS
 * ==============================================================================
 * Tests API response schema validation, dual-mode pagination, and query key contracts.
 */

import { describe, expect, it } from 'vitest';
import { CATALOG_API_ROUTES, catalogQueryKeys } from '@/domains/catalog/contracts';
import { MOCK_PRODUCTS } from '@/domains/catalog/fixtures';
import { GetProductsResponseSchema, PaginationMetaSchema } from '@/domains/catalog/schemas';

describe('API Contracts & TanStack Query Keys', () => {
  describe('Dual Pagination Model', () => {
    it('validates offset-based pagination metadata', () => {
      const offsetMeta = {
        page: 1,
        totalPages: 5,
        totalCount: 50,
        limit: 10,
        hasNextPage: true,
        hasPreviousPage: false,
      };
      const result = PaginationMetaSchema.safeParse(offsetMeta);
      expect(result.success).toBe(true);
    });

    it('validates cursor-based pagination metadata without requiring page/totalPages', () => {
      const cursorMeta = {
        limit: 20,
        hasNextPage: true,
        hasPreviousPage: false,
        nextCursor: 'cursor_xyz123',
      };
      const result = PaginationMetaSchema.safeParse(cursorMeta);
      expect(result.success).toBe(true);
    });
  });

  describe('GetProductsResponse Schema', () => {
    it('validates a complete product list API response with items and facets', () => {
      const responsePayload = {
        items: MOCK_PRODUCTS,
        pagination: {
          page: 1,
          totalPages: 1,
          totalCount: MOCK_PRODUCTS.length,
          limit: 20,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        facets: {
          categories: [
            { id: 'cat-electronics', slug: 'electronics', name: { en: 'Electronics' }, count: 4 },
          ],
          brands: [{ id: 'brand-apple', slug: 'apple', name: 'Apple', count: 1 }],
          priceRanges: [{ minMinor: 0, maxMinor: 100000, count: 2 }],
          attributes: [],
        },
      };

      const result = GetProductsResponseSchema.safeParse(responsePayload);
      expect(result.success).toBe(true);
    });
  });

  describe('Query Key Factory', () => {
    it('generates consistent hierarchical TanStack Query keys', () => {
      expect(catalogQueryKeys.all).toEqual(['catalog']);
      expect(catalogQueryKeys.products()).toEqual(['catalog', 'products']);
      expect(catalogQueryKeys.productDetail('apple-macbook-pro')).toEqual([
        'catalog',
        'products',
        'detail',
        'apple-macbook-pro',
      ]);
      expect(catalogQueryKeys.productSellerOffers('prod-1', 'var-1')).toEqual([
        'catalog',
        'products',
        'seller-offers',
        'prod-1',
        'var-1',
      ]);
      expect(catalogQueryKeys.categoryTree()).toEqual(['catalog', 'categories', 'tree']);
    });
  });

  describe('API Routes Contract', () => {
    it('constructs correct URL endpoints', () => {
      expect(CATALOG_API_ROUTES.getProducts).toBe('/catalog/products');
      expect(CATALOG_API_ROUTES.getProductBySlug('macbook-pro')).toBe(
        '/catalog/products/macbook-pro'
      );
      expect(CATALOG_API_ROUTES.getProductSellerOffers('prod-123')).toBe(
        '/catalog/products/prod-123/seller-offers'
      );
    });
  });
});
