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
  const [deliveryOption, setDeliveryOption] = React.useState<'standard' | 'pickup'>('standard');

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
    <aside
      className="w-full space-y-6 bg-white p-5 rounded-3xl border border-slate-100/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)]"
      aria-label={t('plp.filters')}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">{t('plp.filters')}</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onResetFilters}
          className="text-xs text-slate-500 hover:text-primary h-7 px-2 font-medium"
        >
          {t('plp.clearAll')}
        </Button>
      </div>

      {/* Delivery Options Pill Selector (matching Image 1) */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-800">Delivery Options</span>
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100/80 rounded-full">
          <button
            type="button"
            onClick={() => setDeliveryOption('standard')}
            className={`py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
              deliveryOption === 'standard'
                ? 'bg-primary text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Standard
          </button>
          <button
            type="button"
            onClick={() => setDeliveryOption('pickup')}
            className={`py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
              deliveryOption === 'pickup'
                ? 'bg-primary text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pick Up
          </button>
        </div>
      </div>

      <Accordion
        type="multiple"
        defaultValue={['price', 'category', 'brand', 'rating', 'availability']}
        className="space-y-2"
      >
        {/* 1. Price Facet with curve histogram and pill tags */}
        <AccordionItem value="price">
          <AccordionTrigger>{t('plp.price')}</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-1">
              <p className="text-[11px] text-slate-400">The average price is $300</p>
              {/* Stylized Price Curve Bars */}
              <div className="flex items-end justify-between h-8 gap-0.5 px-1 pb-1 border-b border-indigo-100">
                <div className="w-1.5 bg-indigo-200 rounded-t h-2" />
                <div className="w-1.5 bg-indigo-200 rounded-t h-3" />
                <div className="w-1.5 bg-indigo-300 rounded-t h-5" />
                <div className="w-1.5 bg-indigo-400 rounded-t h-7" />
                <div className="w-1.5 bg-indigo-500 rounded-t h-8" />
                <div className="w-1.5 bg-indigo-400 rounded-t h-6" />
                <div className="w-1.5 bg-indigo-300 rounded-t h-4" />
                <div className="w-1.5 bg-indigo-200 rounded-t h-2" />
              </div>
              <form onSubmit={handleApplyPrice} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label htmlFor="price-min" className="text-2xs text-slate-500 block mb-1">
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
                      className="h-8 text-xs font-mono rounded-xl bg-slate-50 border-slate-200"
                    />
                  </div>
                  <span className="text-slate-400 mt-5 text-xs">–</span>
                  <div className="flex-1">
                    <label htmlFor="price-max" className="text-2xs text-slate-500 block mb-1">
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
                      className="h-8 text-xs font-mono rounded-xl bg-slate-50 border-slate-200"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  className="w-full text-xs h-8 rounded-full font-bold bg-slate-100 hover:bg-primary hover:text-white transition-colors"
                >
                  {t('plp.applyFilters')}
                </Button>
              </form>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 2. Category Facet */}
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
                    className={`flex w-full items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors text-start cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-white font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`font-mono text-2xs ${isSelected ? 'text-white/80' : 'text-slate-400'}`}
                    >
                      ({cat.count})
                    </span>
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 3. Brand Facet */}
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
                      label={<span className="text-xs font-medium text-slate-700">{brand.label}</span>}
                    />
                    <span className="font-mono text-slate-400 text-2xs">({brand.count})</span>
                  </div>
                );
              })}
            </div>
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
                    className={`flex w-full items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs transition-colors text-start cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
                label={<span className="text-xs font-medium text-slate-700">{t('plp.inStockOnly')}</span>}
              />
              <span className="font-mono text-slate-400 text-2xs">({facets.inStockCount})</span>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
}
