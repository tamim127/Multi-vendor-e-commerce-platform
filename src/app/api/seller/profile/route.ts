import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSellerAccess } from '@/server/auth/auth-middleware';
import { getSellerProfile, updateSellerProfile } from '@/server/seller/seller-service';
import { apiSuccess, handleApiError, readJsonBody, ValidationError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  tagline: z.string().max(500).optional(),
  description: z.string().max(4000).optional(),
  contactPhone: z.string().max(64).optional(),
  logoUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
});

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const requestedSellerId = new URL(request.url).searchParams.get('sellerId');
    const { membership } = await requireSellerAccess(request, requestedSellerId);
    const profile = await getSellerProfile(membership.sellerId);
    return apiSuccess(profile);
  } catch (error) {
    return handleApiError(request, error, 'GET /api/seller/profile');
  }
}

export async function PUT(request: Request): Promise<NextResponse> {
  try {
    const requestedSellerId = new URL(request.url).searchParams.get('sellerId');
    const { auth, membership } = await requireSellerAccess(request, requestedSellerId);
    const body = await readJsonBody(request, 32768);
    const parsed = UpdateProfileSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid seller profile update payload', parsed.error.flatten().fieldErrors);
    }

    const updated = await updateSellerProfile(membership.sellerId, auth.customer.id, parsed.data);
    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(request, error, 'PUT /api/seller/profile');
  }
}
