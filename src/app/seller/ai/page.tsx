'use client';

import { SellerGuard } from '@/features/seller/components/seller-guard';
import { SellerLayout } from '@/features/seller/components/seller-layout';
import { SellerAiToolsView } from '@/features/ai/seller-ai/seller-ai-tools-view';

export default function SellerAiPage(): React.JSX.Element {
  return (
    <SellerGuard>
      <SellerLayout
        title="Seller AI Optimization Studio"
        subtitle="AI-assisted product title, copy, and SEO generation"
      >
        <SellerAiToolsView />
      </SellerLayout>
    </SellerGuard>
  );
}

