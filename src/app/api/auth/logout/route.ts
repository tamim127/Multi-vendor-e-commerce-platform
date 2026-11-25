import { NextResponse } from 'next/server';
import { clearAuthCookies, extractSessionToken, requireAuth } from '@/server/auth/auth-middleware';
import { revokeSessionByToken } from '@/server/auth/session-service';
import { applySecurityHeaders } from '@/server/security/headers';
import { handleApiError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Enforce CSRF if cookie-authenticated, or validate bearer token
    const extracted = extractSessionToken(request);
    if (extracted) {
      await requireAuth(request);
      await revokeSessionByToken(extracted.rawToken, 'user_logout');
    }

    const response = NextResponse.json({
      success: true,
      message: 'Session revoked and logged out successfully.',
    });
    clearAuthCookies(response);
    response.headers.set('Cache-Control', 'no-store');
    return applySecurityHeaders(response);
  } catch (error) {
    return handleApiError(request, error, 'POST /api/auth/logout');
  }
}
