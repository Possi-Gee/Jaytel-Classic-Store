import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  findOrder,
  consumedPaymentReferences,
  decrementStockForOrder,
} from '@/lib/orders/orderStore';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    // 1. Verify Webhook Signature if secret key is configured
    if (secretKey && !secretKey.includes('placeholder')) {
      if (!signature) {
        return NextResponse.json(
          { success: false, error: 'Missing Paystack signature' },
          { status: 401 }
        );
      }

      const expectedSignature = crypto
        .createHmac('sha512', secretKey)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        return NextResponse.json(
          { success: false, error: 'Invalid webhook signature' },
          { status: 401 }
        );
      }
    }

    const payload = JSON.parse(rawBody);
    const { event, data } = payload;

    // 2. Handle 'charge.success'
    if (event === 'charge.success') {
      const reference = data.reference;
      const orderId = data.metadata?.orderId || data.metadata?.orderNumber;
      const paidAmount = data.amount / 100; // Paystack amount is in pesewas

      if (!orderId) {
        // Return 200 to acknowledge webhook even if orderId is missing in custom metadata
        return NextResponse.json({ received: true, note: 'No orderId in metadata' });
      }

      const order = findOrder(orderId);
      if (!order) {
        return NextResponse.json({ received: true, note: 'Order not found' });
      }

      // Idempotency: if already paid with this reference, acknowledge without reprocessing
      if (
        order.paymentStatus === 'success' &&
        order.paymentProviderDetails?.transactionReference === reference
      ) {
        return NextResponse.json({ received: true, note: 'Already processed' });
      }

      // Reused reference check across different orders
      if (consumedPaymentReferences.has(reference)) {
        const associatedOrderId = consumedPaymentReferences.get(reference);
        if (associatedOrderId !== order.id) {
          return NextResponse.json(
            { received: true, error: 'Reference mismatch with previous order' },
            { status: 400 }
          );
        }
      }

      // Validate amount match
      if (Math.abs(paidAmount - order.total) > 0.1) {
        console.error(
          `[Webhook] Amount mismatch for order ${order.orderNumber}: expected ${order.total}, got ${paidAmount}`
        );
        return NextResponse.json(
          { received: true, error: 'Amount mismatch' },
          { status: 400 }
        );
      }

      // Record consumption
      consumedPaymentReferences.set(reference, order.id);

      // Confirm order and record details
      order.paymentStatus = 'success';
      order.status = 'confirmed';
      order.updatedAt = new Date().toISOString();
      if (!order.paymentProviderDetails) {
        order.paymentProviderDetails = {};
      }
      order.paymentProviderDetails.transactionReference = reference;
      order.paymentProviderDetails.paidAt = data.paid_at || new Date().toISOString();

      order.timeline.push({
        status: 'confirmed',
        note: `Payment verified via Paystack Webhook (${reference})`,
        timestamp: new Date().toISOString(),
      });

      // Atomic stock decrement
      decrementStockForOrder(order);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[PaystackWebhook] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
