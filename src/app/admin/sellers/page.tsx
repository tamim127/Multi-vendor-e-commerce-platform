import * as React from 'react';
import type { Metadata } from 'next';
import { AdminLayout, AdminGuard, AdminSellersView } from '@/features/admin';

export const metadata: Metadata = {
  title: 'Merchant Oversight | Admin Platform',
  description: 'Manage seller applications, enterprise stores, and merchant status moderation.',
};

export default function AdminSellersPage(): React.JSX.Element {
  return (
    <AdminGuard requiredPermission="sellers:read">
      <AdminLayout
        title="Merchant Management & Verification"
        subtitle="Review applications, oversee seller credentials, and enforce marketplace standards."
      >
        <AdminSellersView />
      </AdminLayout>
    </AdminGuard>
  );
}
