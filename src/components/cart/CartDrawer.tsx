'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatGHS } from '@/lib/utils';
import { mockDeliveryZones } from '@/data/mockData';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
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

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = await applyCoupon(couponCode);
    setCouponMsg({ text: res.message, isError: !res.success });
    if (res.success) {
      setCouponCode('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="px-5 py-4 border-b border-pink-100 flex items-center justify-between bg-pink-50/50">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-pink-600" />
              <h2 className="text-base font-black text-slate-900">Your Shopping Bag</h2>
              <span className="text-xs bg-pink-200 text-pink-900 font-black px-2 py-0.5 rounded-full">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-slate-400 hover:text-pink-600 rounded-full hover:bg-pink-100 min-w-tap min-h-tap flex items-center justify-center"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-pink-50">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 space-y-3">
                <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center text-pink-400 mb-2">
                  <Heart className="w-8 h-8 fill-pink-100" />
                </div>
                <h3 className="text-base font-black text-slate-800">Your bag is empty</h3>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Treat yourself to a fabulous Jaytel mini bag, a dreamy pink dress, or a glossy plumping lip kit!
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-bold text-xs shadow-pink hover:opacity-95 transition-opacity"
                >
                  Start Shopping ♥
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="py-4 flex gap-3 items-center">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-pink-50 shrink-0 border border-pink-100">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                    {item.selectedVariant && (
                      <p className="text-[11px] text-pink-600 font-semibold">
                        {item.selectedVariant.name}
                      </p>
                    )}
                    <p className="text-xs font-black text-pink-600 mt-0.5">
                      {formatGHS(item.price)}
                    </p>

                    {/* Stepper */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-pink-200 rounded-xl bg-pink-50/50">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-pink-600 hover:bg-pink-100 rounded-l-xl"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="w-7 h-7 flex items-center justify-center text-pink-600 hover:bg-pink-100 rounded-r-xl disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-300 hover:text-red-500 p-1.5 rounded transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-slate-900">
                      {formatGHS(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Calculations */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-pink-100 bg-pink-50/40 space-y-3.5">
              {/* Delivery Destination */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Delivery Destination (Ghana):
                </label>
                <select
                  value={selectedDeliveryZoneId}
                  onChange={(e) => setSelectedDeliveryZoneId(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-white border border-pink-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-pink-500"
                >
                  {mockDeliveryZones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} — {formatGHS(z.deliveryFee)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Coupon code (e.g. JAYTEL10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full text-xs uppercase pl-8 pr-3 py-2 bg-white border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500 font-bold"
                  />
                  <Tag className="w-3.5 h-3.5 text-pink-400 absolute left-2.5 top-2.5" />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  Apply
                </button>
              </form>

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
                    onClick={removeCoupon}
                    className="text-xs text-red-600 hover:underline font-bold"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Summary Table */}
              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-pink-100">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">{formatGHS(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-pink-600 font-bold">
                    <span>Discount</span>
                    <span>-{formatGHS(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Est. Ghana Delivery</span>
                  <span className="font-bold text-slate-900">{formatGHS(deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-pink-200">
                  <span>Total Due</span>
                  <span className="text-pink-600 text-lg">{formatGHS(total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl font-black text-sm shadow-pink flex items-center justify-center space-x-2 transition-transform active:scale-[0.98]"
                >
                  <span>Proceed to Checkout ♥</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
