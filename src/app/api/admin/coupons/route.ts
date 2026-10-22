import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/serverAuth';
import {
  getCoupons,
  addCoupon,
  updateCoupon,
  deleteCoupon,
} from '@/lib/coupons/couponStore';

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    const coupons = await getCoupons(!!admin);
    return NextResponse.json({
      success: true,
      coupons,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get coupons' },
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
    const { code, description, discountType, discountValue, minOrderAmount, expiryDate, usageLimit, isActive } = body;

    if (!code || !code.trim() || discountValue === undefined) {
      return NextResponse.json(
        { success: false, error: 'Promo code and discount value are required' },
        { status: 400 }
      );
    }

    const newCoupon = await addCoupon({
      code,
      description,
      discountType: discountType || 'percentage',
      discountValue: Number(discountValue),
      minOrderAmount: minOrderAmount !== undefined ? Number(minOrderAmount) : 0,
      expiryDate: expiryDate || undefined,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      isActive: isActive !== false,
    });

    return NextResponse.json({
      success: true,
      coupon: newCoupon,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create promo code' },
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
        { success: false, error: 'Coupon ID or code is required' },
        { status: 400 }
      );
    }

    const updated = await updateCoupon(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Promo code not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      coupon: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update promo code' },
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
    const id = searchParams.get('id') || searchParams.get('code');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing coupon id or code query parameter' },
        { status: 400 }
      );
    }

    const deleted = await deleteCoupon(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Promo code not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Promo code deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete promo code' },
      { status: 500 }
    );
  }
}
