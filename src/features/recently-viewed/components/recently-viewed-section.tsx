/**
 * ==============================================================================
 * RECENTLY VIEWED FEATURE — PRESENTATION COMPONENT
 * ==============================================================================
 * Renders deduplicated recently viewed products in a responsive grid.
 */

'use client';

import * as React from 'react';
import { useRecentlyViewed } from '../context/recently-viewed-context';
import { ProductCard } from '@/components/product-card';
import { useI18n } from '@/lib/i18n';
import { Clock, Trash2 } from 'lucide-react';
import { useCart } from '@/features/cart';
import { useWishlist } from '@/features/wishlist';
import { MOCK_SELLER_OFFERS } from '@/domains/catalog/fixtures/seller-offers.fixture';

export interface RecentlyViewedSectionProps {
  currentProductId?: string;
  className?: string;
  maxDisplay?: number;
}

export function RecentlyViewedSection({
  currentProductId,
  className,
  maxDisplay = 4,
}: RecentlyViewedSectionProps): React.JSX.Element | null {
  const { items, clearHistory } = useRecentlyViewed();
  const { t } = useI18n();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Filter out current product if viewing PDP
  const displayItems = items
    .filter((item) => item.productSnapshot && item.productId !== currentProductId)
    .slice(0, maxDisplay);

  if (displayItems.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="recently-viewed-heading"
      className={className ?? 'py-8 border-t border-border-subtle'}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="size-5 text-primary" />
          <h2 id="recently-viewed-heading" className="text-xl font-bold text-fg-primary">
            {t('account.recentlyViewed')}
          </h2>
        </div>
        <button
          type="button"
          onClick={clearHistory}
          className="text-xs text-fg-subtle hover:text-destructive flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Trash2 className="size-3.5" />
          <span>{t('account.clearHistory')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayItems.map((item) => {
          const product = item.productSnapshot!;
          const offer = MOCK_SELLER_OFFERS.find(
            (o) => o.productId === product.id && o.isBuyBoxWinner
          ) ||
            MOCK_SELLER_OFFERS.find((o) => o.productId === product.id) || {
              offerId: `ofr-${product.id}`,
              sellerId: 'seller-official',
              seller: {
                name: 'Official Store',
                id: 'seller-official',
                slug: 'official-store',
                isVerified: true,
                rating: { average: 4.9, count: 120, positiveFeedbackPercent: 98 },
                badges: ['official_store' as const],
              },
              price: product.offerSummary.lowestPrice,
              shippingEstimate: { minDays: 2, maxDays: 4, isFreeShipping: true },
            };

          return (
            <ProductCard
              key={item.productId}
              product={product}
              variant="standard"
              showWishlist
              isWishlisted={isInWishlist(product.id)}
              onWishlistToggle={() => toggleWishlist(product)}
              showQuickAction
              quickActionLabel={t('cart.addToCart')}
              onQuickAction={() => {
                addItem({
                  productId: product.id,
                  slug: product.slug,
                  title: product.title,
                  imageUrl: product.media[0]?.url,
                  offerId: offer.offerId,
                  sellerId: offer.sellerId,
                  sellerName: offer.seller.name,
                  sellerSlug: offer.seller.slug,
                  isSellerVerified: offer.seller.isVerified,
                  unitPrice: offer.price,
                  quantity: 1,
                  shippingEstimate: offer.shippingEstimate,
                });
              }}
            />
          );
        })}
      </div>
    </section>
  );
}
