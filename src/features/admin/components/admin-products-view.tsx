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
import { useAdmin } from '../context/admin-context';
import type { ProductModerationStatus } from '@/domains/admin';
import { MOCK_PRODUCTS } from '@/domains/catalog/fixtures/products.fixture';
import { formatMinorToCurrency } from '@/domains/admin/utils/analytics';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { Search, Filter, CheckCircle2, XCircle, EyeOff, Clock, Eye } from 'lucide-react';

export function AdminProductsView(): React.JSX.Element {
  const { productStatuses, moderateProduct, hasPermission } = useAdmin();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProductModerationStatus>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> Approved
          </span>
        );
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Clock className="h-3 w-3" /> Under Review
          </span>
        );
      case 'hidden':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <EyeOff className="h-3 w-3" /> Hidden
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400">
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
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search canonical catalog products by title or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Moderation:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | ProductModerationStatus)}
            className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground"
          >
            <option value="all">All Moderation States ({productsList.length})</option>
            <option value="approved">Approved</option>
            <option value="pending_review">Under Review</option>
            <option value="hidden">Hidden</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Canonical Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Offer Pricing</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No products found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => (
                  <tr key={prod.id} className="transition hover:bg-accent/30">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">
                        <Link
                          href={`/admin/products/${prod.id}`}
                          className="hover:underline text-primary"
                        >
                          {prod.titleEn}
                        </Link>
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">{prod.id}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{prod.categoryId}</td>
                    <td className="px-4 py-3 font-mono font-medium text-foreground">
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
                    <td className="px-4 py-3">{getStatusBadge(prod.moderationStatus)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/admin/products/${prod.id}`}>
                          <Button variant="tertiary" size="sm">
                            <Eye className="mr-1 h-3.5 w-3.5" />
                            Inspect
                          </Button>
                        </Link>

                        {canModerate && (
                          <>
                            {prod.moderationStatus !== 'approved' && (
                              <Button
                                variant="primary"
                                size="sm"
                                disabled={updatingId === prod.id}
                                onClick={() => handleStatusChange(prod.id, 'approved')}
                              >
                                Approve
                              </Button>
                            )}

                            {prod.moderationStatus === 'approved' && (
                              <Button
                                variant="tertiary"
                                size="sm"
                                disabled={updatingId === prod.id}
                                onClick={() => handleStatusChange(prod.id, 'hidden')}
                              >
                                Hide
                              </Button>
                            )}

                            {prod.moderationStatus === 'hidden' && (
                              <Button
                                variant="secondary"
                                size="sm"
                                disabled={updatingId === prod.id}
                                onClick={() => handleStatusChange(prod.id, 'approved')}
                              >
                                Restore
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
