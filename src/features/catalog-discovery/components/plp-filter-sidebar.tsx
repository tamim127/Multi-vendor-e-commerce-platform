/**
 * ==============================================================================
 * CATALOG DISCOVERY FEATURE — DESKTOP FILTER SIDEBAR
 * ==============================================================================
 * Desktop filter sidebar using Accordion primitives.
 * Directly communicates parameter updates to canonical URL state.
 */

'use client';

import * as React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion/accordion';
import { Button } from '@/components/ui/button/button';
import { Checkbox } from '@/components/ui/checkbox/checkbox';
import { Input } from '@/components/ui/input/input';
import { Rating } from '@/components/ui/rating/rating';
import type { CatalogQueryParams } from '@/domains/catalog/types/query';
import { useI18n } from '@/lib/i18n';
import type { CatalogDiscoveryFacets } from '../repository';

export interface PlpFilterSidebarProps {
  params: CatalogQueryParams;
  facets: CatalogDiscoveryFacets;
  onParamChange: <K extends keyof CatalogQueryParams>(key: K, value: CatalogQueryParams[K]) => void;
  onResetFilters: () => void;
}

export function PlpFilterSidebar({
  params,
  facets,
  onParamChange,
  onResetFilters,
}: PlpFilterSidebarProps): React.JSX.Element {
  const { t } = useI18n();

  // Local price input state for user editing before submission
  const [minPriceInput, setMinPriceInput] = React.useState<string>(
    typeof params.minPriceMinor === 'number' ? (params.minPriceMinor / 100).toString() : ''
  );
  const [maxPriceInput, setMaxPriceInput] = React.useState<string>(
    typeof params.maxPriceMinor === 'number' ? (params.maxPriceMinor / 100).toString() : ''
  );

  React.useEffect(() => {
    setMinPriceInput(
      typeof params.minPriceMinor === 'number' ? (params.minPriceMinor / 100).toString() : ''
    );
    setMaxPriceInput(
      typeof params.maxPriceMinor === 'number' ? (params.maxPriceMinor / 100).toString() : ''
    );
  }, [params.minPriceMinor, params.maxPriceMinor]);

  const handleApplyPrice = (e: React.FormEvent): void => {
    e.preventDefault();
    const minVal = minPriceInput ? Math.round(parseFloat(minPriceInput) * 100) : undefined;
    const maxVal = maxPriceInput ? Math.round(parseFloat(maxPriceInput) * 100) : undefined;

    onParamChange('minPriceMinor', minVal);
    onParamChange('maxPriceMinor', maxVal);
  };

  const handleBrandToggle = (brandSlug: string): void => {
    const current = params.brandSlugs ?? [];
    const exists = current.includes(brandSlug);
    const updated = exists ? current.filter((b) => b !== brandSlug) : [...current, brandSlug];
    onParamChange('brandSlugs', updated.length > 0 ? updated : undefined);
  };

  const handleCategorySelect = (categorySlug: string): void => {
    if (params.categorySlug === categorySlug) {
      onParamChange('categorySlug', undefined);
    } else {
      onParamChange('categorySlug', categorySlug);
    }
  };

  const handleRatingSelect = (rating: number): void => {
    if (params.minRating === rating) {
      onParamChange('minRating', undefined);
    } else {
      onParamChange('minRating', rating);
    }
  };

  const handleStockToggle = (checked: boolean | 'indeterminate'): void => {
    if (checked === true) {
      onParamChange('inventoryStates', ['in_stock']);
    } else {
      onParamChange('inventoryStates', undefined);
    }
  };

  return (
    <aside className="w-full space-y-6" aria-label={t('plp.filters')}>
      <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
        <h2 className="text-base font-bold text-fg-primary tracking-tight">{t('plp.filters')}</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onResetFilters}
          className="text-xs text-fg-muted hover:text-fg-primary h-7 px-2"
        >
          {t('plp.clearAll')}
        </Button>
      </div>

      <Accordion
        type="multiple"
        defaultValue={['category', 'brand', 'price', 'rating', 'availability']}
        className="space-y-2"
      >
        {/* 1. Category Facet */}
        <AccordionItem value="category">
          <AccordionTrigger>{t('plp.category')}</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-1 pt-1">
              {facets.categories.map((cat) => {
                const isSelected = params.categorySlug === cat.slug;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.slug)}
                    className={`flex w-full items-center justify-between px-2 py-1.5 rounded-md text-xs transition-colors text-start cursor-pointer ${
                      isSelected
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-fg-muted hover:text-fg-primary hover:bg-surface-subtle'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className="font-mono text-fg-subtle text-2xs">({cat.count})</span>
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 2. Brand Facet */}
        <AccordionItem value="brand">
          <AccordionTrigger>{t('plp.brand')}</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-1 max-h-48 overflow-y-auto pr-1">
              {facets.brands.map((brand) => {
                const isChecked = params.brandSlugs?.includes(brand.slug) ?? false;
                return (
                  <div key={brand.id} className="flex items-center justify-between py-0.5">
                    <Checkbox
                      id={`sidebar-brand-${brand.slug}`}
                      checked={isChecked}
                      onCheckedChange={() => handleBrandToggle(brand.slug)}
                      label={<span className="text-xs">{brand.label}</span>}
                    />
                    <span className="font-mono text-fg-subtle text-2xs">({brand.count})</span>
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 3. Price Facet */}
        <AccordionItem value="price">
          <AccordionTrigger>{t('plp.price')}</AccordionTrigger>
          <AccordionContent>
            <form onSubmit={handleApplyPrice} className="space-y-3 pt-1">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label htmlFor="price-min" className="text-2xs text-fg-muted block mb-1">
                    {t('plp.minPrice')} ($)
                  </label>
                  <Input
                    id="price-min"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <span className="text-fg-muted mt-5 text-xs">–</span>
                <div className="flex-1">
                  <label htmlFor="price-max" className="text-2xs text-fg-muted block mb-1">
                    {t('plp.maxPrice')} ($)
                  </label>
                  <Input
                    id="price-max"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="3000"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
              <Button type="submit" variant="secondary" size="sm" className="w-full text-xs h-8">
                {t('plp.applyFilters')}
              </Button>
            </form>
          </AccordionContent>
        </AccordionItem>

        {/* 4. Rating Facet */}
        <AccordionItem value="rating">
          <AccordionTrigger>{t('plp.rating')}</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-1.5 pt-1">
              {[4, 3, 2, 1].map((stars) => {
                const isSelected = params.minRating === stars;
                return (
                  <button
                    key={stars}
                    type="button"
                    onClick={() => handleRatingSelect(stars)}
                    className={`flex w-full items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors text-start cursor-pointer ${
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
          </AccordionContent>
        </AccordionItem>

        {/* 5. Availability Facet */}
        <AccordionItem value="availability">
          <AccordionTrigger>{t('plp.availability')}</AccordionTrigger>
          <AccordionContent>
            <div className="pt-1 flex items-center justify-between">
              <Checkbox
                id="sidebar-stock-only"
                checked={params.inventoryStates?.includes('in_stock') ?? false}
                onCheckedChange={handleStockToggle}
                label={<span className="text-xs">{t('plp.inStockOnly')}</span>}
              />
              <span className="font-mono text-fg-subtle text-2xs">({facets.inStockCount})</span>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
}
