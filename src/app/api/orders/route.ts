import { NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth/auth-middleware';
import { listCustomerOrders } from '@/server/customer/customer-service';
import { apiSuccess, handleApiError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const auth = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const q = searchParams.get('q') || undefined;

    // Strictly scoped to authenticated customer ID (never trusts ?customerId query param)
    const orders = await listCustomerOrders(auth.customer.id, { status, q });
    return apiSuccess(orders, { meta: { total: orders.length } });
  } catch (error) {
    return handleApiError(request, error, 'GET /api/orders');
  }
}
