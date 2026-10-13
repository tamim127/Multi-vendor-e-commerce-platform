import * as React from 'react';
import { AppShell } from '@/components/layout/shell/app-shell';
import { PdpSkeleton } from '@/features/product-detail';

export default function ProductLoading(): React.JSX.Element {
  return (
    <AppShell>
      <PdpSkeleton />
    </AppShell>
  );
}
