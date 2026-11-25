import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminPermission } from '@/server/auth/auth-middleware';
import { listAdminSellers, moderateSeller } from '@/server/admin/admin-service';
import { apiSuccess, handleApiError, readJsonBody, ValidationError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

const ModerateSellerSchema = z.object({
  sellerId: z.string().min(2),
  status: z.enum(['pending_review', 'approved', 'rejected', 'suspended']),
  reason: z.string().optional(),
});

export async function GET(request: Request): Promise<NextResponse> {
  try {
    await requireAdminPermission(request, 'sellers:read');
    const query = new URL(request.url).searchParams.get('q') || undefined;
    const result = await listAdminSellers(query);
    return apiSuccess(result.sellers, {
      meta: { total: result.sellers.length, applications: result.applications },
    });
  } catch (error) {
    return handleApiError(request, error, 'GET /api/admin/sellers');
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const auth = await requireAdminPermission(request, 'sellers:moderate');
    const body = await readJsonBody(request, 16384);
    const parsed = ModerateSellerSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid moderation payload', parsed.error.flatten().fieldErrors);
    }

    const updated = await moderateSeller({
      ...parsed.data,
      actorId: auth.customer.id,
      actorName: `${auth.customer.firstName} ${auth.customer.lastName}`,
      actorRole: auth.customer.adminRole || 'admin',
    });

    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(request, error, 'PATCH /api/admin/sellers');
  }
}
