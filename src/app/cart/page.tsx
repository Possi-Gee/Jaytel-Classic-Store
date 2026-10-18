'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Tag, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatGHS } from '@/lib/utils';
import { mockDeliveryZones } from '@/data/mockData';

export default function CartPage() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    subtotal,
    deliveryFee,
    discount,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    selectedDeliveryZoneId,
    setSelectedDeliveryZoneId,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = applyCoupon(couponCode);
    setCouponMsg({ text: res.message, isError: !res.success });
    if (res.success) setCouponCode('');
  };

  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-4xl border border-pink-100 p-12 text-center max-w-md mx-auto my-12 shadow-soft space-y-4">
        <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-400 mx-auto flex items-center justify-center">
          <Heart className="w-8 h-8 fill-pink-100" />
        </div>
        <h1 className="text-xl font-black text-slate-900">Your Shopping Bag is Empty</h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          Looks like you haven't added anything yet. Treat yourself to Jaytel Classic statement mini bags, chic dresses, and lip oils!
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full text-xs font-bold shadow-pink hover:opacity-95 transition-opacity"
        >
          <span>Start Shopping ♥</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-pink-100 pb-5">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>Shopping Bag</span>
          <span className="text-pink-600 font-bold text-base">
            ({cart.reduce((a, b) => a + b.quantity, 0)} items)
          </span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Review your glam pieces before proceeding to checkout</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-pink-100/90 overflow-hidden shadow-soft divide-y divide-pink-50">
          {cart.map((item) => (
            <div key={item.id} className="p-4 sm:p-5 flex gap-4 items-center">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-pink-50 border border-pink-100 shrink-0">
                <Image src={item.image} alt={item.title} fill className="object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                  {item.title}
                </h3>
                {item.selectedVariant && (
                  <p className="text-xs text-pink-600 font-semibold">{item.selectedVariant.name}</p>
                )}
                <p className="text-xs font-black text-pink-600 mt-0.5">
                  {formatGHS(item.price)}
                </p>

                {/* Stepper */}
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-pink-200 rounded-xl bg-pink-50/50">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-pink-600 hover:text-pink-700"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-black text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.maxStock}
                      className="w-8 h-8 flex items-center justify-center text-pink-600 hover:text-pink-700 disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-300 hover:text-red-500 p-2 transition-colors min-w-tap min-h-tap flex items-center justify-center"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-sm font-black text-slate-900">
                  {formatGHS(item.price * item.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="bg-white rounded-3xl border border-pink-100/90 p-5 sm:p-6 shadow-soft space-y-5">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-pink-50 pb-3">
            Order Summary
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Delivery Destination:
            </label>
            <select
              value={selectedDeliveryZoneId}
              onChange={(e) => setSelectedDeliveryZoneId(e.target.value)}
              className="w-full text-xs py-2.5 px-3 bg-pink-50/40 border border-pink-200 rounded-2xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {mockDeliveryZones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} — {formatGHS(z.deliveryFee)}
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Have a coupon code?</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="e.g. JAYTEL10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full text-xs uppercase pl-8 pr-3 py-2 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-bold"
                />
                <Tag className="w-3.5 h-3.5 text-pink-400 absolute left-2.5 top-2.5" />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
              >
                Apply
              </button>
            </div>
            {couponMsg && (
              <p
                className={`text-[11px] font-bold ${
                  couponMsg.isError ? 'text-red-500' : 'text-pink-600'
                }`}
              >
                {couponMsg.text}
              </p>
            )}
            {appliedCoupon && (
              <div className="flex items-center justify-between text-xs bg-pink-100 text-pink-800 px-3 py-1.5 rounded-xl border border-pink-200">
                <span className="font-bold">Applied: {appliedCoupon.code}</span>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-xs text-red-600 hover:underline font-bold"
                >
                  Remove
                </button>
              </div>
            )}
          </form>

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
              <span>Ghana Delivery Fee</span>
              <span className="font-bold text-slate-900">{formatGHS(deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-pink-200">
              <span>Total Amount</span>
              <span className="text-pink-600 text-xl">{formatGHS(total)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl font-black text-sm shadow-pink flex items-center justify-center gap-2 transition-transform active:scale-[0.98] min-h-tap"
          >
            <span>Proceed to Checkout ♥</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-1">
            <ShieldCheck className="w-4 h-4 text-pink-500" />
            <span>Encrypted & Verified Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
}
