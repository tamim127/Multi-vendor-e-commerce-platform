'use client';

/**
 * ==============================================================================
 * ADMIN REVIEWS & CONTENT MODERATION VIEW
 * ==============================================================================
 * Community guidelines enforcement, spam/profanity detection queue,
 * review hiding, and approval workflows.
 */

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAdmin } from '../context/admin-context';
import type { ReviewModerationStatus } from '@/domains/admin';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { Search, Filter, CheckCircle2, EyeOff, AlertTriangle, Star, Flag } from 'lucide-react';

export function AdminReviewsView(): React.JSX.Element {
  const { reviews, moderateReview, hasPermission } = useAdmin();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ReviewModerationStatus>('all');
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const canModerate = hasPermission('reviews:moderate');

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchSearch =
        r.productTitle.toLowerCase().includes(search.toLowerCase()) ||
        r.customerName.toLowerCase().includes(search.toLowerCase()) ||
        r.comment.toLowerCase().includes(search.toLowerCase()) ||
        r.title.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [reviews, search, statusFilter]);

  const handleStatusChange = async (
    reviewId: string,
    newStatus: ReviewModerationStatus,
    reason?: string
  ): Promise<void> => {
    setSubmittingId(reviewId);
    try {
      await moderateReview(reviewId, newStatus, reason);
    } finally {
      setSubmittingId(null);
    }
  };

  const getStatusBadge = (status: ReviewModerationStatus): React.JSX.Element => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> Published
          </span>
        );
      case 'reported':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Flag className="h-3 w-3" /> Flagged ({status})
          </span>
        );
      case 'hidden':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400">
            <EyeOff className="h-3 w-3" /> Hidden
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reviews by product, customer, or text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Moderation:</span>
          <select
            aria-label="Filter reviews by moderation status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | ReviewModerationStatus)}
            className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground"
          >
            <option value="all">All Reviews ({reviews.length})</option>
            <option value="reported">Reported / Flagged</option>
            <option value="published">Published</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </div>

      {/* Reviews Queue */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground text-xs">
            No reviews found matching moderation filter.
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < rev.rating ? 'fill-current' : 'text-muted stroke-current fill-none'
                        }`}
                      />
                    ))}
                  </div>
                  <h3 className="font-bold text-sm text-foreground">{rev.title}</h3>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(rev.status)}
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <p className="text-xs text-foreground leading-relaxed">{rev.comment}</p>

              {rev.flagReason && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>
                    <strong>Flagged Reason:</strong> {rev.flagReason} ({rev.reportedCount} user
                    report{rev.reportedCount === 1 ? '' : 's'})
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                <div>
                  Product:{' '}
                  <Link
                    href={`/admin/products/${rev.productId}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {rev.productTitle}
                  </Link>{' '}
                  · By: <span className="font-medium text-foreground">{rev.customerName}</span>
                </div>

                {canModerate && (
                  <div className="flex items-center gap-2">
                    {rev.status !== 'published' && (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={submittingId === rev.id}
                        onClick={() => handleStatusChange(rev.id, 'published')}
                      >
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                        Approve / Publish
                      </Button>
                    )}

                    {rev.status !== 'hidden' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={submittingId === rev.id}
                        onClick={() =>
                          handleStatusChange(
                            rev.id,
                            'hidden',
                            'Moderated: Removed from public view'
                          )
                        }
                      >
                        <EyeOff className="mr-1 h-3.5 w-3.5" />
                        Hide Review
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
