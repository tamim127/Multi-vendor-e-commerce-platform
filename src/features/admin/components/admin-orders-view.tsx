'use client';

/**
 * ==============================================================================
 * ADMIN ORDERS OVERSIGHT VIEW
 * ==============================================================================
 * Platform-wide marketplace order supervision, status filtering, buyer context,
 * and order inspection.
 */

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAdmin } from '../context/admin-context';
import type { CustomerOrderStatus } from '@/domains/customer/types/order';
import { formatMinorToCurrency } from '@/domains/admin/utils/analytics';
import { Input } from '@/components/ui/input/input';
import { Search, Filter, Eye, Truck, CheckCircle2, Clock, XCircle } from 'lucide-react';

export function AdminOrdersView(): React.JSX.Element {
  const { orders } = useAdmin();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CustomerOrderStatus>('all');

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.orderId.toLowerCase().includes(search.toLowerCase()) ||
        o.shippingAddress.fullName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const getStatusBadge = (status: CustomerOrderStatus): React.JSX.Element => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 px-2.5 py-0.5 text-xs font-bold">
            <CheckCircle2 className="h-3 w-3" /> Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 px-2.5 py-0.5 text-xs font-bold">
            <Truck className="h-3 w-3" /> Dispatched
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 px-2.5 py-0.5 text-xs font-bold">
            <Clock className="h-3 w-3" /> Processing
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 px-2.5 py-0.5 text-xs font-bold">
            <XCircle className="h-3 w-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-[#1E1E24] dark:text-slate-400 dark:border-[#27272A] px-2.5 py-0.5 text-xs font-bold">
            Pending
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
            placeholder="Search orders by Order ID or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-xl border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121215] text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400 text-xs sm:text-sm shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121215] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs">
            <Filter className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-slate-400">Order Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | CustomerOrderStatus)}
              className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-900 dark:text-white"
            >
              <option value="all" className="dark:bg-[#18181B]">All Orders ({orders.length})</option>
              <option value="pending" className="dark:bg-[#18181B]">Pending</option>
              <option value="processing" className="dark:bg-[#18181B]">Processing</option>
              <option value="shipped" className="dark:bg-[#18181B]">Shipped</option>
              <option value="delivered" className="dark:bg-[#18181B]">Delivered</option>
              <option value="cancelled" className="dark:bg-[#18181B]">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-[#27272A] bg-white dark:bg-[#121215] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 dark:border-[#1E1E24] bg-slate-50/70 dark:bg-[#18181D] font-bold uppercase tracking-wider text-slate-400 text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Order Number</th>
                <th className="px-5 py-3.5">Customer Recipient</th>
                <th className="px-5 py-3.5">Packages</th>
                <th className="px-5 py-3.5">Grand Total</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Created</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1E1E24]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No orders found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.orderId} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-[#18181D]/60">
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/orders/${ord.orderId}`}
                        className="font-mono font-bold text-slate-900 dark:text-amber-400 hover:underline"
                      >
                        {ord.orderId}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {ord.shippingAddress.fullName}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {ord.shippingAddress.city}, {ord.shippingAddress.countryCode}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">
                      {ord.vendorPackages?.length || 1} vendor package(s)
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-slate-900 dark:text-white">
                      {formatMinorToCurrency(ord.grandTotal.amountMinor, ord.currency)}
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(ord.status)}</td>
                    <td className="px-5 py-4 text-slate-400 font-mono text-[11px]">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/admin/orders/${ord.orderId}`}>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#18181B] px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-amber-400 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5 text-amber-500" />
                          <span>Supervise</span>
                        </button>
                      </Link>
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
