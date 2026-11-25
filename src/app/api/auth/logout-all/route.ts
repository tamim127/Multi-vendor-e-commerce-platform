import { NextResponse } from 'next/server';
import { clearAuthCookies, requireAuth } from '@/server/auth/auth-middleware';
import { revokeAllCustomerSessions } from '@/server/auth/session-service';
import { applySecurityHeaders } from '@/server/security/headers';
import { handleApiError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const auth = await requireAuth(request);
    const revokedCount = await revokeAllCustomerSessions(auth.customer.id, 'logout_all_devices');

    const response = NextResponse.json({
      success: true,
      data: { revokedCount },
      message: 'Logged out from all devices.',
    });
    clearAuthCookies(response);
    response.headers.set('Cache-Control', 'no-store');
    return applySecurityHeaders(response);
  } catch (error) {
    return handleApiError(request, error, 'POST /api/auth/logout-all');
  }
}
