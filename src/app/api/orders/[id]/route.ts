import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/server/auth/auth-middleware';
import { getCustomerOrderById } from '@/server/customer/customer-service';
import { transitionOrderLifecycle } from '@/server/commerce/order-lifecycle';
import { apiSuccess, handleApiError, NotFoundError, readJsonBody, ValidationError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const OrderActionSchema = z.object({
  action: z.enum(['cancel']),
  reason: z.string().min(3).max(500).optional(),
});

export async function GET(request: Request, context: RouteContext): Promise<NextResponse> {
  try {
    const auth = await requireAuth(request);
    const { id } = await context.params;
    const isAdmin = auth.customer.role === 'admin';
    const order = await getCustomerOrderById(auth.customer.id, decodeURIComponent(id), isAdmin);

    if (!order) {
      throw new NotFoundError(`Order not found with identifier: ${id}`);
    }

    return apiSuccess(order);
  } catch (error) {
    return handleApiError(request, error, 'GET /api/orders/[id]');
  }
}

export async function PATCH(request: Request, context: RouteContext): Promise<NextResponse> {
  try {
    const auth = await requireAuth(request);
    const { id } = await context.params;
    const body = await readJsonBody(request, 16384);
    const parsed = OrderActionSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid order action payload', parsed.error.flatten().fieldErrors);
    }

    // Verify ownership before mutating
    const existing = await getCustomerOrderById(auth.customer.id, decodeURIComponent(id), false);
    if (!existing) {
      throw new NotFoundError(`Order not found or does not belong to customer: ${id}`);
    }

    const result = await transitionOrderLifecycle({
      orderId: existing.orderId,
      targetStatus: 'cancelled',
      actorId: auth.customer.id,
      actorRole: 'customer',
      reason: parsed.data.reason || 'Cancelled by customer',
    });

    return apiSuccess(result);
  } catch (error) {
    return handleApiError(request, error, 'PATCH /api/orders/[id]');
  }
}
