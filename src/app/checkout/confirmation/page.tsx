'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  ArrowRight,
  Package,
  Heart,
  Crown,
} from 'lucide-react';
import { Order } from '@/types';
import { formatGHS, formatDate } from '@/lib/utils';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const reference = searchParams.get('reference');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<
    'verifying' | 'success' | 'pending' | 'failed'
  >('verifying');
  const [statusMessage, setStatusMessage] = useState('Verifying your payment...');

  useEffect(() => {
    async function loadAndVerifyOrder() {
      if (!orderId && !reference) {
        setLoading(false);
        setVerificationStatus('failed');
        setStatusMessage('No order information found in callback.');
        return;
      }

      try {
        if (reference) {
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference, orderId }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success && verifyData.paid) {
            setVerificationStatus('success');
            setStatusMessage('Payment verified successfully with provider!');
            if (verifyData.order) {
              setOrder(verifyData.order);
              setLoading(false);
              return;
            }
          } else {
            setVerificationStatus('pending');
            setStatusMessage(
              verifyData.message || 'Payment is processing or awaiting customer MoMo approval.'
            );
          }
        }

        if (orderId) {
          const orderRes = await fetch(`/api/orders/create?query=${encodeURIComponent(orderId)}`);
          const orderData = await orderRes.json();
          if (orderData.success && orderData.order) {
            setOrder(orderData.order);
            if (orderData.order.paymentMethod === 'cash_on_delivery') {
              setVerificationStatus('success');
              setStatusMessage('Order confirmed with Cash on Delivery!');
            }
          }
        }
      } catch (err: any) {
        setVerificationStatus('failed');
        setStatusMessage(err.message || 'Failed to verify order details.');
      } finally {
        setLoading(false);
      }
    }

    loadAndVerifyOrder();
  }, [orderId, reference]);

  if (loading) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-base font-black text-slate-800">Verifying Payment with Provider</h2>
        <p className="text-xs text-slate-500">
          Communicating with Ghanaian payment gateway to confirm your transaction. Please do not close this window.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-6">
      <div className="bg-white rounded-4xl border border-pink-100 p-6 sm:p-8 text-center shadow-soft space-y-4">
        {verificationStatus === 'success' ? (
          <div className="w-16 h-16 rounded-full bg-pink-100 text-pink-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
        ) : verificationStatus === 'pending' ? (
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
            <Clock className="w-10 h-10 animate-pulse" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-700 mx-auto flex items-center justify-center">
            <AlertCircle className="w-10 h-10" />
          </div>
        )}

        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center justify-center gap-1.5">
            <span>
              {verificationStatus === 'success'
                ? 'Thank You Darling! Your Order is Confirmed'
                : verificationStatus === 'pending'
                ? 'Payment Pending Confirmation'
                : 'Payment Verification Failed'}
            </span>
            <Heart className="w-5 h-5 fill-pink-500 text-pink-500 inline" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
            {statusMessage}
          </p>
        </div>

        {order && (
          <div className="inline-block bg-pink-50 border border-pink-200 px-4 py-2 rounded-2xl text-xs font-mono font-bold text-slate-800">
            Order Reference: <span className="text-pink-600 font-black">{order.orderNumber}</span>
          </div>
        )}
      </div>

      {order && (
        <div className="bg-white rounded-3xl border border-pink-100 p-5 sm:p-6 shadow-soft space-y-5">
          <div className="flex items-center justify-between border-b border-pink-50 pb-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-pink-500" />
              <h2 className="font-black text-sm text-slate-900">Order Summary</h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {formatDate(order.createdAt)}
            </span>
          </div>

          <div className="space-y-3 text-xs text-slate-700 divide-y divide-pink-50">
            {order.items.map((it, idx) => (
              <div key={idx} className="pt-2 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900">{it.title}</p>
                  <p className="text-[11px] text-slate-500">
                    Qty: {it.quantity} × {formatGHS(it.price)}
                    {it.variantName && ` • ${it.variantName}`}
                  </p>
                </div>
                <span className="font-black text-pink-600">{formatGHS(it.subtotal)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-pink-100 pt-3 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-slate-900">{formatGHS(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-pink-600 font-bold">
                <span>Promotional Discount</span>
                <span>-{formatGHS(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-bold text-slate-900">{formatGHS(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-pink-100">
              <span>Total Paid</span>
              <span className="text-pink-600 text-lg">{formatGHS(order.total)}</span>
            </div>
          </div>

          <div className="bg-pink-50/40 p-4 rounded-2xl border border-pink-100 text-xs space-y-1">
            <div className="flex items-center gap-2 text-slate-900 font-bold mb-1">
              <Truck className="w-4 h-4 text-pink-500" />
              <span>
                {order.deliveryType === 'pickup'
                  ? 'Jaytel Boutique Pickup (East Legon, Accra)'
                  : 'Doorstep Delivery Address'}
              </span>
            </div>
            {order.shippingAddress ? (
              <p className="text-slate-600">
                {order.shippingAddress.streetAddress}, {order.shippingAddress.townOrArea},{' '}
                {order.shippingAddress.city}, {order.shippingAddress.region} Region.
                {order.shippingAddress.digitalAddress && (
                  <span className="block font-mono text-[11px] text-pink-700">
                    GhanaPost: {order.shippingAddress.digitalAddress}
                  </span>
                )}
              </p>
            ) : (
              <p className="text-slate-600">
                {order.deliveryType === 'delivery'
                  ? 'Delivery dispatched to verified customer address.'
                  : 'Pickup ready at Jaytel Classic Boutique, Lagos Avenue, East Legon, Accra.'}
              </p>
            )}
            {(order.customerPhone || (order as any).maskedCustomer?.phone) && (
              <p className="text-slate-600 text-[11px] pt-1">
                Recipient Contact:{' '}
                <strong>{order.customerPhone || (order as any).maskedCustomer?.phone}</strong>{' '}
                {order.customerName ? `(${order.customerName})` : (order as any).maskedCustomer?.name ? `(${(order as any).maskedCustomer?.name})` : ''}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href={`/orders?query=${encodeURIComponent(order.orderNumber)}`}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-pink hover:opacity-95 transition-opacity min-h-tap"
            >
              <span>Track Live Order Status</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/shop"
              className="py-3 px-4 bg-slate-100 hover:bg-pink-50 text-slate-800 rounded-2xl text-xs font-bold flex items-center justify-center transition-colors min-h-tap"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-pink-600 font-medium">Loading confirmation...</p>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
