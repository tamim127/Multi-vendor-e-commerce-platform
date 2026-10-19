/**
 * ==============================================================================
 * PRODUCT DETAIL PAGE — PRICE COMPONENT
 * ==============================================================================
 * Authoritative financial display with integer-minor formatting, strike-through
 * compare-at comparisons, and discount percentage badges.
 */

'use client';

import * as React from 'react';
import { formatMoneyMinor } from '@/domains/catalog/utils/money';
import type { SellerOffer } from '@/domains/catalog/types/seller-offer';
import type { ProductOfferSummary } from '@/domains/catalog/types/product';
import { useI18n } from '@/lib/i18n';

export interface PdpPriceProps {
  selectedOffer?: SellerOffer | null;
  offerSummary: ProductOfferSummary;
  className?: string;
}

export function PdpPrice({
  selectedOffer,
  offerSummary,
  className = '',
}: PdpPriceProps): React.JSX.Element {
  const { t, locale } = useI18n();
  const formatLocale = locale === 'en' ? 'en-US' : locale;

  if (selectedOffer) {
    const isPriceValid =
      typeof selectedOffer.price?.amountMinor === 'number' &&
      Number.isFinite(selectedOffer.price.amountMinor) &&
      Number.isInteger(selectedOffer.price.amountMinor) &&
      selectedOffer.price.amountMinor >= 0;

    if (!isPriceValid) {
      return (
        <div className={`flex items-baseline gap-2 ${className}`}>
          <span className="text-xl sm:text-2xl font-bold text-fg-muted">
            {t('pdp.priceUnavailable')}
          </span>
        </div>
      );
    }

    let currentFormatted: string;
    try {
      currentFormatted = formatMoneyMinor(selectedOffer.price, { locale: formatLocale });
    } catch {
      return (
        <div className={`flex items-baseline gap-2 ${className}`}>
          <span className="text-xl sm:text-2xl font-bold text-fg-muted">
            {t('pdp.priceUnavailable')}
          </span>
        </div>
      );
    }

    const hasMatchingCurrency =
      Boolean(selectedOffer.compareAtPrice) &&
      selectedOffer.compareAtPrice?.currency === selectedOffer.price.currency &&
      typeof selectedOffer.compareAtPrice?.amountMinor === 'number' &&
      Number.isFinite(selectedOffer.compareAtPrice.amountMinor) &&
      selectedOffer.compareAtPrice.amountMinor > 0;

    let compareAtFormatted: string | null = null;
    if (hasMatchingCurrency && selectedOffer.compareAtPrice) {
      try {
        compareAtFormatted = formatMoneyMinor(selectedOffer.compareAtPrice, {
          locale: formatLocale,
        });
      } catch {
        compareAtFormatted = null;
      }
    }

    const discountPercent = hasMatchingCurrency
      ? selectedOffer.discount?.type === 'percentage'
        ? selectedOffer.discount.value
        : selectedOffer.compareAtPrice &&
            selectedOffer.compareAtPrice.amountMinor > selectedOffer.price.amountMinor
          ? Math.round(
              ((selectedOffer.compareAtPrice.amountMinor - selectedOffer.price.amountMinor) /
                selectedOffer.compareAtPrice.amountMinor) *
                100
            )
          : null
      : null;

    return (
      <div className={`flex flex-wrap items-baseline gap-3 ${className}`}>
        {/* Main Current Commercial Price */}
        <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-price tabular-nums">
          {currentFormatted}
        </span>

        {/* Compare-At / Strike-through */}
        {compareAtFormatted && (
          <span className="text-base sm:text-lg text-price-strike line-through tabular-nums opacity-75">
            {compareAtFormatted}
          </span>
        )}

        {/* Discount Badge */}
        {discountPercent !== null && discountPercent > 0 && (
          <span className="rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-bold text-destructive">
            -{discountPercent}%
          </span>
        )}
      </div>
    );
  }

  // Fallback to Catalog Summary Range when no single offer is active
  try {
    const lowest = formatMoneyMinor(offerSummary.lowestPrice, { locale: formatLocale });
    const highest = formatMoneyMinor(offerSummary.highestPrice, { locale: formatLocale });
    const isRange =
      offerSummary.lowestPrice.amountMinor !== offerSummary.highestPrice.amountMinor &&
      offerSummary.lowestPrice.currency === offerSummary.highestPrice.currency;

    return (
      <div className={`flex items-baseline gap-2 ${className}`}>
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-price tabular-nums">
          {isRange ? `${lowest} – ${highest}` : lowest}
        </span>
      </div>
    );
  } catch {
    return (
      <div className={`flex items-baseline gap-2 ${className}`}>
        <span className="text-xl sm:text-2xl font-bold text-fg-muted">
          {t('pdp.priceUnavailable')}
        </span>
      </div>
    );
  }
}
