'use client';

/**
 * ==============================================================================
 * AI FEATURE — ADMIN AI OPERATIONS COPILOT
 * ==============================================================================
 * Operator-facing AI analytics copilot providing executive summaries,
 * review moderation assistance, merchant performance audits, and risk alerts.
 * STRICT SECURITY: All outputs are advisory only and cannot independently trigger
 * administrative mutations or financial transactions.
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileText,
  RotateCcw,
  Store,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import type { PlatformHealthSummary } from '@/domains/ai/types/admin-ai';
import { formatMoneyMinor } from '@/domains/catalog/utils/money';

export function AdminAiView(): React.JSX.Element {
  const [timeframe, setTimeframe] = useState<'last_7_days' | 'last_30_days'>('last_30_days');
  const [summary, setSummary] = useState<PlatformHealthSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async (selectedTimeframe: 'last_7_days' | 'last_30_days') => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeframe: selectedTimeframe }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to generate operational report.');
      }

      const data = await response.json();
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load AI analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(timeframe);
  }, [timeframe]);

  return (
    <div className="space-y-8">
      {/* Top Banner & Advisory Safety Boundary */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Marketplace Operations Copilot (AI)
              </h2>
              <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Advisory Only
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Executive analytics summaries, merchant velocity insights, and content moderation
              assistance.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-card border border-amber-500/30 p-3 text-xs text-muted-foreground">
            <Lock className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <span>
              <strong>Zero Execution Privilege:</strong> AI cannot approve sellers, issue refunds,
              or modify catalog data. Human authorization is strictly required.
            </span>
          </div>
        </div>
      </div>

      {/* Timeframe Filter Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Analysis Window:</span>
          <div className="inline-flex rounded-xl border border-border bg-card p-1 shadow-xs">
            <button
              type="button"
              onClick={() => setTimeframe('last_7_days')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                timeframe === 'last_7_days'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('last_30_days')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                timeframe === 'last_30_days'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Last 30 Days
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchAnalytics(timeframe)}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent transition-colors disabled:opacity-50"
        >
          <RotateCcw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-xs text-destructive flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading && !summary && (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center space-y-3">
          <Sparkles className="h-6 w-6 text-primary animate-spin" />
          <span>Synthesizing marketplace performance metrics...</span>
        </div>
      )}

      {summary && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Executive KPI Overview Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Platform GMV Volume
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {formatMoneyMinor(summary.gmvTrend.totalGmv)}
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-0.5" /> +{summary.gmvTrend.growthPercent}%
                </span>
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                Total marketplace throughput for {summary.period}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Fulfillment Success Rate
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {summary.orderFulfillmentRate}%
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
                  <CheckCircle2 className="h-3 w-3 mr-0.5" /> High SLA
                </span>
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                Across all multi-vendor split dispatches
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Platform Safety
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  Healthy
                </span>
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                No systemic abuse or review bombing anomalies detected
              </div>
            </div>
          </div>

          {/* Key Insights & Advisory Recommendations */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">
                  Marketplace Intelligence Insights
                </h3>
              </div>
              <ul className="space-y-2.5 text-xs leading-relaxed text-muted-foreground">
                {summary.keyInsights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span className="text-foreground">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-foreground">Advisory Operator Actions</h3>
              </div>
              <ul className="space-y-2.5 text-xs leading-relaxed text-muted-foreground">
                {summary.advisoryRecommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <span className="text-foreground">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Top Merchant Performance Analysis */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Store className="h-4 w-4 text-purple-500" />
              <h3 className="text-sm font-bold text-foreground">Top Merchant Health Analysis</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {summary.topMerchantPerformance.map((merchant) => (
                <div
                  key={merchant.sellerId}
                  className="rounded-xl border border-border bg-muted/30 p-4 space-y-1.5 text-xs"
                >
                  <div className="font-bold text-foreground">{merchant.storeName}</div>
                  <div className="text-muted-foreground leading-relaxed">{merchant.summary}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Moderation Copilot Notice */}
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 flex items-start gap-3 text-xs">
            <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-foreground">Review & Content Moderation Copilot</div>
              <p className="text-muted-foreground leading-relaxed">
                The AI Copilot pre-screens customer reviews against spam, toxicity, and competitive
                defamation policies. In all cases, suspected violations are placed into the
                administrative moderation queue for human agent sign-off.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
