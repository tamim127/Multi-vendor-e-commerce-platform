import * as React from 'react';
import { AppShell } from '@/components/layout/shell/app-shell';
import { PdpNotFound } from '@/features/product-detail';

export default function ProductNotFoundPage(): React.JSX.Element {
  return (
    <AppShell>
      <PdpNotFound />
    </AppShell>
  );
}
