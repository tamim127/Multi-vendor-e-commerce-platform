'use client';

/**
 * ==============================================================================
 * ADMIN PRODUCTS & CATALOG MODERATION VIEW
 * ==============================================================================
 * Marketplace-wide product catalog directory, search, category filtering,
 * moderation status evaluation (approved, pending_review, rejected, hidden),
 * and batch/item actions.
 */

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAdmin } from '../context/admin-context';
import type { ProductModerationStatus } from '@/domains/admin';
import { MOCK_PRODUCTS } from '@/domains/catalog/fixtures/products.fixture';
import { formatMinorToCurrency } from '@/domains/admin/utils/analytics';
import { Input } from '@/components/ui/input/input';
import { Search, Filter, CheckCircle2, XCircle, EyeOff, Clock, Eye } from 'lucide-react';

export function AdminProductsView(): React.JSX.Element {
  const { productStatuses, moderateProduct, hasPermission } = useAdmin();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProductModerationStatus>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const PAGE_SIZE = 25;

  const canModerate = hasPermission('catalog:moderate');

  const productsList = useMemo(() => {
    return MOCK_PRODUCTS.map((prod) => {
      const currentStatus: ProductModerationStatus =
        productStatuses[prod.id] || (prod.status === 'active' ? 'approved' : 'pending_review');
      const titleEn = typeof prod.title === 'object' ? prod.title.en : String(prod.title);
      return {
        ...prod,
        titleEn,
        moderationStatus: currentStatus,
      };
    });
  }, [productStatuses]);

  const filteredProducts = useMemo(() => {
    return productsList.filter((prod) => {
      const matchSearch =
        prod.titleEn.toLowerCase().includes(search.toLowerCase()) ||
        prod.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || prod.moderationStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [productsList, search, statusFilter]);

  const handleStatusChange = async (
    productId: string,
    newStatus: ProductModerationStatus
  ): Promise<void> => {
    setUpdatingId(productId);
    try {
      await moderateProduct(productId, newStatus, `Catalog moderation decision: ${newStatus}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: ProductModerationStatus): React.JSX.Element => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 px-2.5 py-0.5 text-xs font-bold">
            <CheckCircle2 className="h-3 w-3" /> Approved
          </span>
        );
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 px-2.5 py-0.5 text-xs font-bold">
            <Clock className="h-3 w-3" /> Under Review
          </span>
        );
      case 'hidden':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-[#1E1E24] dark:text-slate-400 dark:border-[#27272A] px-2.5 py-0.5 text-xs font-bold">
            <EyeOff className="h-3 w-3" /> Hidden
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 px-2.5 py-0.5 text-xs font-bold">
            <XCircle className="h-3 w-3" /> Rejected
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search canonical catalog products by title or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-xl border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121215] text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400 text-xs sm:text-sm shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121215] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs">
            <Filter className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-slate-400">Moderation:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | ProductModerationStatus)}
              className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-900 dark:text-white"
            >
              <option value="all" className="dark:bg-[#18181B]">All Moderation States ({productsList.length})</option>
              <option value="approved" className="dark:bg-[#18181B]">Approved</option>
              <option value="pending_review" className="dark:bg-[#18181B]">Under Review</option>
              <option value="hidden" className="dark:bg-[#18181B]">Hidden</option>
              <option value="rejected" className="dark:bg-[#18181B]">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-[#27272A] bg-white dark:bg-[#121215] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 dark:border-[#1E1E24] bg-slate-50/70 dark:bg-[#18181D] font-bold uppercase tracking-wider text-slate-400 text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Canonical Product</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Offer Pricing</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1E1E24]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No products found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts
                  .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
                  .map((prod) => {
                  const imageUrl =
                    prod.media?.[0]?.url ||
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=160&q=80';
                  return (
                    <tr key={prod.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-[#18181D]/60">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative size-10 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-100 dark:bg-[#18181B]">
                            <Image src={imageUrl} alt={prod.titleEn} fill className="object-cover" sizes="40px" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              <Link
                                href={`/admin/products/${prod.id}`}
                                className="hover:underline hover:text-amber-500 transition-colors"
                              >
                                {prod.titleEn}
                              </Link>
                            </div>
                            <div className="font-mono text-[11px] text-slate-400 mt-0.5">{prod.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-slate-100 dark:bg-[#1E1E24] px-2 py-1 font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          {prod.categoryId}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-slate-900 dark:text-amber-400">
                        {prod.offerSummary ? (
                          <>
                            {formatMinorToCurrency(prod.offerSummary.lowestPrice.amountMinor, 'USD')}{' '}
                            –{' '}
                            {formatMinorToCurrency(prod.offerSummary.highestPrice.amountMinor, 'USD')}
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-5 py-4">{getStatusBadge(prod.moderationStatus)}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/products/${prod.id}`}>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#18181B] px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-amber-400 transition-colors"
                            >
                              <Eye className="h-3.5 w-3.5 text-amber-500" />
                              <span>Inspect</span>
                            </button>
                          </Link>

                          {canModerate && (
                            <>
                              {prod.moderationStatus !== 'approved' && (
                                <button
                                  type="button"
                                  disabled={updatingId === prod.id}
                                  onClick={() => handleStatusChange(prod.id, 'approved')}
                                  className="rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs px-3 py-1.5 shadow-xs transition-colors disabled:opacity-50"
                                >
                                  Approve
                                </button>
                              )}

                              {prod.moderationStatus === 'approved' && (
                                <button
                                  type="button"
                                  disabled={updatingId === prod.id}
                                  onClick={() => handleStatusChange(prod.id, 'hidden')}
                                  className="rounded-xl border border-slate-200 dark:border-[#27272A] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1E1E24] px-2.5 py-1.5 text-xs font-bold transition-colors disabled:opacity-50"
                                >
                                  Hide
                                </button>
                              )}

                              {prod.moderationStatus === 'hidden' && (
                                <button
                                  type="button"
                                  disabled={updatingId === prod.id}
                                  onClick={() => handleStatusChange(prod.id, 'approved')}
                                  className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs px-2.5 py-1.5 transition-colors disabled:opacity-50"
                                >
                                  Restore
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredProducts.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-[#1E1E24] px-5 py-3.5 bg-slate-50/50 dark:bg-[#141418]">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Showing <span className="font-bold text-slate-900 dark:text-white">{(page - 1) * PAGE_SIZE + 1}</span> to{' '}
              <span className="font-bold text-slate-900 dark:text-white">
                {Math.min(page * PAGE_SIZE, filteredProducts.length)}
              </span>{' '}
              of <span className="font-bold text-slate-900 dark:text-white">{filteredProducts.length}</span> products
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-200 dark:border-[#27272A] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E1E24] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 px-2">
                Page {page} of {Math.ceil(filteredProducts.length / PAGE_SIZE)}
              </span>
              <button
                type="button"
                disabled={page >= Math.ceil(filteredProducts.length / PAGE_SIZE)}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-200 dark:border-[#27272A] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E1E24] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
