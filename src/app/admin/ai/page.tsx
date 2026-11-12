'use client';

import { AdminGuard } from '@/features/admin/components/admin-guard';
import { AdminLayout } from '@/features/admin/components/admin-layout';
import { AdminAiView } from '@/features/ai/admin-ai/admin-ai-view';

export default function AdminAiPage(): React.JSX.Element {
  return (
    <AdminGuard requiredPermission="analytics:read">
      <AdminLayout
        title="Marketplace Operations Copilot (AI)"
        subtitle="Executive platform analytics, anomaly summaries, and review moderation assistance"
      >
        <AdminAiView />
      </AdminLayout>
    </AdminGuard>
  );
}

