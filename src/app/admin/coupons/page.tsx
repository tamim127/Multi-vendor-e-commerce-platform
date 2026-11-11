import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { AdminLayout, AdminGuard, AdminCouponsView } from '@/features/admin';

export const metadata: Metadata = {
  title: 'Discount Coupons | Admin Platform',
  description: 'Manage discount codes, percentage and fixed vouchers, and minimum purchase rules.',
};

export default function AdminCouponsPage(): React.JSX.Element {
  return (
    <AppShell>
      <AdminGuard requiredPermission="promotions:read">
        <AdminLayout
          title="Discount Voucher Management"
          subtitle="Provision coupon codes, redemption thresholds, and monetary discount rules."
        >
          <AdminCouponsView />
        </AdminLayout>
      </AdminGuard>
    </AppShell>
  );
}
