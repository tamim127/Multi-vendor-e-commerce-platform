import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminPermission } from '@/server/auth/auth-middleware';
import { listAndReviewReturns } from '@/server/admin/admin-service';
import { apiSuccess, handleApiError, readJsonBody, ValidationError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

const ReviewReturnSchema = z.object({
  returnId: z.string().min(3),
  status: z.enum(['approved', 'rejected', 'completed']),
  adminNote: z.string().optional(),
});

export async function GET(request: Request): Promise<NextResponse> {
  try {
    await requireAdminPermission(request, 'orders:read');
    const returns = await listAndReviewReturns({ mode: 'list' });
    return apiSuccess(returns);
  } catch (error) {
    return handleApiError(request, error, 'GET /api/admin/returns');
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const auth = await requireAdminPermission(request, 'orders:write');
    const body = await readJsonBody(request, 16384);
    const parsed = ReviewReturnSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid return review payload', parsed.error.flatten().fieldErrors);
    }

    const updated = await listAndReviewReturns({
      mode: 'review',
      ...parsed.data,
      actorId: auth.customer.id,
      actorName: `${auth.customer.firstName} ${auth.customer.lastName}`,
      actorRole: auth.customer.adminRole || 'admin',
    });
    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(request, error, 'PATCH /api/admin/returns');
  }
}
