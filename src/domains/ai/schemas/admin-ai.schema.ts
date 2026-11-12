/**
 * ==============================================================================
 * AI DOMAIN — ADMIN AI SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type {
  PlatformHealthSummary,
  ReviewModerationAdvice,
  SuspiciousActivityInsight,
  OperationalExecutiveReport,
} from '../types/admin-ai';
import { MoneySchema } from '@/domains/catalog/schemas/common.schema';

export const PlatformHealthSummarySchema: z.ZodType<PlatformHealthSummary> = z.object({
  period: z.string(),
  gmvTrend: z.object({
    totalGmv: MoneySchema,
    growthPercent: z.number(),
    trendDirection: z.enum(['up', 'down', 'neutral']),
  }),
  orderFulfillmentRate: z.number().min(0).max(100),
  topMerchantPerformance: z.array(
    z.object({
      sellerId: z.string(),
      storeName: z.string(),
      summary: z.string(),
    })
  ),
  keyInsights: z.array(z.string()),
  advisoryRecommendations: z.array(z.string()),
  generatedAt: z.string(),
});

export const ReviewModerationAdviceSchema: z.ZodType<ReviewModerationAdvice> = z.object({
  reviewId: z.string(),
  sentiment: z.enum(['positive', 'negative', 'neutral']),
  spamProbability: z.number().min(0).max(1),
  toxicityDetected: z.boolean(),
  policyViolations: z.array(z.string()),
  recommendedAction: z.enum(['approve', 'hide', 'escalate_to_human']),
  explanation: z.string(),
});

export const SuspiciousActivityInsightSchema: z.ZodType<SuspiciousActivityInsight> = z.object({
  id: z.string(),
  category: z.enum([
    'rapid_refund_requests',
    'new_seller_surge',
    'review_bombing',
    'unusual_velocity',
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  entitiesInvolved: z.array(z.string()),
  observedPattern: z.string(),
  suggestedAuditSteps: z.array(z.string()),
  requiresHumanReview: z.literal(true),
});

export const OperationalExecutiveReportSchema: z.ZodType<OperationalExecutiveReport> = z.object({
  title: z.string(),
  timeframe: z.string(),
  executiveSummary: z.string(),
  kpis: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
      change: z.string(),
    })
  ),
  riskHighlights: z.array(z.string()),
  growthOpportunities: z.array(z.string()),
  disclaimer: z.string(),
});
