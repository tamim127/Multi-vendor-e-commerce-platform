import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/server/auth/auth-middleware';
import { confirmEmailVerification, requestEmailVerification } from '@/server/auth/session-service';
import { apiSuccess, handleApiError, readJsonBody, ValidationError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

const VerifySchema = z.object({
  token: z.string().min(10).optional(),
  resend: z.boolean().optional(),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await readJsonBody(request, 16384);
    const parsed = VerifySchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid email verification request', parsed.error.flatten().fieldErrors);
    }

    if (parsed.data.token) {
      await confirmEmailVerification(parsed.data.token);
      return apiSuccess({ verified: true, message: 'Email verified successfully.' });
    }

    const auth = await requireAuth(request);
    const res = await requestEmailVerification(auth.customer.id);
    return apiSuccess({
      verified: false,
      emailDelivery: res.emailDelivery,
      ...(res.verificationTokenPreview ? { verificationTokenPreview: res.verificationTokenPreview } : {}),
    });
  } catch (error) {
    return handleApiError(request, error, 'POST /api/auth/verify-email');
  }
}
