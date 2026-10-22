'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Eye,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Crown,
  Play,
  Pause,
  Sliders,
  Gem,
} from 'lucide-react';
import { BannerSlide } from '@/types';
import CloudinaryImageUploader from '@/components/admin/CloudinaryImageUploader';
import { initialBanners } from '@/lib/banners/bannerStore';

const GRADIENT_PRESETS = [
  {
    name: 'Royal Burgundy & Rose (Original)',
    value: 'from-rose-950 via-pink-900 to-rose-900',
  },
  {
    name: 'African Heritage Gold & Rose',
    value: 'from-amber-950 via-rose-950 to-pink-950',
  },
  {
    name: 'Midnight Amethyst & Plum',
    value: 'from-slate-950 via-purple-950 to-pink-950',
  },
  {
    name: 'Girlish Fuchsia & Magenta',
    value: 'from-fuchsia-950 via-pink-950 to-rose-950',
  },
  {
    name: 'Emerald Green Luxury',
    value: 'from-emerald-950 via-slate-950 to-pink-950',
  },
];

export default function BannerManager() {
  const [banners, setBanners] = useState<BannerSlide[]>(initialBanners);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Auto-scroll setting
  const [autoScrollSpeed, setAutoScrollSpeed] = useState<number>(5);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [badgeText, setBadgeText] = useState("Accra's Premier Boutique");
  const [title, setTitle] = useState('Unleash Your');
  const [highlightText, setHighlightText] = useState('Girlish Glamour.');
  const [subtitle, setSubtitle] = useState(
    'Curated statement bags, satin gowns & viral glam pieces — hand-delivered across Ghana with instant MoMo checkout.'
  );
  const [primaryBtnText, setPrimaryBtnText] = useState('Shop Glamour');
  const [primaryBtnLink, setPrimaryBtnLink] = useState('/shop');
  const [secondaryBtnText, setSecondaryBtnText] = useState('Explore Luxe Bags');
  const [secondaryBtnLink, setSecondaryBtnLink] = useState('/shop?category=shoes-bags');

  // Featured card states
  const [cardTag, setCardTag] = useState('TRENDING #1');
  const [cardPrice, setCardPrice] = useState('GH₵ 320.00');
  const [cardCategoryTag, setCardCategoryTag] = useState('SIGNATURE HANDBAG');
  const [cardTitle, setCardTitle] = useState('Jaytel Royal Pink Quilted Crossbody');
  const [cardRating, setCardRating] = useState('★ 4.9');
  const [cardReviewCount, setCardReviewCount] = useState('(46 reviews)');
  const [cardImage, setCardImage] = useState(
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'
  );
  const [cardLink, setCardLink] = useState('/product/jaytel-royal-pink-quilted-crossbody-mini-bag');
  const [cardDispatchBadge, setCardDispatchBadge] = useState('Ready to Dispatch');
  const [cardGuaranteeBadge, setCardGuaranteeBadge] = useState('100% Authentic Luxe');

  const [bgGradient, setBgGradient] = useState(GRADIENT_PRESETS[0].value);
  const [isActive, setIsActive] = useState(true);

  // Fetch banners
  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/admin/banners');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.banners)) {
          setBanners(data.banners);
        }
      }
    } catch (err) {
      console.warn('Failed to load banners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setBadgeText("Accra's Premier Boutique");
    setTitle('Unleash Your');
    setHighlightText('Girlish Glamour.');
    setSubtitle('Curated statement bags, satin gowns & viral glam pieces — hand-delivered across Ghana with instant MoMo checkout.');
    setPrimaryBtnText('Shop Glamour');
    setPrimaryBtnLink('/shop');
    setSecondaryBtnText('Explore Luxe Bags');
    setSecondaryBtnLink('/shop?category=shoes-bags');
    setCardTag('TRENDING #1');
    setCardPrice('GH₵ 320.00');
    setCardCategoryTag('SIGNATURE HANDBAG');
    setCardTitle('Jaytel Royal Pink Quilted Crossbody');
    setCardRating('★ 4.9');
    setCardReviewCount('(46 reviews)');
    setCardImage('https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80');
    setCardLink('/product/jaytel-royal-pink-quilted-crossbody-mini-bag');
    setCardDispatchBadge('Ready to Dispatch');
    setCardGuaranteeBadge('100% Authentic Luxe');
    setBgGradient(GRADIENT_PRESETS[0].value);
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (banner: BannerSlide) => {
    setIsEditing(true);
    setEditingId(banner.id);
    setBadgeText(banner.badgeText || "Accra's Premier Boutique");
    setTitle(banner.title);
    setHighlightText(banner.highlightText);
    setSubtitle(banner.subtitle);
    setPrimaryBtnText(banner.primaryBtnText);
    setPrimaryBtnLink(banner.primaryBtnLink);
    setSecondaryBtnText(banner.secondaryBtnText || '');
    setSecondaryBtnLink(banner.secondaryBtnLink || '');
    setCardTag(banner.featuredCard?.tag || 'TRENDING #1');
    setCardPrice(banner.featuredCard?.price || 'GH₵ 320.00');
    setCardCategoryTag(banner.featuredCard?.categoryTag || 'FEATURED ITEM');
    setCardTitle(banner.featuredCard?.title || 'Jaytel Piece');
    setCardRating(banner.featuredCard?.rating || '★ 4.9');
    setCardReviewCount(banner.featuredCard?.reviewCount || '(30 reviews)');
    setCardImage(banner.featuredCard?.image || '');
    setCardLink(banner.featuredCard?.link || '/shop');
    setCardDispatchBadge(banner.featuredCard?.dispatchBadge || 'Ready to Dispatch');
    setCardGuaranteeBadge(banner.featuredCard?.guaranteeBadge || '100% Authentic Luxe');
    setBgGradient(banner.bgGradient || GRADIENT_PRESETS[0].value);
    setIsActive(banner.isActive ?? true);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    const bannerPayload = {
      badgeText: badgeText.trim(),
      title: title.trim(),
      highlightText: highlightText.trim(),
      subtitle: subtitle.trim(),
      primaryBtnText: primaryBtnText.trim(),
      primaryBtnLink: primaryBtnLink.trim(),
      secondaryBtnText: secondaryBtnText.trim(),
      secondaryBtnLink: secondaryBtnLink.trim(),
      featuredCard: {
        tag: cardTag.trim(),
        price: cardPrice.trim(),
        categoryTag: cardCategoryTag.trim(),
        title: cardTitle.trim(),
        rating: cardRating.trim(),
        reviewCount: cardReviewCount.trim(),
        image: cardImage.trim() || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
        link: cardLink.trim() || '/shop',
        dispatchBadge: cardDispatchBadge.trim(),
        guaranteeBadge: cardGuaranteeBadge.trim(),
      },
      bgGradient,
      isActive,
      order: isEditing ? undefined : banners.length + 1,
    };

    try {
      if (isEditing && editingId) {
        const res = await fetch('/api/admin/banners', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...bannerPayload }),
        });
        const data = await res.json();
        if (data.success && data.banner) {
          setBanners(banners.map((b) => (b.id === editingId ? data.banner : b)));
          setShowModal(false);
          setStatusMessage('Banner slide updated successfully!');
          setTimeout(() => setStatusMessage(null), 3000);
        } else {
          alert(data.error || 'Failed to update banner');
        }
      } else {
        const res = await fetch('/api/admin/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bannerPayload),
        });
        const data = await res.json();
        if (data.success && data.banner) {
          setBanners([...banners, data.banner]);
          setShowModal(false);
          setStatusMessage('New Hero Banner added! It is now auto-scrolling on the home page.');
          setTimeout(() => setStatusMessage(null), 4000);
        } else {
          alert(data.error || 'Failed to create banner');
        }
      }
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, bannerTitle: string) => {
    if (!confirm(`Are you sure you want to delete banner "${bannerTitle}"?`)) return;

    try {
      const res = await fetch(`/api/admin/banners?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setBanners(banners.filter((b) => b.id !== id));
        setStatusMessage('Banner deleted');
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async (banner: BannerSlide) => {
    const newStatus = !(banner.isActive ?? true);
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: banner.id, isActive: newStatus }),
      });
      const data = await res.json();
      if (data.success && data.banner) {
        setBanners(banners.map((b) => (b.id === banner.id ? data.banner : b)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-4xl border border-pink-100 p-6 shadow-soft space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pink-50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-black text-lg text-slate-900">Hero Banners & Auto-Scroller</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 font-bold text-xs">
              {banners.length} Banners Configured
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Add as many hero banners as you wish. They automatically rotate on the homepage matching the layout in Screenshot 3.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-pink transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Hero Banner</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Auto-Scroll Settings Bar */}
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-3xl border border-pink-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-pink-600 text-white flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900">Auto-Scroll Rotation Delay</h4>
            <p className="text-[11px] text-slate-500">
              Control how frequently the hero banners change automatically on the customer site.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="text-slate-600">Speed:</span>
          {[3, 5, 7, 10].map((sec) => (
            <button
              key={sec}
              onClick={() => {
                setAutoScrollSpeed(sec);
                setStatusMessage(`Rotation interval set to ${sec} seconds.`);
                setTimeout(() => setStatusMessage(null), 3000);
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                autoScrollSpeed === sec
                  ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
                  : 'bg-white text-slate-700 border-pink-200 hover:bg-pink-100'
              }`}
            >
              {sec}s
            </button>
          ))}
        </div>
      </div>

      {/* Banners List */}
      <div className="space-y-4">
        {banners.map((b, idx) => (
          <div
            key={b.id}
            className={`p-5 rounded-3xl border transition-all ${
              b.isActive !== false
                ? 'bg-gradient-to-r from-pink-50/20 via-white to-rose-50/20 border-pink-200 shadow-xs'
                : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              {/* Left Info & Visual Snippet */}
              <div className="flex items-start gap-4 flex-1">
                <div className="w-7 h-7 rounded-full bg-pink-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  #{idx + 1}
                </div>

                {/* Banner Thumbnail representation */}
                <div className="relative w-28 h-20 rounded-2xl overflow-hidden shrink-0 border border-white/20 shadow-md">
                  <div className={`absolute inset-0 bg-gradient-to-br ${b.bgGradient}`} />
                  {b.featuredCard?.image && (
                    <Image
                      src={b.featuredCard.image}
                      alt={b.title}
                      fill
                      className="object-cover opacity-80"
                    />
                  )}
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-mono">
                    {b.featuredCard?.price || 'GH₵'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-white border border-pink-200 text-pink-700 text-[10px] font-black uppercase">
                      {b.badgeText || "Accra's Premier Boutique"}
                    </span>
                    <button
                      onClick={() => handleToggleActive(b)}
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        b.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {b.isActive !== false ? 'Live & Auto-scrolling' : 'Disabled'}
                    </button>
                  </div>

                  <h3 className="font-black text-slate-900 text-base">
                    {b.title} <span className="text-pink-600">{b.highlightText}</span>
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 max-w-xl">
                    {b.subtitle}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-600">
                    <span className="font-semibold">
                      Primary CTA:{' '}
                      <strong className="text-pink-600">
                        "{b.primaryBtnText}" &rarr; {b.primaryBtnLink}
                      </strong>
                    </span>
                    {b.secondaryBtnText && (
                      <span className="font-semibold">
                        Secondary:{' '}
                        <strong className="text-slate-800">
                          "{b.secondaryBtnText}" &rarr; {b.secondaryBtnLink}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Featured Card Snippet & Actions */}
              <div className="flex items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-pink-100">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-pink-700 font-extrabold uppercase">
                    {b.featuredCard?.categoryTag}
                  </p>
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">
                    {b.featuredCard?.title}
                  </p>
                  <p className="text-xs font-mono font-black text-pink-600">
                    {b.featuredCard?.price}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(b)}
                    className="p-2 bg-white border border-pink-200 hover:bg-pink-50 text-pink-600 rounded-xl transition-all shadow-xs"
                    title="Edit banner slide"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id, b.title)}
                    className="p-2 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl transition-all shadow-xs"
                    title="Delete banner slide"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Banner Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-4xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 border border-pink-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <div>
                <h3 className="font-black text-lg text-slate-900">
                  {isEditing ? 'Edit Hero Banner Slide' : 'Create New Hero Banner Slide'}
                </h3>
                <p className="text-xs text-slate-500">
                  Customize the headline, colors, buttons, and featured piece shown in Screenshot 3.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {/* Section 1: Hero Text & Headings */}
              <div className="space-y-3 bg-pink-50/40 p-4 rounded-3xl border border-pink-100">
                <h4 className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
                  <Crown className="w-4 h-4 text-pink-600" />
                  <span>Banner Editorial Content</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Badge Pill Text</label>
                    <input
                      type="text"
                      placeholder="e.g. Accra's Premier Boutique"
                      value={badgeText}
                      onChange={(e) => setBadgeText(e.target.value)}
                      className="w-full p-2.5 bg-white border border-pink-200 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Gradient Theme</label>
                    <select
                      value={bgGradient}
                      onChange={(e) => setBgGradient(e.target.value)}
                      className="w-full p-2.5 bg-white border border-pink-200 rounded-xl font-bold text-slate-800"
                    >
                      {GRADIENT_PRESETS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">First Line Headline *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Unleash Your"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-2.5 bg-white border border-pink-200 rounded-xl font-black text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Gradient Highlight Line *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Girlish Glamour."
                      value={highlightText}
                      onChange={(e) => setHighlightText(e.target.value)}
                      className="w-full p-2.5 bg-white border border-pink-200 rounded-xl font-black text-pink-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subtitle Paragraph</label>
                  <textarea
                    rows={2}
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full p-2.5 bg-white border border-pink-200 rounded-xl resize-none"
                    placeholder="Short description..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Primary Button Text</label>
                    <input
                      type="text"
                      value={primaryBtnText}
                      onChange={(e) => setPrimaryBtnText(e.target.value)}
                      className="w-full p-2 bg-white border border-pink-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Primary Button Link</label>
                    <input
                      type="text"
                      value={primaryBtnLink}
                      onChange={(e) => setPrimaryBtnLink(e.target.value)}
                      className="w-full p-2 bg-white border border-pink-200 rounded-xl font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Secondary Button Text</label>
                    <input
                      type="text"
                      value={secondaryBtnText}
                      onChange={(e) => setSecondaryBtnText(e.target.value)}
                      className="w-full p-2 bg-white border border-pink-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Secondary Button Link</label>
                    <input
                      type="text"
                      value={secondaryBtnLink}
                      onChange={(e) => setSecondaryBtnLink(e.target.value)}
                      className="w-full p-2 bg-white border border-pink-200 rounded-xl font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Right-side Featured Card in Screenshot 3 */}
              <div className="space-y-3 bg-rose-50/40 p-4 rounded-3xl border border-rose-100">
                <h4 className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-pink-600" />
                  <span>Right-Side Featured Piece Card (Screenshot 3)</span>
                </h4>

                {/* Cloudinary Image Uploader */}
                <CloudinaryImageUploader
                  label="Featured Product Photo"
                  currentImageUrl={cardImage || undefined}
                  onUploadComplete={({ url }) => setCardImage(url)}
                  onUploadError={(err) => console.error(err)}
                />

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Or Direct Photo URL (Unsplash or CDN)
                  </label>
                  <input
                    type="text"
                    value={cardImage}
                    onChange={(e) => setCardImage(e.target.value)}
                    className="w-full p-2.5 bg-white border border-pink-200 rounded-xl font-mono text-[11px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Product Title</label>
                    <input
                      type="text"
                      value={cardTitle}
                      onChange={(e) => setCardTitle(e.target.value)}
                      className="w-full p-2 bg-white border border-pink-200 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Price Tag</label>
                    <input
                      type="text"
                      placeholder="GH₵ 320.00"
                      value={cardPrice}
                      onChange={(e) => setCardPrice(e.target.value)}
                      className="w-full p-2 bg-white border border-pink-200 rounded-xl font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Top Tag (Pink Pill)</label>
                    <input
                      type="text"
                      placeholder="TRENDING #1"
                      value={cardTag}
                      onChange={(e) => setCardTag(e.target.value)}
                      className="w-full p-2 bg-white border border-pink-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category Tag</label>
                    <input
                      type="text"
                      placeholder="SIGNATURE HANDBAG"
                      value={cardCategoryTag}
                      onChange={(e) => setCardCategoryTag(e.target.value)}
                      className="w-full p-2 bg-white border border-pink-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Dispatch Badge</label>
                    <input
                      type="text"
                      value={cardDispatchBadge}
                      onChange={(e) => setCardDispatchBadge(e.target.value)}
                      className="w-full p-2 bg-white border border-pink-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Quality Guarantee Badge</label>
                    <input
                      type="text"
                      value={cardGuaranteeBadge}
                      onChange={(e) => setCardGuaranteeBadge(e.target.value)}
                      className="w-full p-2 bg-white border border-pink-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="banner-active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-pink-600 rounded border-pink-300 focus:ring-pink-500"
                />
                <label htmlFor="banner-active" className="font-bold text-slate-800 cursor-pointer">
                  Activate this banner immediately in the auto-scroller
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
                  {isSubmitting ? 'Saving...' : isEditing ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
