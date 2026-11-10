/**
 * ==============================================================================
 * SELLER DOMAIN — SELLER OFFER MANAGEMENT TYPES
 * ==============================================================================
 */

import type { Money } from '@/domains/catalog/types/pricing';
import type {
  SellerOfferCondition,
  FulfillmentType,
  ShippingEstimate,
  WarrantySummary,
} from '@/domains/catalog/types/seller-offer';

export interface SellerOfferUpsertInput {
  productId: string;
  variantId?: string;
  price: Money;
  compareAtPrice?: Money;
  condition: SellerOfferCondition;
  fulfillmentType: FulfillmentType;
  quantityAvailable: number;
  leadTimeDays: number;
  shippingEstimate: ShippingEstimate;
  warranty?: WarrantySummary;
  returnPolicyDays: number;
  isActive: boolean;
}

export interface SellerListingItem {
  offerId: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  productThumbnail?: string;
  variantId?: string;
  variantSku?: string;
  variantName?: string;
  price: Money;
  compareAtPrice?: Money;
  condition: SellerOfferCondition;
  inventoryState: 'in_stock' | 'low_stock' | 'out_of_stock';
  quantityAvailable: number;
  fulfillmentType: FulfillmentType;
  isBuyBoxWinner: boolean;
  isActive: boolean;
  updatedAt: string;
}

