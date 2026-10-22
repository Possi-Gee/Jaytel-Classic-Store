'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  Sparkles,
  Palette,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Eye,
  Layers,
  X,
  ExternalLink,
} from 'lucide-react';
import { Product, ProductCategory, ProductVariant } from '@/types';
import { formatGHS } from '@/lib/utils';
import CloudinaryImageUploader from '@/components/admin/CloudinaryImageUploader';
import { mockProducts } from '@/data/mockData';

interface ProductManagerProps {
  categories: ProductCategory[];
  onProductsChange?: (products: Product[]) => void;
}

interface VariantFormItem {
  id?: string;
  name: string;
  price: string;
  salePrice?: string;
  stock: string;
  image?: string;
}

export default function ProductManager({ categories, onProductsChange }: ProductManagerProps) {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'Shoes / Bags');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stock, setStock] = useState('10');
  const [description, setDescription] = useState('');
  const [primaryImage, setPrimaryImage] = useState('');
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [variants, setVariants] = useState<VariantFormItem[]>([]);
  const [featured, setFeatured] = useState(false);
  const [bestSeller, setBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Load products from API
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
          if (onProductsChange) onProductsChange(data.products);
        }
      }
    } catch (err) {
      console.warn('Failed to load products from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Open modal in "Add" mode
  const openAddModal = () => {
    setIsEditing(false);
    setEditingProductId(null);
    setTitle('');
    setCategory(categories[0]?.name || 'Shoes / Bags');
    setPrice('');
    setSalePrice('');
    setStock('10');
    setDescription('');
    setPrimaryImage('');
    setAdditionalImages([]);
    setNewGalleryUrl('');
    // Provide a default color variant suggestion
    setVariants([
      { name: 'Barbie Hot Pink', price: '', stock: '5' },
      { name: 'Pastel Blush', price: '', stock: '5' },
    ]);
    setFeatured(false);
    setBestSeller(false);
    setIsNewArrival(true);
    setShowModal(true);
  };

  // Open modal in "Edit" mode
  const openEditModal = (prod: Product) => {
    setIsEditing(true);
    setEditingProductId(prod.id);
    setTitle(prod.title);
    setCategory(prod.category);
    setPrice(prod.price.toString());
    setSalePrice(prod.salePrice ? prod.salePrice.toString() : '');
    setStock(prod.stock.toString());
    setDescription(prod.description);
    setPrimaryImage(prod.images[0] || '');
    setAdditionalImages(prod.images.slice(1));
    setNewGalleryUrl('');

    if (prod.variants && prod.variants.length > 0) {
      setVariants(
        prod.variants.map((v) => ({
          id: v.id,
          name: v.name,
          price: v.price.toString(),
          salePrice: v.salePrice ? v.salePrice.toString() : '',
          stock: v.stock.toString(),
          image: v.image || '',
        }))
      );
    } else {
      setVariants([]);
    }

    setFeatured(Boolean(prod.featured));
    setBestSeller(Boolean(prod.bestSeller));
    setIsNewArrival(Boolean(prod.isNewArrival));
    setShowModal(true);
  };

  // Variant helpers
  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        name: '',
        price: price || '',
        stock: '5',
      },
    ]);
  };

  const handleUpdateVariant = (index: number, field: keyof VariantFormItem, value: string) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // Gallery helpers
  const handleAddGalleryImage = () => {
    if (!newGalleryUrl.trim()) return;
    setAdditionalImages((prev) => [...prev, newGalleryUrl.trim()]);
    setNewGalleryUrl('');
  };

  const handleRemoveGalleryImage = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Quick Stock adjustment
  const handleStockAdjust = async (productId: string, delta: number) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, stockDelta: delta }),
      });
      const data = await res.json();
      if (data.success && data.product) {
        setProducts((prev) => {
          const updated = prev.map((p) => (p.id === productId ? data.product : p));
          if (onProductsChange) onProductsChange(updated);
          return updated;
        });
      }
    } catch (err) {
      console.error('Failed to adjust stock:', err);
    }
  };

  // Delete product
  const handleDeleteProduct = async (prod: Product) => {
    if (!confirm(`Are you sure you want to delete "${prod.title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products?id=${encodeURIComponent(prod.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => {
          const updated = prev.filter((p) => p.id !== prod.id);
          if (onProductsChange) onProductsChange(updated);
          return updated;
        });
        setStatusMessage({ text: `Product "${prod.title}" deleted`, isError: false });
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  // Form Submit (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) return;

    setIsSubmitting(true);
    const catObj = categories.find((c) => c.name === category) || categories[0];

    // Combine primary and gallery images
    const allImages: string[] = [];
    if (primaryImage.trim()) allImages.push(primaryImage.trim());
    additionalImages.forEach((img) => {
      if (img.trim() && !allImages.includes(img.trim())) {
        allImages.push(img.trim());
      }
    });

    if (allImages.length === 0) {
      allImages.push('https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80');
    }

    // Process variants
    const processedVariants: ProductVariant[] = variants
      .filter((v) => v.name.trim().length > 0)
      .map((v, idx) => ({
        id: v.id || `var-${Date.now()}-${idx}`,
        name: v.name.trim(),
        price: v.price ? parseFloat(v.price) : parseFloat(price),
        salePrice: v.salePrice ? parseFloat(v.salePrice) : undefined,
        stock: v.stock ? parseInt(v.stock) : 10,
        attributes: { color: v.name.trim() },
        image: v.image ? v.image.trim() : undefined,
      }));

    const payload = {
      title: title.trim(),
      category,
      categoryId: catObj?.id || 'cat-accessories',
      price: parseFloat(price),
      salePrice: salePrice ? parseFloat(salePrice) : undefined,
      stock: parseInt(stock) || 10,
      description: description.trim() || 'Jaytel Classic premium glamorous piece.',
      images: allImages,
      variants: processedVariants.length > 0 ? processedVariants : undefined,
      featured,
      bestSeller,
      isNewArrival,
    };

    try {
      if (isEditing && editingProductId) {
        // PATCH
        const res = await fetch('/api/admin/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: editingProductId, ...payload }),
        });
        const data = await res.json();
        if (data.success && data.product) {
          setProducts((prev) => {
            const updated = prev.map((p) => (p.id === editingProductId ? data.product : p));
            if (onProductsChange) onProductsChange(updated);
            return updated;
          });
          setShowModal(false);
          setStatusMessage({
            text: `Product "${data.product.title}" updated with ${processedVariants.length} color variant(s)!`,
            isError: false,
          });
          setTimeout(() => setStatusMessage(null), 3500);
        } else {
          alert(data.error || 'Failed to update product');
        }
      } else {
        // POST
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success && data.product) {
          setProducts((prev) => {
            const updated = [data.product, ...prev];
            if (onProductsChange) onProductsChange(updated);
            return updated;
          });
          setShowModal(false);
          setStatusMessage({
            text: `New product "${data.product.title}" posted with ${processedVariants.length} color option(s)!`,
            isError: false,
          });
          setTimeout(() => setStatusMessage(null), 3500);
        } else {
          alert(data.error || 'Failed to create product');
        }
      }
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Network error saving product');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered product list
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.variants && p.variants.some((v) => v.name.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesCat = selectedCatFilter === 'ALL' || p.category === selectedCatFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="bg-white rounded-4xl border border-pink-100 p-6 shadow-soft space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pink-50 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </span>
            <h2 className="font-black text-lg text-slate-900">Jaytel Catalog & Product Control</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Post new items, configure available color options/variants, add gallery photo angles, and manage stock.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-pink transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Glam Piece</span>
        </button>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            statusMessage.isError
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-pink-50 text-pink-800 border border-pink-200'
          }`}
        >
          {statusMessage.isError ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-400" />
          <input
            type="text"
            placeholder="Search products by title, color option, or category…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-pink-50/40 border border-pink-100 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <select
          value={selectedCatFilter}
          onChange={(e) => setSelectedCatFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 bg-white border border-pink-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="ALL">All Categories ({products.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Grid / List */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading catalog items…</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-pink-50/30 rounded-3xl border border-dashed border-pink-200 p-6 space-y-3">
          <Package className="w-8 h-8 text-pink-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No products found</h3>
          <p className="text-xs text-slate-400">Try adjusting your search or category filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((p) => {
            const hasVariants = p.variants && p.variants.length > 0;
            return (
              <div
                key={p.id}
                className="p-4 bg-pink-50/30 hover:bg-pink-50/60 border border-pink-100 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs transition-colors"
              >
                {/* Left: Product Media & Info */}
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white border border-pink-200 shrink-0 shadow-xs">
                    <Image
                      src={p.images[0] || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80'}
                      alt={p.title}
                      fill
                      className="object-cover"
                    />
                    {p.images.length > 1 && (
                      <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-md">
                        +{p.images.length - 1}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{p.title}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-800 shrink-0">
                        {p.category}
                      </span>
                      {p.bestSeller && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                          Best Seller
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-black text-pink-600 text-sm">
                        {formatGHS(p.salePrice ?? p.price)}
                      </span>
                      {p.salePrice && (
                        <span className="text-slate-400 line-through text-[11px]">
                          {formatGHS(p.price)}
                        </span>
                      )}
                    </div>

                    {/* Color Options / Variants preview */}
                    {hasVariants && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <span className="text-[10px] font-black text-pink-800 flex items-center gap-1 uppercase tracking-wider">
                          <Palette className="w-3 h-3 text-pink-500" />
                          Colors ({p.variants!.length}):
                        </span>
                        {p.variants!.map((v) => (
                          <span
                            key={v.id}
                            className="px-2 py-0.5 rounded-lg bg-white border border-pink-200 text-[10px] font-bold text-pink-900"
                          >
                            {v.name} ({formatGHS(v.salePrice ?? v.price)})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Stock Controls & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-pink-100">
                  {/* Stock adjust */}
                  <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-2xl border border-pink-200">
                    <span className="text-[11px] font-bold text-slate-600">Stock:</span>
                    <button
                      onClick={() => handleStockAdjust(p.id, -1)}
                      className="w-6 h-6 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-lg flex items-center justify-center font-bold text-xs"
                      title="Decrease stock"
                    >
                      -
                    </button>
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded-full text-xs ${
                        p.stock < 10 ? 'bg-rose-100 text-rose-800' : 'bg-pink-100 text-pink-800'
                      }`}
                    >
                      {p.stock}
                    </span>
                    <button
                      onClick={() => handleStockAdjust(p.id, 1)}
                      className="w-6 h-6 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-lg flex items-center justify-center font-bold text-xs"
                      title="Increase stock"
                    >
                      +
                    </button>
                  </div>

                  {/* Edit / Delete Buttons */}
                  <div className="flex items-center gap-1">
                    <a
                      href={`/product/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-400 hover:text-pink-600 rounded-xl hover:bg-white transition-colors"
                      title="Preview product page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-2 text-slate-500 hover:text-pink-600 rounded-xl hover:bg-white transition-colors"
                      title="Edit product and color options"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-white transition-colors"
                      title="Delete product"
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

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-4xl border border-pink-100 p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 animate-in fade-in duration-200 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <div>
                <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-pink-500" />
                  <span>{isEditing ? 'Edit Product & Color Options' : 'Post New Glam Piece'}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {isEditing
                    ? 'Update item details, photos, and color variations.'
                    : 'Fill in product info, available colors, and gallery photos.'}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-pink-100 hover:text-pink-700 font-bold flex items-center justify-center transition-colors"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {/* Product Cover Image Upload */}
              <div>
                <CloudinaryImageUploader
                  label="Cover / Primary Image"
                  currentImageUrl={primaryImage || undefined}
                  onUploadComplete={({ url }) => setPrimaryImage(url)}
                  onUploadError={(err) => console.error('Image upload failed:', err)}
                />
                <div className="mt-2">
                  <input
                    type="url"
                    placeholder="Or paste direct image URL (https://...)"
                    value={primaryImage}
                    onChange={(e) => setPrimaryImage(e.target.value)}
                    className="w-full p-2 bg-pink-50/30 border border-pink-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Additional Gallery Photos (Thumbnails like in screenshot) */}
              <div className="p-4 bg-pink-50/40 rounded-3xl border border-pink-100 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-pink-500" />
                    <span>Additional Gallery Angles (Thumbnails)</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Shown below the main photo on the product page
                  </span>
                </div>

                {additionalImages.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {additionalImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative w-16 h-16 rounded-xl overflow-hidden border border-pink-200 group bg-white"
                      >
                        <Image src={img} alt={`Angle ${idx + 1}`} fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(idx)}
                          className="absolute top-0.5 right-0.5 bg-rose-600 text-white rounded-full p-0.5 opacity-90 hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Paste additional image URL (e.g. back angle, interior view)..."
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                    className="flex-1 p-2 bg-white border border-pink-200 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddGalleryImage}
                    className="px-3 py-2 bg-pink-100 hover:bg-pink-200 text-pink-800 font-bold rounded-xl transition-colors"
                  >
                    + Add Angle
                  </button>
                </div>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Product Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ferragamo Red Signature Handbag"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2.5 bg-white border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500 text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 bg-white border border-pink-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-pink-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Base Price (GH₵) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="1"
                    placeholder="380"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-2.5 bg-white border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Sale Price (GH₵) <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="320"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="w-full p-2.5 bg-white border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500 font-bold text-pink-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Stock</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full p-2.5 bg-white border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500 font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe materials, elegance, size, hardware, and luxury feel…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-white border border-pink-200 rounded-xl resize-none focus:outline-none focus:ring-1 focus:ring-pink-500 text-slate-900"
                />
              </div>

              {/* AVAILABLE COLORS / OPTIONS (VARIANTS) BUILDER */}
              <div className="p-4 bg-pink-50/60 rounded-3xl border border-pink-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                      <Palette className="w-4 h-4 text-pink-600" />
                      <span>Available Colors / Options (As seen in screenshot)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Customers will see &quot;SELECT OPTION / COLOR&quot; with these pills (e.g. Barbie Hot Pink GH₵320.00).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="px-3 py-1.5 bg-white hover:bg-pink-100 text-pink-700 font-black rounded-xl border border-pink-300 text-xs flex items-center gap-1 transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Color</span>
                  </button>
                </div>

                {variants.length === 0 ? (
                  <p className="text-slate-400 italic text-[11px] py-2">
                    No color options added yet. Click &quot;Add Color&quot; above to create choices like &quot;Barbie Hot Pink&quot;, &quot;Pastel Blush&quot;, etc.
                  </p>
                ) : (
                  <div className="space-y-2.5 pt-1">
                    {variants.map((v, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white rounded-2xl border border-pink-200 flex flex-col sm:flex-row sm:items-center gap-2 shadow-xs"
                      >
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                            Color / Option Name
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Barbie Hot Pink, Pastel Blush, Jet Black"
                            value={v.name}
                            onChange={(e) => handleUpdateVariant(idx, 'name', e.target.value)}
                            className="w-full p-2 bg-pink-50/30 border border-pink-100 rounded-xl text-xs font-bold text-slate-900"
                          />
                        </div>

                        <div className="w-full sm:w-28">
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                            Price (GH₵)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder={price || '320'}
                            value={v.price}
                            onChange={(e) => handleUpdateVariant(idx, 'price', e.target.value)}
                            className="w-full p-2 bg-pink-50/30 border border-pink-100 rounded-xl text-xs font-bold text-pink-600"
                          />
                        </div>

                        <div className="w-full sm:w-20">
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                            Stock
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="5"
                            value={v.stock}
                            onChange={(e) => handleUpdateVariant(idx, 'stock', e.target.value)}
                            className="w-full p-2 bg-pink-50/30 border border-pink-100 rounded-xl text-xs font-bold text-slate-800"
                          />
                        </div>

                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(idx)}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                            title="Remove color option"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Marketing Badges Checkboxes */}
              <div className="flex items-center gap-6 p-3 bg-pink-50/40 rounded-2xl border border-pink-100">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 accent-pink-600 rounded"
                  />
                  <span>Featured Piece</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={bestSeller}
                    onChange={(e) => setBestSeller(e.target.checked)}
                    className="w-4 h-4 accent-pink-600 rounded"
                  />
                  <span>Best Seller</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={(e) => setIsNewArrival(e.target.checked)}
                    className="w-4 h-4 accent-pink-600 rounded"
                  />
                  <span>New Arrival</span>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-pink-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl shadow-pink hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isSubmitting
                    ? 'Saving…'
                    : isEditing
                    ? 'Update Product & Colors'
                    : 'Publish to Boutique'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
