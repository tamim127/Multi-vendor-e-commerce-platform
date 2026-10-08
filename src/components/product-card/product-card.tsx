/**
 * ==============================================================================
 * PRODUCT CARD SYSTEM — CANONICAL PRODUCT CARD
 * ==============================================================================
 * Production-grade, unified product card presentation layer.
 * Supports 10 distinct variants, loading skeletons, unavailable states,
 * multiple seller offers, flash sale progress, editorial copy, and accessible actions.
 * Zero duplicated card implementations.
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card/card';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ProductCardQuickActionButton, ProductCardWishlistButton } from './product-card-actions';
import { ProductCardBadges } from './product-card-badges';
import { ProductCardBrand } from './product-card-brand';
import { ProductCardMedia } from './product-card-media';
import { ProductCardPrice } from './product-card-price';
import { ProductCardRating } from './product-card-rating';
import { ProductCardSkeleton } from './product-card-skeleton';
import { ProductCardTitle } from './product-card-title';
import type { ProductCardProps } from './product-card.types';
import { getVariantConfig, resolveProductPricing } from './product-card.utils';

export function ProductCard({
  product,
  variant = 'standard',
  priority = false,
  isLoading = false,
  isUnavailable = false,
  isWishlisted = false,
  isSponsored: explicitIsSponsored,
  flashSaleProgressPercent,
  editorialBadgeText,
  quickActionLabel,
  showBrand: explicitShowBrand,
  showRating: explicitShowRating,
  showReviewCount: explicitShowReviewCount,
  showCompareAtPrice: explicitShowCompareAtPrice,
  showDiscount: explicitShowDiscount,
  showOfferCount: explicitShowOfferCount,
  showBadges: explicitShowBadges,
  showWishlist: explicitShowWishlist,
  showQuickAction: explicitShowQuickAction,
  showEditorialCopy: explicitShowEditorialCopy,
  aspectRatio: explicitAspectRatio,
  onWishlistToggle,
  onQuickAction,
  onNavigate,
  className,
  ...props
}: ProductCardProps): React.JSX.Element {
  const { locale } = useI18n();

  // 1. Resolve variant configuration defaults with prop overrides
  const config = getVariantConfig(variant);

  const showBrand = explicitShowBrand ?? config.showBrand;
  const showRating = explicitShowRating ?? config.showRating;
  const showReviewCount = explicitShowReviewCount ?? config.showReviewCount;
  const showCompareAtPrice = explicitShowCompareAtPrice ?? config.showCompareAtPrice;
  const showDiscount = explicitShowDiscount ?? config.showDiscount;
  const showOfferCount = explicitShowOfferCount ?? config.showOfferCount;
  const showBadges = explicitShowBadges ?? config.showBadges;
  const showWishlist = explicitShowWishlist ?? config.showWishlist;
  const showQuickAction = explicitShowQuickAction ?? config.showQuickAction;
  const showEditorialCopy = explicitShowEditorialCopy ?? config.showEditorialCopy;
  const aspectRatio = explicitAspectRatio ?? config.defaultAspectRatio;

  const isSponsored = explicitIsSponsored ?? variant === 'sponsored';
  const isFlashSale = variant === 'flash-sale';
  const isHorizontal = variant === 'horizontal';
  const isCompact = variant === 'compact' || variant === 'recently-viewed';
  const isEditorial = variant === 'editorial';

  // 2. Render layout-stable skeleton if loading
  if (isLoading) {
    return (
      <ProductCardSkeleton variant={variant} aspectRatio={aspectRatio} className={className} />
    );
  }

  // 3. Resolve localized texts & domain pricing
  const title = (locale && product.title[locale]) || product.title.en;
  const editorialCopy =
    (locale && product.shortDescription?.[locale]) ||
    product.shortDescription?.en ||
    (locale && product.description[locale]) ||
    product.description.en;

  const {
    lowestPriceFormatted,
    compareAtPriceFormatted,
    discountPercent,
    hasMultipleOffers,
    offerCount,
  } = resolveProductPricing(product, locale);

  const handleCardClick = (): void => {
    onNavigate?.(product);
  };

  return (
    <Card
      interactive
      className={cn(
        'group relative flex overflow-hidden border border-border-subtle bg-surface text-fg-primary',
        'transition-all duration-200 hover:shadow-md hover:border-border-strong focus-within:ring-2 focus-within:ring-primary',
        isHorizontal ? 'flex-col sm:flex-row items-stretch' : 'flex-col justify-between h-full',
        isSponsored && 'border-primary/20 bg-surface-subtle/30',
        isEditorial && 'p-1 bg-surface-elevated shadow-sm',
        isUnavailable && 'opacity-75 grayscale-25',
        className
      )}
      onClick={handleCardClick}
      {...props}
    >
      <article
        className={cn(
          'relative flex w-full',
          isHorizontal ? 'flex-col sm:flex-row' : 'flex-col h-full'
        )}
      >
        {/* Full-Card Accessible Stretched Link */}
        <Link
          href={`/products/${product.slug}`}
          className="absolute inset-0 z-0 rounded-lg focus:outline-none"
          aria-label={title}
        />

        {/* Media Section */}
        <div className={cn(isHorizontal ? 'w-full sm:w-56 shrink-0 relative z-1' : 'relative z-1')}>
          <ProductCardMedia
            product={product}
            aspectRatio={aspectRatio}
            priority={priority}
            isUnavailable={isUnavailable}
            badgesSlot={
              showBadges ? (
                <ProductCardBadges
                  product={product}
                  isSponsored={isSponsored}
                  isFlashSale={isFlashSale}
                  editorialBadgeText={editorialBadgeText}
                />
              ) : undefined
            }
            actionsSlot={
              showWishlist ? (
                <ProductCardWishlistButton
                  product={product}
                  isWishlisted={isWishlisted}
                  onWishlistToggle={onWishlistToggle}
                />
              ) : undefined
            }
          />
        </div>

        {/* Details & Information Section */}
        <div
          className={cn(
            'flex flex-1 flex-col justify-between gap-2.5 p-4 relative z-1 pointer-events-none',
            isCompact && 'p-2.5 gap-1.5'
          )}
        >
          {/* Metadata Header: Brand & Title */}
          <div className="space-y-1">
            {showBrand && <ProductCardBrand name={product.brand.name} />}
            <ProductCardTitle title={title} variant={variant} />

            {/* Editorial / Supporting description copy */}
            {showEditorialCopy && editorialCopy && (
              <p className="text-xs text-fg-muted line-clamp-2 mt-1 leading-relaxed">
                {editorialCopy}
              </p>
            )}
          </div>

          {/* Rating */}
          {showRating && (
            <div className="mt-auto pt-1">
              <ProductCardRating
                average={product.ratingSummary.average}
                count={product.ratingSummary.count}
                showReviewCount={showReviewCount}
                size={isCompact ? 'sm' : 'sm'}
              />
            </div>
          )}

          {/* Pricing & Offers Guidance */}
          <div className="pt-2 border-t border-border-subtle mt-1 flex flex-col gap-2">
            <ProductCardPrice
              lowestPriceFormatted={lowestPriceFormatted}
              compareAtPriceFormatted={compareAtPriceFormatted}
              discountPercent={discountPercent}
              hasMultipleOffers={hasMultipleOffers}
              offerCount={offerCount}
              showCompareAtPrice={showCompareAtPrice}
              showDiscount={showDiscount}
              showOfferCount={showOfferCount}
              isFlashSale={isFlashSale}
              flashSaleProgressPercent={flashSaleProgressPercent}
            />

            {/* Quick Action Button (Isolated pointer-events) */}
            {showQuickAction && (
              <div className="pt-1 pointer-events-auto">
                <ProductCardQuickActionButton
                  product={product}
                  quickActionLabel={quickActionLabel}
                  onQuickAction={onQuickAction}
                />
              </div>
            )}
          </div>
        </div>
      </article>
    </Card>
  );
}
