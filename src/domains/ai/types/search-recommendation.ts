/**
 * ==============================================================================
 * AI DOMAIN — SEARCH & RECOMMENDATION CONTRACTS
 * ==============================================================================
 * Contracts for semantic search query parsing, hybrid ranking, product similarity,
 * related products, and personalized category-based recommendations.
 */

import type { Money } from '@/domains/catalog/types/pricing';

export type RecommendationStrategy =
  | 'similar_products'
  | 'frequently_bought_together'
  | 'category_trending'
  | 'price_conscious_alternative'
  | 'recently_viewed_complement';

export interface SemanticParsedQuery {
  rawQuery: string;
  inferredCategory?: string;
  inferredBrand?: string;
  maxBudgetMinor?: number;
  minBudgetMinor?: number;
  currency?: string;
  extractedFeatures: string[];
  intent: 'browse' | 'buy_specific' | 'compare' | 'budget_filter';
}

export interface RecommendationItem {
  productId: string;
  slug: string;
  title: string;
  brandName: string;
  price: Money;
  ratingAverage: number;
  primaryImage: string;
  relevanceScore: number; // 0 - 1
  reasonCode: string;
  reasonLabel: string;
}

export interface RecommendationResult {
  strategy: RecommendationStrategy;
  title: string;
  subtitle?: string;
  items: RecommendationItem[];
  generatedAt: string;
}
