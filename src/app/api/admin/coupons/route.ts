import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminPermission } from '@/server/auth/auth-middleware';
import { listAndManageCoupons } from '@/server/admin/admin-service';
import { apiSuccess, handleApiError, readJsonBody, ValidationError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

const CouponActionSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('create'),
    code: z.string().min(2).max(64),
    description: z.string().default(''),
    discountType: z.enum(['percentage', 'fixed_amount']).default('percentage'),
    discountValue: z.number().int().min(1),
    minOrderMinor: z.number().int().min(0).optional(),
  }),
  z.object({
    mode: z.literal('toggle'),
    couponId: z.string().min(3),
  }),
]);

export async function GET(request: Request): Promise<NextResponse> {
  try {
    await requireAdminPermission(request, 'promotions:read');
    const coupons = await listAndManageCoupons({ mode: 'list' });
    return apiSuccess(coupons);
  } catch (error) {
    return handleApiError(request, error, 'GET /api/admin/coupons');
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const auth = await requireAdminPermission(request, 'promotions:write');
    const body = await readJsonBody(request, 16384);
    const parsed = CouponActionSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid coupon payload', parsed.error.flatten().fieldErrors);
    }

    const result = await listAndManageCoupons({
      ...parsed.data,
      actorId: auth.customer.id,
      actorName: `${auth.customer.firstName} ${auth.customer.lastName}`,
      actorRole: auth.customer.adminRole || 'admin',
    });
    return apiSuccess(result, { status: parsed.data.mode === 'create' ? 201 : 200 });
  } catch (error) {
    return handleApiError(request, error, 'POST /api/admin/coupons');
  }
}
