import { NextRequest, NextResponse } from 'next/server';
import { getPaymentAdapter } from '@/lib/payment/adapter';
import {
  findOrder,
  consumedPaymentReferences,
  decrementStockForOrder,
} from '@/lib/orders/orderStore';
import { checkRateLimit } from '@/lib/security/rateLimit';

export async function POST(req: NextRequest) {
  const rateLimitErr = checkRateLimit(req, { limit: 30, windowSeconds: 60 });
  if (rateLimitErr) return rateLimitErr;

  try {
    const body = await req.json();
    const { reference, orderId } = body;

    if (!reference || !orderId) {
      return NextResponse.json(
        { success: false, error: 'Reference and orderId are required' },
        { status: 400 }
      );
    }

    // 1. Locate the order
    const order = findOrder(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // 2. Idempotency check: If order is ALREADY paid with THIS exact reference, return success
    if (
      order.paymentStatus === 'success' &&
      order.paymentProviderDetails?.transactionReference === reference
    ) {
      return NextResponse.json({
        success: true,
        paid: true,
        order,
        message: 'Payment was already successfully verified for this order (idempotent)',
      });
    }

    // 3. Reused Reference Protection: Has this reference been consumed by a DIFFERENT order?
    if (consumedPaymentReferences.has(reference)) {
      const associatedOrderId = consumedPaymentReferences.get(reference);
      if (associatedOrderId !== order.id) {
        return NextResponse.json(
          {
            success: false,
            error: 'Security violation: This payment reference has already been consumed by another order',
          },
          { status: 400 }
        );
      }
    }

    // 4. Verify payment with provider
    const adapter = getPaymentAdapter();
    const verifyResult = await adapter.verifyPayment(reference);

    if (!verifyResult.paid) {
      return NextResponse.json({
        success: true,
        paid: false,
        message: verifyResult.message || 'Payment has not been completed or was declined',
      });
    }

    // 5. Amount validation: verify paid amount matches order total (within 0.05 GHS tolerance for rounding)
    // Note: in sandbox mode, verifyResult.amount might be a test amount or matched
    if (!verifyResult.provider.includes('sandbox')) {
      const amountDiff = Math.abs(verifyResult.amount - order.total);
      if (amountDiff > 0.1) {
        return NextResponse.json(
          {
            success: false,
            error: `Payment amount mismatch: Expected GH₵${order.total.toFixed(2)}, but paid GH₵${verifyResult.amount.toFixed(2)}`,
          },
          { status: 400 }
        );
      }
    }

    // 6. Record payment reference consumption
    consumedPaymentReferences.set(reference, order.id);

    // 7. Update order status and decrement stock
    order.paymentStatus = 'success';
    order.status = 'confirmed';
    order.updatedAt = new Date().toISOString();
    if (!order.paymentProviderDetails) {
      order.paymentProviderDetails = {};
    }
    order.paymentProviderDetails.transactionReference = reference;
    order.paymentProviderDetails.paidAt = verifyResult.paidAt || new Date().toISOString();

    order.timeline.push({
      status: 'confirmed',
      note: `Payment verified via ${verifyResult.provider.toUpperCase()} (${reference})`,
      timestamp: new Date().toISOString(),
    });

    // Atomic decrement of stock on verified payment
    decrementStockForOrder(order);

    return NextResponse.json({
      success: true,
      paid: true,
      order,
      message: 'Payment verified and order confirmed',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
