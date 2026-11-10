import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { SellerLayout, SellerOrdersView } from '@/features/seller';

export const metadata: Metadata = {
  title: 'Seller Orders | Marketplace Seller Central',
  description: 'Manage and fulfill seller packages, assign carriers, and track customer delivery.',
};

export default function SellerOrdersPage(): React.JSX.Element {
  return (
    <AppShell>
      <SellerLayout
        title="Fulfillment & Order Packages"
        subtitle="Process pending packages, assign carrier tracking, and update shipment statuses."
      >
        <SellerOrdersView />
      </SellerLayout>
    </AppShell>
  );
}
