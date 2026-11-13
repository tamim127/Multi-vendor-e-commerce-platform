import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  mergeOrAddItem,
  updateItemQuantity,
  removeItemFromCart,
  buildCartState,
  groupCartBySeller,
} from '@/domains/cart/utils/calculations';
import type { CartItem } from '@/domains/cart/types/cart';

export const dynamic = 'force-dynamic';

const CartActionSchema = z.object({
  action: z.enum(['add', 'update', 'remove', 'clear', 'recalculate']),
  items: z.array(z.any()).default([]),
  item: z.any().optional(),
  itemId: z.string().optional(),
  quantity: z.number().int().optional(),
  couponCode: z.string().optional(),
  currency: z.string().default('USD'),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = CartActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid cart payload', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { action, items: rawItems, item, itemId, quantity, currency } = parsed.data;
    let items: CartItem[] = (rawItems as CartItem[]) || [];

    switch (action) {
      case 'add': {
        if (!item) {
          return NextResponse.json(
            { success: false, error: 'Item object required for add action' },
            { status: 400 }
          );
        }
        const mergeResult = mergeOrAddItem(items, item, currency as any);
        if (mergeResult.error) {
          return NextResponse.json(
            { success: false, error: mergeResult.error },
            { status: 400 }
          );
        }
        items = mergeResult.items;
        break;
      }

      case 'update': {
        if (!itemId || quantity === undefined) {
          return NextResponse.json(
            { success: false, error: 'itemId and quantity required for update action' },
            { status: 400 }
          );
        }
        items = updateItemQuantity(items, itemId, quantity);
        break;
      }

      case 'remove': {
        if (!itemId) {
          return NextResponse.json(
            { success: false, error: 'itemId required for remove action' },
            { status: 400 }
          );
        }
        items = removeItemFromCart(items, itemId);
        break;
      }

      case 'clear': {
        items = [];
        break;
      }

      case 'recalculate':
      default:
        break;
    }

    const cart = buildCartState(items, currency as any);
    const sellerGroups = groupCartBySeller(items);

    return NextResponse.json({
      success: true,
      data: {
        ...cart,
        sellerGroups,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to process cart operation', details: message },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  const emptyCart = buildCartState([], 'USD');
  return NextResponse.json({
    success: true,
    data: {
      ...emptyCart,
      sellerGroups: [],
    },
  });
}
