import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminPermission } from '@/server/auth/auth-middleware';
import { listAndReviewRefunds } from '@/server/admin/admin-service';
import { apiSuccess, handleApiError, readJsonBody, ValidationError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

const ReviewRefundSchema = z.object({
  refundId: z.string().min(3),
  status: z.enum(['approved', 'rejected']),
  adminNote: z.string().optional(),
});

export async function GET(request: Request): Promise<NextResponse> {
  try {
    await requireAdminPermission(request, 'refunds:read');
    const refunds = await listAndReviewRefunds({ mode: 'list' });
    return apiSuccess(refunds, { meta: { paymentGatewayConfigured: Boolean(process.env['PAYMENT_GATEWAY_SECRET']) } });
  } catch (error) {
    return handleApiError(request, error, 'GET /api/admin/refunds');
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const auth = await requireAdminPermission(request, 'refunds:process');
    const body = await readJsonBody(request, 16384);
    const parsed = ReviewRefundSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid refund review payload', parsed.error.flatten().fieldErrors);
    }

    const updated = await listAndReviewRefunds({
      mode: 'review',
      ...parsed.data,
      actorId: auth.customer.id,
      actorName: `${auth.customer.firstName} ${auth.customer.lastName}`,
      actorRole: auth.customer.adminRole || 'admin',
    });
    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(request, error, 'PATCH /api/admin/refunds');
  }
}
