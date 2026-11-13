import { NextResponse } from 'next/server';
import { z } from 'zod';
import { MOCK_PRODUCTS, MOCK_SELLER_OFFERS } from '@/domains/catalog/fixtures';
import { createMoney } from '@/domains/catalog/utils/money';

export const dynamic = 'force-dynamic';

const CreateProductOfferSchema = z.object({
  title: z.string().min(3),
  sku: z.string().min(3),
  priceMinor: z.number().int().positive(),
  compareAtPriceMinor: z.number().int().positive().optional(),
  currency: z.string().default('USD'),
  stockQuantity: z.number().int().min(0).default(10),
  categoryId: z.string().optional(),
  description: z.string().optional(),
});

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId') || 'seller-tech-direct';

    // Get seller offers and join with product metadata
    const offers = MOCK_SELLER_OFFERS.filter((o) => o.sellerId === sellerId);
    const sellerProducts = offers.map((offer) => {
      const product = MOCK_PRODUCTS.find((p) => p.id === offer.productId);
      return {
        offerId: offer.offerId,
        productId: offer.productId,
        title: product?.title.en || 'Marketplace Item',
        slug: product?.slug || '',
        price: offer.price,
        compareAtPrice: offer.compareAtPrice,
        inventory: offer.inventory,
        isBuyBoxWinner: offer.isBuyBoxWinner,
        thumbnail: product?.media[0]?.url || '',
      };
    });

    return NextResponse.json({
      success: true,
      data: sellerProducts,
      total: sellerProducts.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve seller products', details: message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = CreateProductOfferSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid product listing data', errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, sku, priceMinor, compareAtPriceMinor, currency, stockQuantity } = parsed.data;
    const now = new Date().toISOString();

    const newOffer = {
      offerId: `ofr-${Date.now()}`,
      sellerId: 'seller-tech-direct',
      productId: `prod-custom-${Date.now()}`,
      title,
      sku,
      price: createMoney(priceMinor, currency as any),
      compareAtPrice: compareAtPriceMinor ? createMoney(compareAtPriceMinor, currency as any) : undefined,
      inventory: {
        state: stockQuantity > 0 ? 'in_stock' : 'out_of_stock',
        quantityAvailable: stockQuantity,
        allowsBackorder: false,
      },
      isBuyBoxWinner: true,
      complianceStatus: 'pending_review',
      createdAt: now,
      updatedAt: now,
    };

    return NextResponse.json({
      success: true,
      data: newOffer,
      message: 'Product offer created and queued for marketplace catalog approval',
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to create product listing', details: message },
      { status: 500 }
    );
  }
}
