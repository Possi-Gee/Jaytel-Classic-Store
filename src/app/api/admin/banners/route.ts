import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/serverAuth';
import {
  getBanners,
  addBanner,
  updateBanner,
  deleteBanner,
} from '@/lib/banners/bannerStore';

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    const banners = await getBanners(!!admin);
    return NextResponse.json({
      success: true,
      banners,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get banners' },
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
    const {
      badgeText,
      title,
      highlightText,
      subtitle,
      primaryBtnText,
      primaryBtnLink,
      secondaryBtnText,
      secondaryBtnLink,
      featuredCard,
      bgGradient,
      isActive,
      order,
    } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Banner title is required' },
        { status: 400 }
      );
    }

    const newBanner = await addBanner({
      badgeText: badgeText || "Accra's Premier Boutique",
      title: title.trim(),
      highlightText: highlightText || '',
      subtitle: subtitle || 'Discover chic luxury pieces with instant Ghana delivery.',
      primaryBtnText: primaryBtnText || 'Shop Glamour',
      primaryBtnLink: primaryBtnLink || '/shop',
      secondaryBtnText: secondaryBtnText || '',
      secondaryBtnLink: secondaryBtnLink || '',
      featuredCard: {
        tag: featuredCard?.tag || 'TRENDING',
        price: featuredCard?.price || 'GH₵ 300.00',
        categoryTag: featuredCard?.categoryTag || 'EXCLUSIVE',
        title: featuredCard?.title || 'Jaytel Classic Feature',
        rating: featuredCard?.rating || '★ 4.9',
        reviewCount: featuredCard?.reviewCount || '(35 reviews)',
        image: featuredCard?.image || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
        link: featuredCard?.link || '/shop',
        dispatchBadge: featuredCard?.dispatchBadge || 'Ready to Dispatch',
        guaranteeBadge: featuredCard?.guaranteeBadge || '100% Authentic Luxe',
      },
      bgGradient: bgGradient || 'from-rose-950 via-pink-900 to-rose-900',
      isActive: isActive !== false,
      order: Number(order) || 1,
    });

    return NextResponse.json({
      success: true,
      banner: newBanner,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create banner' },
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
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    const updated = await updateBanner(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      banner: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update banner' },
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
        { success: false, error: 'Missing banner id query parameter' },
        { status: 400 }
      );
    }

    const deleted = await deleteBanner(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Banner deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete banner' },
      { status: 500 }
    );
  }
}
