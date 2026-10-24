import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/serverAuth';
import { getProducts, addProduct, updateProduct, deleteProduct } from '@/lib/products/productStore';
import { ProductVariant } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const products = await getProducts();
  return NextResponse.json({
    success: true,
    products,
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

    const newProd = await addProduct({
      title: title.trim(),
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
    });

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

    const updates: any = {};
    if (title !== undefined) {
      updates.title = title.trim();
      updates.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (category !== undefined) updates.category = category;
    if (categoryId !== undefined) updates.categoryId = categoryId;
    if (price !== undefined) updates.price = Number(price);
    if (salePrice !== undefined) updates.salePrice = salePrice ? Number(salePrice) : undefined;
    if (stock !== undefined) updates.stock = Math.max(0, Number(stock));
    if (description !== undefined) updates.description = description;
    if (Array.isArray(images) && images.length > 0) updates.images = images.filter(Boolean);
    if (Array.isArray(variants)) {
      updates.variants = variants.map((v: any, index: number) => ({
        id: v.id || `var-${Date.now()}-${index}`,
        name: v.name || `Option ${index + 1}`,
        price: Number(v.price) || updates.price || 0,
        salePrice: v.salePrice ? Number(v.salePrice) : undefined,
        stock: Number(v.stock) >= 0 ? Number(v.stock) : 10,
        attributes: v.attributes || { color: v.name },
        image: v.image || undefined,
      }));
    }
    if (featured !== undefined) updates.featured = Boolean(featured);
    if (bestSeller !== undefined) updates.bestSeller = Boolean(bestSeller);
    if (isNewArrival !== undefined) updates.isNewArrival = Boolean(isNewArrival);

    const updated = await updateProduct(productId, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product: updated,
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

    const deleted = await deleteProduct(productId);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

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
