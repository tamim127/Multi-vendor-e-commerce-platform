import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { Container } from '@/components/layout/container/container';
import { CartPageView } from '@/features/cart/components/cart-page-view';

export const metadata: Metadata = {
  title: 'Shopping Cart | Marketplace',
  description: 'View and manage your shopping cart items across verified marketplace merchants.',
};

export default function CartPage(): React.JSX.Element {
  return (
    <AppShell>
      <div className="py-6 sm:py-10">
        <Container size="standard">
          <CartPageView />
        </Container>
      </div>
    </AppShell>
  );
}

