/**
 * ==============================================================================
 * CATALOG DISCOVERY FEATURE — URL STATE HOOK
 * ==============================================================================
 * Bi-directional canonical URL query parameter synchronization hook.
 * Strictly owns canonical URL state. Does not hold local draft state.
 */

'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { CatalogQueryParams, CatalogSortOption } from '@/domains/catalog/types/query';
import {
  parseCatalogQueryParams,
  serializeCatalogQueryParams,
} from '@/domains/catalog/utils/url-params';

export function resolveEffectiveSort(params: CatalogQueryParams): CatalogSortOption {
  if (params.sort) return params.sort;
  if (params.query && params.query.trim().length > 0) return 'relevance';
  return 'newest';
}

export interface UseCatalogUrlStateReturn {
  params: CatalogQueryParams;
  effectiveSort: CatalogSortOption;
  setParams: (updates: Partial<CatalogQueryParams>, options?: { resetPage?: boolean }) => void;
  setParam: <K extends keyof CatalogQueryParams>(key: K, value: CatalogQueryParams[K]) => void;
  setQuery: (query: string) => void;
  resetFilters: (options?: { preserveQuery?: boolean }) => void;
  setPage: (page: number) => void;
  setSort: (sort: CatalogSortOption) => void;
}

export function useCatalogUrlState(): UseCatalogUrlStateReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const queryString = searchParams?.toString() ?? '';

  const params: CatalogQueryParams = useMemo(() => {
    return parseCatalogQueryParams(queryString);
  }, [queryString]);

  const effectiveSort = useMemo(() => resolveEffectiveSort(params), [params]);

  const updateUrl = useCallback(
    (newParams: CatalogQueryParams) => {
      const serialized = serializeCatalogQueryParams(newParams);
      const query = serialized.toString();
      const target = query ? `${pathname}?${query}` : pathname;
      router.push(target, { scroll: false });
    },
    [pathname, router]
  );

  const setParams = useCallback(
    (updates: Partial<CatalogQueryParams>, options?: { resetPage?: boolean }) => {
      const shouldResetPage = options?.resetPage ?? true;
      const next: CatalogQueryParams = {
        ...params,
        ...updates,
      };

      if (shouldResetPage) {
        delete next.page;
      }

      updateUrl(next);
    },
    [params, updateUrl]
  );

  const setParam = useCallback(
    <K extends keyof CatalogQueryParams>(key: K, value: CatalogQueryParams[K]) => {
      const next: CatalogQueryParams = { ...params };
      if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
        delete next[key];
      } else {
        next[key] = value;
      }
      delete next.page; // reset page on any filter modification
      updateUrl(next);
    },
    [params, updateUrl]
  );

  const setQuery = useCallback(
    (queryText: string) => {
      const trimmed = queryText.trim();
      const next: CatalogQueryParams = { ...params };
      if (trimmed.length > 0) {
        next.query = trimmed;
      } else {
        delete next.query;
      }
      delete next.page;
      updateUrl(next);
    },
    [params, updateUrl]
  );

  const resetFilters = useCallback(
    (options?: { preserveQuery?: boolean }) => {
      const shouldPreserveQuery = options?.preserveQuery ?? true;
      const next: CatalogQueryParams = {};
      if (shouldPreserveQuery && params.query) {
        next.query = params.query;
      }
      updateUrl(next);
    },
    [params.query, updateUrl]
  );

  const setPage = useCallback(
    (page: number) => {
      const next: CatalogQueryParams = { ...params };
      if (page <= 1) {
        delete next.page;
      } else {
        next.page = page;
      }
      updateUrl(next);
    },
    [params, updateUrl]
  );

  const setSort = useCallback(
    (sort: CatalogSortOption) => {
      const next: CatalogQueryParams = { ...params, sort };
      delete next.page;
      updateUrl(next);
    },
    [params, updateUrl]
  );

  return {
    params,
    effectiveSort,
    setParams,
    setParam,
    setQuery,
    resetFilters,
    setPage,
    setSort,
  };
}
