import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/serverAuth';
import { activeOrders, findOrder, updateOrderStatus, decrementStockForOrder } from '@/lib/orders/orderStore';
import { OrderStatus, PaymentStatus } from '@/types';

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Forbidden: Administrator privileges required' },
      { status: 403 }
    );
  }

  return NextResponse.json({
    success: true,
    orders: activeOrders,
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
    const { orderId, status, paymentStatus, note, notes, courierDetails, pickupLocation } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Missing orderId' },
        { status: 400 }
      );
    }

    const order = findOrder(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const newStatus = (status as OrderStatus) || order.status;
    const metadata: Record<string, unknown> = {};

    if (paymentStatus) {
      metadata.paymentStatus = paymentStatus as PaymentStatus;
      if (paymentStatus === 'success' && order.paymentStatus !== 'success') {
        decrementStockForOrder(order);
      }
    }

    if (notes) {
      metadata.notes = notes;
    }

    if (courierDetails) {
      metadata.courierDetails = courierDetails;
    }

    if (pickupLocation) {
      metadata.pickupLocation = pickupLocation;
    }

    const timelineNote =
      note ||
      `Order updated by Admin (${admin.email || admin.uid}): Status=${newStatus}${
        paymentStatus ? `, Payment=${paymentStatus}` : ''
      }`;

    const updated = updateOrderStatus(orderId, newStatus, timelineNote, metadata);

    return NextResponse.json({
      success: true,
      order: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}
