import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { AdminLayout, AdminGuard, AdminOrderDetailView } from '@/features/admin';

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { orderId } = await params;
  return {
    title: `Order #${orderId} | Admin Oversight`,
    description: `Order supervision, split vendor fulfillment, and audit timeline for #${orderId}.`,
  };
}

export default async function AdminOrderDetailPage({
  params,
}: PageProps): Promise<React.JSX.Element> {
  const { orderId } = await params;

  return (
    <AppShell>
      <AdminGuard requiredPermission="orders:read">
        <AdminLayout>
          <AdminOrderDetailView orderId={orderId} />
        </AdminLayout>
      </AdminGuard>
    </AppShell>
  );
}
