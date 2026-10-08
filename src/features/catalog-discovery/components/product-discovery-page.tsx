/**
 * ==============================================================================
 * CATALOG DISCOVERY FEATURE — PRODUCT DISCOVERY PAGE
 * ==============================================================================
 * Primary PLP feature component orchestrating URL state, TanStack Query,
 * filter sidebar, mobile drawer, toolbar, active filter chips, grid, and pagination.
 */

'use client';

import * as React from 'react';
import { useCatalogUrlState } from '../hooks/use-catalog-url-state';
import { useProductDiscovery } from '../hooks/use-product-discovery';
import type { CatalogDiscoveryFacets } from '../repository';
import { PlpActiveFilters } from './plp-active-filters';
import { PlpFilterSidebar } from './plp-filter-sidebar';
import { PlpHeader } from './plp-header';
import { PlpMobileFilterDrawer } from './plp-mobile-filter-drawer';
import { PlpPagination } from './plp-pagination';
import { PlpProductGrid } from './plp-product-grid';
import { PlpEmptyState, PlpErrorState, PlpSkeleton } from './plp-states';
import { PlpToolbar } from './plp-toolbar';

const fallbackFacets: CatalogDiscoveryFacets = {
  categories: [],
  brands: [],
  inStockCount: 0,
};

export function ProductDiscoveryPage(): React.JSX.Element {
  const { params, setParam, setParams, resetFilters, setSort, setPage } = useCatalogUrlState();
  const { data, isLoading, isError, error, refetch } = useProductDiscovery(params);

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = React.useState<boolean>(false);

  // Active filter count for mobile badge
  const activeFiltersCount =
    (params.categorySlug ? 1 : 0) +
    (params.brandSlugs?.length ?? 0) +
    (typeof params.minPriceMinor === 'number' || typeof params.maxPriceMinor === 'number' ? 1 : 0) +
    (typeof params.minRating === 'number' && params.minRating > 0 ? 1 : 0) +
    (params.inventoryStates?.includes('in_stock') ? 1 : 0);

  const facets = data?.facets ?? fallbackFacets;

  // Active filter chip removal handlers
  const handleRemoveCategory = (): void => {
    setParam('categorySlug', undefined);
  };

  const handleRemoveBrand = (brandSlug: string): void => {
    const updated = (params.brandSlugs ?? []).filter((b) => b !== brandSlug);
    setParam('brandSlugs', updated.length > 0 ? updated : undefined);
  };

  const handleRemovePrice = (): void => {
    setParams({ minPriceMinor: undefined, maxPriceMinor: undefined });
  };

  const handleRemoveRating = (): void => {
    setParam('minRating', undefined);
  };

  const handleRemoveInStock = (): void => {
    setParam('inventoryStates', undefined);
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      {/* Header & Breadcrumbs */}
      <PlpHeader params={params} />

      {/* Active Filter Chips */}
      <PlpActiveFilters
        params={params}
        onRemoveCategory={handleRemoveCategory}
        onRemoveBrand={handleRemoveBrand}
        onRemovePrice={handleRemovePrice}
        onRemoveRating={handleRemoveRating}
        onRemoveInStock={handleRemoveInStock}
        onClearAll={resetFilters}
      />

      {/* Two-Column Responsive Layout */}
      <div className="flex gap-8 items-start">
        {/* Desktop Filter Sidebar (Hidden on mobile/tablet) */}
        <div className="hidden lg:block w-64 shrink-0 sticky top-20">
          <PlpFilterSidebar
            params={params}
            facets={facets}
            onParamChange={setParam}
            onResetFilters={resetFilters}
          />
        </div>

        {/* Main Products Area */}
        <div className="flex-1 min-w-0">
          {/* Toolbar: Total count, Sorting, Mobile Filter Trigger */}
          <PlpToolbar
            totalCount={data?.total ?? 0}
            currentSort={params.sort}
            onSortChange={setSort}
            onOpenMobileFilters={() => setIsMobileDrawerOpen(true)}
            activeFiltersCount={activeFiltersCount}
          />

          {/* Loading, Error, Empty, and Results Views */}
          {isLoading ? (
            <PlpSkeleton />
          ) : isError ? (
            <PlpErrorState onRetry={() => refetch()} errorMessage={error?.message} />
          ) : !data || data.products.length === 0 ? (
            <PlpEmptyState onResetFilters={resetFilters} />
          ) : (
            <>
              <PlpProductGrid products={data.products} />
              <PlpPagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
            </>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer with Isolated Temporary Draft State */}
      <PlpMobileFilterDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        canonicalParams={params}
        facets={facets}
        onApplyDraft={(draft) => setParams(draft)}
      />
    </div>
  );
}
