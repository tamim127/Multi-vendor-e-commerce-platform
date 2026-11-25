import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/server/auth/auth-middleware';
import { updateCustomerProfileAndPreferences } from '@/server/customer/customer-service';
import { apiSuccess, handleApiError, readJsonBody, ValidationError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

const UpdateProfileSchema = z.object({
  firstName: z.string().min(1).max(128).optional(),
  lastName: z.string().min(1).max(128).optional(),
  phoneNumber: z.string().max(64).nullable().optional(),
  preferences: z
    .object({
      language: z.enum(['en', 'bn', 'ar', 'hi']).optional(),
      currency: z.enum(['USD', 'EUR', 'GBP', 'BDT', 'AED', 'SAR']).optional(),
      newsletterSubscribed: z.boolean().optional(),
      orderUpdatesEmail: z.boolean().optional(),
      orderUpdatesSms: z.boolean().optional(),
      twoFactorEnabled: z.boolean().optional(),
    })
    .optional(),
});

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const auth = await requireAuth(request);
    return apiSuccess(auth.customer);
  } catch (error) {
    return handleApiError(request, error, 'GET /api/customer/profile');
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const auth = await requireAuth(request);
    const body = await readJsonBody(request, 16384);
    const parsed = UpdateProfileSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid profile update payload', parsed.error.flatten().fieldErrors);
    }

    const updated = await updateCustomerProfileAndPreferences(auth.customer.id, parsed.data);
    return apiSuccess({
      id: updated.id,
      email: updated.email,
      firstName: updated.first_name,
      lastName: updated.last_name,
      phoneNumber: updated.phone || undefined,
      status: updated.status,
      emailVerified: Boolean(updated.email_verified),
      preferences: updated.preferences,
      updatedAt: new Date(updated.updated_at).toISOString(),
    });
  } catch (error) {
    return handleApiError(request, error, 'PATCH /api/customer/profile');
  }
}
