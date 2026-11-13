import * as React from 'react';
import type { Metadata } from 'next';
import { SellerLayout, SellerOrderDetailView } from '@/features/seller';

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { orderId } = await params;
  return {
    title: `Package ${orderId} | Seller Fulfillment`,
    description: `Package details and fulfillment controls for ${orderId}.`,
  };
}

export default async function SellerOrderDetailPage({
  params,
}: PageProps): Promise<React.JSX.Element> {
  const { orderId } = await params;

  return (
    <SellerLayout
      title={`Package ${orderId}`}
      subtitle="Inspect fulfillment details, line items, and customer destination."
    >
      <SellerOrderDetailView orderId={orderId} />
    </SellerLayout>
  );
}
