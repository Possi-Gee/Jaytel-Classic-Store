import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getProductBySlug } from '@/lib/products/productStore';

export const dynamic = 'force-dynamic';

/**
 * GET /api/products
 * Public API to fetch store products for the storefront and catalog.
 * Anyone (customer, guest, or admin) can query products freely.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const featured = searchParams.get('featured') === 'true';
    const bestSeller = searchParams.get('bestSeller') === 'true';
    const isNewArrival = searchParams.get('isNewArrival') === 'true' || searchParams.get('newArrival') === 'true';
    const search = searchParams.get('q') || searchParams.get('search') || undefined;
    const slug = searchParams.get('slug') || undefined;

    if (slug) {
      const product = await getProductBySlug(slug);
      if (!product) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, product });
    }

    const products = await getProducts({
      category,
      featured: featured || undefined,
      bestSeller: bestSeller || undefined,
      isNewArrival: isNewArrival || undefined,
      search,
    });

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error: any) {
    console.error('Failed to get public products:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
