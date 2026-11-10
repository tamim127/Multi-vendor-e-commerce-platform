/**
 * ==============================================================================
 * SELLER DOMAIN — SELLER ORDER & PACKAGE MANAGEMENT TYPES
 * ==============================================================================
 * Authoritative contracts for multi-vendor split orders. Each seller sees only
 * the package assigned to their merchant ID.
 */

import type { Money } from '@/domains/catalog/types/pricing';
import type { CartItem } from '@/domains/cart/types/cart';

export type SellerPackageStatus =
  'unfulfilled' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface SellerPackageShippingAddress {
  fullName: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface SellerOrderPackage {
  packageId: string;
  orderId: string;
  sellerId: string;
  orderCreatedAt: string;
  status: SellerPackageStatus;
  items: CartItem[];
  itemCount: number;
  subtotal: Money;
  shippingFee: Money;
  totalEarnings: Money;
  shippingMethod: string;
  customer: {
    name: string;
    email: string;
  };
  shippingAddress: SellerPackageShippingAddress;
  carrier?: string;
  trackingNumber?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  notes?: string;
}

export interface DispatchPackageInput {
  packageId: string;
  carrier: string;
  trackingNumber: string;
  notes?: string;
}
