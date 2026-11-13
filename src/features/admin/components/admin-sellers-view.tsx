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
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 px-2.5 py-0.5 text-xs font-bold">
            <CheckCircle2 className="h-3 w-3" /> Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 px-2.5 py-0.5 text-xs font-bold">
            <Clock className="h-3 w-3" /> Under Review
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 px-2.5 py-0.5 text-xs font-bold">
            <AlertTriangle className="h-3 w-3" /> Suspended
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-[#1E1E24] dark:text-slate-400 dark:border-[#27272A] px-2.5 py-0.5 text-xs font-bold">
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
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search sellers by store, legal entity, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-xl border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121215] text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400 text-xs sm:text-sm shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121215] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs">
            <Filter className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | SellerStatus)}
              className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-900 dark:text-white"
            >
              <option value="all" className="dark:bg-[#18181B]">All Statuses ({sellersList.length})</option>
              <option value="approved" className="dark:bg-[#18181B]">Approved</option>
              <option value="pending" className="dark:bg-[#18181B]">Under Review</option>
              <option value="suspended" className="dark:bg-[#18181B]">Suspended</option>
              <option value="rejected" className="dark:bg-[#18181B]">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sellers Data Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-[#27272A] bg-white dark:bg-[#121215] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 dark:border-[#1E1E24] bg-slate-50/70 dark:bg-[#18181D] font-bold uppercase tracking-wider text-slate-400 text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Merchant / Store</th>
                <th className="px-5 py-3.5">Legal Entity</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Rating</th>
                <th className="px-5 py-3.5 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1E1E24]">
              {filteredSellers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No merchants found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSellers.map((seller) => (
                  <tr key={seller.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-[#18181D]/60">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Link
                          href={`/admin/sellers/${seller.id}`}
                          className="hover:underline hover:text-amber-500 transition-colors"
                        >
                          {seller.name}
                        </Link>
                        {seller.isVerified && <ShieldCheck className="h-4 w-4 text-amber-500" />}
                        {seller.isApplication && (
                          <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-black text-amber-600 dark:text-amber-400">
                            New App
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{seller.email}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400 font-mono">
                      {seller.legalName || 'N/A'}
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(seller.status)}</td>
                    <td className="px-5 py-4 text-slate-900 dark:text-white font-semibold">
                      {seller.ratingCount > 0 ? (
                        <span>
                          ★ {seller.ratingAverage.toFixed(1)}{' '}
                          <span className="text-slate-400 font-normal">({seller.ratingCount})</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">New</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/sellers/${seller.id}`}>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#18181B] px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-amber-400 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5 text-amber-500" />
                            <span>Details</span>
                          </button>
                        </Link>

                        {canModerate && (
                          <>
                            {seller.status === 'pending' && (
                              <>
                                <button
                                  type="button"
                                  disabled={actionInProgress === seller.id}
                                  onClick={() => handleStatusChange(seller.id, 'approved')}
                                  className="rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs px-3 py-1.5 shadow-xs transition-colors disabled:opacity-50"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  disabled={actionInProgress === seller.id}
                                  onClick={() => handleStatusChange(seller.id, 'rejected')}
                                  className="rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs px-3 py-1.5 shadow-xs transition-colors disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {seller.status === 'approved' && (
                              <button
                                type="button"
                                disabled={actionInProgress === seller.id}
                                onClick={() => handleStatusChange(seller.id, 'suspended')}
                                className="rounded-xl border border-rose-300 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 px-2.5 py-1.5 text-xs font-bold transition-colors disabled:opacity-50"
                              >
                                Suspend
                              </button>
                            )}

                            {seller.status === 'suspended' && (
                              <button
                                type="button"
                                disabled={actionInProgress === seller.id}
                                onClick={() => handleStatusChange(seller.id, 'approved')}
                                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs px-2.5 py-1.5 transition-colors disabled:opacity-50"
                              >
                                Reactivate
                              </button>
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
