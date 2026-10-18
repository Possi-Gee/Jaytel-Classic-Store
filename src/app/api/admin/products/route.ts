import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/serverAuth';
import { mockProducts } from '@/data/mockData';
import { Product } from '@/types';

export async function GET() {
  return NextResponse.json({
    success: true,
    products: mockProducts,
  });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Forbidden: Administrator privileges required' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { title, category, categoryId, price, stock, description, images } = body;

    if (!title || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Product title and price are required' },
        { status: 400 }
      );
    }

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: category || 'Accessories',
      categoryId: categoryId || 'cat-accessories',
      price: Number(price),
      stock: Number(stock) || 10,
      description: description || 'Jaytel Classic premium glamorous piece.',
      images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockProducts.unshift(newProd);

    return NextResponse.json({
      success: true,
      product: newProd,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Forbidden: Administrator privileges required' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { productId, stockDelta, price, title } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Missing productId' },
        { status: 400 }
      );
    }

    const prod = mockProducts.find((p) => p.id === productId);
    if (!prod) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    if (stockDelta !== undefined) {
      prod.stock = Math.max(0, prod.stock + Number(stockDelta));
    }
    if (price !== undefined) {
      prod.price = Number(price);
    }
    if (title !== undefined) {
      prod.title = title;
      prod.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    prod.updatedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      product: prod,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Forbidden: Administrator privileges required' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('id');

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Missing productId query parameter' },
        { status: 400 }
      );
    }

    const index = mockProducts.findIndex((p) => p.id === productId);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    mockProducts.splice(index, 1);

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}
