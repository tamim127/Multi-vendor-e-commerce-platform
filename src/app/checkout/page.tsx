import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { Container } from '@/components/layout/container/container';
import { CheckoutPageView } from '@/features/checkout/components/checkout-page-view';

export const metadata: Metadata = {
  title: 'Secure Checkout | Marketplace',
  description: 'Enterprise multi-vendor checkout and order finalization.',
};

export default function CheckoutPage(): React.JSX.Element {
  return (
    <AppShell hideBottomNav>
      <div className="py-6 sm:py-10">
        <Container size="standard">
          <CheckoutPageView />
        </Container>
      </div>
    </AppShell>
  );
}
