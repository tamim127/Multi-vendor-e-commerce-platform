import { NextResponse } from 'next/server';
import { getAuthContext, clearAuthCookies } from '@/server/auth/auth-middleware';
import { revokeSessionByToken } from '@/server/auth/session-service';
import { applySecurityHeaders } from '@/server/security/headers';
import { handleApiError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const auth = await getAuthContext(request);
    const res = NextResponse.json({
      success: true,
      data: {
        customer: auth?.customer ?? null,
        isAuthenticated: Boolean(auth),
        expiresAt: auth?.expiresAt ?? null,
      },
    });
    res.headers.set('Cache-Control', 'no-store');
    return applySecurityHeaders(res);
  } catch (error) {
    return handleApiError(request, error, 'GET /api/auth/me');
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const auth = await getAuthContext(request);
    if (auth) {
      await revokeSessionByToken(auth.rawToken, 'user_logout');
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
    clearAuthCookies(response);
    response.headers.set('Cache-Control', 'no-store');
    return applySecurityHeaders(response);
  } catch (error) {
    return handleApiError(request, error, 'POST /api/auth/me');
  }
}
