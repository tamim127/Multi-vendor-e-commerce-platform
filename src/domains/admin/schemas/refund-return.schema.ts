/**
 * ==============================================================================
 * ADMIN DOMAIN — REFUND & RETURN SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type {
  RefundStatus,
  ReturnStatus,
  RefundReasonCode,
  RefundRequest,
  ReturnRequest,
} from '../types/refund-return';
import type { Money, CurrencyCode } from '@/domains/catalog/types/pricing';

export const RefundStatusSchema: z.ZodType<RefundStatus> = z.enum([
  'pending',
  'approved',
  'rejected',
  'processed',
]);

export const ReturnStatusSchema: z.ZodType<ReturnStatus> = z.enum([
  'pending',
  'approved',
  'rejected',
  'received',
  'completed',
]);

export const RefundReasonCodeSchema: z.ZodType<RefundReasonCode> = z.enum([
  'damaged',
  'wrong_item',
  'defective',
  'buyer_remorse',
  'item_not_received',
  'other',
]);

const CurrencyCodeSchema: z.ZodType<CurrencyCode> = z.enum(['USD', 'EUR', 'GBP', 'BDT']);

const MoneySchema: z.ZodType<Money> = z.object({
  amountMinor: z.number().int().nonnegative(),
  currency: CurrencyCodeSchema,
});

export const RefundRequestSchema: z.ZodType<RefundRequest> = z.object({
  id: z.string().min(1),
  orderId: z.string().min(1),
  packageId: z.string().min(1),
  customerId: z.string().min(1),
  customerName: z.string().min(1),
  sellerId: z.string().min(1),
  sellerName: z.string().min(1),
  amount: MoneySchema,
  reason: RefundReasonCodeSchema,
  customerNote: z.string(),
  adminNote: z.string().optional(),
  status: RefundStatusSchema,
  createdAt: z.string(),
  resolvedAt: z.string().optional(),
  resolvedBy: z.string().optional(),
});

export const ReturnRequestSchema: z.ZodType<ReturnRequest> = z.object({
  id: z.string().min(1),
  orderId: z.string().min(1),
  packageId: z.string().min(1),
  customerId: z.string().min(1),
  customerName: z.string().min(1),
  sellerId: z.string().min(1),
  sellerName: z.string().min(1),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      productName: z.string().min(1),
      quantity: z.number().int().positive(),
    })
  ),
  status: ReturnStatusSchema,
  reason: RefundReasonCodeSchema,
  customerNote: z.string().optional(),
  trackingNumber: z.string().optional(),
  adminNote: z.string().optional(),
  createdAt: z.string(),
  resolvedAt: z.string().optional(),
  resolvedBy: z.string().optional(),
});

export interface RefundReviewInput {
  refundId: string;
  status: RefundStatus;
  adminNote?: string;
}

export const RefundReviewInputSchema: z.ZodType<RefundReviewInput> = z.object({
  refundId: z.string().min(1),
  status: RefundStatusSchema,
  adminNote: z.string().optional(),
});

export interface ReturnReviewInput {
  returnId: string;
  status: ReturnStatus;
  adminNote?: string;
}

export const ReturnReviewInputSchema: z.ZodType<ReturnReviewInput> = z.object({
  returnId: z.string().min(1),
  status: ReturnStatusSchema,
  adminNote: z.string().optional(),
});
