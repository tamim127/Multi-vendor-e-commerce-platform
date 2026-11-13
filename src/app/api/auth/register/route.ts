import { NextResponse } from 'next/server';
import { RegisterSchema } from '@/domains/customer/schemas/auth.schema';
import type { Customer } from '@/domains/customer/types/customer';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Registration validation failed',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, firstName, lastName, phoneNumber } = parsed.data;
    const now = new Date().toISOString();

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      email,
      firstName,
      lastName,
      phoneNumber,
      status: 'active',
      emailVerified: false,
      preferences: {
        language: 'en',
        currency: 'USD',
        newsletterSubscribed: true,
        orderUpdatesEmail: true,
        orderUpdatesSms: Boolean(phoneNumber),
        twoFactorEnabled: false,
      },
      createdAt: now,
      updatedAt: now,
    };

    const token = `aureon_jwt_${Buffer.from(JSON.stringify({ sub: newCustomer.id, email: newCustomer.email, exp: Date.now() + 86400000 })).toString('base64url')}`;

    const response = NextResponse.json({
      success: true,
      data: {
        customer: newCustomer,
        token,
        message: 'Account created successfully. Welcome to Aureon Marketplace!',
      },
    }, { status: 201 });

    response.cookies.set('aureon_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Registration service failed', details: message },
      { status: 500 }
    );
  }
}
