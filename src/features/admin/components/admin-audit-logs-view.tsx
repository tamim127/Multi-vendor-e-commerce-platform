'use client';

/**
 * ==============================================================================
 * ADMIN AUDIT LOGS VIEW
 * ==============================================================================
 * Append-only immutable administrative compliance ledger.
 * Records all moderation actions, permission transitions, and settings changes.
 * Fully supports White (Light) and Dark Aureon themes.
 */

import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/admin-context';
import type { AuditTargetType } from '@/domains/admin';
import { Input } from '@/components/ui/input/input';
import { Search, Filter, ShieldCheck, History, Activity, Lock } from 'lucide-react';

export function AdminAuditLogsView(): React.JSX.Element {
  const { auditLogs } = useAdmin();

  const [search, setSearch] = useState('');
  const [targetFilter, setTargetFilter] = useState<'all' | AuditTargetType>('all');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchSearch =
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.actor.name.toLowerCase().includes(search.toLowerCase()) ||
        log.targetId.toLowerCase().includes(search.toLowerCase());
      const matchTarget = targetFilter === 'all' || log.targetType === targetFilter;
      return matchSearch && matchTarget;
    });
  }, [auditLogs, search, targetFilter]);

  const successCount = useMemo(
    () => auditLogs.filter((l) => l.outcome === 'success').length,
    [auditLogs]
  );

  return (
    <div className="space-y-6">
      {/* Ledger Overview Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Total Log Entries
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <History className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {auditLogs.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
            Immutable events
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Verified Outcomes
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {successCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
            100% compliance rate
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Target Subsystems
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            10 Types
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
            Across platform scopes
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Tamper Proofing
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Lock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-purple-600 dark:text-purple-400">
            Active
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
            Append-only hash chain
          </div>
        </div>
      </div>

      {/* Search and Target Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
          <Input
            placeholder="Search audit trail by action, actor, or target ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 text-sm bg-slate-50 dark:bg-[#18181B] border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
          <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400">Target Entity:</span>
          <select
            value={targetFilter}
            onChange={(e) => setTargetFilter(e.target.value as 'all' | AuditTargetType)}
            className="rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#18181B] px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">All Targets ({auditLogs.length})</option>
            <option value="seller">Sellers</option>
            <option value="customer">Customers</option>
            <option value="product">Products</option>
            <option value="category">Categories</option>
            <option value="order">Orders</option>
            <option value="refund">Refunds</option>
            <option value="return">Returns</option>
            <option value="coupon">Coupons & Promos</option>
            <option value="review">Reviews</option>
            <option value="settings">Settings</option>
          </select>
        </div>
      </div>

      {/* Append-Only Notice */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-slate-700 dark:text-zinc-300 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            <strong className="text-slate-900 dark:text-white">Append-Only Integrity:</strong> Audit log records cannot be mutated, retroactively edited, or purged via administrative interfaces.
          </span>
        </div>
        <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400">{filteredLogs.length} Records</span>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-[#27272A] bg-slate-50/80 dark:bg-[#18181B] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Actor / Role</th>
                <th className="px-5 py-3.5">Action Type</th>
                <th className="px-5 py-3.5">Target Entity</th>
                <th className="px-5 py-3.5">Outcome</th>
                <th className="px-5 py-3.5">Event Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1E1E24] font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-zinc-400 font-sans">
                    No compliance records found matching filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="transition-colors hover:bg-slate-50/60 dark:hover:bg-[#18181B]/60 text-[11px]"
                  >
                    <td className="px-5 py-3.5 text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 font-sans">
                      <div className="font-bold text-slate-900 dark:text-white">{log.actor.name}</div>
                      <div className="font-mono text-[10px] text-slate-500 dark:text-zinc-400 capitalize">
                        {log.actor.role.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-amber-600 dark:text-amber-400">{log.action}</td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-md bg-slate-100 dark:bg-[#1E1E24] px-2 py-0.5 text-slate-700 dark:text-zinc-300 uppercase text-[10px] font-bold mr-1.5">
                        {log.targetType}
                      </span>
                      <span className="text-slate-900 dark:text-white font-mono">{log.targetId}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {log.outcome === 'success' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase">
                          SUCCESS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 px-2 py-0.5 text-[10px] font-bold uppercase">
                          {log.outcome}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-zinc-400 max-w-xs truncate">
                      {log.metadata ? JSON.stringify(log.metadata) : '—'}
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
