import { NextResponse } from 'next/server';
import { requireAdminPermission } from '@/server/auth/auth-middleware';
import { listAdminAuditLogs } from '@/server/admin/admin-service';
import { apiSuccess, handleApiError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  try {
    await requireAdminPermission(request, 'audit_logs:read');
    const { searchParams } = new URL(request.url);
    const logs = await listAdminAuditLogs({
      action: searchParams.get('action') || undefined,
      outcome: searchParams.get('outcome') || undefined,
      q: searchParams.get('q') || undefined,
    });
    return apiSuccess(logs, { meta: { total: logs.length } });
  } catch (error) {
    return handleApiError(request, error, 'GET /api/admin/audit-logs');
  }
}
