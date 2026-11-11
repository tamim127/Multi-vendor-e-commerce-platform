import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { AdminLayout, AdminGuard, AdminAnalyticsView } from '@/features/admin';

export const metadata: Metadata = {
  title: 'Financial Analytics | Admin Platform',
  description: 'Marketplace financial velocity, GMV growth, merchant performance, and AOV metrics.',
};

export default function AdminAnalyticsPage(): React.JSX.Element {
  return (
    <AppShell>
      <AdminGuard requiredPermission="analytics:read">
        <AdminLayout
          title="Marketplace Financial Intelligence"
          subtitle="Comprehensive financial telemetry: GMV trends, net take-rate yields, and merchant velocity."
        >
          <AdminAnalyticsView />
        </AdminLayout>
      </AdminGuard>
    </AppShell>
  );
}
