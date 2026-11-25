import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/server/auth/auth-middleware';
import { getCustomerWishlist, mutateCustomerWishlist } from '@/server/customer/customer-service';
import { handleApiError, readJsonBody, ValidationError } from '@/server/security/http';
import { applySecurityHeaders } from '@/server/security/headers';

export const dynamic = 'force-dynamic';

const WishlistActionSchema = z.object({
  action: z.enum(['toggle', 'add', 'remove', 'get']),
  productId: z.string().optional(),
});

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const auth = await requireAuth(request);
    const items = await getCustomerWishlist(auth.customer.id);
    const res = NextResponse.json({
      success: true,
      data: {
        productIds: items.map((i) => i.productId),
        items,
        total: items.length,
      },
    });
    res.headers.set('Cache-Control', 'no-store');
    return applySecurityHeaders(res);
  } catch (error) {
    return handleApiError(request, error, 'GET /api/wishlist');
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const auth = await requireAuth(request);
    const body = await readJsonBody(request, 16384);
    const parsed = WishlistActionSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid wishlist action payload', parsed.error.flatten().fieldErrors);
    }

    const { action, productId } = parsed.data;
    if (action !== 'get' && !productId) {
      throw new ValidationError('productId is required for wishlist mutations.');
    }

    const items = await mutateCustomerWishlist(auth.customer.id, action, productId);
    const res = NextResponse.json({
      success: true,
      data: {
        productIds: items.map((i) => i.productId),
        items,
        total: items.length,
      },
    });
    res.headers.set('Cache-Control', 'no-store');
    return applySecurityHeaders(res);
  } catch (error) {
    return handleApiError(request, error, 'POST /api/wishlist');
  }
}
