'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Smartphone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Store,
  Heart,
  Crown,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatGHS, isValidGhanaPhone, detectGhanaNetwork } from '@/lib/utils';
import { mockDeliveryZones } from '@/data/mockData';
import { GhanaRegion, MobileMoneyProvider } from '@/types';

const GHANA_REGIONS: GhanaRegion[] = [
  'Greater Accra',
  'Ashanti',
  'Western',
  'Central',
  'Eastern',
  'Northern',
  'Volta',
  'Upper East',
  'Upper West',
  'Bono',
  'Bono East',
  'Ahafo',
  'Oti',
  'North East',
  'Savannah',
  'Western North',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, total, deliveryFee, discount, appliedCoupon, selectedDeliveryZoneId, clearCart } =
    useCart();
  const { user } = useAuth();

  // Step 1: Customer & Delivery Info
  const [customerName, setCustomerName] = useState(user?.displayName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phoneNumber || '');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');

  // Address
  const defaultAddr = user?.savedAddresses?.[0];
  const [region, setRegion] = useState<GhanaRegion>(defaultAddr?.region || 'Greater Accra');
  const [city, setCity] = useState(defaultAddr?.city || 'Accra');
  const [townOrArea, setTownOrArea] = useState(defaultAddr?.townOrArea || 'East Legon');
  const [streetAddress, setStreetAddress] = useState(defaultAddr?.streetAddress || '');
  const [digitalAddress, setDigitalAddress] = useState(defaultAddr?.digitalAddress || '');
  const [landmark, setLandmark] = useState(defaultAddr?.landmark || '');

  // Step 2: Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'card' | 'cash_on_delivery'>('mobile_money');
  const [momoNetwork, setMomoNetwork] = useState<MobileMoneyProvider>('MTN');

  // Status & Validation
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-detect MoMo network when phone changes
  const handlePhoneChange = (val: string) => {
    setCustomerPhone(val);
    const detected = detectGhanaNetwork(val);
    if (detected !== 'Unknown') {
      setMomoNetwork(detected as MobileMoneyProvider);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim() || !customerEmail.trim()) {
      setErrorMsg('Please enter your full name and email address.');
      return;
    }

    if (!isValidGhanaPhone(customerPhone)) {
      setErrorMsg(
        'Please provide a valid Ghanaian phone number (e.g. 0244123456 or +233244123456).'
      );
      return;
    }

    if (deliveryType === 'delivery' && (!streetAddress.trim() || !city.trim())) {
      setErrorMsg('Please provide your street address and town/city in Ghana.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customerName,
        customerEmail,
        customerPhone,
        deliveryType,
        shippingAddress:
          deliveryType === 'delivery'
            ? {
                fullName: customerName,
                phoneNumber: customerPhone,
                region,
                city,
                townOrArea,
                streetAddress,
                digitalAddress,
                landmark,
              }
            : undefined,
        pickupLocation: deliveryType === 'pickup' ? 'Jaytel Classic Boutique, East Legon / Osu, Accra' : undefined,
        items: cart,
        couponCode: appliedCoupon?.code,
        selectedDeliveryZoneId,
        paymentMethod,
        momoNetwork: paymentMethod === 'mobile_money' ? momoNetwork : undefined,
        customerId: user?.id,
        idempotencyKey: `chk_${user?.id || 'guest'}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      };

      const orderRes = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to place order');
      }

      const createdOrder = orderData.order;

      // Persist order number locally so guest customers can track it in their history
      try {
        const stored = JSON.parse(localStorage.getItem('jaytel_my_order_numbers') || '[]');
        const updated = [createdOrder.orderNumber, ...stored.filter((n: string) => n !== createdOrder.orderNumber)].slice(0, 15);
        localStorage.setItem('jaytel_my_order_numbers', JSON.stringify(updated));
        localStorage.setItem('jaytel_last_order_id', createdOrder.id);
        localStorage.setItem('jaytel_last_order_num', createdOrder.orderNumber);
      } catch (e) {
        console.error('Failed to save order to local history:', e);
      }

      if (paymentMethod === 'cash_on_delivery') {
        clearCart();
        router.push(`/checkout/confirmation?orderId=${createdOrder.id}`);
        return;
      }

      const payRes = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: createdOrder.id,
          orderNumber: createdOrder.orderNumber,
          amount: createdOrder.total,
          customerEmail,
          customerPhone,
          customerName,
          paymentMethod,
          momoNetwork,
        }),
      });

      const payData = await payRes.json();
      if (!payData.success) {
        throw new Error(payData.message || 'Payment initiation failed');
      }

      clearCart();

      if (payData.authorizationUrl) {
        window.location.href = payData.authorizationUrl;
      } else {
        router.push(`/checkout/confirmation?orderId=${createdOrder.id}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during checkout. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-4xl border border-pink-100 p-12 text-center max-w-md mx-auto my-12 shadow-soft space-y-4">
        <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center text-pink-400 mx-auto">
          <Heart className="w-8 h-8 fill-pink-100" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Your bag is empty</h2>
        <p className="text-xs text-slate-500">
          You don't have any items to checkout yet. Treat yourself to Jaytel Classic glam!
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full text-xs font-bold shadow-pink hover:opacity-95"
        >
          <span>Return to Boutique ♥</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="border-b border-pink-100 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Crown className="w-5 h-5 text-pink-500" />
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Jaytel Express Checkout
          </h1>
        </div>
        <p className="text-xs text-slate-500">
          Fast doorstep Ghana delivery & Mobile Money or Card payment
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 text-xs font-semibold">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Customer Contact */}
          <div className="bg-white rounded-3xl border border-pink-100/90 p-5 sm:p-6 shadow-soft space-y-4">
            <h2 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2 border-b border-pink-50 pb-3">
              <span className="w-6 h-6 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              <span>Customer Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-pink-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ama Serwaa"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-xs p-3 bg-pink-50/30 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address <span className="text-pink-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ama@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full text-xs p-3 bg-pink-50/30 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ghana Phone / MoMo Number <span className="text-pink-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 024 412 3456"
                  value={customerPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="w-full text-xs p-3 bg-pink-50/30 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white font-semibold"
                />
                <p className="text-[10px] text-pink-600 font-medium mt-1">
                  We send instant SMS / WhatsApp tracking updates to this number.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2: Delivery Option */}
          <div className="bg-white rounded-3xl border border-pink-100/90 p-5 sm:p-6 shadow-soft space-y-4">
            <h2 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2 border-b border-pink-50 pb-3">
              <span className="w-6 h-6 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              <span>Delivery Destination</span>
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType('delivery')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
                  deliveryType === 'delivery'
                    ? 'border-pink-500 bg-pink-50 text-pink-700 font-bold ring-2 ring-pink-500'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-pink-50/50'
                }`}
              >
                <Truck className="w-5 h-5 mb-1 text-pink-500" />
                <span className="text-xs">Doorstep Delivery</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('pickup')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
                  deliveryType === 'pickup'
                    ? 'border-pink-500 bg-pink-50 text-pink-700 font-bold ring-2 ring-pink-500'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-pink-50/50'
                }`}
              >
                <Store className="w-5 h-5 mb-1 text-pink-500" />
                <span className="text-xs">Free Boutique Pickup</span>
              </button>
            </div>

            {deliveryType === 'pickup' ? (
              <div className="p-4 bg-pink-50 border border-pink-200 rounded-2xl text-pink-900 text-xs space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <span>Jaytel Classic Boutique Pickup:</span>
                  <Heart className="w-3 h-3 fill-pink-500 text-pink-500" />
                </p>
                <p>Jaytel Classic Store, Lagos Avenue, East Legon, Accra, Ghana</p>
                <p className="text-[11px] text-pink-700">Open Mon - Sat: 9:00 AM - 7:30 PM</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ghana Region <span className="text-pink-500">*</span>
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value as GhanaRegion)}
                    className="w-full text-xs p-3 bg-pink-50/30 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
                  >
                    {GHANA_REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City / Town <span className="text-pink-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Accra, Tema, Kumasi"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs p-3 bg-pink-50/30 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Neighborhood / Area <span className="text-pink-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. East Legon, Cantonments, Dzorwulu"
                    value={townOrArea}
                    onChange={(e) => setTownOrArea(e.target.value)}
                    className="w-full text-xs p-3 bg-pink-50/30 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Street Address / House Description <span className="text-pink-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. House 14, Near Melcom"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="w-full text-xs p-3 bg-pink-50/30 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    GhanaPost GPS (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. GA-182-9014"
                    value={digitalAddress}
                    onChange={(e) => setDigitalAddress(e.target.value)}
                    className="w-full text-xs p-3 bg-pink-50/30 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Notable Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Behind Total Fuel Station"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full text-xs p-3 bg-pink-50/30 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Payment Method */}
          <div className="bg-white rounded-3xl border border-pink-100/90 p-5 sm:p-6 shadow-soft space-y-4">
            <h2 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2 border-b border-pink-50 pb-3">
              <span className="w-6 h-6 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center font-bold">
                3
              </span>
              <span>Payment Option</span>
            </h2>

            <div className="space-y-3">
              <label
                className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'mobile_money'
                    ? 'border-pink-500 bg-pink-50/60 ring-2 ring-pink-500'
                    : 'border-slate-200 bg-white hover:bg-pink-50/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="mobile_money"
                    checked={paymentMethod === 'mobile_money'}
                    onChange={() => setPaymentMethod('mobile_money')}
                    className="text-pink-600 focus:ring-pink-500"
                  />
                  <div>
                    <span className="text-xs font-black text-slate-900 block">
                      Mobile Money (MTN MoMo, Telecel Cash, AT Money)
                    </span>
                    <span className="text-[11px] text-pink-600">
                      Instant prompt to your Ghana phone number
                    </span>
                  </div>
                </div>
                <Smartphone className="w-5 h-5 text-pink-500 shrink-0" />
              </label>

              {paymentMethod === 'mobile_money' && (
                <div className="p-4 bg-pink-50/50 border border-pink-100 rounded-2xl space-y-3">
                  <span className="text-xs font-bold text-slate-800 block">
                    Choose Your Telecom Network:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['MTN', 'Telecel', 'AirtelTigo'] as MobileMoneyProvider[]).map((net) => (
                      <button
                        key={net}
                        type="button"
                        onClick={() => setMomoNetwork(net)}
                        className={`p-2.5 rounded-xl border text-center text-xs font-black transition-all ${
                          momoNetwork === net
                            ? 'border-pink-500 bg-pink-500 text-white shadow-pink'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-pink-50'
                        }`}
                      >
                        {net}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <label
                className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'border-pink-500 bg-pink-50/60 ring-2 ring-pink-500'
                    : 'border-slate-200 bg-white hover:bg-pink-50/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="text-pink-600 focus:ring-pink-500"
                  />
                  <div>
                    <span className="text-xs font-black text-slate-900 block">
                      Bank Card (Visa / Mastercard)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Encrypted 3D-Secure processing
                    </span>
                  </div>
                </div>
                <CreditCard className="w-5 h-5 text-slate-600 shrink-0" />
              </label>

              <label
                className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'border-pink-500 bg-pink-50/60 ring-2 ring-pink-500'
                    : 'border-slate-200 bg-white hover:bg-pink-50/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash_on_delivery"
                    checked={paymentMethod === 'cash_on_delivery'}
                    onChange={() => setPaymentMethod('cash_on_delivery')}
                    className="text-pink-600 focus:ring-pink-500"
                  />
                  <div>
                    <span className="text-xs font-black text-slate-900 block">
                      Cash / MoMo on Delivery
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Pay rider when your package arrives (Accra & Kumasi)
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-pink-100/90 p-5 sm:p-6 shadow-soft space-y-4">
            <h2 className="font-black text-sm text-slate-900 border-b border-pink-50 pb-3 flex items-center justify-between">
              <span>Your Bag Items</span>
              <span className="text-pink-600 font-bold text-xs">
                {cart.reduce((a, b) => a + b.quantity, 0)} items
              </span>
            </h2>

            <div className="divide-y divide-pink-50 max-h-72 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl bg-pink-50 overflow-hidden shrink-0 border border-pink-100">
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{item.title}</h4>
                    <p className="text-[11px] text-slate-500">
                      Qty: {item.quantity} × {formatGHS(item.price)}
                    </p>
                  </div>
                  <span className="text-xs font-black text-slate-900 shrink-0">
                    {formatGHS(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-pink-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">{formatGHS(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-pink-600 font-bold">
                  <span>Promotional Discount</span>
                  <span>-{formatGHS(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-bold text-slate-900">
                  {deliveryType === 'pickup' ? 'Free (Pickup)' : formatGHS(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-pink-200">
                <span>Total Amount Due</span>
                <span className="text-pink-600 text-xl">{formatGHS(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl font-black text-sm shadow-pink flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-60 min-h-tap"
            >
              {isSubmitting ? (
                <span>Securing Your Glam Order...</span>
              ) : (
                <>
                  <span>
                    {paymentMethod === 'cash_on_delivery'
                      ? 'Place Order (Cash on Delivery)'
                      : `Pay ${formatGHS(total)} with ${
                          paymentMethod === 'mobile_money' ? `${momoNetwork} MoMo` : 'Card'
                        }`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4 text-pink-500" />
              <span>100% Verified Jaytel Classic Ghanaian Checkout</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
