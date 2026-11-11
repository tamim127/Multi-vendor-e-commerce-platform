/**
 * ==============================================================================
 * ADMIN DOMAIN — REVIEW MODERATION SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type { ReviewModerationStatus, AdminProductReview } from '../types/review-moderation';

export const ReviewModerationStatusSchema: z.ZodType<ReviewModerationStatus> = z.enum([
  'published',
  'reported',
  'hidden',
]);

export interface ReviewModerationInput {
  reviewId: string;
  status: ReviewModerationStatus;
  notes?: string;
}

export const ReviewModerationInputSchema: z.ZodType<ReviewModerationInput> = z.object({
  reviewId: z.string().min(1),
  status: ReviewModerationStatusSchema,
  notes: z.string().optional(),
});

export const AdminProductReviewSchema: z.ZodType<AdminProductReview> = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  productTitle: z.string().min(1),
  customerId: z.string().min(1),
  customerName: z.string().min(1),
  rating: z.number().min(1).max(5),
  title: z.string(),
  comment: z.string(),
  status: ReviewModerationStatusSchema,
  flagReason: z.string().optional(),
  reportedCount: z.number().int().nonnegative(),
  createdAt: z.string(),
  moderatedAt: z.string().optional(),
  moderatedBy: z.string().optional(),
});
