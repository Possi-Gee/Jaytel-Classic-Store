import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/serverAuth';
import { mockProducts } from '@/data/mockData';
import { Product, ProductVariant } from '@/types';

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
    const {
      title,
      category,
      categoryId,
      price,
      salePrice,
      stock,
      description,
      images,
      variants,
      featured,
      bestSeller,
      isNewArrival,
      specifications,
    } = body;

    if (!title || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Product title and price are required' },
        { status: 400 }
      );
    }

    // Process gallery images (ensure at least 1 image)
    const processedImages: string[] = Array.isArray(images) && images.length > 0
      ? images.filter(Boolean)
      : ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80'];

    // Process variants (colors/options)
    let processedVariants: ProductVariant[] | undefined = undefined;
    if (Array.isArray(variants) && variants.length > 0) {
      processedVariants = variants.map((v: any, index: number) => ({
        id: v.id || `var-${Date.now()}-${index}`,
        name: v.name || `Option ${index + 1}`,
        price: Number(v.price) || Number(price),
        salePrice: v.salePrice ? Number(v.salePrice) : undefined,
        stock: Number(v.stock) >= 0 ? Number(v.stock) : 10,
        attributes: v.attributes || { color: v.name },
        image: v.image || undefined,
      }));
    }

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      title: title.trim(),
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      category: category || 'Shoes / Bags',
      categoryId: categoryId || 'cat-shoes-bags',
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : undefined,
      stock: Number(stock) >= 0 ? Number(stock) : 10,
      description: description || 'Jaytel Classic premium glamorous piece.',
      images: processedImages,
      variants: processedVariants,
      featured: Boolean(featured),
      bestSeller: Boolean(bestSeller),
      isNewArrival: isNewArrival !== undefined ? Boolean(isNewArrival) : true,
      specifications: specifications || {},
      rating: 5.0,
      reviewCount: 1,
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
    const {
      productId,
      title,
      category,
      categoryId,
      price,
      salePrice,
      stock,
      stockDelta,
      description,
      images,
      variants,
      featured,
      bestSeller,
      isNewArrival,
    } = body;

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
    if (stock !== undefined) {
      prod.stock = Math.max(0, Number(stock));
    }
    if (price !== undefined) {
      prod.price = Number(price);
    }
    if (salePrice !== undefined) {
      prod.salePrice = salePrice ? Number(salePrice) : undefined;
    }
    if (title !== undefined) {
      prod.title = title.trim();
      prod.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (category !== undefined) {
      prod.category = category;
    }
    if (categoryId !== undefined) {
      prod.categoryId = categoryId;
    }
    if (description !== undefined) {
      prod.description = description;
    }
    if (Array.isArray(images) && images.length > 0) {
      prod.images = images.filter(Boolean);
    }
    if (Array.isArray(variants)) {
      prod.variants = variants.map((v: any, index: number) => ({
        id: v.id || `var-${Date.now()}-${index}`,
        name: v.name || `Option ${index + 1}`,
        price: Number(v.price) || prod.price,
        salePrice: v.salePrice ? Number(v.salePrice) : undefined,
        stock: Number(v.stock) >= 0 ? Number(v.stock) : 10,
        attributes: v.attributes || { color: v.name },
        image: v.image || undefined,
      }));
    }
    if (featured !== undefined) prod.featured = Boolean(featured);
    if (bestSeller !== undefined) prod.bestSeller = Boolean(bestSeller);
    if (isNewArrival !== undefined) prod.isNewArrival = Boolean(isNewArrival);

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
    const productId = searchParams.get('id') || searchParams.get('productId');

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
