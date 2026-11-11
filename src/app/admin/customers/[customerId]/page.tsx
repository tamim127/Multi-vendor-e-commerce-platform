import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { AdminLayout, AdminGuard, AdminCustomerDetailView } from '@/features/admin';

interface PageProps {
  params: Promise<{ customerId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { customerId } = await params;
  return {
    title: `Customer ${customerId} | Admin Platform`,
    description: `Inspect buyer profile, order history, and account moderation notes for ${customerId}.`,
  };
}

export default async function AdminCustomerDetailPage({
  params,
}: PageProps): Promise<React.JSX.Element> {
  const { customerId } = await params;

  return (
    <AppShell>
      <AdminGuard requiredPermission="customers:read">
        <AdminLayout>
          <AdminCustomerDetailView customerId={customerId} />
        </AdminLayout>
      </AdminGuard>
    </AppShell>
  );
}
