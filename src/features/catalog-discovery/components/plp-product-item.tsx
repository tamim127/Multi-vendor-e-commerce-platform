/**
 * ==============================================================================
 * CATALOG DISCOVERY FEATURE — PLP PRODUCT ITEM
 * ==============================================================================
 * PLP-local presentation component only.
 * CRITICAL ARCHITECTURAL RULE:
 * This component is strictly local to the PLP feature. It is NOT exported or positioned
 * as the reusable multi-variant ProductCard system (which remains Phase 2C).
 * Lowest price is strictly discovery/display guidance; does not implement Buy Box
 * or checkout pricing.
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge/badge';
import { Card } from '@/components/ui/card/card';
import { Price } from '@/components/ui/price/price';
import { Rating } from '@/components/ui/rating/rating';
import type { Product } from '@/domains/catalog/types/product';
import { formatMoneyMinor } from '@/domains/catalog/utils/money';
import { useI18n } from '@/lib/i18n';

export interface PlpProductItemProps {
  product: Product;
}

export function PlpProductItem({ product }: PlpProductItemProps): React.JSX.Element {
  const { locale, t } = useI18n();

  // Resolve localized text with English fallback
  const title = product.title[locale] ?? product.title.en;
  const primaryMedia = product.media.find((m) => m.role === 'primary') ?? product.media[0];
  const altText = primaryMedia?.alt?.[locale] ?? primaryMedia?.alt?.en ?? title;

  const lowestPriceFormatted = formatMoneyMinor(product.offerSummary.lowestPrice, { locale });

  return (
    <Card
      interactive
      className="group relative flex flex-col justify-between overflow-hidden transition-all duration-200 hover:shadow-md hover:border-border-strong focus-within:ring-2 focus-within:ring-primary h-full"
    >
      <article className="flex flex-col h-full">
        {/* Clickable Card Link for keyboard & screen reader accessibility */}
        <Link
          href={`/products/${product.slug}`}
          className="flex flex-col h-full focus:outline-none"
          aria-label={title}
        >
          {/* Media Container */}
          <div className="relative aspect-square w-full overflow-hidden bg-surface-subtle flex items-center justify-center p-4">
            {primaryMedia ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={primaryMedia.url}
                alt={altText}
                loading="lazy"
                className="h-full w-full object-contain object-center transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-surface-muted text-fg-muted text-xs">
                {title}
              </div>
            )}

            {/* Badges Overlay */}
            {product.badges && product.badges.length > 0 && (
              <div className="absolute top-2 start-2 flex flex-col gap-1 z-10">
                {product.badges.map((badge) => (
                  <Badge
                    key={badge.id}
                    variant={badge.tone === 'accent' ? 'brand' : 'neutral'}
                    size="sm"
                  >
                    {badge.label[locale] ?? badge.label.en}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-1 flex-col p-4 gap-2">
            {/* Brand */}
            <div className="text-xs font-medium uppercase tracking-wider text-fg-muted">
              {product.brand.name}
            </div>

            {/* Title */}
            <h3 className="line-clamp-2 text-sm font-semibold text-fg-primary group-hover:text-primary transition-colors leading-snug min-h-[2.5rem]">
              {title}
            </h3>

            {/* Rating */}
            <div className="mt-auto pt-1 flex items-center">
              <Rating
                value={product.ratingSummary.average}
                reviewCount={product.ratingSummary.count}
                size="sm"
              />
            </div>

            {/* Price Presentation */}
            <div className="pt-2 border-t border-border-subtle mt-2 flex items-baseline justify-between">
              <div>
                {product.offerSummary.hasMultipleOffers ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-fg-muted font-medium">
                      {t('plp.fromPrice', { price: '' }).replace('{price}', '').trim()}
                    </span>
                    <Price
                      current={lowestPriceFormatted}
                      size="md"
                      className="font-bold text-fg-primary"
                    />
                  </div>
                ) : (
                  <Price
                    current={lowestPriceFormatted}
                    size="md"
                    className="font-bold text-fg-primary"
                  />
                )}
              </div>

              {/* Offers Count Guidance */}
              {product.offerSummary.hasMultipleOffers && (
                <span className="text-2xs text-fg-muted font-mono">
                  {product.offerSummary.offerCount} offers
                </span>
              )}
            </div>
          </div>
        </Link>
      </article>
    </Card>
  );
}
