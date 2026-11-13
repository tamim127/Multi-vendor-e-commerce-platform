'use client';

/**
 * ==============================================================================
 * ADMIN RETURNS MANAGEMENT VIEW
 * ==============================================================================
 * Physical return package requests, SKU tracking, warehouse inspection statuses,
 * and completion workflows.
 * Fully supports White (Light) and Dark Aureon themes.
 */

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAdmin } from '../context/admin-context';
import type { ReturnStatus } from '@/domains/admin';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { Search, Filter, CheckCircle2, XCircle, Clock, Package, RotateCcw, Truck, Check } from 'lucide-react';

export function AdminReturnsView(): React.JSX.Element {
  const { returns, reviewReturn, hasPermission } = useAdmin();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ReturnStatus>('all');
  const [submitting, setSubmitting] = useState(false);

  const canProcess = hasPermission('refunds:process');

  const filteredReturns = useMemo(() => {
    return returns.filter((r) => {
      const matchSearch =
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.orderId.toLowerCase().includes(search.toLowerCase()) ||
        r.customerName.toLowerCase().includes(search.toLowerCase()) ||
        r.sellerName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [returns, search, statusFilter]);

  const pendingCount = useMemo(() => returns.filter((r) => r.status === 'pending').length, [returns]);
  const inTransitCount = useMemo(() => returns.filter((r) => r.status === 'approved').length, [returns]);
  const completedCount = useMemo(() => returns.filter((r) => r.status === 'completed').length, [returns]);

  const handleStatusChange = async (returnId: string, status: ReturnStatus): Promise<void> => {
    setSubmitting(true);
    try {
      await reviewReturn(returnId, status, `Admin updated return status to ${status}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: ReturnStatus): React.JSX.Element => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 px-2.5 py-0.5 text-xs font-bold">
            <CheckCircle2 className="h-3 w-3" /> Completed
          </span>
        );
      case 'received':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 px-2.5 py-0.5 text-xs font-bold">
            <Package className="h-3 w-3" /> Received at Hub
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20 px-2.5 py-0.5 text-xs font-bold">
            <Truck className="h-3 w-3" /> In Transit
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
      {/* Returns KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Total Returns
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <RotateCcw className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {returns.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
            Across all vendors
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Awaiting Auth
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
            {pendingCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
            Requires RMA approval
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Inbound In Transit
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-cyan-600 dark:text-cyan-400">
            {inTransitCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
            Waybill tracking active
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Completed & Inspected
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Check className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {completedCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
            Restocked / refunded
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
          <Input
            placeholder="Search return requests by ID, order, customer, or seller..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 text-sm bg-slate-50 dark:bg-[#18181B] border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
          <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | ReturnStatus)}
            className="rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#18181B] px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">All Returns ({returns.length})</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="received">Received</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Returns Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-[#27272A] bg-slate-50/80 dark:bg-[#18181B] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              <tr>
                <th className="px-5 py-3.5">Return ID / Order</th>
                <th className="px-5 py-3.5">Customer & Seller</th>
                <th className="px-5 py-3.5">Returned Line Items</th>
                <th className="px-5 py-3.5">Reason Code</th>
                <th className="px-5 py-3.5">Tracking</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1E1E24]">
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-zinc-400">
                    No physical return requests found.
                  </td>
                </tr>
              ) : (
                filteredReturns.map((ret) => (
                  <tr
                    key={ret.id}
                    className="transition-colors hover:bg-slate-50/60 dark:hover:bg-[#18181B]/60"
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-mono font-bold text-slate-900 dark:text-white">{ret.id}</div>
                      <div className="font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                        <Link
                          href={`/admin/orders/${ret.orderId}`}
                          className="text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                        >
                          {ret.orderId}
                        </Link>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{ret.customerName}</div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400">{ret.sellerName}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      {ret.items.map((it, idx) => (
                        <div key={idx} className="font-medium text-slate-700 dark:text-zinc-300">
                          {it.productName}{' '}
                          <span className="font-mono text-slate-400 dark:text-zinc-500">
                            (Qty: {it.quantity})
                          </span>
                        </div>
                      ))}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-md bg-slate-100 dark:bg-[#1E1E24] px-2 py-0.5 font-mono text-[11px] font-bold uppercase text-slate-700 dark:text-zinc-300">
                        {ret.reason}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-500 dark:text-zinc-400">
                      {ret.trackingNumber || 'Awaiting Shipment'}
                    </td>
                    <td className="px-5 py-3.5">{getStatusBadge(ret.status)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {canProcess && ret.status === 'pending' && (
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={submitting}
                            onClick={() => handleStatusChange(ret.id, 'approved')}
                            className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold"
                          >
                            Authorize Return
                          </Button>
                        )}

                        {canProcess && ret.status === 'approved' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={submitting}
                            onClick={() => handleStatusChange(ret.id, 'received')}
                            className="rounded-xl border border-slate-200 dark:border-[#27272A] font-bold"
                          >
                            Mark Received
                          </Button>
                        )}

                        {canProcess && ret.status === 'received' && (
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={submitting}
                            onClick={() => handleStatusChange(ret.id, 'completed')}
                            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                          >
                            Complete
                          </Button>
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
