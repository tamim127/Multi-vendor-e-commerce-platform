/**
 * ==============================================================================
 * CATALOG DOMAIN — SELLER OFFER TYPES
 * ==============================================================================
 * Authoritative commercial contract for multi-vendor offers.
 * Decoupled from canonical product identity; multiple sellers can offer the same
 * product or specific variant with distinct pricing, stock, condition, and fulfillment.
 */

import type { InventorySummary } from './inventory';
import type { Discount, Money } from './pricing';
import type { SellerSummary } from './seller';

export type SellerOfferCondition =
  'new' | 'refurbished_excellent' | 'refurbished_good' | 'used_like_new' | 'used_good';

export type FulfillmentType = 'marketplace_fulfilled' | 'seller_fulfilled' | 'dropship';

export interface ShippingEstimate {
  minDays: number;
  maxDays: number;
  isFreeShipping: boolean;
  shippingCost?: Money;
}

export interface WarrantySummary {
  durationMonths: number;
  provider: 'manufacturer' | 'seller' | 'third_party';
}

export interface SellerOffer {
  /** Unique commercial offer identifier */
  offerId: string;
  /** Canonical product identifier */
  productId: string;
  /** Specific variant/SKU identifier if offering a variant */
  variantId?: string;
  /** Merchant identifier */
  sellerId: string;
  /** Merchant summary information */
  seller: SellerSummary;
  /** Authoritative commercial price in integer minor units */
  price: Money;
  /** Compare-at / strike-through price */
  compareAtPrice?: Money;
  /** Calculated discount */
  discount?: Discount;
  /** Physical condition of the item */
  condition: SellerOfferCondition;
  /** Authoritative inventory availability for this offer */
  inventory: InventorySummary;
  /** Logistics / fulfillment mechanism */
  fulfillmentType: FulfillmentType;
  /** Shipping turnaround estimate */
  shippingEstimate: ShippingEstimate;
  /** Warranty coverage */
  warranty?: WarrantySummary;
  /** Whether this offer is currently the algorithmic Buy Box winner */
  isBuyBoxWinner: boolean;
  /** Return window in days */
  returnPolicyDays: number;
}
