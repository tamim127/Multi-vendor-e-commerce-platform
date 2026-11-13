'use client';

/**
 * ==============================================================================
 * ADMIN REVIEWS & CONTENT MODERATION VIEW
 * ==============================================================================
 * Community guidelines enforcement, spam/profanity detection queue,
 * review hiding, and approval workflows.
 * Fully supports White (Light) and Dark Aureon themes.
 */

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAdmin } from '../context/admin-context';
import type { ReviewModerationStatus } from '@/domains/admin';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import {
  Search,
  Filter,
  CheckCircle2,
  EyeOff,
  AlertTriangle,
  Star,
  Flag,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';

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

  const reportedCount = useMemo(() => reviews.filter((r) => r.status === 'reported').length, [reviews]);
  const publishedCount = useMemo(() => reviews.filter((r) => r.status === 'published').length, [reviews]);
  const hiddenCount = useMemo(() => reviews.filter((r) => r.status === 'hidden').length, [reviews]);

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
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 px-2.5 py-0.5 text-xs font-bold">
            <CheckCircle2 className="h-3 w-3" /> Published
          </span>
        );
      case 'reported':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 px-2.5 py-0.5 text-xs font-bold">
            <Flag className="h-3 w-3" /> Flagged ({status})
          </span>
        );
      case 'hidden':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 px-2.5 py-0.5 text-xs font-bold">
            <EyeOff className="h-3 w-3" /> Hidden
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Moderation Metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Total Reviews
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {reviews.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
            Across platform
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Flagged Queue
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
            {reportedCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
            Requires moderation
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Published
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {publishedCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
            Visible on PDP
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Hidden
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <EyeOff className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400">
            {hiddenCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
            Removed from store
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
          <Input
            placeholder="Search reviews by product, customer, or text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 text-sm bg-slate-50 dark:bg-[#18181B] border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
          <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400">Moderation:</span>
          <select
            aria-label="Filter reviews by moderation status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | ReviewModerationStatus)}
            className="rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#18181B] px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
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
          <div className="rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-12 text-center text-slate-500 dark:text-zinc-400 text-xs shadow-sm">
            No reviews found matching moderation filter.
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-5 shadow-sm space-y-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-[#1E1E24] pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < rev.rating ? 'fill-current' : 'text-slate-200 dark:text-zinc-700 stroke-current fill-none'
                        }`}
                      />
                    ))}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{rev.title}</h3>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(rev.status)}
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">{rev.comment}</p>

              {rev.flagReason && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>
                    <strong>Flagged Reason:</strong> {rev.flagReason} ({rev.reportedCount} user
                    report{rev.reportedCount === 1 ? '' : 's'})
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 dark:border-[#1E1E24] pt-3 text-xs text-slate-500 dark:text-zinc-400">
                <div>
                  Product:{' '}
                  <Link
                    href={`/admin/products/${rev.productId}`}
                    className="font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    {rev.productTitle}
                  </Link>{' '}
                  · By: <span className="font-semibold text-slate-900 dark:text-white">{rev.customerName}</span>
                </div>

                {canModerate && (
                  <div className="flex items-center gap-2">
                    {rev.status !== 'published' && (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={submittingId === rev.id}
                        onClick={() => handleStatusChange(rev.id, 'published')}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
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
                        className="rounded-xl font-bold"
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
