'use client';

import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Copy,
  Calendar,
  Sparkles,
  Percent,
  DollarSign,
  AlertCircle,
  Clock,
  Check,
} from 'lucide-react';
import { Coupon } from '@/types';
import { formatGHS, formatDate } from '@/lib/utils';

export default function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch Coupons
  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/admin/coupons');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.coupons)) {
          setCoupons(data.coupons);
        }
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCopyCode = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    const newStatus = !coupon.isActive;
    const targetId = coupon.id || coupon.code;

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: targetId, isActive: newStatus }),
      });
      const data = await res.json();
      if (data.success && data.coupon) {
        setCoupons((prev) =>
          prev.map((c) => ((c.id || c.code) === targetId ? { ...c, isActive: newStatus } : c))
        );
        setStatusMsg({
          text: `Promo code "${coupon.code}" is now ${newStatus ? 'Active' : 'Inactive'}`,
          isError: false,
        });
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (err) {
      console.error('Failed to update promo status:', err);
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    if (!confirm(`Are you sure you want to permanently delete promo code "${coupon.code}"?`)) {
      return;
    }

    const targetId = coupon.id || coupon.code;
    try {
      const res = await fetch(`/api/admin/coupons?id=${encodeURIComponent(targetId)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setCoupons((prev) => prev.filter((c) => (c.id || c.code) !== targetId));
        setStatusMsg({ text: `Promo code "${coupon.code}" deleted successfully`, isError: false });
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (err) {
      console.error('Failed to delete coupon:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          description: description.trim(),
          discountType,
          discountValue: parseFloat(discountValue),
          minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
          expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
          usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
          isActive,
        }),
      });

      const data = await res.json();
      if (data.success && data.coupon) {
        setCoupons((prev) => [data.coupon, ...prev]);
        setShowAddModal(false);
        // Reset form
        setCode('');
        setDescription('');
        setDiscountType('percentage');
        setDiscountValue('');
        setMinOrderAmount('');
        setExpiryDate('');
        setUsageLimit('');
        setIsActive(true);
        setStatusMsg({
          text: `Promo code "${data.coupon.code}" created and ready for checkout!`,
          isError: false,
        });
        setTimeout(() => setStatusMsg(null), 3500);
      } else {
        alert(data.error || 'Failed to create promo code');
      }
    } catch (err) {
      console.error('Failed to create coupon:', err);
      alert('Error creating coupon');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-4xl border border-pink-100 p-6 shadow-soft space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pink-50 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </span>
            <h2 className="font-black text-lg text-slate-900">Promo Codes & Discounts</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create coupon codes with percentage or fixed GH₵ discounts for customer checkouts and marketing campaigns.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-pink transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Promo Code</span>
        </button>
      </div>

      {/* Status Alert */}
      {statusMsg && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            statusMsg.isError
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-pink-50 text-pink-800 border border-pink-200'
          }`}
        >
          {statusMsg.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Coupons List */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading promo codes…</div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-12 bg-pink-50/30 rounded-3xl border border-dashed border-pink-200 p-6 space-y-3">
          <Tag className="w-8 h-8 text-pink-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No promo codes yet</h3>
          <p className="text-xs text-slate-400">
            Click &quot;Create New Promo Code&quot; to offer discounts to your buyers.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => {
            const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
            const isLimitReached = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;

            return (
              <div
                key={coupon.id || coupon.code}
                className={`relative p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                  !coupon.isActive || isExpired || isLimitReached
                    ? 'bg-slate-50/70 border-slate-200 opacity-75'
                    : 'bg-white border-pink-100 hover:border-pink-300 hover:shadow-soft'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar: Code and Discount */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-base tracking-wider text-slate-900 bg-pink-50/80 px-2.5 py-1 rounded-xl border border-pink-200/60 inline-flex items-center gap-1.5">
                          {coupon.code}
                          <button
                            onClick={() => handleCopyCode(coupon.code)}
                            title="Copy code"
                            className="text-pink-400 hover:text-pink-600 transition-colors"
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {coupon.description || 'Exclusive customer discount code'}
                      </p>
                    </div>

                    <span className="shrink-0 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink">
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}% OFF`
                        : formatGHS(coupon.discountValue) + ' OFF'}
                    </span>
                  </div>

                  {/* Criteria / Badges */}
                  <div className="space-y-1.5 text-[11px] text-slate-600 border-t border-pink-50 pt-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Min Order:</span>
                      <span className="font-bold text-slate-800">
                        {coupon.minOrderAmount && coupon.minOrderAmount > 0
                          ? formatGHS(coupon.minOrderAmount)
                          : 'No Minimum'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Redemptions:</span>
                      <span className="font-bold text-slate-800">
                        {coupon.usedCount}
                        {coupon.usageLimit ? ` / ${coupon.usageLimit} limit` : ' (Unlimited)'}
                      </span>
                    </div>

                    {coupon.expiryDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Expiry:
                        </span>
                        <span
                          className={`font-bold ${
                            isExpired ? 'text-rose-600' : 'text-slate-800'
                          }`}
                        >
                          {formatDate(coupon.expiryDate)}
                          {isExpired && ' (Expired)'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions & Status */}
                <div className="flex items-center justify-between border-t border-pink-50 pt-3 mt-4 text-xs">
                  <button
                    onClick={() => handleToggleStatus(coupon)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold text-[11px] transition-colors ${
                      coupon.isActive && !isExpired && !isLimitReached
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {coupon.isActive && !isExpired && !isLimitReached ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Disabled</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyCode(coupon.code)}
                      className="p-1.5 text-slate-400 hover:text-pink-600 rounded-lg hover:bg-pink-50 transition-colors"
                      title="Share / Copy"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(coupon)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete promo code"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Coupon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-4xl border border-pink-100 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <div>
                <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-pink-500" />
                  <span>Create Promo Code</span>
                </h3>
                <p className="text-xs text-slate-500">Configure discounts for buyers at checkout</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-pink-100 hover:text-pink-700 font-bold flex items-center justify-center transition-colors"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Code */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Promo Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PINKGLAM20, VALENTINE, JAYTELGIFT"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
                  className="w-full p-3 font-mono font-bold tracking-wider uppercase bg-pink-50/50 border border-pink-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-slate-900"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Customers will type this exact uppercase code in their cart / checkout.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Campaign</label>
                <input
                  type="text"
                  placeholder="e.g. 15% off Easter holiday special"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-white border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500 text-slate-900"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDiscountType('percentage')}
                      className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all ${
                        discountType === 'percentage'
                          ? 'border-pink-500 bg-pink-50 text-pink-700 ring-2 ring-pink-500'
                          : 'border-pink-100 bg-white text-slate-600 hover:border-pink-200'
                      }`}
                    >
                      <Percent className="w-3.5 h-3.5" />
                      <span>Percent (%)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('fixed')}
                      className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all ${
                        discountType === 'fixed'
                          ? 'border-pink-500 bg-pink-50 text-pink-700 ring-2 ring-pink-500'
                          : 'border-pink-100 bg-white text-slate-600 hover:border-pink-200'
                      }`}
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Fixed GH₵</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Discount Value {discountType === 'percentage' ? '(%)' : '(GH₵)'}{' '}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step={discountType === 'percentage' ? '1' : '0.5'}
                    required
                    min="1"
                    max={discountType === 'percentage' ? '100' : '10000'}
                    placeholder={discountType === 'percentage' ? '15' : '50'}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full p-2.5 bg-white border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500 font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Minimum Order Amount & Usage Limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Min Order Amount (GH₵)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="e.g. 150 (Leave 0 for none)"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    className="w-full p-2.5 bg-white border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Usage Limit (Optional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 100 uses"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="w-full p-2.5 bg-white border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500 text-slate-900"
                  />
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Expiry Date (Optional)
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full p-2.5 bg-white border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500 text-slate-900"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 p-3 bg-pink-50/50 rounded-2xl border border-pink-100">
                <input
                  type="checkbox"
                  id="promoIsActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 accent-pink-600 rounded cursor-pointer"
                />
                <label htmlFor="promoIsActive" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Activate promo code immediately upon creation
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-pink-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl shadow-pink hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {submitting ? 'Creating…' : 'Publish Promo Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
