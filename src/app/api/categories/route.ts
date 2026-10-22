import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/categories/categoryStore';

export async function GET() {
  try {
    const categories = await getCategories(false);
    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
