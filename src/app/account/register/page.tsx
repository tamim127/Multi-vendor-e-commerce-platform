import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { RegisterPageView } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Create Account | Aureon Marketplace',
  description:
    'Join the multi-vendor marketplace to discover thousands of verified merchant products.',
};

export default function AccountRegisterPage(): React.JSX.Element {
  return (
    <AppShell hideBottomNav>
      <React.Suspense
        fallback={
          <div className="py-16 text-center text-xs text-fg-muted">Loading register...</div>
        }
      >
        <RegisterPageView />
      </React.Suspense>
    </AppShell>
  );
}

