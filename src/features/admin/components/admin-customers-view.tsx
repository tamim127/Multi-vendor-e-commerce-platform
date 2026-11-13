'use client';

/**
 * ==============================================================================
 * ADMIN CUSTOMERS MANAGEMENT VIEW
 * ==============================================================================
 * Registered buyer directory, search, filter, status moderation (active/suspended),
 * total spending summary, and customer detail navigation.
 */

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAdmin } from '../context/admin-context';
import type { CustomerAccountStatus } from '@/domains/admin';
import { formatMinorToCurrency } from '@/domains/admin/utils/analytics';
import { Input } from '@/components/ui/input/input';
import { Search, Filter, ShieldAlert, CheckCircle2, Eye, UserX, UserCheck } from 'lucide-react';

export function AdminCustomersView(): React.JSX.Element {
  const { customers, moderateCustomer, hasPermission } = useAdmin();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CustomerAccountStatus>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const canModerate = hasPermission('customers:moderate');

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch =
        c.firstName.toLowerCase().includes(search.toLowerCase()) ||
        c.lastName.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [customers, search, statusFilter]);

  const handleToggleStatus = async (
    customerId: string,
    currentStatus: CustomerAccountStatus
  ): Promise<void> => {
    setUpdatingId(customerId);
    const newStatus: CustomerAccountStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await moderateCustomer(
        customerId,
        newStatus,
        `Admin action: set account status to ${newStatus}`
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search customers by name or email..."
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
              onChange={(e) => setStatusFilter(e.target.value as 'all' | CustomerAccountStatus)}
              className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-900 dark:text-white"
            >
              <option value="all" className="dark:bg-[#18181B]">All Accounts ({customers.length})</option>
              <option value="active" className="dark:bg-[#18181B]">Active</option>
              <option value="suspended" className="dark:bg-[#18181B]">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Data Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-[#27272A] bg-white dark:bg-[#121215] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 dark:border-[#1E1E24] bg-slate-50/70 dark:bg-[#18181D] font-bold uppercase tracking-wider text-slate-400 text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Customer Identity</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Lifetime Orders</th>
                <th className="px-5 py-3.5">Total Spend</th>
                <th className="px-5 py-3.5">Member Since</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1E1E24]">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No customer accounts found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-[#18181D]/60">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-xs">
                          {cust.firstName.slice(0, 1)}
                          {cust.lastName.slice(0, 1)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            <Link
                              href={`/admin/customers/${cust.id}`}
                              className="hover:underline hover:text-amber-500 transition-colors"
                            >
                              {cust.firstName} {cust.lastName}
                            </Link>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">{cust.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {cust.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 px-2.5 py-0.5 text-xs font-bold">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 px-2.5 py-0.5 text-xs font-bold">
                          <ShieldAlert className="h-3 w-3" /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-900 dark:text-white font-bold">
                      {cust.totalOrders} {cust.totalOrders === 1 ? 'order' : 'orders'}
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-slate-900 dark:text-amber-400">
                      {formatMinorToCurrency(cust.totalSpentMinor, 'USD')}
                    </td>
                    <td className="px-5 py-4 text-slate-400 font-mono text-[11px]">
                      {new Date(cust.joinedAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/customers/${cust.id}`}>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#18181B] px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-amber-400 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5 text-amber-500" />
                            <span>Profile</span>
                          </button>
                        </Link>

                        {canModerate && (
                          <button
                            type="button"
                            disabled={updatingId === cust.id}
                            onClick={() => handleToggleStatus(cust.id, cust.status)}
                            className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-colors disabled:opacity-50 ${
                              cust.status === 'active'
                                ? 'border border-rose-300 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10'
                                : 'bg-emerald-500 hover:bg-emerald-400 text-white'
                            }`}
                          >
                            {cust.status === 'active' ? (
                              <>
                                <UserX className="h-3.5 w-3.5" />
                                <span>Suspend</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3.5 w-3.5" />
                                <span>Reactivate</span>
                              </>
                            )}
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
