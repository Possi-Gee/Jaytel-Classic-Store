'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  MapPin,
  AlertCircle,
  Heart,
  Crown,
  ShieldCheck,
  Save,
  ShoppingBag,
  ExternalLink,
  Phone,
  Building2,
  Calendar,
  Sparkles,
  Navigation,
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from '@/types';
import { formatGHS, formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

// Milestone steps tailored specifically for Doorstep Delivery
const DOORSTEP_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'confirmed', label: 'Order Confirmed', desc: 'Order placed & verified' },
  { status: 'processing', label: 'Glam Packaging', desc: 'Gift-wrapped at boutique' },
  { status: 'ready_for_dispatch', label: 'Ready for Dispatch', desc: 'Sealed for rider' },
  { status: 'out_for_delivery', label: 'Rider Dispatched', desc: 'Courier en route to you' },
  { status: 'delivered', label: 'Delivered', desc: 'Arrived at your doorstep' },
];

// Milestone steps tailored specifically for In-Store Boutique Pickup
const PICKUP_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'confirmed', label: 'Order Confirmed', desc: 'Order placed & verified' },
  { status: 'processing', label: 'Glam Packaging', desc: 'Prepared at boutique' },
  { status: 'ready_for_pickup', label: 'Ready for Pickup', desc: 'Waiting at VIP counter' },
  { status: 'delivered', label: 'Collected', desc: 'Picked up by customer' },
];

function OrdersContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('query') || '';
  const { user, isAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [searched, setSearched] = useState(false);

  // Admin live update state
  const [editStatus, setEditStatus] = useState<OrderStatus>('confirmed');
  const [editPaymentStatus, setEditPaymentStatus] = useState<PaymentStatus>('pending');
  const [adminNote, setAdminNote] = useState('');
  // Courier fields for Doorstep Delivery
  const [riderName, setRiderName] = useState('');
  const [riderPhone, setRiderPhone] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [estArrival, setEstArrival] = useState('');
  // Shelf field for Boutique Pickup
  const [pickupShelf, setPickupShelf] = useState('');

  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync admin form fields whenever the active order changes
  useEffect(() => {
    if (searchedOrder) {
      setEditStatus(searchedOrder.status);
      setEditPaymentStatus(searchedOrder.paymentStatus);
      setAdminNote('');
      setRiderName(searchedOrder.courierDetails?.riderName || '');
      setRiderPhone(searchedOrder.courierDetails?.riderPhone || '');
      setVehicleInfo(searchedOrder.courierDetails?.vehicleInfo || '');
      setEstArrival(searchedOrder.courierDetails?.estArrival || '');
      setPickupShelf(
        searchedOrder.pickupLocation && searchedOrder.pickupLocation.includes('Shelf')
          ? searchedOrder.pickupLocation
          : ''
      );
      setUpdateMessage(null);
    }
  }, [searchedOrder]);

  // Load orders history (admin, authenticated customer, or guest stored order numbers)
  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);

        // 1. If admin, load all store orders
        if (isAdmin) {
          const res = await fetch('/api/admin/orders');
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.orders)) {
              setOrders(data.orders);
              if (queryParam) {
                const found = data.orders.find(
                  (o: Order) =>
                    o.orderNumber.toUpperCase() === queryParam.toUpperCase() || o.id === queryParam
                );
                if (found) {
                  setSearchedOrder(found);
                  setSearched(true);
                }
              }
              setLoading(false);
              return;
            }
          }
        }

        // 2. If URL has queryParam, fetch that specific order directly
        if (queryParam) {
          const res = await fetch(`/api/orders/create?query=${encodeURIComponent(queryParam)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.order) {
              setSearchedOrder(data.order);
              setSearched(true);
            }
          }
        }

        // 3. Load authenticated customer orders
        const fetchedList: Order[] = [];
        const authRes = await fetch('/api/orders/create');
        if (authRes.ok) {
          const authData = await authRes.json();
          if (authData.success && Array.isArray(authData.orders)) {
            fetchedList.push(...authData.orders);
          }
        }

        // 4. Also check device localStorage for guest order numbers
        if (typeof window !== 'undefined') {
          try {
            const localOrderNums: string[] = JSON.parse(
              localStorage.getItem('jaytel_my_order_numbers') || '[]'
            );

            // Fetch any missing orders by number
            for (const num of localOrderNums) {
              if (!fetchedList.some((o) => o.orderNumber === num)) {
                const singleRes = await fetch(`/api/orders/create?query=${encodeURIComponent(num)}`);
                if (singleRes.ok) {
                  const singleData = await singleRes.json();
                  if (singleData.success && singleData.order) {
                    fetchedList.push(singleData.order);
                  }
                }
              }
            }
          } catch (e) {
            console.error('Error loading local orders:', e);
          }
        }

        // Deduplicate and sort by createdAt desc
        const uniqueOrders = Array.from(new Map(fetchedList.map((o) => [o.orderNumber, o])).values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setOrders(uniqueOrders);

        // Default to latest order if available and no specific search
        if (!queryParam && uniqueOrders.length > 0 && !searchedOrder) {
          setSearchedOrder(uniqueOrders[0]);
          setSearched(true);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [queryParam, isAdmin]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/orders/create?query=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (data.success && data.order) {
        setSearchedOrder(data.order);
      } else {
        setSearchedOrder(null);
      }
      setSearched(true);
    } catch {
      setSearchedOrder(null);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchedOrder) return;

    try {
      setUpdating(true);
      setUpdateMessage(null);

      const isDelivery = searchedOrder.deliveryType === 'delivery';

      // Build courier payload for Doorstep Delivery
      const courierPayload =
        isDelivery && (riderName || riderPhone || vehicleInfo || estArrival)
          ? {
              riderName: riderName.trim(),
              riderPhone: riderPhone.trim(),
              vehicleInfo: vehicleInfo.trim(),
              estArrival: estArrival.trim(),
            }
          : undefined;

      // Automatically construct descriptive timeline note based on delivery destination type
      let computedNote = adminNote.trim();
      if (!computedNote) {
        if (isDelivery) {
          if (editStatus === 'out_for_delivery') {
            computedNote = `Package dispatched with Rider ${riderName || 'Courier'} ${
              riderPhone ? `(${riderPhone})` : ''
            } ${vehicleInfo ? `on ${vehicleInfo}` : ''}. Expected: ${estArrival || 'En route to customer doorstep'}`;
          } else if (editStatus === 'ready_for_dispatch') {
            computedNote = `Package packed and sealed for rider dispatch to ${
              searchedOrder.shippingAddress?.townOrArea || 'Accra destination'
            }`;
          } else if (editStatus === 'delivered') {
            computedNote = `Package hand-delivered to customer doorstep in ${
              searchedOrder.shippingAddress?.townOrArea || 'Accra'
            }`;
          } else {
            computedNote = `Delivery status updated to ${editStatus.replace(/_/g, ' ')}`;
          }
        } else {
          // Boutique Pickup Notes
          if (editStatus === 'ready_for_pickup') {
            computedNote = `Glam package is ready for collection at Jaytel Boutique East Legon ${
              pickupShelf ? `(${pickupShelf})` : '(VIP Counter)'
            }.`;
          } else if (editStatus === 'delivered') {
            computedNote = `Customer collected glam package in person at Jaytel Classic Boutique showroom.`;
          } else {
            computedNote = `Pickup status updated to ${editStatus.replace(/_/g, ' ')}`;
          }
        }
      }

      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: searchedOrder.id,
          status: editStatus,
          paymentStatus: editPaymentStatus,
          note: computedNote,
          courierDetails: courierPayload,
          pickupLocation:
            !isDelivery && pickupShelf
              ? `Jaytel Classic Boutique, East Legon (${pickupShelf})`
              : searchedOrder.pickupLocation,
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setSearchedOrder(data.order);
        setOrders((prev) => prev.map((o) => (o.id === data.order.id ? data.order : o)));
        setUpdateMessage({
          type: 'success',
          text: `Order ${data.order.orderNumber} successfully updated (${isDelivery ? 'Doorstep Delivery' : 'Boutique Pickup'})!`,
        });
      } else {
        throw new Error(data.error || 'Failed to update order');
      }
    } catch (err: any) {
      setUpdateMessage({
        type: 'error',
        text: err.message || 'Error updating order',
      });
    } finally {
      setUpdating(false);
    }
  };

  const isDeliveryOrder = searchedOrder?.deliveryType === 'delivery';
  const activeMilestoneSteps = isDeliveryOrder ? DOORSTEP_STEPS : PICKUP_STEPS;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-pink-100 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-pink-500" />
            <span>{isAdmin ? 'Store Orders & Dispatch Management' : 'Track Your Jaytel Glam Package'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAdmin
              ? 'View customer delivery destinations and update dispatch courier or boutique pickup statuses.'
              : 'Enter your Jaytel Order Number (e.g. JTC-2026-...) or select from your recent orders below.'}
          </p>
        </div>

        {isAdmin && (
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-pink-100 hover:bg-pink-200 text-pink-800 text-xs font-bold transition-colors shrink-0"
          >
            <ShieldCheck className="w-4 h-4 text-pink-600" />
            <span>Full Admin Dashboard</span>
            <ExternalLink className="w-3 h-3 ml-1" />
          </Link>
        )}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="e.g. JTC-2026-12345 or order ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs py-3 pl-10 pr-3 rounded-2xl border border-pink-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
          />
          <Search className="w-4 h-4 text-pink-400 absolute left-3.5 top-3.5" />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl text-xs font-bold hover:opacity-95 transition-opacity shrink-0 shadow-pink"
        >
          Track Package ♥
        </button>
      </form>

      {/* Selected / Searched Order Details */}
      {searched && (
        <div>
          {searchedOrder ? (
            <div className="bg-white rounded-4xl border border-pink-100 p-6 sm:p-8 shadow-soft space-y-6">
              {/* ADMIN LIVE CONTROL CARD (Customized by Delivery Destination) */}
              {isAdmin && (
                <div
                  className={`p-5 rounded-3xl border shadow-sm space-y-4 ${
                    isDeliveryOrder
                      ? 'bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-pink-50/60 border-blue-200'
                      : 'bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50/50 border-pink-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-pink-200/80 pb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-bold shadow-sm ${
                          isDeliveryOrder ? 'bg-blue-600' : 'bg-pink-600'
                        }`}
                      >
                        {isDeliveryOrder ? <Truck className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                            Admin Dispatch & Fulfillment Control
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              isDeliveryOrder
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-pink-100 text-pink-800 border border-pink-200'
                            }`}
                          >
                            {isDeliveryOrder ? 'Doorstep Delivery' : 'In-Store Pickup'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-600 mt-0.5">
                          {isDeliveryOrder
                            ? `Destination: ${searchedOrder.shippingAddress?.townOrArea || ''}, ${searchedOrder.shippingAddress?.city || 'Accra'}`
                            : 'Destination: Jaytel Boutique Flagship (East Legon Showroom)'}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase self-start sm:self-auto">
                      Admin Access
                    </span>
                  </div>

                  {updateMessage && (
                    <div
                      className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                        updateMessage.type === 'success'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}
                    >
                      {updateMessage.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span>{updateMessage.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleAdminUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                          {isDeliveryOrder ? '🚚 Doorstep Delivery Status:' : '🛍️ Boutique Pickup Status:'}
                        </label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as OrderStatus)}
                          className="w-full text-xs py-2.5 px-3 rounded-xl border border-pink-200 bg-white font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-sm"
                        >
                          <option value="pending_payment">Pending Payment</option>
                          <option value="confirmed">Order Confirmed</option>
                          <option value="processing">
                            {isDeliveryOrder ? 'Glam Packaging & Preparation' : 'Glam Packaging & Shelf Tagging'}
                          </option>
                          {isDeliveryOrder ? (
                            <>
                              <option value="ready_for_dispatch">Ready for Dispatch (Package Sealed)</option>
                              <option value="out_for_delivery">Out for Delivery (Rider Dispatched)</option>
                              <option value="delivered">Delivered to Customer Doorstep</option>
                            </>
                          ) : (
                            <>
                              <option value="ready_for_pickup">Ready for Pickup (Waiting at Boutique)</option>
                              <option value="delivered">Collected by Customer at Showroom</option>
                            </>
                          )}
                          <option value="cancelled">Order Cancelled</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                          Payment Verification:
                        </label>
                        <select
                          value={editPaymentStatus}
                          onChange={(e) => setEditPaymentStatus(e.target.value as PaymentStatus)}
                          className="w-full text-xs py-2.5 px-3 rounded-xl border border-pink-200 bg-white font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-sm"
                        >
                          <option value="pending">Pending Payment</option>
                          <option value="processing">Payment Processing</option>
                          <option value="success">Payment Verified (Success)</option>
                          <option value="failed">Failed / Declined</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </div>
                    </div>

                    {/* Differentiated Fields: Doorstep Courier Rider vs Boutique Pickup Counter */}
                    {isDeliveryOrder ? (
                      <div className="bg-white/80 p-3.5 rounded-2xl border border-blue-200 space-y-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-black text-blue-900">
                          <Truck className="w-3.5 h-3.5 text-blue-600" />
                          <span>Assign Dispatch Rider & Courier Information:</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                          <div>
                            <span className="block text-[10px] font-bold text-slate-600">Rider Name:</span>
                            <input
                              type="text"
                              placeholder="e.g. Kwesi Mensah"
                              value={riderName}
                              onChange={(e) => setRiderName(e.target.value)}
                              className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white font-medium"
                            />
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-slate-600">Rider Phone:</span>
                            <input
                              type="text"
                              placeholder="e.g. 0244123456"
                              value={riderPhone}
                              onChange={(e) => setRiderPhone(e.target.value)}
                              className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white font-medium"
                            />
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-slate-600">Vehicle / Bike Reg:</span>
                            <input
                              type="text"
                              placeholder="e.g. Motorbike M-24-GR 4012"
                              value={vehicleInfo}
                              onChange={(e) => setVehicleInfo(e.target.value)}
                              className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white font-medium"
                            />
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-slate-600">Est. Arrival Time:</span>
                            <input
                              type="text"
                              placeholder="e.g. In 45 mins / 2:30 PM"
                              value={estArrival}
                              onChange={(e) => setEstArrival(e.target.value)}
                              className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white/80 p-3.5 rounded-2xl border border-pink-200 space-y-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-black text-pink-900">
                          <ShoppingBag className="w-3.5 h-3.5 text-pink-600" />
                          <span>Boutique Pickup Storage & Counter Details:</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <span className="block text-[10px] font-bold text-slate-600">Boutique Shelf / Locker:</span>
                            <input
                              type="text"
                              placeholder="e.g. VIP Locker #4 / Front Counter Shelf B"
                              value={pickupShelf}
                              onChange={(e) => setPickupShelf(e.target.value)}
                              className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white font-medium"
                            />
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-slate-600">Custom Timeline Note (Optional):</span>
                            <input
                              type="text"
                              placeholder="e.g. Packaged in signature rose bag; customer notified"
                              value={adminNote}
                              onChange={(e) => setAdminNote(e.target.value)}
                              className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={updating}
                        className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{updating ? 'Saving Changes...' : 'Save Order Update Live'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-pink-50 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-pink-600 uppercase tracking-widest flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5 text-pink-500" />
                      <span>{isDeliveryOrder ? 'Doorstep Package' : 'Boutique Pickup'}</span>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        isDeliveryOrder ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                      }`}
                    >
                      {isDeliveryOrder ? 'Doorstep Delivery' : 'In-Store Pickup'}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 font-mono mt-0.5">
                    {searchedOrder.orderNumber}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-pink-100 text-pink-800">
                    {searchedOrder.status.replace(/_/g, ' ')}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      searchedOrder.paymentStatus === 'success'
                        ? 'bg-emerald-100 text-emerald-800'
                        : searchedOrder.paymentStatus === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    Payment: {searchedOrder.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Differentiated Visual Milestone Tracker */}
              <div className="py-4">
                <div className="text-center pb-3">
                  <p className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    {isDeliveryOrder ? 'Doorstep Delivery Journey' : 'Boutique Collection Journey'}
                  </p>
                </div>

                <div className="relative flex items-center justify-between">
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-pink-100 -translate-y-1/2 z-0" />
                  {activeMilestoneSteps.map((step, idx) => {
                    let isCompleted = false;

                    if (isDeliveryOrder) {
                      if (step.status === 'confirmed') {
                        isCompleted = searchedOrder.status !== 'pending_payment';
                      } else if (step.status === 'processing') {
                        isCompleted = ['processing', 'ready_for_dispatch', 'out_for_delivery', 'delivered'].includes(
                          searchedOrder.status
                        );
                      } else if (step.status === 'ready_for_dispatch') {
                        isCompleted = ['ready_for_dispatch', 'out_for_delivery', 'delivered'].includes(
                          searchedOrder.status
                        );
                      } else if (step.status === 'out_for_delivery') {
                        isCompleted = ['out_for_delivery', 'delivered'].includes(searchedOrder.status);
                      } else if (step.status === 'delivered') {
                        isCompleted = searchedOrder.status === 'delivered';
                      }
                    } else {
                      // Pickup flow
                      if (step.status === 'confirmed') {
                        isCompleted = searchedOrder.status !== 'pending_payment';
                      } else if (step.status === 'processing') {
                        isCompleted = ['processing', 'ready_for_pickup', 'delivered'].includes(searchedOrder.status);
                      } else if (step.status === 'ready_for_pickup') {
                        isCompleted = ['ready_for_pickup', 'delivered'].includes(searchedOrder.status);
                      } else if (step.status === 'delivered') {
                        isCompleted = searchedOrder.status === 'delivered';
                      }
                    }

                    return (
                      <div key={idx} className="relative z-10 flex flex-col items-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isCompleted
                              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink scale-110'
                              : 'bg-white border-2 border-pink-200 text-pink-300'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                        </div>
                        <span className="text-[10px] font-bold text-slate-800 mt-2 text-center max-w-[75px] leading-tight">
                          {step.label}
                        </span>
                        <span className="text-[8px] text-slate-400 text-center max-w-[75px] hidden sm:block mt-0.5">
                          {step.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Assigned Courier Card (Doorstep Delivery Only) */}
              {isDeliveryOrder && searchedOrder.courierDetails?.riderName && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50/60 p-4 rounded-3xl border border-blue-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
                        Assigned Courier Rider
                      </span>
                      <h4 className="text-sm font-black text-slate-900">
                        {searchedOrder.courierDetails.riderName}
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        {searchedOrder.courierDetails.vehicleInfo || 'Motorbike Dispatch'}
                        {searchedOrder.courierDetails.estArrival && (
                          <span className="font-semibold text-blue-800">
                            {' '}
                            • Est: {searchedOrder.courierDetails.estArrival}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {searchedOrder.courierDetails.riderPhone && (
                    <a
                      href={`tel:${searchedOrder.courierDetails.riderPhone}`}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors shrink-0"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Rider ({searchedOrder.courierDetails.riderPhone})</span>
                    </a>
                  )}
                </div>
              )}

              {/* Boutique Collection Pass Card (In-Store Pickup Only) */}
              {!isDeliveryOrder && (
                <div className="bg-gradient-to-r from-pink-50 to-rose-50/60 p-4 rounded-3xl border border-pink-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shrink-0 shadow-pink">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-pink-700 tracking-wider">
                        Boutique In-Store Collection Pass
                      </span>
                      <h4 className="text-sm font-black text-slate-900">
                        Jaytel Classic Boutique — Flagship Showroom
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        Lagos Avenue, East Legon, Accra (Near A&C Mall)
                      </p>
                      <p className="text-[10px] text-pink-600 font-semibold mt-0.5">
                        Hours: Mon - Sat: 9:00 AM - 7:30 PM • Sunday: 1:00 PM - 6:00 PM
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/80 border border-pink-200 px-3 py-2 rounded-xl text-center shrink-0">
                    <span className="text-[9px] font-bold text-slate-500 block uppercase">Pickup Code:</span>
                    <span className="text-xs font-black font-mono text-pink-600">{searchedOrder.orderNumber}</span>
                  </div>
                </div>
              )}

              {/* Timeline Updates */}
              {searchedOrder.timeline && searchedOrder.timeline.length > 0 && (
                <div className="bg-pink-50/40 p-4 rounded-3xl border border-pink-100 space-y-2.5">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-pink-500" />
                    <span>Tracking Activity & Dispatch Log</span>
                  </h3>
                  <div className="space-y-2 divide-y divide-pink-100/60">
                    {searchedOrder.timeline.map((entry, idx) => (
                      <div key={idx} className="pt-2 text-xs flex justify-between gap-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900">{entry.note}</p>
                          <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-pink-100 text-pink-700">
                            {entry.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">
                          {formatDate(entry.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Package Contents Breakdown */}
              <div className="space-y-3 border-t border-pink-50 pt-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Package Contents ({searchedOrder.items.length} items)
                </h3>
                <div className="divide-y divide-pink-50">
                  {searchedOrder.items.map((it, i) => (
                    <div key={i} className="py-2.5 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{it.title}</span>
                        <span className="text-slate-500 block text-[11px]">
                          Qty: {it.quantity} × {formatGHS(it.price)}
                          {it.variantName && ` • ${it.variantName}`}
                        </span>
                      </div>
                      <span className="font-black text-pink-600">{formatGHS(it.subtotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-pink-100 pt-3 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>{formatGHS(searchedOrder.subtotal)}</span>
                  </div>
                  {searchedOrder.discount > 0 && (
                    <div className="flex justify-between text-pink-600 font-bold">
                      <span>Discount:</span>
                      <span>-{formatGHS(searchedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>
                      {isDeliveryOrder ? 'Ghana Doorstep Delivery Fee:' : 'In-Store Boutique Pickup:'}
                    </span>
                    <span className="font-bold">
                      {isDeliveryOrder ? formatGHS(searchedOrder.deliveryFee) : 'FREE (GH₵ 0.00)'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-pink-100">
                    <span>Total Amount:</span>
                    <span className="text-pink-600 font-mono text-base">{formatGHS(searchedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Differentiated Destination Box (Doorstep Delivery Address vs In-Store Pickup Location) */}
              <div
                className={`p-4 rounded-3xl border text-xs space-y-2 ${
                  isDeliveryOrder ? 'bg-blue-50/40 border-blue-100' : 'bg-pink-50/40 border-pink-100'
                }`}
              >
                <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                  {isDeliveryOrder ? (
                    <MapPin className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Building2 className="w-4 h-4 text-pink-600" />
                  )}
                  <span className="uppercase text-[11px] font-black tracking-wider">
                    {isDeliveryOrder
                      ? 'Selected Customer Delivery Destination:'
                      : 'Selected Boutique Pickup Showroom:'}
                  </span>
                </div>

                {isDeliveryOrder ? (
                  searchedOrder.shippingAddress ? (
                    <div className="space-y-1 text-slate-700 leading-relaxed pl-1">
                      <p className="font-bold text-slate-900">
                        {searchedOrder.shippingAddress.fullName || searchedOrder.customerName}
                      </p>
                      <p>
                        {searchedOrder.shippingAddress.streetAddress},{' '}
                        {searchedOrder.shippingAddress.townOrArea}, {searchedOrder.shippingAddress.city},{' '}
                        {searchedOrder.shippingAddress.region} Region.
                      </p>
                      {searchedOrder.shippingAddress.landmark && (
                        <p className="text-[11px] text-slate-500">
                          Landmark: <em>{searchedOrder.shippingAddress.landmark}</em>
                        </p>
                      )}
                      {searchedOrder.shippingAddress.digitalAddress && (
                        <div className="pt-1">
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-800 font-bold border border-blue-200">
                            <Navigation className="w-3 h-3 text-blue-600" />
                            <span>GhanaPost GPS: {searchedOrder.shippingAddress.digitalAddress}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-600">
                      Dispatched to verified customer address.
                    </p>
                  )
                ) : (
                  <div className="space-y-1 text-slate-700 leading-relaxed pl-1">
                    <p className="font-bold text-slate-900">
                      Jaytel Classic Boutique (East Legon Showroom)
                    </p>
                    <p className="text-slate-600">
                      Lagos Avenue, East Legon / Osu, Accra (Near A&C Mall)
                    </p>
                    <p className="text-[11px] text-pink-700 font-medium">
                      Location Note: {searchedOrder.pickupLocation || 'VIP Collection Counter'}
                    </p>
                  </div>
                )}

                {(searchedOrder.customerPhone || (searchedOrder as any).maskedCustomer?.phone) && (
                  <p className="text-slate-600 text-[11px] pt-1.5 border-t border-slate-200/60">
                    Recipient Contact:{' '}
                    <strong>
                      {searchedOrder.customerPhone || (searchedOrder as any).maskedCustomer?.phone}
                    </strong>{' '}
                    {searchedOrder.customerName ? `(${searchedOrder.customerName})` : ''}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 bg-white rounded-4xl border border-pink-100 text-center space-y-3 shadow-soft">
              <AlertCircle className="w-8 h-8 text-pink-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">Order Not Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                We couldn't find an order matching "{searchQuery}". Please check your order reference number or browse your recent orders below.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recent Orders List (Accessible for Both Customers & Admins) */}
      {orders.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-pink-500" />
              <span>{isAdmin ? 'All Store Orders Ledger' : 'Your Recent Orders'}</span>
            </h2>
            <span className="text-xs text-pink-600 font-bold">
              {orders.length} order{orders.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="space-y-3">
            {orders.map((o) => {
              const isSelected = searchedOrder?.id === o.id;
              const isOrderDelivery = o.deliveryType === 'delivery';

              return (
                <div
                  key={o.id}
                  onClick={() => {
                    setSearchedOrder(o);
                    setSearched(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`bg-white rounded-3xl border p-4 transition-all cursor-pointer shadow-soft flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'border-pink-500 ring-2 ring-pink-500/20 bg-pink-50/20'
                      : 'border-pink-100 hover:border-pink-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-black text-xs text-slate-900">
                        {o.orderNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-pink-100 text-pink-800">
                        {o.status.replace(/_/g, ' ')}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          isOrderDelivery ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                        }`}
                      >
                        {isOrderDelivery ? '🚚 Doorstep Delivery' : '🛍️ Boutique Pickup'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          o.paymentStatus === 'success'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {o.paymentStatus}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      {o.items.length} item(s) • Total:{' '}
                      <strong className="text-slate-900">{formatGHS(o.total)}</strong> •{' '}
                      {formatDate(o.createdAt)}
                    </p>

                    <p className="text-[10px] text-slate-600 font-medium">
                      {isOrderDelivery && o.shippingAddress
                        ? `Destination: ${o.shippingAddress.streetAddress}, ${o.shippingAddress.townOrArea}, ${o.shippingAddress.city} (${o.shippingAddress.region})`
                        : `Destination: Jaytel Classic Boutique (East Legon, Accra)`}
                    </p>

                    {isAdmin && o.customerName && (
                      <p className="text-[10px] text-pink-700 font-medium">
                        Customer: {o.customerName} ({o.customerPhone})
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-pink-600 hidden sm:inline">
                      {isSelected ? 'Viewing' : 'Track Package'}
                    </span>
                    <ArrowRight
                      className={`w-4 h-4 text-pink-400 transition-transform ${
                        isSelected ? 'rotate-90 text-pink-600' : ''
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {orders.length === 0 && !loading && !searched && (
        <div className="p-8 bg-white rounded-4xl border border-pink-100 text-center space-y-3 shadow-soft">
          <Package className="w-8 h-8 text-pink-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Orders Placed Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any recent orders recorded on this device yet. Start exploring our glamorous chic collection!
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-block px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl text-xs font-bold shadow-pink"
            >
              Shop Boutique Now
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-pink-600 font-medium">Loading orders & live tracking...</p>
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
