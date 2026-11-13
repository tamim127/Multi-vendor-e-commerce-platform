'use client';

/**
 * ==============================================================================
 * ADMIN NOTIFICATIONS VIEW
 * ==============================================================================
 * Real-time operational alert inbox: merchant applications, refund claims,
 * flagged content, and system announcements.
 * Fully supports White (Light) and Dark Aureon themes.
 */

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useAdmin } from '../context/admin-context';
import { Button } from '@/components/ui/button/button';
import { CheckCircle2, AlertTriangle, Info, ArrowRight, Bell, ShieldAlert, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminNotificationsView(): React.JSX.Element {
  const { notifications, markNotificationRead, clearAllNotifications } = useAdmin();

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);
  const criticalCount = useMemo(
    () => notifications.filter((n) => n.severity === 'critical' || n.severity === 'warning').length,
    [notifications]
  );

  const getSeverityIcon = (severity: 'info' | 'warning' | 'critical') => {
    switch (severity) {
      case 'critical':
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-4 w-4" />
          </div>
        );
      case 'warning':
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Info className="h-4 w-4" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Total Alerts
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Bell className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {notifications.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
            Platform notification events
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Unread Messages
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-blue-600 dark:text-blue-400">
            {unreadCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
            Awaiting executive review
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Action Required
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
            {criticalCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
            Warning and critical priority
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-4 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Operational Notifications</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Administrative alerts requiring triage or compliance response.
          </p>
        </div>

        {notifications.length > 0 && (
          <Button
            variant="tertiary"
            size="sm"
            onClick={clearAllNotifications}
            className="rounded-xl border border-slate-200 dark:border-[#27272A] text-slate-700 dark:text-zinc-300 font-bold"
          >
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-12 text-center text-slate-500 dark:text-zinc-400 text-xs shadow-sm">
            No active operational notifications.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={cn(
                'rounded-2xl border p-4.5 shadow-sm flex items-start justify-between gap-4 transition cursor-pointer',
                !n.isRead
                  ? 'border-amber-500/40 bg-amber-50/40 dark:bg-amber-500/[0.04]'
                  : 'border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] hover:bg-slate-50/60 dark:hover:bg-[#18181B]/60'
              )}
            >
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 shrink-0">{getSeverityIcon(n.severity)}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white">{n.title}</h3>
                    {!n.isRead && (
                      <span className="rounded-full bg-amber-500 text-slate-950 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">{n.message}</p>
                  <span className="mt-2 block font-mono text-[10px] text-slate-400 dark:text-zinc-500">
                    {new Date(n.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              {n.targetUrl && (
                <Link href={n.targetUrl} className="shrink-0">
                  <Button
                    variant="tertiary"
                    size="sm"
                    className="rounded-xl border border-slate-200 dark:border-[#27272A] text-xs font-semibold text-slate-700 dark:text-zinc-300"
                  >
                    Open Subsystem
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5 text-amber-500" />
                  </Button>
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
