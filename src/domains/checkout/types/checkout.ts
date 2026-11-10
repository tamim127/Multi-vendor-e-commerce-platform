/**
 * ==============================================================================
 * CHECKOUT DOMAIN — TYPES & CONTRACTS
 * ==============================================================================
 * Multi-vendor order checkout foundation, split packaging, and order contracts.
 */

import type { CurrencyCode, Money } from '@/domains/catalog/types/pricing';
import type { CartItem } from '@/domains/cart/types/cart';

export type DeliveryMethodType = 'standard' | 'express';

export interface CheckoutContactInfo {
  fullName: string;
  email: string;
  phone: string;
}

export interface CheckoutShippingAddress {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CheckoutVendorPackage {
  sellerId: string;
  sellerName: string;
  items: CartItem[];
  subtotal: Money;
  shippingFee: Money;
  deliveryMethod: DeliveryMethodType;
  estimatedDays: string;
}

export interface CheckoutFormState {
  contact: CheckoutContactInfo;
  shipping: CheckoutShippingAddress;
  deliveryMethod: DeliveryMethodType;
}

export interface CheckoutOrderResult {
  orderId: string;
  currency: CurrencyCode;
  itemsSubtotal: Money;
  shippingTotal: Money;
  grandTotal: Money;
  itemCount: number;
  contact: CheckoutContactInfo;
  shippingAddress: CheckoutShippingAddress;
  vendorPackages: CheckoutVendorPackage[];
  createdAt: string;
  isDemo: boolean;
  status: 'confirmed';
}
