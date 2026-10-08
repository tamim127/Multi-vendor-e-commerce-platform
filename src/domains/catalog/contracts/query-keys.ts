/**
 * ==============================================================================
 * CATALOG DOMAIN — QUERY KEY FACTORY
 * ==============================================================================
 * Standardized hierarchical cache keys for future TanStack Query data fetching.
 * Pure TypeScript tuple structures; zero dependencies on React or TanStack Query.
 */

import type { CatalogQueryParams } from '../types/query';

export const catalogQueryKeys = {
  all: ['catalog'] as const,

  // Products
  products: (): readonly ['catalog', 'products'] => ['catalog', 'products'] as const,
  productList: (
    params?: CatalogQueryParams
  ): readonly ['catalog', 'products', 'list', CatalogQueryParams] =>
    ['catalog', 'products', 'list', params ?? {}] as const,
  productDetail: (slug: string): readonly ['catalog', 'products', 'detail', string] =>
    ['catalog', 'products', 'detail', slug] as const,
  productSellerOffers: (
    productId: string,
    variantId?: string
  ): readonly ['catalog', 'products', 'seller-offers', string, string] =>
    ['catalog', 'products', 'seller-offers', productId, variantId ?? 'all'] as const,

  // Categories
  categories: (): readonly ['catalog', 'categories'] => ['catalog', 'categories'] as const,
  categoryTree: (): readonly ['catalog', 'categories', 'tree'] =>
    ['catalog', 'categories', 'tree'] as const,
  categoryDetail: (slug: string): readonly ['catalog', 'categories', 'detail', string] =>
    ['catalog', 'categories', 'detail', slug] as const,

  // Brands
  brands: (): readonly ['catalog', 'brands'] => ['catalog', 'brands'] as const,
  brandDetail: (slug: string): readonly ['catalog', 'brands', 'detail', string] =>
    ['catalog', 'brands', 'detail', slug] as const,

  // Collections
  collections: (): readonly ['catalog', 'collections'] => ['catalog', 'collections'] as const,
  collectionDetail: (slug: string): readonly ['catalog', 'collections', 'detail', string] =>
    ['catalog', 'collections', 'detail', slug] as const,
};
