import { NextResponse } from 'next/server';
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '@/domains/catalog/fixtures';
import { buildCategoryTree } from '@/domains/catalog/utils/tree';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const asTree = searchParams.get('tree') !== 'false';
    const parentId = searchParams.get('parentId');

    let categories = [...MOCK_CATEGORIES];

    if (parentId !== null && parentId !== undefined) {
      categories = categories.filter((c) => c.parentId === (parentId === 'null' ? null : parentId));
    }

    // Augment with live product counts
    const augmentedCategories = categories.map((cat) => {
      const productCount = MOCK_PRODUCTS.filter((p) => p.categoryId === cat.id).length;
      return {
        ...cat,
        productCount,
      };
    });

    const data = asTree ? buildCategoryTree(augmentedCategories) : augmentedCategories;

    return NextResponse.json({
      success: true,
      data,
      total: categories.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories', details: message },
      { status: 500 }
    );
  }
}

