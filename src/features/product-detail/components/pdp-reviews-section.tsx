/**
 * ==============================================================================
 * PRODUCT DETAIL PAGE — REVIEWS SECTION COMPONENT
 * ==============================================================================
 * Customer ratings breakdown, star distribution, and verified feedback cards.
 */

'use client';

import * as React from 'react';
import { Star, CheckCircle, Info, ThumbsUp } from 'lucide-react';
import type { ProductRatingSummary } from '@/domains/catalog/types/product';
import type { DemoReview } from '../types';
import { Rating } from '@/components/ui/rating/rating';
import { Button } from '@/components/ui/button/button';
import { useI18n } from '@/lib/i18n';

export interface PdpReviewsSectionProps {
  ratingSummary: ProductRatingSummary;
  reviews: DemoReview[];
}

export function PdpReviewsSection({
  ratingSummary,
  reviews,
}: PdpReviewsSectionProps): React.JSX.Element {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-8 py-2">
      {/* Top Rating Summary and Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-xl border border-border-default bg-surface-subtle p-5">
        {/* Left: Overall Score */}
        <div className="flex flex-col items-center justify-center gap-2 text-center md:border-r border-border-default md:pr-6">
          <span className="text-4xl sm:text-5xl font-extrabold text-fg-primary">
            {ratingSummary.average.toFixed(1)}
          </span>
          <Rating value={ratingSummary.average} showValue={false} size="md" />
          <span className="text-xs text-fg-muted font-medium">
            {t('pdp.ratingCount', { count: ratingSummary.count })}
          </span>
        </div>

        {/* Middle: Star Bars Distribution */}
        <div className="md:col-span-2 flex flex-col justify-center gap-2">
          {([5, 4, 3, 2, 1] as const).map((stars) => {
            const starCount = ratingSummary.distribution[stars] ?? 0;
            const percentage =
              ratingSummary.count > 0 ? Math.round((starCount / ratingSummary.count) * 100) : 0;

            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-medium text-fg-muted flex items-center gap-1">
                  {stars} <Star className="size-3 fill-amber-400 text-amber-400" />
                </span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface border border-border-subtle">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-10 text-end font-mono text-fg-subtle tabular-nums">
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Demo Fixture Disclaimer */}
      <div className="flex items-start gap-2 rounded-lg bg-surface-subtle p-3 text-xs text-fg-muted">
        <Info className="size-4 text-fg-subtle shrink-0 mt-0.5" />
        <p>{t('pdp.demoFeedbackNote')}</p>
      </div>

      {/* Reviews List */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-bold text-fg-primary">
            {t('pdp.tabReviews')} ({reviews.length})
          </h4>
          <Button variant="tertiary" size="sm" className="text-xs">
            {t('pdp.writeReview')}
          </Button>
        </div>

        {reviews.length === 0 ? (
          <div className="rounded-xl border border-border-default bg-surface p-8 text-center text-fg-muted text-sm">
            {t('pdp.noReviews')}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="flex flex-col gap-2.5 rounded-xl border border-border-default bg-surface p-4 shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-fg-primary">{rev.authorName}</span>
                    {rev.isVerifiedBuyer && (
                      <span className="inline-flex items-center gap-1 text-2xs font-medium text-success bg-success/10 px-1.5 py-0.5 rounded-sm">
                        <CheckCircle className="size-3" />
                        Verified Buyer
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-fg-subtle">
                    {new Date(rev.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Rating value={rev.rating} showValue={false} size="sm" />
                  <span className="text-sm font-bold text-fg-primary">{rev.title}</span>
                </div>

                <p className="text-xs sm:text-sm text-fg-secondary leading-relaxed">
                  {rev.comment}
                </p>

                <div className="flex items-center gap-1 text-2xs text-fg-subtle pt-1">
                  <ThumbsUp className="size-3" />
                  <span>{rev.helpfulCount} people found this helpful</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
