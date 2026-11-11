import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { AdminLayout, AdminGuard, AdminCustomersView } from '@/features/admin';

export const metadata: Metadata = {
  title: 'Customer Directory | Admin Platform',
  description: 'Manage registered buyer accounts, orders volume, and account standing.',
};

export default function AdminCustomersPage(): React.JSX.Element {
  return (
    <AppShell>
      <AdminGuard requiredPermission="customers:read">
        <AdminLayout
          title="Customer Accounts & Moderation"
          subtitle="Directory of marketplace buyers, spend velocity, and account status controls."
        >
          <AdminCustomersView />
        </AdminLayout>
      </AdminGuard>
    </AppShell>
  );
}
