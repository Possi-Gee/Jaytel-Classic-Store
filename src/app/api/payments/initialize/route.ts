import { NextRequest, NextResponse } from 'next/server';
import { getPaymentAdapter } from '@/lib/payment/adapter';
import { findOrder } from '@/lib/orders/orderStore';
import { checkRateLimit } from '@/lib/security/rateLimit';

export async function POST(req: NextRequest) {
  const rateLimitErr = checkRateLimit(req, { limit: 20, windowSeconds: 60 });
  if (rateLimitErr) return rateLimitErr;

  try {
    const body = await req.json();
    const {
      orderId,
      orderNumber,
      customerEmail,
      customerPhone,
      customerName,
      paymentMethod,
      momoNetwork,
    } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Missing orderId parameter' },
        { status: 400 }
      );
    }

    // Verify order exists in repository
    const order = findOrder(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Prevent re-payment of already paid orders
    if (order.paymentStatus === 'success') {
      return NextResponse.json(
        { success: false, error: 'Order has already been successfully paid' },
        { status: 400 }
      );
    }

    // CRITICAL SECURITY FIX: Use the server-verified order total, never the client amount!
    const verifiedAmount = order.total;

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const callbackUrl = `${protocol}://${host}/checkout/confirmation`;

    const adapter = getPaymentAdapter();
    const result = await adapter.initializePayment({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: verifiedAmount,
      customerEmail: order.customerEmail || customerEmail,
      customerPhone: order.customerPhone || customerPhone,
      customerName: order.customerName || customerName,
      paymentMethod: paymentMethod || order.paymentMethod,
      momoNetwork: momoNetwork || order.paymentProviderDetails?.momoNetwork,
      callbackUrl,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Payment initialization error' },
      { status: 500 }
    );
  }
}
