import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/server/auth/auth-middleware';
import { submitSellerOnboardingApplication } from '@/server/seller/seller-service';
import { apiSuccess, handleApiError, readJsonBody, ValidationError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

const ApplySellerSchema = z.object({
  storeName: z.string().min(2).max(255),
  storeSlug: z.string().min(2).max(255),
  storeDescription: z.string().min(10).max(4000),
  businessInfo: z.record(z.unknown()).default({}),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const auth = await requireAuth(request);
    const body = await readJsonBody(request, 32768);
    const parsed = ApplySellerSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid seller application payload', parsed.error.flatten().fieldErrors);
    }

    const application = await submitSellerOnboardingApplication(auth.customer.id, {
      ...parsed.data,
      contactEmail: auth.customer.email,
    });

    return apiSuccess(application, { status: 201 });
  } catch (error) {
    return handleApiError(request, error, 'POST /api/seller/apply');
  }
}
