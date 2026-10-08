/**
 * ==============================================================================
 * PRODUCT CARD SYSTEM — PRICE COMPONENT
 * ==============================================================================
 * Displays commercial discovery pricing, strike-through compare-at prices,
 * discount badges, multiple-offer guidance, and flash-sale urgency progress.
 */

'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge/badge';
import { Price } from '@/components/ui/price/price';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { ProductCardPriceProps } from './product-card.types';

export function ProductCardPrice({
  lowestPriceFormatted,
  compareAtPriceFormatted,
  discountPercent,
  hasMultipleOffers = false,
  offerCount,
  showCompareAtPrice = true,
  showDiscount = true,
  showOfferCount = true,
  isFlashSale = false,
  flashSaleProgressPercent,
  className,
}: ProductCardPriceProps): React.JSX.Element {
  const { t } = useI18n();

  const isDiscounted = Boolean(compareAtPriceFormatted && showCompareAtPrice);

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-1.5">
        {/* Main Price Block */}
        <div className="flex flex-wrap items-baseline gap-1.5">
          {hasMultipleOffers ? (
            <div className="flex items-baseline gap-1">
              <span className="text-2xs font-medium text-fg-muted">
                {t('productCard.fromPrice', { price: '' }).replace('{price}', '').trim()}
              </span>
              <Price
                current={lowestPriceFormatted}
                compareAt={showCompareAtPrice ? compareAtPriceFormatted : undefined}
                size="md"
                emphasis={isFlashSale ? 'sale' : 'default'}
                className="font-bold text-fg-primary"
              />
            </div>
          ) : (
            <Price
              current={lowestPriceFormatted}
              compareAt={showCompareAtPrice ? compareAtPriceFormatted : undefined}
              size="md"
              emphasis={isFlashSale ? 'sale' : 'default'}
              className="font-bold text-fg-primary"
            />
          )}

          {/* Discount Percentage Badge */}
          {isDiscounted && showDiscount && discountPercent && discountPercent > 0 && (
            <Badge variant="destructive" size="sm" className="font-bold text-2xs py-0 px-1.5">
              -{discountPercent}%
            </Badge>
          )}
        </div>

        {/* Multi-Offer Guidance */}
        {hasMultipleOffers && showOfferCount && offerCount && offerCount > 1 && (
          <span className="text-2xs text-fg-muted font-mono shrink-0">
            {t('productCard.offersCount', { count: offerCount.toString() })}
          </span>
        )}
      </div>

      {/* Flash Sale Urgency Progress Bar Presentation */}
      {isFlashSale && typeof flashSaleProgressPercent === 'number' && (
        <div
          className="space-y-1 pt-1"
          aria-label={`Sale progress: ${flashSaleProgressPercent}% claimed`}
        >
          <div className="flex justify-between items-center text-2xs font-medium text-destructive">
            <span>
              {t('productCard.claimed', { percent: flashSaleProgressPercent.toString() })}
            </span>
          </div>
          <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-destructive transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, flashSaleProgressPercent))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
