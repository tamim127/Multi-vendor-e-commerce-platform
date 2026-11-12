/**
 * ==============================================================================
 * AI DOMAIN — SEARCH & RECOMMENDATION SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type {
  SemanticParsedQuery,
  RecommendationItem,
  RecommendationResult,
} from '../types/search-recommendation';
import { MoneySchema } from '@/domains/catalog/schemas/common.schema';

export const SemanticParsedQuerySchema: z.ZodType<SemanticParsedQuery> = z.object({
  rawQuery: z.string().min(1).max(500),
  inferredCategory: z.string().optional(),
  inferredBrand: z.string().optional(),
  maxBudgetMinor: z.number().int().positive().optional(),
  minBudgetMinor: z.number().int().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  extractedFeatures: z.array(z.string()),
  intent: z.enum(['browse', 'buy_specific', 'compare', 'budget_filter']),
});

export const RecommendationItemSchema: z.ZodType<RecommendationItem> = z.object({
  productId: z.string(),
  slug: z.string(),
  title: z.string(),
  brandName: z.string(),
  price: MoneySchema,
  ratingAverage: z.number().min(0).max(5),
  primaryImage: z.string(),
  relevanceScore: z.number().min(0).max(1),
  reasonCode: z.string(),
  reasonLabel: z.string(),
});

export const RecommendationResultSchema: z.ZodType<RecommendationResult> = z.object({
  strategy: z.enum([
    'similar_products',
    'frequently_bought_together',
    'category_trending',
    'price_conscious_alternative',
    'recently_viewed_complement',
  ]),
  title: z.string(),
  subtitle: z.string().optional(),
  items: z.array(RecommendationItemSchema),
  generatedAt: z.string(),
});
