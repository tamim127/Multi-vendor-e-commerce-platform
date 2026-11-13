import { NextResponse } from 'next/server';
import { LoginSchema } from '@/domains/customer/schemas/auth.schema';
import { DEMO_CUSTOMER } from '@/domains/customer/fixtures/customer.fixture';
import { checkRateLimit } from '@/server/security/rate-limiter';
import { applySecurityHeaders } from '@/server/security/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  // Stricter rate limit for authentication (10 attempts / min per IP)
  const rate = checkRateLimit(request, { maxRequests: 10, windowSeconds: 60, prefix: 'auth_login' });
  if (!rate.isAllowed) {
    const rateRes = NextResponse.json(
      {
        success: false,
        error: 'Too Many Login Attempts',
        message: `Too many login attempts detected. Please wait ${rate.resetSeconds} seconds before trying again.`,
      },
      { status: 429 }
    );
    return applySecurityHeaders(rateRes);
  }

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      const errRes = NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
      return applySecurityHeaders(errRes);
    }

    const { email, rememberMe } = parsed.data;

    // Deterministic mock session creation
    const customer = {
      ...DEMO_CUSTOMER,
      email,
      firstName: email.split('@')[0]?.split('.')[0] || DEMO_CUSTOMER.firstName,
      lastName: email.split('@')[0]?.split('.')[1] || DEMO_CUSTOMER.lastName,
    };

    const token = `aureon_jwt_${Buffer.from(JSON.stringify({ sub: customer.id, email: customer.email, exp: Date.now() + 86400000 })).toString('base64url')}`;

    const response = NextResponse.json({
      success: true,
      data: {
        customer,
        token,
        expiresIn: rememberMe ? 2592000 : 86400,
      },
    });

    response.cookies.set('aureon_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: rememberMe ? 2592000 : 86400,
    });

    response.headers.set('X-RateLimit-Limit', String(rate.limit));
    response.headers.set('X-RateLimit-Remaining', String(rate.remaining));
    response.headers.set('X-RateLimit-Reset', String(rate.resetSeconds));

    return applySecurityHeaders(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const errRes = NextResponse.json(
      { success: false, error: 'Authentication service failed', details: message },
      { status: 500 }
    );
    return applySecurityHeaders(errRes);
  }
}
