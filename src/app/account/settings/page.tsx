import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { AccountLayout, SettingsPageView } from '@/features/account';

export const metadata: Metadata = {
  title: 'Account Settings | Marketplace',
  description: 'Manage preferences, notification options, security settings, and credentials.',
};

export default function SettingsPage(): React.JSX.Element {
  return (
    <AppShell>
      <AccountLayout>
        <SettingsPageView />
      </AccountLayout>
    </AppShell>
  );
}
