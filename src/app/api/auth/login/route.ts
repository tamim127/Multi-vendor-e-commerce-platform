import { NextResponse } from 'next/server';
import { LoginSchema } from '@/domains/customer/schemas/auth.schema';
import { GUEST_CART_COOKIE_NAME, loginCustomer } from '@/server/auth/session-service';
import { attachAuthCookies, getCookieValue } from '@/server/auth/auth-middleware';
import { mergeGuestCartIntoCustomerCart } from '@/server/commerce/cart-service';
import { checkRateLimit, extractClientIp } from '@/server/security/rate-limiter';
import { applySecurityHeaders } from '@/server/security/headers';
import { handleApiError, readJsonBody, ValidationError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  const rate = checkRateLimit(request, { maxRequests: 10, windowSeconds: 60, prefix: 'auth_login' });
  if (!rate.isAllowed) {
    return applySecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: 'Too Many Login Attempts',
          message: `Too many login attempts detected. Please wait ${rate.resetSeconds} seconds before trying again.`,
        },
        { status: 429 }
      )
    );
  }

  try {
    const body = await readJsonBody(request, 32768);
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Validation failed', parsed.error.flatten().fieldErrors);
    }

    const result = await loginCustomer(parsed.data, {
      userAgent: request.headers.get('user-agent'),
      ipAddress: extractClientIp(request),
    });

    // Merge guest cart into customer persistent cart on login
    const guestCartToken = getCookieValue(request, GUEST_CART_COOKIE_NAME);
    if (guestCartToken) {
      await mergeGuestCartIntoCustomerCart(guestCartToken, result.customer.id);
    }

    const response = NextResponse.json({
      success: true,
      data: {
        customer: result.customer,
        token: result.sessionToken,
        csrfToken: result.csrfToken,
        expiresIn: result.expiresIn,
        expiresAt: result.expiresAt,
      },
    });

    attachAuthCookies(response, result.sessionToken, result.csrfToken, result.expiresIn, request);
    response.headers.set('X-RateLimit-Limit', String(rate.limit));
    response.headers.set('X-RateLimit-Remaining', String(rate.remaining));
    response.headers.set('X-RateLimit-Reset', String(rate.resetSeconds));
    response.headers.set('Cache-Control', 'no-store');
    return applySecurityHeaders(response);
  } catch (error) {
    return handleApiError(request, error, 'POST /api/auth/login');
  }
}
