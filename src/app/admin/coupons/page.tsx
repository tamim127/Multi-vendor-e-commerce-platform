import * as React from 'react';
import type { Metadata } from 'next';
import { AdminLayout, AdminGuard, AdminCouponsView } from '@/features/admin';

export const metadata: Metadata = {
  title: 'Discount Coupons | Admin Platform',
  description: 'Manage promotion codes, coupon campaigns, and discount parameters.',
};

export default function AdminCouponsPage(): React.JSX.Element {
  return (
    <AdminGuard requiredPermission="promotions:read">
      <AdminLayout
        title="Promotional Coupons & Vouchers"
        subtitle="Provision promotional discount vouchers, redemption rules, and checkout minimum thresholds."
      >
        <AdminCouponsView />
      </AdminLayout>
    </AdminGuard>
  );
}
