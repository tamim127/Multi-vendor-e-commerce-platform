/**
 * ==============================================================================
 * PRODUCT DETAIL PAGE — INTERACTIVE VIEW COMPONENT
 * ==============================================================================
 * Core client interactive view integrating gallery, variant matrix selection,
 * competing seller offer routing, purchase intent capture, tabs, and related items.
 */

'use client';

import * as React from 'react';
import type { ProductDetailData, PdpPurchaseIntentPayload } from '../types';
import { usePdpSelection } from '../hooks/use-pdp-selection';
import { PdpBreadcrumbs } from './pdp-breadcrumbs';
import { PdpGallery } from './pdp-gallery';
import { PdpHeader } from './pdp-header';
import { PdpPrice } from './pdp-price';
import { PdpVariantSelector } from './pdp-variant-selector';
import { PdpAvailability } from './pdp-availability';
import { PdpSellerOffers } from './pdp-seller-offers';
import { PdpPurchasePanel } from './pdp-purchase-panel';
import { PdpMobileStickyBar } from './pdp-mobile-sticky-bar';
import { PdpTabs } from './pdp-tabs';
import { PdpRelatedProducts } from './pdp-related-products';
import { useI18n } from '@/lib/i18n';

export interface ProductDetailInteractiveViewProps {
  initialData: ProductDetailData;
  initialVariantId?: string;
  onPurchaseIntent?: (payload: PdpPurchaseIntentPayload) => void;
}

export function ProductDetailInteractiveView({
  initialData,
  initialVariantId,
  onPurchaseIntent,
}: ProductDetailInteractiveViewProps): React.JSX.Element {
  const { product, offers, relatedProducts, reviews, qaList } = initialData;
  const { locale } = useI18n();

  const {
    selectedOptions,
    selectedVariant,
    selectedOffer,
    eligibleOffers,
    quantity,
    maxQuantity,
    isQuantityBoundedByDemo,
    canPurchase,
    statusMessageKey,
    setOption,
    selectOffer,
    setQuantity,
  } = usePdpSelection({
    product,
    offers,
    initialVariantId,
  });

  const [activeTab, setActiveTab] = React.useState<string>('overview');

  const handleReviewsClick = (): void => {
    setActiveTab('reviews');
    const tabsElement = document.getElementById('pdp-tabs-section');
    if (tabsElement) {
      tabsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const productTitle = product.title[locale as keyof typeof product.title] ?? product.title.en;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* 1. Hierarchical Breadcrumbs */}
      <PdpBreadcrumbs product={product} />

      {/* 2. Main Product Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Media Gallery (5 cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <PdpGallery
            productMedia={product.media}
            selectedVariant={selectedVariant}
            badges={product.badges}
            productTitle={productTitle}
          />
        </div>

        {/* Right Column: Information, Pricing, Variants, and Offers (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Product Header */}
          <PdpHeader
            product={product}
            selectedVariant={selectedVariant}
            onReviewsClick={handleReviewsClick}
          />

          {/* Live Price Display */}
          <PdpPrice selectedOffer={selectedOffer} offerSummary={product.offerSummary} />

          {/* Variant Matrix Selector */}
          <PdpVariantSelector
            variants={product.variants}
            selectedOptions={selectedOptions}
            onSelectOption={setOption}
            statusMessageKey={statusMessageKey}
          />

          {/* Stock & Fulfillment Turnaround */}
          <PdpAvailability selectedOffer={selectedOffer} />

          {/* Multi-Vendor Seller Offer Comparison */}
          {eligibleOffers.length > 0 && (
            <PdpSellerOffers
              eligibleOffers={eligibleOffers}
              selectedOffer={selectedOffer}
              onSelectOffer={selectOffer}
            />
          )}

          {/* Purchasing Box / CTA Panel */}
          <PdpPurchasePanel
            product={product}
            selectedVariant={selectedVariant}
            selectedOffer={selectedOffer}
            quantity={quantity}
            maxQuantity={maxQuantity}
            isQuantityBoundedByDemo={isQuantityBoundedByDemo}
            canPurchase={canPurchase}
            onSetQuantity={setQuantity}
            onPurchaseIntent={onPurchaseIntent}
          />
        </div>
      </div>

      {/* 3. Detailed Tabs (Overview, Specs, Reviews, Q&A) */}
      <PdpTabs
        product={product}
        reviews={reviews}
        qaList={qaList}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* 4. Related Products Carousel / Grid */}
      <PdpRelatedProducts relatedProducts={relatedProducts} />

      {/* 5. Mobile Sticky Bottom Bar */}
      <PdpMobileStickyBar
        selectedOffer={selectedOffer}
        offerSummary={product.offerSummary}
        canPurchase={canPurchase}
        onAddToCart={() => {
          // Trigger purchase panel CTA modal
          const submitBtn = document.querySelector<HTMLButtonElement>(
            'button[type="button"]:has(svg.lucide-shopping-cart)'
          );
          if (submitBtn) {
            submitBtn.click();
          }
        }}
      />
    </div>
  );
}
