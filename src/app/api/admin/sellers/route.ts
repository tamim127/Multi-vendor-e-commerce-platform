import { NextResponse } from 'next/server';
import { z } from 'zod';
import { MOCK_SELLERS } from '@/domains/catalog/fixtures';

export const dynamic = 'force-dynamic';

const ModerateSellerSchema = z.object({
  sellerId: z.string(),
  status: z.enum(['pending_review', 'approved', 'rejected', 'suspended']),
  reason: z.string().optional(),
});

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase();

    let sellers = [...MOCK_SELLERS];

    if (query) {
      sellers = sellers.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.slug.toLowerCase().includes(query)
      );
    }

    const data = sellers.map((s) => ({
      ...s,
      status: 'approved',
      joinedAt: '2025-11-10T12:00:00Z',
      complianceScore: 98,
      activeProductsCount: 24,
    }));

    return NextResponse.json({
      success: true,
      data,
      total: data.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve sellers list', details: message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = ModerateSellerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid moderation payload', errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { sellerId, status, reason } = parsed.data;

    return NextResponse.json({
      success: true,
      data: {
        sellerId,
        status,
        reason,
        moderatedAt: new Date().toISOString(),
      },
      message: `Seller ${sellerId} status updated to ${status}.`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to moderate seller', details: message },
      { status: 500 }
    );
  }
}
