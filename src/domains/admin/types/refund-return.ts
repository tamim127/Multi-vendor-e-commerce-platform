/**
 * ==============================================================================
 * ADMIN DOMAIN — REFUND & RETURN MANAGEMENT TYPES
 * ==============================================================================
 */

import type { Money } from '@/domains/catalog/types/pricing';

export type RefundStatus = 'pending' | 'approved' | 'rejected' | 'processed';

export type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'received' | 'completed';

export type RefundReasonCode =
  'damaged' | 'wrong_item' | 'defective' | 'buyer_remorse' | 'item_not_received' | 'other';

export interface RefundRequest {
  id: string;
  orderId: string;
  packageId: string;
  customerId: string;
  customerName: string;
  sellerId: string;
  sellerName: string;
  amount: Money;
  reason: RefundReasonCode;
  customerNote: string;
  adminNote?: string;
  status: RefundStatus;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface ReturnRequestItem {
  productId: string;
  productName: string;
  quantity: number;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  packageId: string;
  customerId: string;
  customerName: string;
  sellerId: string;
  sellerName: string;
  items: ReturnRequestItem[];
  status: ReturnStatus;
  reason: RefundReasonCode;
  customerNote?: string;
  trackingNumber?: string;
  adminNote?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}
