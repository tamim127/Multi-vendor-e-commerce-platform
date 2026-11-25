import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSellerAccess } from '@/server/auth/auth-middleware';
import { createSellerOfferListing, listSellerOffers } from '@/server/seller/seller-service';
import { apiSuccess, handleApiError, readJsonBody, ValidationError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

const CreateProductOfferSchema = z.object({
  productId: z.string().optional(),
  title: z.string().min(3),
  sku: z.string().min(3),
  priceMinor: z.number().int().positive(),
  compareAtPriceMinor: z.number().int().positive().optional(),
  currency: z.string().length(3).default('USD'),
  stockQuantity: z.number().int().min(0).default(10),
  categoryId: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const requestedSellerId = new URL(request.url).searchParams.get('sellerId');
    const { membership } = await requireSellerAccess(request, requestedSellerId);
    const items = await listSellerOffers(membership.sellerId);
    return apiSuccess(items, { meta: { total: items.length, sellerId: membership.sellerId } });
  } catch (error) {
    return handleApiError(request, error, 'GET /api/seller/products');
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const requestedSellerId = new URL(request.url).searchParams.get('sellerId');
    const { auth, membership } = await requireSellerAccess(request, requestedSellerId);
    const body = await readJsonBody(request, 32768);
    const parsed = CreateProductOfferSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid product listing data', parsed.error.flatten().fieldErrors);
    }

    const offer = await createSellerOfferListing(membership.sellerId, auth.customer.id, parsed.data);
    return apiSuccess(offer, { status: 201 });
  } catch (error) {
    return handleApiError(request, error, 'POST /api/seller/products');
  }
}
