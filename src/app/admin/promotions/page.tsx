import * as React from 'react';
import type { Metadata } from 'next';
import { AdminLayout, AdminGuard, AdminPromotionsView } from '@/features/admin';

export const metadata: Metadata = {
  title: 'Marketing Promotions | Admin Platform',
  description: 'Manage store-wide promotional events, sale banners, and merchandising campaigns.',
};

export default function AdminPromotionsPage(): React.JSX.Element {
  return (
    <AdminGuard requiredPermission="promotions:read">
      <AdminLayout
        title="Campaigns & Promotional Events"
        subtitle="Configure marketing banners, seasonal discount events, and merchandising campaigns."
      >
        <AdminPromotionsView />
      </AdminLayout>
    </AdminGuard>
  );
}
