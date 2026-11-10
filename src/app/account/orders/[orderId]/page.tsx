import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { AccountLayout, OrderDetailView } from '@/features/account';

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { orderId } = await params;
  return {
    title: `Order ${orderId} | Marketplace`,
    description: `Track delivery and view details for order ${orderId}.`,
  };
}

export default async function OrderDetailPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { orderId } = await params;

  return (
    <AppShell>
      <AccountLayout>
        <OrderDetailView orderId={orderId} />
      </AccountLayout>
    </AppShell>
  );
}
