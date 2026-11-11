import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { AdminLayout, AdminGuard, AdminAuditLogsView } from '@/features/admin';

export const metadata: Metadata = {
  title: 'Compliance Audit Logs | Admin Platform',
  description:
    'Append-only immutable record of administrative actions, status transitions, and config updates.',
};

export default function AdminAuditLogsPage(): React.JSX.Element {
  return (
    <AppShell>
      <AdminGuard requiredPermission="audit_logs:read">
        <AdminLayout
          title="Compliance & Security Audit Trail"
          subtitle="Immutable chronological ledger of administrative interventions and operational changes."
        >
          <AdminAuditLogsView />
        </AdminLayout>
      </AdminGuard>
    </AppShell>
  );
}
