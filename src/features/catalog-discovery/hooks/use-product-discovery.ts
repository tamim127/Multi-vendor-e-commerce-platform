'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { catalogQueryKeys } from '@/domains/catalog/contracts/query-keys';
import type { CatalogQueryParams } from '@/domains/catalog/types/query';
import type { CatalogDiscoveryResult } from '../repository';

async function fetchCatalogProductsFromApi(
  params?: CatalogQueryParams
): Promise<CatalogDiscoveryResult> {
  const sp = new URLSearchParams();
  if (params?.query) sp.set('q', params.query);
  if (params?.categorySlug) sp.set('category', params.categorySlug);
  if (params?.brandSlugs) {
    for (const b of params.brandSlugs) {
      sp.append('brand', b);
    }
  }
  if (typeof params?.minPriceMinor === 'number') {
    sp.set('minPrice', String(params.minPriceMinor / 100));
  }
  if (typeof params?.maxPriceMinor === 'number') {
    sp.set('maxPrice', String(params.maxPriceMinor / 100));
  }
  if (typeof params?.minRating === 'number') {
    sp.set('rating', String(params.minRating));
  }
  if (params?.inventoryStates?.includes('in_stock')) {
    sp.set('inStock', 'true');
  }
  if (params?.sort) sp.set('sort', params.sort);
  if (params?.page) sp.set('page', String(params.page));
  if (params?.limit) sp.set('limit', String(params.limit));
  if (params?.currency) sp.set('currency', params.currency);

  const response = await fetch(`/api/catalog/products?${sp.toString()}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error || `Failed to load catalog products (HTTP ${response.status}).`);
  }

  return {
    products: payload.data || [],
    total: payload.meta?.total ?? 0,
    page: payload.meta?.page ?? 1,
    limit: payload.meta?.limit ?? 24,
    totalPages: payload.meta?.totalPages ?? 1,
    facets: payload.meta?.facets ?? { categories: [], brands: [], inStockCount: 0 },
  };
}

export function useProductDiscovery(
  params?: CatalogQueryParams
): UseQueryResult<CatalogDiscoveryResult, Error> {
  return useQuery({
    queryKey: catalogQueryKeys.productList(params),
    queryFn: () => fetchCatalogProductsFromApi(params),
    staleTime: 30 * 1000,
    retry: 1,
  });
}
