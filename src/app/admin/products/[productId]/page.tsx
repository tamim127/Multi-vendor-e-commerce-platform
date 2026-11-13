import * as React from 'react';
import type { Metadata } from 'next';
import { AdminLayout, AdminGuard, AdminProductDetailView } from '@/features/admin';

interface PageProps {
  params: Promise<{ productId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { productId } = await params;
  return {
    title: `Product ${productId} | Admin Platform`,
    description: `Inspect canonical specifications and commercial seller offers for product ${productId}.`,
  };
}

export default async function AdminProductDetailPage({
  params,
}: PageProps): Promise<React.JSX.Element> {
  const { productId } = await params;

  return (
    <AdminGuard requiredPermission="catalog:read">
      <AdminLayout>
        <AdminProductDetailView productId={productId} />
      </AdminLayout>
    </AdminGuard>
  );
}
