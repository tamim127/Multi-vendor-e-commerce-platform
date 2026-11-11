import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { AdminLayout, AdminGuard, AdminDashboardView } from '@/features/admin';

export const metadata: Metadata = {
  title: 'Platform Administration | Nexus Global Marketplace',
  description: 'Enterprise operations, GMV velocity, catalog moderation, and merchant management.',
};

export default function AdminDashboardPage(): React.JSX.Element {
  return (
    <AppShell>
      <AdminGuard requiredPermission="analytics:read">
        <AdminLayout
          title="Marketplace Operations Overview"
          subtitle="Real-time GMV velocity, multi-vendor orders, seller health, and moderation queues."
        >
          <AdminDashboardView />
        </AdminLayout>
      </AdminGuard>
    </AppShell>
  );
}
