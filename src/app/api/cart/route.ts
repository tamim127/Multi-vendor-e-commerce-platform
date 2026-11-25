import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  addCartItem,
  clearPersistedCart,
  getPersistedCart,
  removeCartLine,
  updateCartLineQuantity,
  type CartIdentity,
} from '@/server/commerce/cart-service';
import { GUEST_CART_COOKIE_NAME, verifyCsrfTokenMatch } from '@/server/auth/session-service';
import { getAuthContext, getCookieValue } from '@/server/auth/auth-middleware';
import { applySecurityHeaders } from '@/server/security/headers';
import { ForbiddenError, handleApiError, readJsonBody, ValidationError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

const CartActionSchema = z.object({
  action: z.enum(['add', 'update', 'remove', 'clear', 'get']),
  offerId: z.string().optional(),
  productId: z.string().optional(),
  variantId: z.string().optional(),
  variantLabel: z.string().optional(),
  itemId: z.string().optional(),
  quantity: z.number().int().optional(),
});

function isHttpsRequest(request?: Request): boolean {
  if (process.env['FORCE_SECURE_COOKIES'] === 'true') return true;
  if (!request) return process.env.NODE_ENV === 'production';
  const proto = request.headers.get('x-forwarded-proto');
  if (proto) return proto.split(',')[0]?.trim() === 'https';
  return request.url.startsWith('https://');
}

function attachGuestCartCookie(
  response: NextResponse,
  rawGuestToken?: string,
  request?: Request
): void {
  if (!rawGuestToken) return;
  response.cookies.set(GUEST_CART_COOKIE_NAME, rawGuestToken, {
    httpOnly: true,
    secure: isHttpsRequest(request),
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

async function resolveCartIdentity(request: Request, verifyCsrfOnCookie = false): Promise<CartIdentity> {
  const auth = await getAuthContext(request);
  if (auth) {
    if (verifyCsrfOnCookie && auth.tokenSource === 'cookie') {
      const csrfHeader = request.headers.get('x-csrf-token');
      if (!verifyCsrfTokenMatch(csrfHeader, auth.csrfTokenHash)) {
        throw new ForbiddenError('Invalid or missing CSRF token.');
      }
    }
    return { customerId: auth.customer.id };
  }

  const guestToken = getCookieValue(request, GUEST_CART_COOKIE_NAME) || undefined;
  return { guestToken };
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const identity = await resolveCartIdentity(request, false);
    const result = await getPersistedCart(identity);
    const res = NextResponse.json({
      success: true,
      data: result.cart,
      cartId: result.cartId,
    });
    res.headers.set('Cache-Control', 'no-store');
    return applySecurityHeaders(res);
  } catch (error) {
    return handleApiError(request, error, 'GET /api/cart');
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const identity = await resolveCartIdentity(request, true);
    const body = await readJsonBody(request, 32768);
    const parsed = CartActionSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid cart action payload', parsed.error.flatten().fieldErrors);
    }

    const { action, offerId, productId, variantId, variantLabel, itemId, quantity } = parsed.data;
    let result;

    switch (action) {
      case 'get':
        result = await getPersistedCart(identity);
        break;
      case 'add':
        if (!productId) {
          throw new ValidationError('productId is required to add an item to cart.');
        }
        result = await addCartItem(identity, {
          offerId,
          productId,
          variantId,
          variantLabel,
          quantity: quantity ?? 1,
        });
        break;
      case 'update':
        if (!itemId || quantity === undefined) {
          throw new ValidationError('itemId and quantity are required to update cart item.');
        }
        result = await updateCartLineQuantity(identity, itemId, quantity);
        break;
      case 'remove':
        if (!itemId) {
          throw new ValidationError('itemId is required to remove cart item.');
        }
        result = await removeCartLine(identity, itemId);
        break;
      case 'clear':
        result = await clearPersistedCart(identity);
        break;
    }

    const res = NextResponse.json({
      success: true,
      data: result.cart,
      cartId: result.cartId,
    });
    attachGuestCartCookie(res, result.newGuestToken, request);
    res.headers.set('Cache-Control', 'no-store');
    return applySecurityHeaders(res);
  } catch (error) {
    return handleApiError(request, error, 'POST /api/cart');
  }
}
