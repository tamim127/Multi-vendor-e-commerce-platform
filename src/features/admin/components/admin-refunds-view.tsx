'use client';

/**
 * ==============================================================================
 * ADMIN REFUND MANAGEMENT VIEW
 * ==============================================================================
 * Buyer refund request queues, reason codes, monetary verification using Money contracts,
 * and simulated settlement decisions.
 */

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAdmin } from '../context/admin-context';
import type { RefundStatus } from '@/domains/admin';
import { formatMinorToCurrency } from '@/domains/admin/utils/analytics';
import { Input } from '@/components/ui/input/input';
import { Search, Filter, CheckCircle2, XCircle, Clock } from 'lucide-react';

export function AdminRefundsView(): React.JSX.Element {
  const { refunds, reviewRefund, hasPermission } = useAdmin();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RefundStatus>('all');
  const [adminNote, setAdminNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canProcess = hasPermission('refunds:process');

  const filteredRefunds = useMemo(() => {
    return refunds.filter((r) => {
      const matchSearch =
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.orderId.toLowerCase().includes(search.toLowerCase()) ||
        r.customerName.toLowerCase().includes(search.toLowerCase()) ||
        r.sellerName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [refunds, search, statusFilter]);

  const handleAction = async (refundId: string, status: RefundStatus): Promise<void> => {
    setSubmitting(true);
    try {
      await reviewRefund(refundId, status, adminNote.trim() || undefined);
      setAdminNote('');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: RefundStatus): React.JSX.Element => {
    switch (status) {
      case 'processed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 px-2.5 py-0.5 text-xs font-bold">
            <CheckCircle2 className="h-3 w-3" /> Processed
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 px-2.5 py-0.5 text-xs font-bold">
            <CheckCircle2 className="h-3 w-3" /> Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 px-2.5 py-0.5 text-xs font-bold">
            <Clock className="h-3 w-3" /> Pending Review
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
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search refunds by claim ID, order ID, customer, or seller..."
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
              onChange={(e) => setStatusFilter(e.target.value as 'all' | RefundStatus)}
              className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-900 dark:text-white"
            >
              <option value="all" className="dark:bg-[#18181B]">All Claims ({refunds.length})</option>
              <option value="pending" className="dark:bg-[#18181B]">Pending</option>
              <option value="approved" className="dark:bg-[#18181B]">Approved</option>
              <option value="processed" className="dark:bg-[#18181B]">Processed</option>
              <option value="rejected" className="dark:bg-[#18181B]">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Refunds Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-[#27272A] bg-white dark:bg-[#121215] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 dark:border-[#1E1E24] bg-slate-50/70 dark:bg-[#18181D] font-bold uppercase tracking-wider text-slate-400 text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Claim ID / Order</th>
                <th className="px-5 py-3.5">Customer &amp; Seller</th>
                <th className="px-5 py-3.5">Refund Amount</th>
                <th className="px-5 py-3.5">Reason Code</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Review Workflow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1E1E24]">
              {filteredRefunds.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No refund claims found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRefunds.map((ref) => (
                  <tr key={ref.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-[#18181D]/60">
                    <td className="px-5 py-4">
                      <div className="font-mono font-bold text-slate-900 dark:text-white">{ref.id}</div>
                      <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                        <Link
                          href={`/admin/orders/${ref.orderId}`}
                          className="text-amber-500 hover:underline"
                        >
                          {ref.orderId}
                        </Link>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{ref.customerName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Seller: {ref.sellerName}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-slate-900 dark:text-amber-400">
                      {formatMinorToCurrency(ref.amount.amountMinor, ref.amount.currency)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-slate-100 dark:bg-[#1E1E24] px-2 py-1 font-mono text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300">
                        {ref.reason}
                      </span>
                      <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        {ref.customerNote}
                      </div>
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(ref.status)}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canProcess && ref.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleAction(ref.id, 'approved')}
                              disabled={submitting}
                              className="rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs px-3 py-1.5 shadow-xs transition-colors disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAction(ref.id, 'rejected')}
                              disabled={submitting}
                              className="rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs px-3 py-1.5 shadow-xs transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {canProcess && ref.status === 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleAction(ref.id, 'processed')}
                            disabled={submitting}
                            className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs px-3 py-1.5 shadow-xs transition-colors disabled:opacity-50"
                          >
                            Mark Processed
                          </button>
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
