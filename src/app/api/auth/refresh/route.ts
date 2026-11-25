import { NextResponse } from 'next/server';
import { attachAuthCookies, requireAuth } from '@/server/auth/auth-middleware';
import { rotateSession } from '@/server/auth/session-service';
import { extractClientIp } from '@/server/security/rate-limiter';
import { applySecurityHeaders } from '@/server/security/headers';
import { handleApiError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const auth = await requireAuth(request);
    const rotated = await rotateSession(auth.sessionId, auth.customer.id, {
      userAgent: request.headers.get('user-agent'),
      ipAddress: extractClientIp(request),
    });

    const response = NextResponse.json({
      success: true,
      data: {
        token: rotated.sessionToken,
        csrfToken: rotated.csrfToken,
        expiresIn: rotated.expiresIn,
        expiresAt: rotated.expiresAt,
      },
    });

    attachAuthCookies(response, rotated.sessionToken, rotated.csrfToken, rotated.expiresIn);
    response.headers.set('Cache-Control', 'no-store');
    return applySecurityHeaders(response);
  } catch (error) {
    return handleApiError(request, error, 'POST /api/auth/refresh');
  }
}
