import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/serverAuth';
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from '@/lib/categories/categoryStore';

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    const categories = await getCategories(!!admin);
    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get categories' },
      { status: 500 }
    );
  }
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
    const { name, slug, description, image, icon, featured, isActive } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    const newCategory = await addCategory({
      name: name.trim(),
      slug: slug?.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: description?.trim() || `Shop ${name.trim()} at Jaytel Classic Store.`,
      image: image || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
      icon: icon || 'Sparkles',
      featured: !!featured,
      isActive: isActive !== false,
      productCount: 0,
    });

    return NextResponse.json({
      success: true,
      category: newCategory,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create category' },
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
    const { id, name, slug, description, image, icon, featured, isActive, order } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const updated = await updateCategory(id, {
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug }),
      ...(description !== undefined && { description }),
      ...(image !== undefined && { image }),
      ...(icon !== undefined && { icon }),
      ...(featured !== undefined && { featured }),
      ...(isActive !== undefined && { isActive }),
      ...(order !== undefined && { order: Number(order) }),
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      category: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update category' },
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing category id parameter' },
        { status: 400 }
      );
    }

    const deleted = await deleteCategory(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete category' },
      { status: 500 }
    );
  }
}
