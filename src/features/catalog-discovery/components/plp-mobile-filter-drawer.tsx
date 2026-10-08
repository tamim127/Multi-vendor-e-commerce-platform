/**
 * ==============================================================================
 * CATALOG DISCOVERY FEATURE — MOBILE FILTER DRAWER
 * ==============================================================================
 * Temporary local draft state management for mobile filters.
 * STRICT ARCHITECTURAL FLOW:
 * URL -> CatalogQueryParams -> PLP -> Mobile Filter Drawer local draft -> Apply -> URL.
 * Does NOT mutate canonical URL state until the user explicitly taps "Apply Filters".
 * Minimum touch target >= 44px for WCAG compliance.
 */

'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button/button';
import { Checkbox } from '@/components/ui/checkbox/checkbox';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer/drawer';
import { Input } from '@/components/ui/input/input';
import { Rating } from '@/components/ui/rating/rating';
import type { CatalogQueryParams } from '@/domains/catalog/types/query';
import { useI18n } from '@/lib/i18n';
import type { CatalogDiscoveryFacets } from '../repository';

export interface PlpMobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  canonicalParams: CatalogQueryParams;
  facets: CatalogDiscoveryFacets;
  onApplyDraft: (draftParams: CatalogQueryParams) => void;
}

export function PlpMobileFilterDrawer({
  isOpen,
  onClose,
  canonicalParams,
  facets,
  onApplyDraft,
}: PlpMobileFilterDrawerProps): React.JSX.Element {
  const { t } = useI18n();

  // Local temporary draft state
  const [draftParams, setDraftParams] = React.useState<CatalogQueryParams>(canonicalParams);

  // Synchronize draft state when drawer opens with canonical params
  React.useEffect(() => {
    if (isOpen) {
      setDraftParams(canonicalParams);
    }
  }, [isOpen, canonicalParams]);

  // Handle local draft updates
  const setDraftParam = <K extends keyof CatalogQueryParams>(
    key: K,
    value: CatalogQueryParams[K]
  ): void => {
    setDraftParams((prev) => {
      const next = { ...prev };
      if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  };

  const handleBrandToggle = (brandSlug: string): void => {
    const current = draftParams.brandSlugs ?? [];
    const exists = current.includes(brandSlug);
    const updated = exists ? current.filter((b) => b !== brandSlug) : [...current, brandSlug];
    setDraftParam('brandSlugs', updated.length > 0 ? updated : undefined);
  };

  const handleCategorySelect = (categorySlug: string): void => {
    if (draftParams.categorySlug === categorySlug) {
      setDraftParam('categorySlug', undefined);
    } else {
      setDraftParam('categorySlug', categorySlug);
    }
  };

  const handleRatingSelect = (rating: number): void => {
    if (draftParams.minRating === rating) {
      setDraftParam('minRating', undefined);
    } else {
      setDraftParam('minRating', rating);
    }
  };

  const handleStockToggle = (checked: boolean | 'indeterminate'): void => {
    if (checked === true) {
      setDraftParam('inventoryStates', ['in_stock']);
    } else {
      setDraftParam('inventoryStates', undefined);
    }
  };

  const handleClearAll = (): void => {
    // Preserve query string or sort if present, reset filters
    setDraftParams({
      query: canonicalParams.query,
      sort: canonicalParams.sort,
    });
  };

  const handleApply = (): void => {
    onApplyDraft(draftParams);
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent
        side="right"
        className="flex flex-col h-full w-full max-w-md p-0 overflow-hidden"
      >
        <DrawerHeader className="px-6 py-4 border-b border-border-subtle flex flex-row items-center justify-between shrink-0 bg-surface">
          <div>
            <DrawerTitle>{t('plp.filters')}</DrawerTitle>
            <DrawerDescription className="text-xs">
              Refine marketplace product criteria
            </DrawerDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-xs min-h-[44px] min-w-[44px] text-fg-muted hover:text-fg-primary"
          >
            {t('plp.clearAll')}
          </Button>
        </DrawerHeader>

        {/* Scrollable Filter Controls */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Categories */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-fg-primary">{t('plp.category')}</h3>
            <div className="space-y-1">
              {facets.categories.map((cat) => {
                const isSelected = draftParams.categorySlug === cat.slug;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.slug)}
                    className={`flex w-full items-center justify-between min-h-[44px] px-3 py-2 rounded-md text-sm transition-colors text-start cursor-pointer ${
                      isSelected
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-fg-muted hover:text-fg-primary hover:bg-surface-subtle'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className="font-mono text-fg-subtle text-xs">({cat.count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Brands */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-fg-primary">{t('plp.brand')}</h3>
            <div className="space-y-1">
              {facets.brands.map((brand) => {
                const isChecked = draftParams.brandSlugs?.includes(brand.slug) ?? false;
                return (
                  <div
                    key={brand.id}
                    className="flex items-center justify-between min-h-[44px] px-2 py-1"
                  >
                    <Checkbox
                      id={`mobile-brand-${brand.slug}`}
                      checked={isChecked}
                      onCheckedChange={() => handleBrandToggle(brand.slug)}
                      label={<span className="text-sm font-medium">{brand.label}</span>}
                      className="size-5"
                    />
                    <span className="font-mono text-fg-subtle text-xs">({brand.count})</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-fg-primary">{t('plp.price')}</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label htmlFor="mobile-price-min" className="text-xs text-fg-muted block mb-1">
                  {t('plp.minPrice')} ($)
                </label>
                <Input
                  id="mobile-price-min"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={
                    typeof draftParams.minPriceMinor === 'number'
                      ? (draftParams.minPriceMinor / 100).toString()
                      : ''
                  }
                  onChange={(e) => {
                    const val = e.target.value
                      ? Math.round(parseFloat(e.target.value) * 100)
                      : undefined;
                    setDraftParam('minPriceMinor', val);
                  }}
                  className="min-h-[44px] text-sm font-mono"
                />
              </div>
              <span className="text-fg-muted mt-6 text-sm">–</span>
              <div className="flex-1">
                <label htmlFor="mobile-price-max" className="text-xs text-fg-muted block mb-1">
                  {t('plp.maxPrice')} ($)
                </label>
                <Input
                  id="mobile-price-max"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="3000"
                  value={
                    typeof draftParams.maxPriceMinor === 'number'
                      ? (draftParams.maxPriceMinor / 100).toString()
                      : ''
                  }
                  onChange={(e) => {
                    const val = e.target.value
                      ? Math.round(parseFloat(e.target.value) * 100)
                      : undefined;
                    setDraftParam('maxPriceMinor', val);
                  }}
                  className="min-h-[44px] text-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-fg-primary">{t('plp.rating')}</h3>
            <div className="space-y-1">
              {[4, 3, 2, 1].map((stars) => {
                const isSelected = draftParams.minRating === stars;
                return (
                  <button
                    key={stars}
                    type="button"
                    onClick={() => handleRatingSelect(stars)}
                    className={`flex w-full items-center gap-3 min-h-[44px] px-3 py-2 rounded-md text-sm transition-colors text-start cursor-pointer ${
                      isSelected
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-fg-muted hover:text-fg-primary hover:bg-surface-subtle'
                    }`}
                  >
                    <Rating value={stars} max={5} showValue={false} size="sm" />
                    <span>{t('plp.starsAndAbove', { stars: stars.toString() })}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-fg-primary">{t('plp.availability')}</h3>
            <div className="flex items-center justify-between min-h-[44px] px-2 py-1">
              <Checkbox
                id="mobile-stock-only"
                checked={draftParams.inventoryStates?.includes('in_stock') ?? false}
                onCheckedChange={handleStockToggle}
                label={<span className="text-sm font-medium">{t('plp.inStockOnly')}</span>}
                className="size-5"
              />
              <span className="font-mono text-fg-subtle text-xs">({facets.inStockCount})</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <DrawerFooter className="px-6 py-4 border-t border-border-subtle bg-surface shrink-0 z-10 gap-3">
          <Button
            type="button"
            variant="tertiary"
            onClick={onClose}
            className="flex-1 min-h-[44px] text-sm"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleApply}
            className="flex-1 min-h-[44px] text-sm font-semibold"
          >
            {t('plp.applyFilters')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
