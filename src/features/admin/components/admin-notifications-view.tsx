'use client';

/**
 * ==============================================================================
 * ADMIN NOTIFICATIONS VIEW
 * ==============================================================================
 * Real-time operational alert inbox: merchant applications, refund claims,
 * flagged content, and system announcements.
 */

import React from 'react';
import Link from 'next/link';
import { useAdmin } from '../context/admin-context';
import { Button } from '@/components/ui/button/button';
import { CheckCircle2, AlertTriangle, Info, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminNotificationsView(): React.JSX.Element {
  const { notifications, markNotificationRead, clearAllNotifications } = useAdmin();

  const getSeverityIcon = (severity: 'info' | 'warning' | 'critical') => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Operational Notifications</h2>
          <p className="text-xs text-muted-foreground">
            Administrative alerts requiring triage or compliance response.
          </p>
        </div>

        {notifications.length > 0 && (
          <Button variant="tertiary" size="sm" onClick={clearAllNotifications}>
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground text-xs">
            No active operational notifications.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={cn(
                'rounded-xl border border-border bg-card p-4 shadow-sm flex items-start justify-between gap-4 transition cursor-pointer hover:bg-accent/30',
                !n.isRead && 'border-primary/40 bg-primary/5'
              )}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getSeverityIcon(n.severity)}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs text-foreground">{n.title}</h3>
                    {!n.isRead && (
                      <span className="rounded-full bg-primary px-1.5 py-0.2 text-[9px] font-bold text-primary-foreground">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{n.message}</p>
                  <span className="mt-2 block font-mono text-[10px] text-muted-foreground">
                    {new Date(n.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              {n.targetUrl && (
                <Link href={n.targetUrl} className="shrink-0">
                  <Button variant="tertiary" size="sm">
                    Open Subsystem
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
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
