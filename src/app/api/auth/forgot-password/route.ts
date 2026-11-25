import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requestPasswordReset } from '@/server/auth/session-service';
import { checkRateLimit } from '@/server/security/rate-limiter';
import { applySecurityHeaders } from '@/server/security/headers';
import { apiSuccess, handleApiError, readJsonBody, ValidationError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

const ForgotSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request): Promise<NextResponse> {
  const rate = checkRateLimit(request, { maxRequests: 5, windowSeconds: 60, prefix: 'auth_forgot' });
  if (!rate.isAllowed) {
    return applySecurityHeaders(
      NextResponse.json(
        { success: false, error: 'Too Many Requests', retryAfter: rate.resetSeconds },
        { status: 429 }
      )
    );
  }

  try {
    const body = await readJsonBody(request, 8192);
    const parsed = ForgotSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Valid email address is required.');
    }

    const result = await requestPasswordReset(parsed.data.email);
    // Always returns 200 generic response to prevent account enumeration
    return apiSuccess({
      accepted: result.accepted,
      emailDelivery: result.emailDelivery,
      ...(result.resetTokenPreview ? { resetTokenPreview: result.resetTokenPreview } : {}),
      message: 'If an account matches that email, password reset instructions have been processed.',
    });
  } catch (error) {
    return handleApiError(request, error, 'POST /api/auth/forgot-password');
  }
}
