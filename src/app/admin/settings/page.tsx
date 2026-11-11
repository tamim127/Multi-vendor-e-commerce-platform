import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { AdminLayout, AdminGuard, AdminSettingsView } from '@/features/admin';

export const metadata: Metadata = {
  title: 'Platform Settings | Admin Platform',
  description: 'Manage marketplace configuration, commission rates, policies, and feature flags.',
};

export default function AdminSettingsPage(): React.JSX.Element {
  return (
    <AppShell>
      <AdminGuard requiredPermission="settings:read">
        <AdminLayout
          title="Marketplace Platform Settings"
          subtitle="Configure default commission take-rates, merchant verification standards, and operational parameters."
        >
          <AdminSettingsView />
        </AdminLayout>
      </AdminGuard>
    </AppShell>
  );
}
