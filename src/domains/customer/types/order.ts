/**
 * ==============================================================================
 * CUSTOMER DOMAIN — ORDER HISTORY TYPES
 * ==============================================================================
 */

import type { Money, CurrencyCode } from '@/domains/catalog/types/pricing';
import type { CustomerAddress } from './address';
import type { CheckoutVendorPackage } from '@/domains/checkout/types/checkout';

export type CustomerOrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderTrackingEvent {
  status: string;
  location: string;
  timestamp: string;
  description: string;
}

export interface CustomerOrder {
  orderId: string;
  customerId?: string;
  currency: CurrencyCode;
  itemsSubtotal: Money;
  shippingTotal: Money;
  grandTotal: Money;
  itemCount: number;
  status: CustomerOrderStatus;
  createdAt: string;
  updatedAt: string;
  shippingAddress: CustomerAddress;
  vendorPackages: CheckoutVendorPackage[];
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  trackingEvents?: OrderTrackingEvent[];
  isDemo?: boolean;
}
