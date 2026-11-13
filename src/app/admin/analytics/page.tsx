import * as React from 'react';
import type { Metadata } from 'next';
import { AdminLayout, AdminGuard, AdminAnalyticsView } from '@/features/admin';

export const metadata: Metadata = {
  title: 'Financial Analytics | Admin Platform',
  description: 'Review GMV velocity, platform net revenue, average order values, and merchant performance.',
};

export default function AdminAnalyticsPage(): React.JSX.Element {
  return (
    <AdminGuard requiredPermission="analytics:read">
      <AdminLayout>
        <AdminAnalyticsView />
      </AdminLayout>
    </AdminGuard>
  );
}
