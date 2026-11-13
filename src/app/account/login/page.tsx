import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { LoginPageView } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Sign In | Aureon Marketplace',
  description: 'Sign in to access your orders, saved addresses, and customer wishlist.',
};

export default function AccountLoginPage(): React.JSX.Element {
  return (
    <AppShell hideBottomNav>
      <React.Suspense
        fallback={<div className="py-16 text-center text-xs text-fg-muted">Loading sign in...</div>}
      >
        <LoginPageView />
      </React.Suspense>
    </AppShell>
  );
}
