/**
 * ==============================================================================
 * CATALOG DISCOVERY FEATURE — PLP PRODUCT ITEM ADAPTER
 * ==============================================================================
 * Thin PLP adapter delegating directly to the canonical reusable ProductCard system.
 * Retains backward-compatible component boundary without duplicate implementation.
 */

'use client';

import * as React from 'react';
import { ProductCard } from '@/components/product-card';
import type { Product } from '@/domains/catalog/types/product';
import { useCart } from '@/features/cart';
import { MOCK_SELLER_OFFERS } from '@/domains/catalog/fixtures/seller-offers.fixture';

export interface PlpProductItemProps {
  product: Product;
}

export function PlpProductItem({ product }: PlpProductItemProps): React.JSX.Element {
  const { addItem } = useCart();

  const handleQuickAction = (): void => {
    const offer = MOCK_SELLER_OFFERS.find((o) => o.productId === product.id && o.isBuyBoxWinner) ||
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
  };

  return (
    <ProductCard
      product={product}
      variant="standard"
      showQuickAction
      quickActionLabel="Add to Cart"
      onQuickAction={handleQuickAction}
    />
  );
}
