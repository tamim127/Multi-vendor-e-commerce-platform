import { NextResponse } from 'next/server';
import { requireAdminPermission } from '@/server/auth/auth-middleware';
import { getAdminRealMetrics } from '@/server/admin/admin-service';
import { apiSuccess, handleApiError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  try {
    await requireAdminPermission(request, 'analytics:read');
    const timeframe = new URL(request.url).searchParams.get('timeframe') || 'last_30_days';
    const data = await getAdminRealMetrics(timeframe);
    return apiSuccess(data);
  } catch (error) {
    return handleApiError(request, error, 'GET /api/admin/metrics');
  }
}
