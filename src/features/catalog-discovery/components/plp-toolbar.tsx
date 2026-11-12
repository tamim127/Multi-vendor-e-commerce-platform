/**
 * ==============================================================================
 * CATALOG DISCOVERY FEATURE — PLP TOOLBAR
 * ==============================================================================
 * Results summary, deterministic sorting controls, and mobile filter trigger.
 */

'use client';

import * as React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button/button';
import type { CatalogSortOption } from '@/domains/catalog/types/query';
import { useI18n } from '@/lib/i18n';

export interface PlpToolbarProps {
  totalCount: number;
  currentSort?: CatalogSortOption;
  onSortChange: (sort: CatalogSortOption) => void;
  onOpenMobileFilters: () => void;
  activeFiltersCount: number;
}

export function PlpToolbar({
  totalCount,
  currentSort = 'newest',
  onSortChange,
  onOpenMobileFilters,
  activeFiltersCount,
}: PlpToolbarProps): React.JSX.Element {
  const { t } = useI18n();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-3 px-5 border border-slate-100 bg-white rounded-2xl shadow-xs mb-6">
      {/* Total Results Summary */}
      <div className="text-sm font-semibold text-slate-800">
        {t('plp.showingResults', { count: totalCount.toString() })}
      </div>

      <div className="flex items-center gap-3">
        {/* Mobile Filter Drawer Trigger (Mobile/Tablet only, touch target >= 44px) */}
        <Button
          type="button"
          variant="tertiary"
          size="sm"
          onClick={onOpenMobileFilters}
          className="lg:hidden min-h-[44px] min-w-[44px] px-3 gap-2 rounded-full"
          aria-label={t('plp.filters')}
        >
          <SlidersHorizontal className="size-4" />
          <span>{t('plp.filters')}</span>
          {activeFiltersCount > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-white text-xs font-semibold">
              {activeFiltersCount}
            </span>
          )}
        </Button>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="plp-sort-select"
            className="text-xs font-medium text-slate-500 shrink-0 hidden sm:inline"
          >
            {t('plp.sortBy')}:
          </label>
          <select
            id="plp-sort-select"
            value={currentSort}
            onChange={(e) => onSortChange(e.target.value as CatalogSortOption)}
            className="h-10 sm:h-9 min-h-[44px] sm:min-h-0 rounded-full border border-slate-200/80 bg-slate-50 px-3.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-colors cursor-pointer"
            aria-label={t('plp.sortBy')}
          >
            <option value="relevance">{t('plp.sortRelevance')}</option>
            <option value="newest">{t('plp.sortNewest')}</option>
            <option value="bestselling">{t('plp.sortBestselling')}</option>
            <option value="price_asc">{t('plp.sortPriceAsc')}</option>
            <option value="price_desc">{t('plp.sortPriceDesc')}</option>
            <option value="discount_desc">{t('plp.sortDiscountDesc')}</option>
            <option value="rating_desc">{t('plp.sortRatingDesc')}</option>
          </select>
        </div>
      </div>
    </div>
  );
}
