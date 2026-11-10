import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { AccountLayout, OrdersPageView } from '@/features/account';

export const metadata: Metadata = {
  title: 'Order History | Marketplace',
  description: 'View and track all your previous and in-transit multi-vendor orders.',
};

export default function OrdersPage(): React.JSX.Element {
  return (
    <AppShell>
      <AccountLayout>
        <OrdersPageView />
      </AccountLayout>
    </AppShell>
  );
}
