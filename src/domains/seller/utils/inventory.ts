/**
 * ==============================================================================
 * SELLER DOMAIN — INVENTORY UTILITIES
 * ==============================================================================
 */

import type { InventoryItem, StockAlertLevel } from '../types/inventory';
import type { SellerOffer } from '@/domains/catalog/types/seller-offer';
import type { Product } from '@/domains/catalog/types/product';

export function calculateStockAlertLevel(
  quantityAvailable: number,
  lowStockThreshold = 10
): StockAlertLevel {
  if (quantityAvailable <= 0) return 'out_of_stock';
  if (quantityAvailable <= lowStockThreshold) return 'low_stock';
  return 'normal';
}

export function buildSellerInventoryFromOffers(
  sellerOffers: SellerOffer[],
  allProducts: Product[]
): InventoryItem[] {
  const productMap = new Map(allProducts.map((p) => [p.id, p]));

  return sellerOffers.map((offer) => {
    const product = productMap.get(offer.productId);
    const variant = product?.variants.find((v) => v.id === offer.variantId);

    const sku = variant?.sku || product?.defaultVariantId || `SKU-${offer.productId}`;
    const qty = offer.inventory.quantityAvailable ?? 0;
    const threshold = 10;

    return {
      sku,
      productId: offer.productId,
      variantId: offer.variantId,
      productTitle: product?.title.en ?? offer.productId,
      variantName: variant?.options?.map((o) => o.displayValue.en).join(' / '),
      thumbnailUrl: product?.media[0]?.url,
      quantityAvailable: qty,
      quantityReserved: Math.floor(qty * 0.1),
      lowStockThreshold: threshold,
      alertLevel: calculateStockAlertLevel(qty, threshold),
      location: 'Central Fulfillment Hub Dock A',
      updatedAt: new Date().toISOString(),
    };
  });
}
