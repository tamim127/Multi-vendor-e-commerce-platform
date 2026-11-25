import { NextResponse } from 'next/server';
import { z } from 'zod';
import { resetPasswordWithToken } from '@/server/auth/session-service';
import { apiSuccess, handleApiError, readJsonBody, ValidationError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

const ResetSchema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(8).max(128),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await readJsonBody(request, 16384);
    const parsed = ResetSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid password reset payload', parsed.error.flatten().fieldErrors);
    }

    await resetPasswordWithToken(parsed.data.token, parsed.data.newPassword);
    return apiSuccess({ reset: true, message: 'Password updated and active sessions revoked.' });
  } catch (error) {
    return handleApiError(request, error, 'POST /api/auth/reset-password');
  }
}
