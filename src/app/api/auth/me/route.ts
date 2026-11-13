import { NextResponse } from 'next/server';
import { DEMO_CUSTOMER } from '@/domains/customer/fixtures/customer.fixture';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    const isAuthenticated = Boolean(authHeader || cookieHeader?.includes('aureon_session'));

    return NextResponse.json({
      success: true,
      data: {
        customer: DEMO_CUSTOMER,
        isAuthenticated,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve session profile', details: message },
      { status: 500 }
    );
  }
}

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  response.cookies.delete('aureon_session');
  return response;
}
