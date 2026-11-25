import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSellerAccess } from '@/server/auth/auth-middleware';
import { adjustSellerInventory } from '@/server/seller/seller-service';
import { apiSuccess, handleApiError, readJsonBody, ValidationError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

const AdjustStockSchema = z.object({
  offerId: z.string().min(3),
  delta: z.number().int().min(-10000).max(10000),
  reason: z.string().min(2).max(255).default('Manual inventory adjustment'),
});

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const requestedSellerId = new URL(request.url).searchParams.get('sellerId');
    const { auth, membership } = await requireSellerAccess(request, requestedSellerId);
    const body = await readJsonBody(request, 16384);
    const parsed = AdjustStockSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid inventory adjustment payload', parsed.error.flatten().fieldErrors);
    }

    const result = await adjustSellerInventory({
      offerId: parsed.data.offerId,
      sellerId: membership.sellerId,
      actorId: auth.customer.id,
      delta: parsed.data.delta,
      reason: parsed.data.reason,
    });

    return apiSuccess(result);
  } catch (error) {
    return handleApiError(request, error, 'PATCH /api/seller/inventory');
  }
}
