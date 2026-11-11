'use client';

/**
 * ==============================================================================
 * ADMIN AUDIT LOGS VIEW
 * ==============================================================================
 * Append-only immutable administrative compliance ledger.
 * Records all moderation actions, permission transitions, and settings changes.
 */

import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/admin-context';
import type { AuditTargetType } from '@/domains/admin';
import { Input } from '@/components/ui/input/input';
import { Search, Filter, ShieldCheck } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      {/* Search and Target Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search audit trail by action, actor, or target ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Target Entity:</span>
          <select
            value={targetFilter}
            onChange={(e) => setTargetFilter(e.target.value as 'all' | AuditTargetType)}
            className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground"
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
      <div className="rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>
            <strong>Append-Only Integrity:</strong> Audit log records cannot be mutated or purged
            via administrative interfaces.
          </span>
        </div>
        <span className="font-mono text-[11px]">{filteredLogs.length} Records</span>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Actor / Role</th>
                <th className="px-4 py-3">Action Type</th>
                <th className="px-4 py-3">Target Entity</th>
                <th className="px-4 py-3">Outcome</th>
                <th className="px-4 py-3">Event Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground font-sans">
                    No compliance records found matching filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="transition hover:bg-accent/30 text-[11px]">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <div className="font-semibold text-foreground">{log.actor.name}</div>
                      <div className="font-mono text-[10px] text-muted-foreground capitalize">
                        {log.actor.role.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-primary">{log.action}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-secondary-foreground uppercase text-[10px] font-bold mr-1">
                        {log.targetType}
                      </span>
                      <span className="text-foreground">{log.targetId}</span>
                    </td>
                    <td className="px-4 py-3">
                      {log.outcome === 'success' ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[10px]">
                          SUCCESS
                        </span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400 font-bold uppercase text-[10px]">
                          {log.outcome}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
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
