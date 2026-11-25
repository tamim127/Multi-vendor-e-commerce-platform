import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminPermission } from '@/server/auth/auth-middleware';
import { listAndManagePromotions } from '@/server/admin/admin-service';
import { apiSuccess, handleApiError, readJsonBody, ValidationError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

const CreatePromotionSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().default(''),
  discountPercentage: z.number().int().min(1).max(100),
  bannerText: z.string().optional(),
});

export async function GET(request: Request): Promise<NextResponse> {
  try {
    await requireAdminPermission(request, 'promotions:read');
    const promos = await listAndManagePromotions({ mode: 'list' });
    return apiSuccess(promos);
  } catch (error) {
    return handleApiError(request, error, 'GET /api/admin/promotions');
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const auth = await requireAdminPermission(request, 'promotions:write');
    const body = await readJsonBody(request, 16384);
    const parsed = CreatePromotionSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid promotion payload', parsed.error.flatten().fieldErrors);
    }

    const created = await listAndManagePromotions({
      mode: 'create',
      ...parsed.data,
      actorId: auth.customer.id,
      actorName: `${auth.customer.firstName} ${auth.customer.lastName}`,
      actorRole: auth.customer.adminRole || 'admin',
    });
    return apiSuccess(created, { status: 201 });
  } catch (error) {
    return handleApiError(request, error, 'POST /api/admin/promotions');
  }
}
