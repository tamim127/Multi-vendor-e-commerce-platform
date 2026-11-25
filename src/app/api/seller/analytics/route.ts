import { NextResponse } from 'next/server';
import { requireSellerAccess } from '@/server/auth/auth-middleware';
import { getSellerRealAnalytics } from '@/server/seller/seller-service';
import { apiSuccess, handleApiError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const requestedSellerId = searchParams.get('sellerId');
    const { membership } = await requireSellerAccess(request, requestedSellerId);
    const timeframe = searchParams.get('timeframe') || 'last_30_days';

    const data = await getSellerRealAnalytics(membership.sellerId, timeframe);
    return apiSuccess(data);
  } catch (error) {
    return handleApiError(request, error, 'GET /api/seller/analytics');
  }
}
