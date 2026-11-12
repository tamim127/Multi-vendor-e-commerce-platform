/**
 * ==============================================================================
 * AI DOMAIN — CUSTOMER SHOPPING ASSISTANT CONTRACTS
 * ==============================================================================
 * Contracts for interactive natural language shopping discovery, product
 * recommendations, spec comparisons, budget search, and policy Q&A.
 */

import type { Money } from '@/domains/catalog/types/pricing';

export type AssistantIntent =
  | 'product_search'
  | 'product_comparison'
  | 'spec_explanation'
  | 'budget_recommendation'
  | 'policy_faq'
  | 'general_help';

export interface RecommendedProductCard {
  productId: string;
  slug: string;
  title: string;
  brandName: string;
  primaryImage: string;
  price: Money;
  originalPrice?: Money;
  ratingAverage: number;
  reviewCount: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  matchReason: string;
  categoryPath: string;
}

export interface AssistantStructuredResponse {
  message: string;
  intent: AssistantIntent;
  confidenceScore: number;
  recommendedProducts: RecommendedProductCard[];
  suggestedFollowUps: string[];
  referencedPolicies?: {
    topic: 'returns' | 'shipping' | 'warranty' | 'payments';
    summary: string;
    slaDays?: number;
  }[];
  isAiGenerated: true;
  disclaimer: string;
}

export interface AssistantChatSessionMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  structuredData?: AssistantStructuredResponse;
  timestamp: string;
  status: 'sent' | 'processing' | 'error';
  errorMessage?: string;
}

export interface AssistantChatSession {
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  messages: AssistantChatSessionMessage[];
}
