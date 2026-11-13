import * as React from 'react';
import type { Metadata } from 'next';
import { AdminLayout, AdminGuard, AdminSettingsView } from '@/features/admin';

export const metadata: Metadata = {
  title: 'Platform Settings | Admin Platform',
  description: 'Manage platform take-rates, policies, merchant onboarding rules, and feature flags.',
};

export default function AdminSettingsPage(): React.JSX.Element {
  return (
    <AdminGuard requiredPermission="settings:read">
      <AdminLayout
        title="Platform Configuration & Policies"
        subtitle="Configure default commission take-rate, return windows, feature flags, and marketplace identity."
      >
        <AdminSettingsView />
      </AdminLayout>
    </AdminGuard>
  );
}
