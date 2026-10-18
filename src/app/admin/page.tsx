'use client';

import React, { useState, useEffect } from 'react';
import CloudinaryImageUploader from '@/components/admin/CloudinaryImageUploader';
import Link from 'next/link';
import Image from 'next/image';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Truck,
  ShieldAlert,
  Search,
  Crown,
  Heart,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { mockProducts, mockCategories, mockDeliveryZones, mockCoupons } from '@/data/mockData';
import { formatGHS, formatDate } from '@/lib/utils';
import { Order, OrderStatus, Product } from '@/types';

export default function AdminDashboardPage() {
  const { user, isAdmin, switchDemoRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'zones'>('overview');

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [loading, setLoading] = useState(true);

  // New product modal state
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState(mockCategories[0].name);
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('10');
  const [newDesc, setNewDesc] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newImagePublicId, setNewImagePublicId] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [ordersRes, prodsRes] = await Promise.all([
          fetch('/api/admin/orders'),
          fetch('/api/admin/products'),
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

  const handleStockAdjust = async (productId: string, delta: number) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, stockDelta: delta }),
      });
      const data = await res.json();
      if (data.success && data.product) {
        setProducts((prev) => prev.map((p) => (p.id === productId ? data.product : p)));
      }
    } catch (err) {
      console.error('Failed to adjust stock:', err);
    }
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice) return;

    const catObj = mockCategories.find((c) => c.name === newCategory) || mockCategories[0];
    // Use uploaded Cloudinary image, or fall back to a placeholder
    const imageUrl = newImage ||
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80';

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          categoryId: catObj.id,
          price: parseFloat(newPrice),
          stock: parseInt(newStock) || 10,
          description: newDesc || 'Jaytel Classic premium glamorous piece.',
          images: [imageUrl],
          cloudinaryPublicId: newImagePublicId || null,
        }),
      });
      const data = await res.json();
      if (data.success && data.product) {
        setProducts([data.product, ...products]);
        setShowAddProduct(false);
        setNewTitle('');
        setNewPrice('');
        setNewDesc('');
        setNewImage('');
        setNewImagePublicId('');
      }
    } catch (err) {
      console.error('Failed to add product:', err);
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
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-white border-2 border-pink-300 shadow-md shrink-0">
            <Image src="/logo.png" alt="Jaytel Logo" fill className="object-cover" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-black mb-1.5 backdrop-blur-md">
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              <span>Jaytel Classic Store Admin</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight">Operations Dashboard</h1>
            <p className="text-xs text-pink-200 mt-0.5">
              Fulfillment, sales receipts, and live inventory control
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950/40 p-1 rounded-2xl self-start sm:self-center overflow-x-auto backdrop-blur-md border border-white/20">
          {(['overview', 'orders', 'products', 'zones'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black capitalize transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-white text-pink-700 shadow-sm'
                  : 'text-pink-100 hover:text-white'
              }`}
            >
              {tab}
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

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-4xl border border-pink-100 p-6 shadow-soft space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-base text-slate-900">Jaytel Catalog & Live Stock</h2>
            <button
              onClick={() => setShowAddProduct(true)}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-pink transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Glam Piece</span>
            </button>
          </div>

          {showAddProduct && (
            <form
              onSubmit={handleAddProductSubmit}
              className="p-5 bg-pink-50/50 border border-pink-200 rounded-3xl space-y-4 text-xs"
            >
              <h3 className="font-black text-sm text-slate-900">Add New Jaytel Classic Item</h3>

              {/* Product Image Upload */}
              <CloudinaryImageUploader
                label="Product Image"
                currentImageUrl={newImage || undefined}
                onUploadComplete={({ url, publicId }) => {
                  setNewImage(url);
                  setNewImagePublicId(publicId);
                }}
                onUploadError={(err) => console.error('Image upload failed:', err)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pink Pearl Mini Bag"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full p-2.5 bg-white border border-pink-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2.5 bg-white border border-pink-200 rounded-xl"
                  >
                    {mockCategories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (GH₵)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="250"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full p-2.5 bg-white border border-pink-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full p-2.5 bg-white border border-pink-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe this glamorous piece…"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2.5 bg-white border border-pink-200 rounded-xl resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl shadow-pink"
                >
                  Save to Boutique
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddProduct(false);
                    setNewImage('');
                    setNewImagePublicId('');
                  }}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-medium rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="p-4 bg-pink-50/30 border border-pink-100 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-white border border-pink-200 shrink-0">
                    <Image src={p.images[0]} alt={p.title} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{p.title}</h4>
                    <p className="text-[11px] text-pink-600 font-semibold">{p.category}</p>
                    <p className="font-black text-pink-600 mt-0.5">
                      {formatGHS(p.salePrice ?? p.price)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-700">Stock:</span>
                  <button
                    onClick={() => handleStockAdjust(p.id, -1)}
                    className="w-7 h-7 bg-white border border-pink-200 text-pink-700 rounded-lg flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <span
                    className={`font-mono font-bold px-2.5 py-0.5 rounded-full ${
                      p.stock < 10
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-pink-100 text-pink-800'
                    }`}
                  >
                    {p.stock}
                  </span>
                  <button
                    onClick={() => handleStockAdjust(p.id, 1)}
                    className="w-7 h-7 bg-white border border-pink-200 text-pink-700 rounded-lg flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivery Zones Tab */}
      {activeTab === 'zones' && (
        <div className="bg-white rounded-4xl border border-pink-100 p-6 shadow-soft space-y-4">
          <h2 className="font-black text-base text-slate-900">Ghana Delivery Zones & Fees</h2>
          <div className="space-y-3">
            {mockDeliveryZones.map((z) => (
              <div
                key={z.id}
                className="p-4 bg-pink-50/40 border border-pink-100 rounded-3xl flex justify-between items-center text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900">{z.name}</h4>
                  <p className="text-slate-500 text-[11px]">{z.estimatedDeliveryTime}</p>
                </div>
                <span className="font-black text-pink-600 text-sm">
                  {formatGHS(z.deliveryFee)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
