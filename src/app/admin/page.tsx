'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  TrendingUp,
  ShieldAlert,
  Crown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { mockProducts, mockCategories, mockDeliveryZones } from '@/data/mockData';
import { formatGHS, formatDate } from '@/lib/utils';
import { Order, OrderStatus, Product, ProductCategory } from '@/types';
import CategoryManager from '@/components/admin/CategoryManager';
import BannerManager from '@/components/admin/BannerManager';
import StoreSettingsManager from '@/components/admin/StoreSettingsManager';
import ProductManager from '@/components/admin/ProductManager';
import CouponManager from '@/components/admin/CouponManager';
import DeliveryZoneManager from '@/components/admin/DeliveryZoneManager';

export default function AdminDashboardPage() {
  const { user, isAdmin, switchDemoRole } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'products' | 'categories' | 'banners' | 'coupons' | 'zones' | 'settings'
  >('overview');

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [categories, setCategories] = useState<ProductCategory[]>(mockCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [ordersRes, prodsRes, catsRes] = await Promise.all([
          fetch('/api/admin/orders', { credentials: 'include' }),
          fetch('/api/admin/products', { credentials: 'include' }),
          fetch('/api/admin/categories', { credentials: 'include' }),
        ]);

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          if (ordersData.success && Array.isArray(ordersData.orders)) {
            setOrders(ordersData.orders);
          }
        }

        if (prodsRes.ok) {
          const prodsData = await prodsRes.json();
          if (prodsData.success && Array.isArray(prodsData.products)) {
            setProducts(prodsData.products);
          }
        }

        if (catsRes.ok) {
          const catsData = await catsRes.json();
          if (catsData.success && Array.isArray(catsData.categories) && catsData.categories.length > 0) {
            setCategories(catsData.categories);
          }
        }
      } catch (err) {
        console.error('Error loading admin data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };


  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-4xl border border-pink-200 p-8 text-center space-y-4 shadow-soft">
        <div className="w-16 h-16 rounded-full bg-pink-100 text-pink-600 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-black text-slate-900">Jaytel Admin Portal</h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          Access to the administrative control center is restricted to verified store administrators with trusted server credentials.
        </p>
        <div className="pt-2">
          <Link
            href="/account?redirect=/admin"
            className="inline-block px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl text-xs font-black shadow-pink"
          >
            Sign In with Admin Account
          </Link>
        </div>
        <div>
          <Link href="/" className="text-xs text-slate-400 hover:text-pink-600">
            &larr; Return to Jaytel Boutique
          </Link>
        </div>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'success' ? o.total : 0), 0);
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => ['confirmed', 'processing'].includes(o.status)).length;
  const lowStockCount = products.filter((p) => p.stock < 10).length;

  return (
    <div className="space-y-8">
      {/* Admin Header with Jaytel Logo */}
      <div className="bg-gradient-to-r from-pink-700 via-rose-600 to-pink-800 text-white rounded-4xl p-6 sm:p-8 shadow-pink-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-full overflow-hidden bg-white border-2 border-pink-300 shadow-md shrink-0">
            <Image src="/logo.png" alt="Jaytel Logo" fill className="object-cover" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-black mb-1.5 backdrop-blur-md">
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              <span>Jaytel Classic Store Admin</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight">Operations Dashboard</h1>
            <p className="text-xs text-pink-200 mt-0.5">
              Live inventory, categories, hero banners, fulfillment, and settings
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950/40 p-1 rounded-2xl self-start sm:self-center overflow-x-auto max-w-full backdrop-blur-md border border-white/20">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'orders', label: 'Orders' },
            { id: 'products', label: '🛍 Products' },
            { id: 'coupons', label: '🏷 Promo Codes' },
            { id: 'categories', label: 'Categories' },
            { id: 'banners', label: 'Hero Banners' },
            { id: 'zones', label: 'Zones' },
            { id: 'settings', label: 'Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black capitalize transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-pink-700 shadow-sm'
                  : 'text-pink-100 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl border border-pink-100 p-5 shadow-soft space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Revenue
              </span>
              <p className="text-xl sm:text-2xl font-black text-pink-600">
                {formatGHS(totalRevenue)}
              </p>
              <span className="text-[10px] text-pink-700 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-pink-500" /> Verified MoMo & Card receipts
              </span>
            </div>

            <div className="bg-white rounded-3xl border border-pink-100 p-5 shadow-soft space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Orders
              </span>
              <p className="text-xl sm:text-2xl font-black text-slate-900">
                {totalOrdersCount}
              </p>
              <span className="text-[10px] text-slate-500">All channels</span>
            </div>

            <div className="bg-white rounded-3xl border border-pink-100 p-5 shadow-soft space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Pending Dispatch
              </span>
              <p className="text-xl sm:text-2xl font-black text-amber-500">
                {pendingOrdersCount}
              </p>
              <span className="text-[10px] text-amber-700 font-semibold">Requires packaging</span>
            </div>

            <div className="bg-white rounded-3xl border border-pink-100 p-5 shadow-soft space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Low Stock Alerts
              </span>
              <p className="text-xl sm:text-2xl font-black text-rose-600">{lowStockCount}</p>
              <span className="text-[10px] text-rose-600 font-semibold">Under 10 units</span>
            </div>
          </div>

          <div className="bg-white rounded-4xl border border-pink-100 p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-pink-50 pb-3">
              <h2 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                Recent Orders
              </h2>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs text-pink-600 font-black hover:underline"
              >
                View all orders &rarr;
              </button>
            </div>

            {orders.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No orders yet. Place a test order in the boutique to see live data here!
              </p>
            ) : (
              <div className="divide-y divide-pink-50">
                {orders.slice(0, 5).map((o) => (
                  <div key={o.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="font-mono font-black text-slate-900">{o.orderNumber}</span>
                      <p className="text-[11px] text-slate-500">
                        {o.customerName} ({o.customerPhone}) • {formatDate(o.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-pink-600 block">{formatGHS(o.total)}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-pink-100 text-pink-800">
                        {o.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-4xl border border-pink-100 p-6 shadow-soft space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-base text-slate-900">Order Management & Fulfillment</h2>
            <span className="text-xs bg-pink-100 text-pink-800 px-3 py-1 rounded-full font-bold">
              {orders.length} orders
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No orders have been placed yet.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-5 border border-pink-100 rounded-3xl bg-pink-50/30 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-pink-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-slate-900">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            order.paymentStatus === 'success'
                              ? 'bg-pink-100 text-pink-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          Payment: {order.paymentStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Customer: <strong>{order.customerName}</strong> • Phone:{' '}
                        <strong>{order.customerPhone}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-slate-600">Update Status:</label>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                        }
                        className="text-xs py-1.5 px-3 bg-white border border-pink-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-pink-500"
                      >
                        <option value="pending_payment">Pending Payment</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-xs space-y-1">
                    <p className="font-bold text-slate-700">Order Items:</p>
                    {order.items.map((it, i) => (
                      <p key={i} className="text-slate-600">
                        {it.quantity}x {it.title} — {formatGHS(it.subtotal)}
                      </p>
                    ))}
                  </div>

                  <div className="text-xs text-slate-600 bg-white p-3 rounded-2xl border border-pink-100">
                    <strong>Delivery: </strong>
                    {order.shippingAddress ? (
                      <span>
                        {order.shippingAddress.streetAddress}, {order.shippingAddress.townOrArea},{' '}
                        {order.shippingAddress.city} ({order.shippingAddress.region})
                      </span>
                    ) : (
                      <span>Pickup at Jaytel East Legon / Osu Boutique</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Products Tab — Full ProductManager */}
      {activeTab === 'products' && (
        <ProductManager categories={categories} onProductsChange={setProducts} />
      )}

      {/* Promo Codes / Coupons Tab */}
      {activeTab === 'coupons' && <CouponManager />}

      {/* Delivery Zones Tab */}
      {activeTab === 'zones' && <DeliveryZoneManager />}

      {/* Categories Management Tab */}
      {activeTab === 'categories' && (
        <CategoryManager onCategoriesChange={setCategories} />
      )}

      {/* Hero Banners Management Tab */}
      {activeTab === 'banners' && <BannerManager />}

      {/* Store Global Settings Tab */}
      {activeTab === 'settings' && <StoreSettingsManager />}
    </div>
  );
}
