/**
 * ==============================================================================
 * AI DOMAIN — ADMIN AI TOOLS CONTRACTS
 * ==============================================================================
 * Contracts for marketplace operator AI copilot: platform performance summaries,
 * review moderation assistance, suspicious activity detection, and operational reports.
 * STRICT: All AI outputs are advisory only and cannot trigger administrative mutations.
 */

import type { Money } from '@/domains/catalog/types/pricing';

export interface PlatformHealthSummary {
  period: string;
  gmvTrend: {
    totalGmv: Money;
    growthPercent: number;
    trendDirection: 'up' | 'down' | 'neutral';
  };
  orderFulfillmentRate: number; // percentage
  topMerchantPerformance: {
    sellerId: string;
    storeName: string;
    summary: string;
  }[];
  keyInsights: string[];
  advisoryRecommendations: string[];
  generatedAt: string;
}

export interface ReviewModerationAdvice {
  reviewId: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  spamProbability: number; // 0 - 1
  toxicityDetected: boolean;
  policyViolations: string[];
  recommendedAction: 'approve' | 'hide' | 'escalate_to_human';
  explanation: string;
}

export interface SuspiciousActivityInsight {
  id: string;
  category: 'rapid_refund_requests' | 'new_seller_surge' | 'review_bombing' | 'unusual_velocity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  entitiesInvolved: string[];
  observedPattern: string;
  suggestedAuditSteps: string[];
  requiresHumanReview: true;
}

export interface OperationalExecutiveReport {
  title: string;
  timeframe: string;
  executiveSummary: string;
  kpis: {
    name: string;
    value: string;
    change: string;
  }[];
  riskHighlights: string[];
  growthOpportunities: string[];
  disclaimer: string;
}
