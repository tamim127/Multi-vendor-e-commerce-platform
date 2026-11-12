/**
 * ==============================================================================
 * AI DOMAIN — ASSISTANT SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type {
  AssistantStructuredResponse,
  RecommendedProductCard,
  AssistantChatSessionMessage,
} from '../types/assistant';
import { MoneySchema } from '@/domains/catalog/schemas/common.schema';

export const RecommendedProductCardSchema: z.ZodType<RecommendedProductCard> = z.object({
  productId: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  brandName: z.string().min(1),
  primaryImage: z.string(),
  price: MoneySchema,
  originalPrice: MoneySchema.optional(),
  ratingAverage: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  stockStatus: z.enum(['in_stock', 'low_stock', 'out_of_stock']),
  matchReason: z.string().min(1),
  categoryPath: z.string(),
});

export const AssistantStructuredResponseSchema: z.ZodType<AssistantStructuredResponse> = z.object({
  message: z.string().min(1),
  intent: z.enum([
    'product_search',
    'product_comparison',
    'spec_explanation',
    'budget_recommendation',
    'policy_faq',
    'general_help',
  ]),
  confidenceScore: z.number().min(0).max(1),
  recommendedProducts: z.array(RecommendedProductCardSchema),
  suggestedFollowUps: z.array(z.string()),
  referencedPolicies: z
    .array(
      z.object({
        topic: z.enum(['returns', 'shipping', 'warranty', 'payments']),
        summary: z.string(),
        slaDays: z.number().int().positive().optional(),
      })
    )
    .optional(),
  isAiGenerated: z.literal(true),
  disclaimer: z.string(),
});

export const AssistantChatSessionMessageSchema: z.ZodType<AssistantChatSessionMessage> = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
  structuredData: AssistantStructuredResponseSchema.optional(),
  timestamp: z.string().datetime(),
  status: z.enum(['sent', 'processing', 'error']),
  errorMessage: z.string().optional(),
});
