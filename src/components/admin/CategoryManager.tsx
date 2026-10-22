'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Sparkles, Layers, Image as ImageIcon } from 'lucide-react';
import { ProductCategory } from '@/types';
import CloudinaryImageUploader from '@/components/admin/CloudinaryImageUploader';
import { mockCategories } from '@/data/mockData';

interface CategoryManagerProps {
  onCategoriesChange?: (updatedCategories: ProductCategory[]) => void;
}

export default function CategoryManager({ onCategoriesChange }: CategoryManagerProps) {
  const [categories, setCategories] = useState<ProductCategory[]>(mockCategories);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [featured, setFeatured] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.categories)) {
          setCategories(data.categories);
          if (onCategoriesChange) onCategoriesChange(data.categories);
        }
      }
    } catch (err) {
      console.warn('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('');
    setFeatured(true);
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (cat: ProductCategory) => {
    setIsEditing(true);
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImageUrl(cat.image || '');
    setFeatured(cat.featured ?? true);
    setIsActive(cat.isActive ?? true);
    setShowModal(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      if (isEditing && editingId) {
        const res = await fetch('/api/admin/categories', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            name: name.trim(),
            slug: slug.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: description.trim(),
            image: imageUrl.trim() || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
            featured,
            isActive,
          }),
        });

        const data = await res.json();
        if (data.success && data.category) {
          const updated = categories.map((c) => (c.id === editingId ? data.category : c));
          setCategories(updated);
          if (onCategoriesChange) onCategoriesChange(updated);
          setShowModal(false);
          setStatusMessage('Category updated successfully!');
          setTimeout(() => setStatusMessage(null), 3000);
        } else {
          alert(data.error || 'Failed to update category');
        }
      } else {
        const res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            slug: slug.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: description.trim(),
            image: imageUrl.trim() || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
            featured,
            isActive,
          }),
        });

        const data = await res.json();
        if (data.success && data.category) {
          const updated = [...categories, data.category];
          setCategories(updated);
          if (onCategoriesChange) onCategoriesChange(updated);
          setShowModal(false);
          setStatusMessage('Category created successfully!');
          setTimeout(() => setStatusMessage(null), 3000);
        } else {
          alert(data.error || 'Failed to create category');
        }
      }
    } catch (err: any) {
      console.error('Category save error:', err);
      alert(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        const updated = categories.filter((c) => c.id !== id);
        setCategories(updated);
        if (onCategoriesChange) onCategoriesChange(updated);
        setStatusMessage(`Deleted category "${catName}"`);
        setTimeout(() => setStatusMessage(null), 3000);
      } else {
        alert(data.error || 'Failed to delete category');
      }
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const handleToggleActive = async (cat: ProductCategory) => {
    const newStatus = !(cat.isActive ?? true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cat.id,
          isActive: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success && data.category) {
        const updated = categories.map((c) => (c.id === cat.id ? data.category : c));
        setCategories(updated);
        if (onCategoriesChange) onCategoriesChange(updated);
      }
    } catch (err) {
      console.error('Failed to toggle category active status:', err);
    }
  };

  return (
    <div className="bg-white rounded-4xl border border-pink-100 p-6 shadow-soft space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pink-50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-black text-lg text-slate-900">Categories Management</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 font-bold text-xs">
              {categories.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Categories align with the store flyer and can be added, updated or deleted dynamically. The entire boutique adapts automatically.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-pink transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Categories Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`p-4 rounded-3xl border transition-all flex flex-col justify-between ${
              cat.isActive !== false
                ? 'bg-pink-50/20 border-pink-200 shadow-xs'
                : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            <div>
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-pink-100 mb-3 border border-pink-100">
                <Image
                  src={cat.image || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'}
                  alt={cat.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  {cat.featured && (
                    <span className="px-2 py-0.5 rounded-full bg-pink-500 text-white font-black text-[9px] uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Featured</span>
                    </span>
                  )}
                  <button
                    onClick={() => handleToggleActive(cat)}
                    title={cat.isActive !== false ? 'Click to deactivate' : 'Click to activate'}
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm ${
                      cat.isActive !== false
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-500 text-white'
                    }`}
                  >
                    {cat.isActive !== false ? 'Active' : 'Hidden'}
                  </button>
                </div>
              </div>

              <h4 className="font-black text-slate-900 text-sm">{cat.name}</h4>
              <p className="font-mono text-[10px] text-pink-600 font-semibold mb-1">
                slug: /{cat.slug}
              </p>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {cat.description || 'No description provided.'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-pink-100/60">
              <span className="text-[11px] font-bold text-slate-600">
                {cat.productCount ?? 0} items
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-1.5 bg-white border border-pink-200 hover:bg-pink-50 text-pink-600 rounded-xl transition-all"
                  title="Edit category"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="p-1.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl transition-all"
                  title="Delete category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-4xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 border border-pink-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <h3 className="font-black text-base text-slate-900">
                {isEditing ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Category Image Upload */}
              <CloudinaryImageUploader
                label="Category Cover Photo"
                currentImageUrl={imageUrl || undefined}
                onUploadComplete={({ url }) => setImageUrl(url)}
                onUploadError={(err) => console.error(err)}
              />

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Or Direct Image URL (Unsplash or CDN)
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-pink-200 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. African Prints, Shoes / Bags"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-pink-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">URL Slug</label>
                <input
                  type="text"
                  placeholder="e.g. african-prints"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-pink-200 rounded-xl font-mono text-slate-800"
                />
                <span className="text-[10px] text-slate-400">
                  This will be used in the URL: /shop?category={slug || '...'}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe items in this collection..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-pink-200 rounded-xl resize-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 text-pink-600 rounded border-pink-300 focus:ring-pink-500"
                  />
                  <span className="font-bold text-slate-800">Featured in Home Showcase</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-pink-600 rounded border-pink-300 focus:ring-pink-500"
                  />
                  <span className="font-bold text-slate-800">Visible to Customers</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-pink-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold rounded-xl shadow-pink disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
