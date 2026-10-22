import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/serverAuth';
import { mockDeliveryZones } from '@/data/mockData';
import { DeliveryZone } from '@/types';

export async function GET() {
  return NextResponse.json({
    success: true,
    zones: mockDeliveryZones,
  });
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
    const { zoneId, deliveryFee, name, estimatedDeliveryTime, isActive } = body;

    if (!zoneId) {
      return NextResponse.json(
        { success: false, error: 'Missing zoneId' },
        { status: 400 }
      );
    }

    const zone = mockDeliveryZones.find((z) => z.id === zoneId);
    if (!zone) {
      return NextResponse.json(
        { success: false, error: 'Delivery zone not found' },
        { status: 404 }
      );
    }

    if (deliveryFee !== undefined) zone.deliveryFee = Number(deliveryFee);
    if (name !== undefined) zone.name = name.trim();
    if (estimatedDeliveryTime !== undefined) zone.estimatedDeliveryTime = estimatedDeliveryTime.trim();
    if (isActive !== undefined) zone.isActive = Boolean(isActive);

    return NextResponse.json({
      success: true,
      zone,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update zone' },
      { status: 500 }
    );
  }
}
