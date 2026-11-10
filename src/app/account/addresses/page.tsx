import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { AccountLayout, AddressesPageView } from '@/features/account';

export const metadata: Metadata = {
  title: 'Address Book | Marketplace',
  description: 'Manage shipping and billing addresses for fast and seamless checkout.',
};

export default function AddressesPage(): React.JSX.Element {
  return (
    <AppShell>
      <AccountLayout>
        <AddressesPageView />
      </AccountLayout>
    </AppShell>
  );
}
