'use client';

/**
 * ==============================================================================
 * ADMIN SELLERS MANAGEMENT VIEW
 * ==============================================================================
 * Full merchant directory, search, filter, status moderation (approve, reject, suspend),
 * KYC verification status, and storefront shortcuts.
 */

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAdmin } from '../context/admin-context';
import type { SellerStatus } from '@/domains/seller/types/seller';
import { MOCK_SELLERS } from '@/domains/catalog/fixtures/sellers.fixture';
import { DEMO_PENDING_APPLICATION } from '@/domains/seller/fixtures/seller.fixture';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Eye,
} from 'lucide-react';

interface CombinedSellerItem {
  id: string;
  slug: string;
  name: string;
  legalName?: string;
  email: string;
  status: SellerStatus;
  isVerified: boolean;
  ratingAverage: number;
  ratingCount: number;
  isApplication?: boolean;
}

export function AdminSellersView(): React.JSX.Element {
  const { sellerStatuses, moderateSeller, hasPermission } = useAdmin();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SellerStatus>('all');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const canModerate = hasPermission('sellers:moderate');

  // Combine mock sellers and pending applications
  const sellersList: CombinedSellerItem[] = useMemo(() => {
    const list: CombinedSellerItem[] = MOCK_SELLERS.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      legalName: s.name + ' Corp',
      email: `contact@${s.slug}.demo`,
      status: (sellerStatuses[s.id] as SellerStatus) || (s.isVerified ? 'approved' : 'pending'),
      isVerified: s.isVerified,
      ratingAverage: s.rating.average,
      ratingCount: s.rating.count,
    }));

    // Add pending demo application as a seller item
    const pendingStatus =
      (sellerStatuses[DEMO_PENDING_APPLICATION.storeSlug] as SellerStatus) || 'pending';
    list.unshift({
      id: DEMO_PENDING_APPLICATION.storeSlug,
      slug: DEMO_PENDING_APPLICATION.storeSlug,
      name: DEMO_PENDING_APPLICATION.storeName,
      legalName: DEMO_PENDING_APPLICATION.businessInfo.legalBusinessName,
      email: DEMO_PENDING_APPLICATION.businessInfo.contactPerson.email,
      status: pendingStatus,
      isVerified: false,
      ratingAverage: 0,
      ratingCount: 0,
      isApplication: true,
    });

    return list;
  }, [sellerStatuses]);

  const filteredSellers = useMemo(() => {
    return sellersList.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        (s.legalName && s.legalName.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [sellersList, search, statusFilter]);

  const handleStatusChange = async (sellerId: string, newStatus: SellerStatus): Promise<void> => {
    setActionInProgress(sellerId);
    try {
      await moderateSeller(sellerId, newStatus, `Admin manual action: set to ${newStatus}`);
    } finally {
      setActionInProgress(null);
    }
  };

  const getStatusBadge = (status: SellerStatus): React.JSX.Element => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Clock className="h-3 w-3" /> Under Review
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400">
            <AlertTriangle className="h-3 w-3" /> Suspended
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <XCircle className="h-3 w-3" /> Declined
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sellers by store, legal entity, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | SellerStatus)}
            className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground"
          >
            <option value="all">All Statuses ({sellersList.length})</option>
            <option value="approved">Approved</option>
            <option value="pending">Under Review</option>
            <option value="suspended">Suspended</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Sellers Data Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Merchant / Store</th>
                <th className="px-4 py-3">Legal Entity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSellers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No merchants found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSellers.map((seller) => (
                  <tr key={seller.id} className="transition hover:bg-accent/30">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground flex items-center gap-1.5">
                        <Link
                          href={`/admin/sellers/${seller.id}`}
                          className="hover:underline text-primary"
                        >
                          {seller.name}
                        </Link>
                        {seller.isVerified && <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />}
                        {seller.isApplication && (
                          <span className="rounded bg-amber-500/10 px-1 py-0.2 text-[10px] font-bold text-amber-600">
                            New App
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{seller.email}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono">
                      {seller.legalName || 'N/A'}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(seller.status)}</td>
                    <td className="px-4 py-3 text-foreground">
                      {seller.ratingCount > 0 ? (
                        <span>
                          ★ {seller.ratingAverage.toFixed(1)}{' '}
                          <span className="text-muted-foreground">({seller.ratingCount})</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">New</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/admin/sellers/${seller.id}`}>
                          <Button variant="tertiary" size="sm">
                            <Eye className="mr-1 h-3.5 w-3.5" />
                            Details
                          </Button>
                        </Link>

                        {canModerate && (
                          <>
                            {seller.status === 'pending' && (
                              <>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  disabled={actionInProgress === seller.id}
                                  onClick={() => handleStatusChange(seller.id, 'approved')}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  disabled={actionInProgress === seller.id}
                                  onClick={() => handleStatusChange(seller.id, 'rejected')}
                                >
                                  Reject
                                </Button>
                              </>
                            )}

                            {seller.status === 'approved' && (
                              <Button
                                variant="tertiary"
                                size="sm"
                                disabled={actionInProgress === seller.id}
                                onClick={() => handleStatusChange(seller.id, 'suspended')}
                                className="text-destructive hover:bg-destructive/10"
                              >
                                Suspend
                              </Button>
                            )}

                            {seller.status === 'suspended' && (
                              <Button
                                variant="secondary"
                                size="sm"
                                disabled={actionInProgress === seller.id}
                                onClick={() => handleStatusChange(seller.id, 'approved')}
                              >
                                Reactivate
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
