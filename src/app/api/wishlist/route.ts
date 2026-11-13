import { NextResponse } from 'next/server';
import { z } from 'zod';
import { MOCK_PRODUCTS } from '@/domains/catalog/fixtures';
import type { WishlistItem } from '@/domains/customer/types/wishlist';

export const dynamic = 'force-dynamic';

const WishlistActionSchema = z.object({
  action: z.enum(['toggle', 'add', 'remove', 'get']),
  productId: z.string().optional(),
  currentProductIds: z.array(z.string()).default([]),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = WishlistActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid wishlist action payload', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { action, productId, currentProductIds } = parsed.data;
    const idSet = new Set(currentProductIds);

    if (action === 'add' && productId) {
      idSet.add(productId);
    } else if (action === 'remove' && productId) {
      idSet.delete(productId);
    } else if (action === 'toggle' && productId) {
      if (idSet.has(productId)) {
        idSet.delete(productId);
      } else {
        idSet.add(productId);
      }
    }

    const updatedIds = Array.from(idSet);
    const items: WishlistItem[] = updatedIds.map((id) => {
      const product = MOCK_PRODUCTS.find((p) => p.id === id);
      return {
        productId: id,
        addedAt: new Date().toISOString(),
        productSnapshot: product,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        productIds: updatedIds,
        items,
        total: items.length,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Wishlist operation failed', details: message },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  // Returns demo wishlist with curated favorites
  const sampleProductIds = [MOCK_PRODUCTS[0]?.id, MOCK_PRODUCTS[1]?.id].filter(Boolean) as string[];
  const items: WishlistItem[] = sampleProductIds.map((id) => ({
    productId: id,
    addedAt: new Date().toISOString(),
    productSnapshot: MOCK_PRODUCTS.find((p) => p.id === id),
  }));

  return NextResponse.json({
    success: true,
    data: {
      productIds: sampleProductIds,
      items,
      total: items.length,
    },
  });
}

