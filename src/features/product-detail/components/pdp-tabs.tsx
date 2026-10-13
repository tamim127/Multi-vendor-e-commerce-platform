/**
 * ==============================================================================
 * PRODUCT DETAIL PAGE — TABS COMPONENT
 * ==============================================================================
 * Multi-section tab container orchestrating Overview, Technical Specs,
 * Customer Reviews, and Community Q&A.
 */

'use client';

import * as React from 'react';
import type { Product } from '@/domains/catalog/types/product';
import type { DemoQaItem, DemoReview } from '../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs/tabs';
import { PdpReviewsSection } from './pdp-reviews-section';
import { PdpQaSection } from './pdp-qa-section';
import { useI18n } from '@/lib/i18n';

export interface PdpTabsProps {
  product: Product;
  reviews: DemoReview[];
  qaList: DemoQaItem[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function PdpTabs({
  product,
  reviews,
  qaList,
  activeTab = 'overview',
  onTabChange,
}: PdpTabsProps): React.JSX.Element {
  const { t, locale } = useI18n();

  const description =
    product.description[locale as keyof typeof product.description] ?? product.description.en;

  // Filter visible attributes for specification table
  const visibleAttributes = (product.attributes || []).filter((a) => a.isVisibleOnPdp !== false);

  return (
    <div id="pdp-tabs-section" className="mt-10 pt-6 border-t border-border-default">
      <Tabs
        value={activeTab}
        onValueChange={onTabChange}
        defaultValue="overview"
        className="w-full"
      >
        <div className="overflow-x-auto pb-2 scrollbar-none">
          <TabsList className="h-11 w-full justify-start border-b border-border-default bg-transparent p-0 gap-6 rounded-none">
            <TabsTrigger
              value="overview"
              className="rounded-none border-b-2 border-transparent px-2 pb-3 pt-2 font-bold text-fg-muted data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              {t('pdp.tabOverview')}
            </TabsTrigger>
            <TabsTrigger
              value="specs"
              className="rounded-none border-b-2 border-transparent px-2 pb-3 pt-2 font-bold text-fg-muted data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              {t('pdp.tabSpecs')}
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-none border-b-2 border-transparent px-2 pb-3 pt-2 font-bold text-fg-muted data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              {t('pdp.tabReviews')} ({product.ratingSummary.count})
            </TabsTrigger>
            <TabsTrigger
              value="qa"
              className="rounded-none border-b-2 border-transparent px-2 pb-3 pt-2 font-bold text-fg-muted data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              {t('pdp.tabQa')} ({qaList.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 1. Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="prose prose-sm dark:prose-invert max-w-none text-fg-secondary leading-relaxed">
            <p className="text-base whitespace-pre-line">{description}</p>
          </div>
        </TabsContent>

        {/* 2. Specifications Tab */}
        <TabsContent value="specs" className="mt-6">
          {visibleAttributes.length === 0 ? (
            <p className="text-sm text-fg-muted">No specifications listed.</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border-default bg-surface shadow-xs">
              <table className="w-full text-left text-sm">
                <tbody>
                  {visibleAttributes.map((attr, idx) => {
                    const label = attr.label[locale as keyof typeof attr.label] ?? attr.label.en;
                    const displayVal = attr.displayValue
                      ? (attr.displayValue[locale as keyof typeof attr.displayValue] ??
                        attr.displayValue.en)
                      : String(attr.value);

                    return (
                      <tr
                        key={attr.id || attr.key}
                        className={`border-b border-border-subtle last:border-b-0 ${
                          idx % 2 === 0 ? 'bg-surface' : 'bg-surface-subtle'
                        }`}
                      >
                        <th
                          scope="row"
                          className="w-1/3 px-4 py-3 font-semibold text-fg-primary text-xs sm:text-sm"
                        >
                          {label}
                        </th>
                        <td className="px-4 py-3 text-fg-secondary text-xs sm:text-sm">
                          {displayVal}
                          {attr.unit ? ` ${attr.unit}` : ''}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* 3. Reviews Tab */}
        <TabsContent value="reviews" className="mt-6">
          <PdpReviewsSection ratingSummary={product.ratingSummary} reviews={reviews} />
        </TabsContent>

        {/* 4. QA Tab */}
        <TabsContent value="qa" className="mt-6">
          <PdpQaSection qaList={qaList} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
