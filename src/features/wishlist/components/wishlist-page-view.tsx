/**
 * ==============================================================================
 * WISHLIST FEATURE — WISHLIST PAGE VIEW
 * ==============================================================================
 * Renders user wishlisted items with responsive ProductCard grid,
 * Add to Cart quick actions, and graceful empty state.
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { useWishlist } from '../context/wishlist-context';
import { useCart } from '@/features/cart';
import { useI18n } from '@/lib/i18n';
import { Heart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button/button';
import { ProductCard } from '@/components/product-card';
import { MOCK_SELLER_OFFERS } from '@/domains/catalog/fixtures/seller-offers.fixture';

export function WishlistPageView(): React.JSX.Element {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  const { t } = useI18n();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-fg-primary flex items-center gap-2">
            <Heart className="size-5 text-destructive fill-destructive" />
            <span>{t('wishlist.title')}</span>
          </h2>
          <p className="text-xs text-fg-muted mt-0.5">
            Products you have saved for later purchase or price monitoring.
          </p>
        </div>

        {items.length > 0 && (
          <Button
            type="button"
            variant="tertiary"
            size="sm"
            onClick={clearWishlist}
            className="text-destructive font-semibold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Trash2 className="size-3.5" />
            <span>Clear Wishlist</span>
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-default bg-surface p-12 text-center space-y-3">
          <div className="flex size-14 items-center justify-center rounded-full bg-surface-muted text-fg-muted mx-auto">
            <Heart className="size-6 text-fg-muted" />
          </div>
          <h3 className="text-base font-bold text-fg-primary">{t('wishlist.empty')}</h3>
          <p className="text-xs text-fg-muted max-w-sm mx-auto">{t('wishlist.emptyDesc')}</p>
          <Link href="/products" className="inline-block mt-2">
            <Button variant="primary" size="sm" className="font-semibold cursor-pointer">
              {t('wishlist.exploreProducts')}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item) => {
            const product = item.productSnapshot;
            if (!product) return null;

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
                isWishlisted={true}
                onWishlistToggle={() => removeFromWishlist(product.id)}
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
      )}
    </div>
  );
}
