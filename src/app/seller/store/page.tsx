import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { SellerLayout, SellerStoreView } from '@/features/seller';

export const metadata: Metadata = {
  title: 'Store Settings | Marketplace Seller Central',
  description: 'Configure your merchant store branding, support contacts, and return policies.',
};

export default function SellerStorePage(): React.JSX.Element {
  return (
    <AppShell>
      <SellerLayout
        title="Store Management"
        subtitle="Manage storefront branding, customer support channels, and fulfillment policies."
      >
        <SellerStoreView />
      </SellerLayout>
    </AppShell>
  );
}
