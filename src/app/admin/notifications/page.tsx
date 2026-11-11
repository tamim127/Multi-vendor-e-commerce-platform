import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { AdminLayout, AdminGuard, AdminNotificationsView } from '@/features/admin';

export const metadata: Metadata = {
  title: 'Admin Alerts | Admin Platform',
  description:
    'Operational alert inbox for merchant onboarding, refund requests, and flagged items.',
};

export default function AdminNotificationsPage(): React.JSX.Element {
  return (
    <AppShell>
      <AdminGuard requiredPermission="analytics:read">
        <AdminLayout
          title="Administrative Alert Inbox"
          subtitle="Real-time operational alerts from customer and merchant activity."
        >
          <AdminNotificationsView />
        </AdminLayout>
      </AdminGuard>
    </AppShell>
  );
}
