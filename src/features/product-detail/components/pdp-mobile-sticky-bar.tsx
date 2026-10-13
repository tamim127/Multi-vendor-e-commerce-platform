/**
 * ==============================================================================
 * PRODUCT DETAIL PAGE — MOBILE STICKY BAR COMPONENT
 * ==============================================================================
 * Fixed bottom purchasing action bar for 375px mobile viewports.
 */

'use client';

import * as React from 'react';
import { ShoppingCart } from 'lucide-react';
import { formatMoneyMinor } from '@/domains/catalog/utils/money';
import type { SellerOffer } from '@/domains/catalog/types/seller-offer';
import type { ProductOfferSummary } from '@/domains/catalog/types/product';
import { Button } from '@/components/ui/button/button';
import { useI18n } from '@/lib/i18n';

export interface PdpMobileStickyBarProps {
  selectedOffer?: SellerOffer | null;
  offerSummary: ProductOfferSummary;
  canPurchase: boolean;
  onAddToCart: () => void;
}

export function PdpMobileStickyBar({
  selectedOffer,
  offerSummary,
  canPurchase,
  onAddToCart,
}: PdpMobileStickyBarProps): React.JSX.Element {
  const { t, locale } = useI18n();
  const formatLocale = locale === 'en' ? 'en-US' : locale;

  const priceFormatted = selectedOffer
    ? formatMoneyMinor(selectedOffer.price, { locale: formatLocale })
    : formatMoneyMinor(offerSummary.lowestPrice, { locale: formatLocale });

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border-default bg-surface/95 p-3 backdrop-blur-md shadow-lg safe-bottom">
      <div className="flex items-center justify-between gap-3">
        {/* Price Summary */}
        <div className="flex flex-col min-w-0">
          <span className="text-lg font-extrabold text-price tabular-nums truncate">
            {priceFormatted}
          </span>
          <span className="text-2xs text-fg-muted truncate">
            {canPurchase ? t('pdp.inStock') : t('pdp.outOfStock')}
          </span>
        </div>

        {/* CTA Button */}
        <Button
          type="button"
          variant="primary"
          size="md"
          disabled={!canPurchase}
          onClick={onAddToCart}
          className="font-bold shrink-0 cursor-pointer"
        >
          <ShoppingCart className="size-4" />
          <span>{t('pdp.addToCart')}</span>
        </Button>
      </div>
    </div>
  );
}
