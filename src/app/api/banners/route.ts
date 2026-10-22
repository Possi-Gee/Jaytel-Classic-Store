import { NextResponse } from 'next/server';
import { getBanners } from '@/lib/banners/bannerStore';

export async function GET() {
  try {
    const banners = await getBanners(false);
    return NextResponse.json({
      success: true,
      banners,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}
