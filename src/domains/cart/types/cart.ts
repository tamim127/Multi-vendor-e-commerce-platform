/**
 * ==============================================================================
 * SHOPPING CART DOMAIN — TYPES & CONTRACTS
 * ==============================================================================
 * Authoritative shopping cart data structures supporting multi-vendor offers,
 * variant selections, strict integer money calculations, and seller-level grouping.
 */

import type { Money, CurrencyCode } from '@/domains/catalog/types/pricing';
import type { LocalizedText } from '@/domains/catalog/types/localization';
import type { ShippingEstimate } from '@/domains/catalog/types/seller-offer';

/**
 * Snapshot of a product variant option (e.g. Color: Space Black)
 */
export interface CartVariantOptionSnapshot {
  attributeId: string;
  name: LocalizedText;
  value: LocalizedText;
}

/**
 * Individual item line in the shopping cart.
 * Uniquely identified by combination of product, variant, and specific seller offer.
 */
export interface CartItem {
  /** Unique cart item identifier (composite or UUID) */
  id: string;
  /** Canonical product reference */
  productId: string;
  /** Product slug for deep linking */
  slug: string;
  /** Localized product title snapshot */
  title: LocalizedText;
  /** Product SKU or variant SKU */
  sku?: string;
  /** Thumbnail image URL */
  imageUrl?: string;
  /** Specific variant reference if configured */
  variantId?: string;
  /** Selected variant options snapshot */
  selectedOptions?: Record<string, string>;
  /** Specific seller offer reference */
  offerId: string;
  /** Merchant/Seller identifier */
  sellerId: string;
  /** Merchant display name */
  sellerName: string;
  /** Merchant slug */
  sellerSlug?: string;
  /** Whether the merchant is verified */
  isSellerVerified?: boolean;
  /** Unit price in integer minor units */
  unitPrice: Money;
  /** Quantity ordered (integer >= 1) */
  quantity: number;
  /** Line total: unitPrice * quantity */
  lineTotal: Money;
  /** Maximum purchasable quantity based on inventory */
  maxAvailableQuantity: number;
  /** Estimated shipping details from seller offer */
  shippingEstimate?: ShippingEstimate;
  /** Timestamp when line item was created */
  createdAt: string;
  /** Timestamp when line item was last updated */
  updatedAt: string;
}

/**
 * Group of cart items fulfilled by a single merchant.
 * Used for multi-vendor presentation and future order splitting.
 */
export interface CartSellerGroup {
  sellerId: string;
  sellerName: string;
  sellerSlug?: string;
  isVerified?: boolean;
  items: CartItem[];
  subtotal: Money;
  shippingCost?: Money;
  itemCount: number;
}

/**
 * Complete shopping cart state.
 */
export interface Cart {
  /** Unique cart identifier */
  id: string;
  /** Active cart items */
  items: CartItem[];
  /** Active currency of the cart */
  currency: CurrencyCode;
  /** Total units count (sum of all item quantities) */
  itemCount: number;
  /** Distinct line items count */
  distinctItemCount: number;
  /** Products subtotal */
  subtotal: Money;
  /** Shipping total across seller groups (where available) */
  shippingTotal: Money;
  /** Grand total: subtotal + shippingTotal */
  grandTotal: Money;
  /** Multi-vendor grouped view of cart items */
  sellerGroups: CartSellerGroup[];
  /** Creation timestamp */
  createdAt: string;
  /** Last modification timestamp */
  updatedAt: string;
}

/**
 * Parameters for adding an item to the cart.
 */
export interface AddToCartInput {
  productId: string;
  slug: string;
  title: LocalizedText;
  sku?: string;
  imageUrl?: string;
  variantId?: string;
  selectedOptions?: Record<string, string>;
  offerId: string;
  sellerId: string;
  sellerName: string;
  sellerSlug?: string;
  isSellerVerified?: boolean;
  unitPrice: Money;
  quantity?: number;
  maxAvailableQuantity?: number;
  shippingEstimate?: ShippingEstimate;
}

/**
 * Storage schema contract for safe persistence.
 */
export interface CartStorageState {
  version: number;
  currency: CurrencyCode;
  items: CartItem[];
  updatedAt: string;
}

