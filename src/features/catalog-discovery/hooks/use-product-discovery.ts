/**
 * ==============================================================================
 * CATALOG DISCOVERY FEATURE — DATA FETCHING HOOK
 * ==============================================================================
 * Connects TanStack Query caching with the catalog discovery repository.
 */

'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { catalogQueryKeys } from '@/domains/catalog/contracts/query-keys';
import type { CatalogQueryParams } from '@/domains/catalog/types/query';
import { getCatalogProducts, type CatalogDiscoveryResult } from '../repository';

export function useProductDiscovery(
  params?: CatalogQueryParams
): UseQueryResult<CatalogDiscoveryResult, Error> {
  return useQuery({
    queryKey: catalogQueryKeys.productList(params),
    queryFn: () => getCatalogProducts(params),
    staleTime: 60 * 1000, // 1 minute
  });
}
