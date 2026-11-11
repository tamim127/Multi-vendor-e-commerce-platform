/**
 * ==============================================================================
 * ADMIN DOMAIN — SELLER MODERATION SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type { SellerModerationRecord } from '../types/seller-moderation';
import type { SellerStatus } from '@/domains/seller/types/seller';

export const SellerStatusSchema: z.ZodType<SellerStatus> = z.enum([
  'pending',
  'approved',
  'rejected',
  'suspended',
]);

export const SellerModerationRecordSchema: z.ZodType<SellerModerationRecord> = z.object({
  sellerId: z.string().min(1),
  status: SellerStatusSchema,
  notes: z.string().optional(),
  reason: z.string().optional(),
  moderatedBy: z.string().min(1),
  moderatedAt: z.string(),
});

export interface SellerModerationInput {
  sellerId: string;
  status: SellerStatus;
  notes?: string;
  reason?: string;
}

export const SellerModerationInputSchema: z.ZodType<SellerModerationInput> = z.object({
  sellerId: z.string().min(1),
  status: SellerStatusSchema,
  notes: z.string().optional(),
  reason: z.string().optional(),
});
