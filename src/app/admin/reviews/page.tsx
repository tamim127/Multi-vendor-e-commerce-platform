import * as React from 'react';
import type { Metadata } from 'next';
import { AdminLayout, AdminGuard, AdminReviewsView } from '@/features/admin';

export const metadata: Metadata = {
  title: 'Content Moderation | Admin Platform',
  description: 'Moderate customer reviews, spam reports, and community standard compliance.',
};

export default function AdminReviewsPage(): React.JSX.Element {
  return (
    <AdminGuard requiredPermission="reviews:read">
      <AdminLayout
        title="Review & Content Moderation"
        subtitle="Triage flagged customer reviews, investigate reported spam, and moderate published feedback."
      >
        <AdminReviewsView />
      </AdminLayout>
    </AdminGuard>
  );
}
