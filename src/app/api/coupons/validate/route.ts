import { NextRequest, NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/coupons/couponStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, subtotal } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, valid: false, message: 'Please provide a promo code' },
        { status: 400 }
      );
    }

    const result = await validateCoupon(code, Number(subtotal) || 0);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, valid: false, message: error.message || 'Validation error' },
      { status: 500 }
    );
  }
}
