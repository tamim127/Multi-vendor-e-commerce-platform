import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { AccountLayout, AccountDashboardView } from '@/features/account';

export const metadata: Metadata = {
  title: 'My Account | Marketplace',
  description: 'Manage your profile, recent orders, saved addresses, and account settings.',
};

export default function AccountPage(): React.JSX.Element {
  return (
    <AppShell>
      <AccountLayout>
        <AccountDashboardView />
      </AccountLayout>
    </AppShell>
  );
}
