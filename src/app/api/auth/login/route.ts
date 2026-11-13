import { NextResponse } from 'next/server';
import { LoginSchema } from '@/domains/customer/schemas/auth.schema';
import { DEMO_CUSTOMER } from '@/domains/customer/fixtures/customer.fixture';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
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
        expiresIn: rememberMe ? 2592000 : 86400, // 30 days vs 1 day
      },
    });

    // Set secure cookie
    response.cookies.set('aureon_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: rememberMe ? 2592000 : 86400,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Authentication service failed', details: message },
      { status: 500 }
    );
  }
}
