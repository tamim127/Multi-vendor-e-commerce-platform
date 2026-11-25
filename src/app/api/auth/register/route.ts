import { NextResponse } from 'next/server';
import { RegisterSchema } from '@/domains/customer/schemas/auth.schema';
import { GUEST_CART_COOKIE_NAME, registerCustomer } from '@/server/auth/session-service';
import { attachAuthCookies, getCookieValue } from '@/server/auth/auth-middleware';
import { mergeGuestCartIntoCustomerCart } from '@/server/commerce/cart-service';
import { checkRateLimit, extractClientIp } from '@/server/security/rate-limiter';
import { applySecurityHeaders } from '@/server/security/headers';
import { handleApiError, readJsonBody, ValidationError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  const rate = checkRateLimit(request, { maxRequests: 10, windowSeconds: 60, prefix: 'auth_register' });
  if (!rate.isAllowed) {
    return applySecurityHeaders(
      NextResponse.json(
        { success: false, error: 'Too Many Registration Attempts', retryAfter: rate.resetSeconds },
        { status: 429 }
      )
    );
  }

  try {
    const body = await readJsonBody(request, 65536);
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Registration validation failed', parsed.error.flatten().fieldErrors);
    }

    const result = await registerCustomer(parsed.data, {
      userAgent: request.headers.get('user-agent'),
      ipAddress: extractClientIp(request),
    });

    const guestCartToken = getCookieValue(request, GUEST_CART_COOKIE_NAME);
    if (guestCartToken) {
      await mergeGuestCartIntoCustomerCart(guestCartToken, result.customer.id);
    }

    const response = NextResponse.json(
      {
        success: true,
        data: {
          customer: result.customer,
          token: result.sessionToken,
          csrfToken: result.csrfToken,
          expiresIn: result.expiresIn,
          expiresAt: result.expiresAt,
          emailDelivery: result.emailDelivery,
          ...(result.verificationTokenPreview ? { verificationTokenPreview: result.verificationTokenPreview } : {}),
          message: 'Account created successfully.',
        },
      },
      { status: 201 }
    );

    attachAuthCookies(response, result.sessionToken, result.csrfToken, result.expiresIn, request);
    response.headers.set('Cache-Control', 'no-store');
    return applySecurityHeaders(response);
  } catch (error) {
    return handleApiError(request, error, 'POST /api/auth/register');
  }
}
