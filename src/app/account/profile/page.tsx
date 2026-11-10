import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { AccountLayout, ProfilePageView } from '@/features/account';

export const metadata: Metadata = {
  title: 'Profile Settings | Marketplace',
  description: 'Update your personal information and contact details.',
};

export default function ProfilePage(): React.JSX.Element {
  return (
    <AppShell>
      <AccountLayout>
        <ProfilePageView />
      </AccountLayout>
    </AppShell>
  );
}
