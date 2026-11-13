import * as React from 'react';
import type { Metadata } from 'next';
import { AdminLayout, AdminGuard, AdminSellerDetailView } from '@/features/admin';

interface PageProps {
  params: Promise<{ sellerId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sellerId } = await params;
  return {
    title: `Merchant ${sellerId} | Admin Platform`,
    description: `Inspect KYC credentials, store policies, and compliance status for merchant ${sellerId}.`,
  };
}

export default async function AdminSellerDetailPage({
  params,
}: PageProps): Promise<React.JSX.Element> {
  const { sellerId } = await params;

  return (
    <AdminGuard requiredPermission="sellers:read">
      <AdminLayout>
        <AdminSellerDetailView sellerId={sellerId} />
      </AdminLayout>
    </AdminGuard>
  );
}
