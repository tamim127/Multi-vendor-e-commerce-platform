import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { SellerLayout, SellerAnalyticsView } from '@/features/seller';

export const metadata: Metadata = {
  title: 'Seller Analytics | Marketplace Seller Central',
  description: 'Detailed revenue analytics, volume trends, and top selling products.',
};

export default function SellerAnalyticsPage(): React.JSX.Element {
  return (
    <AppShell>
      <SellerLayout
        title="Performance & Analytics"
        subtitle="Track business growth, gross revenue trends, and catalog product rankings."
      >
        <SellerAnalyticsView />
      </SellerLayout>
    </AppShell>
  );
}
