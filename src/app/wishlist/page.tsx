import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { Container } from '@/components/layout/container/container';
import { WishlistPageView } from '@/features/wishlist';

export const metadata: Metadata = {
  title: 'My Wishlist | Marketplace',
  description: 'Your saved products across top multi-vendor brands and merchants.',
};

export default function WishlistPage(): React.JSX.Element {
  return (
    <AppShell>
      <div className="py-8 min-h-[calc(100vh-200px)]">
        <Container size="standard">
          <WishlistPageView />
        </Container>
      </div>
    </AppShell>
  );
}
