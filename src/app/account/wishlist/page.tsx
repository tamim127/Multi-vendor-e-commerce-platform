import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { AccountLayout } from '@/features/account';
import { WishlistPageView } from '@/features/wishlist';

export const metadata: Metadata = {
  title: 'My Wishlist | Marketplace',
  description: 'Saved items to buy later across verified marketplace sellers.',
};

export default function AccountWishlistPage(): React.JSX.Element {
  return (
    <AppShell>
      <AccountLayout>
        <WishlistPageView />
      </AccountLayout>
    </AppShell>
  );
}
