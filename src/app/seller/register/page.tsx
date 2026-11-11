import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { SellerOnboardingView } from '@/features/seller';

export const metadata: Metadata = {
  title: 'Merchant Registration | Become a Seller',
  description: 'Apply to become an authorized marketplace vendor and sell to global customers.',
};

export default function SellerRegisterPage(): React.JSX.Element {
  return (
    <AppShell>
      <SellerOnboardingView />
    </AppShell>
  );
}
