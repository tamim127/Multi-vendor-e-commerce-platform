import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminPermission } from '@/server/auth/auth-middleware';
import { listAndModerateReviews } from '@/server/admin/admin-service';
import { apiSuccess, handleApiError, readJsonBody, ValidationError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

const ModerateReviewSchema = z.object({
  reviewId: z.string().min(3),
  status: z.enum(['approved', 'rejected', 'flagged']),
});

export async function GET(request: Request): Promise<NextResponse> {
  try {
    await requireAdminPermission(request, 'reviews:read');
    const reviews = await listAndModerateReviews({ mode: 'list' });
    return apiSuccess(reviews);
  } catch (error) {
    return handleApiError(request, error, 'GET /api/admin/reviews');
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const auth = await requireAdminPermission(request, 'reviews:moderate');
    const body = await readJsonBody(request, 16384);
    const parsed = ModerateReviewSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid review moderation payload', parsed.error.flatten().fieldErrors);
    }

    const updated = await listAndModerateReviews({
      mode: 'moderate',
      ...parsed.data,
      actorId: auth.customer.id,
      actorName: `${auth.customer.firstName} ${auth.customer.lastName}`,
      actorRole: auth.customer.adminRole || 'admin',
    });
    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(request, error, 'PATCH /api/admin/reviews');
  }
}
