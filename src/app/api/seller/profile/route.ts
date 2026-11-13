import { NextResponse } from 'next/server';
import { DEMO_SELLER_PROFILE } from '@/domains/seller/fixtures/seller.fixture';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    data: DEMO_SELLER_PROFILE,
  });
}

export async function PUT(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}));

    const updatedProfile = {
      ...DEMO_SELLER_PROFILE,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: 'Merchant store profile updated successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to update seller profile', details: message },
      { status: 500 }
    );
  }
}
