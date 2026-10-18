'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  ChevronRight,
  Plus,
  Minus,
  Share2,
  Sparkles,
} from 'lucide-react';
import { mockProducts } from '@/data/mockData';
import { formatGHS } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/product/ProductCard';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const product = mockProducts.find((p) => p.slug === slug) || mockProducts[0];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  const { addToCart, setIsCartOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isFavorited = isInWishlist(product.id);
  const currentPrice = selectedVariant?.salePrice ?? selectedVariant?.price ?? product.salePrice ?? product.price;
  const originalPrice = selectedVariant?.price ?? product.price;
  const discountPercent =
    currentPrice < originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
  const maxStock = selectedVariant ? selectedVariant.stock : product.stock;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedVariant);
    router.push('/checkout');
  };

  const handleShare = async () => {
    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out ${product.title} on Jaytel Classic Store`,
          url: window.location.href,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Product link copied to clipboard!');
    }
  };

  const relatedProducts = mockProducts.filter(
    (p) => p.categoryId === product.categoryId && p.id !== product.id
  );

  return (
    <div className="space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-1.5 text-xs text-slate-500 overflow-x-auto whitespace-nowrap py-1">
        <Link href="/" className="hover:text-pink-600">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-pink-300 shrink-0" />
        <Link href="/shop" className="hover:text-pink-600">
          Shop
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-pink-300 shrink-0" />
        <Link
          href={`/shop?category=${product.categoryId}`}
          className="hover:text-pink-600"
        >
          {product.category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-pink-300 shrink-0" />
        <span className="text-slate-900 font-bold truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Left: Responsive Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-4xl overflow-hidden bg-pink-50/50 border border-pink-100 shadow-soft">
            <Image
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-all duration-300"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-xs rounded-full shadow-pink">
                -{discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-pink-500 shadow-pink ring-2 ring-pink-200'
                      : 'border-pink-100 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`View ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details & Purchase Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-black text-pink-600 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                <span>{product.category}</span>
              </span>
              <button
                onClick={handleShare}
                className="p-2 text-slate-400 hover:text-pink-600 rounded-full hover:bg-pink-50 min-w-tap min-h-tap flex items-center justify-center"
                aria-label="Share product"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-slate-900 leading-tight">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2.5">
              <div className="flex items-center text-pink-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating || 5)
                        ? 'fill-pink-400 stroke-pink-400'
                        : 'fill-slate-200 stroke-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800">{product.rating}</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">{product.reviewCount || 0} reviews</span>
            </div>
          </div>

          {/* Pricing & Stock Status */}
          <div className="p-4 rounded-3xl bg-pink-50/60 border border-pink-100 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-pink-600">
                  {formatGHS(currentPrice)}
                </span>
                {currentPrice < originalPrice && (
                  <span className="text-sm text-slate-400 line-through">
                    {formatGHS(originalPrice)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-pink-700 mt-0.5">Includes all Ghana taxes</p>
            </div>

            <div className="text-right">
              {maxStock > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-800 font-bold text-xs">
                  <Check className="w-3.5 h-3.5" />
                  <span>In Stock ({maxStock})</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 font-bold text-xs">
                  Sold Out
                </span>
              )}
            </div>
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Select Option / Color:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedVariant?.id === v.id
                        ? 'border-pink-500 bg-pink-50 ring-2 ring-pink-500 text-pink-950 font-bold shadow-xs'
                        : 'border-pink-100 bg-white text-slate-700 hover:border-pink-300'
                    }`}
                  >
                    <div className="text-xs font-semibold">{v.name}</div>
                    <div className="text-xs font-black text-pink-600 mt-0.5">
                      {formatGHS(v.salePrice ?? v.price)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Stepper & Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-pink-200 rounded-2xl bg-white p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-8 h-8 flex items-center justify-center text-pink-600 hover:bg-pink-50 rounded-xl disabled:opacity-30"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-black text-sm text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                  disabled={quantity >= maxStock}
                  className="w-8 h-8 flex items-center justify-center text-pink-600 hover:bg-pink-50 rounded-xl disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3 rounded-2xl border transition-all flex items-center gap-2 text-xs font-bold min-h-tap ${
                  isFavorited
                    ? 'border-pink-300 bg-pink-50 text-pink-600 ring-1 ring-pink-400'
                    : 'border-pink-200 bg-white text-slate-700 hover:bg-pink-50/50'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-pink-600' : ''}`} />
                <span>{isFavorited ? 'Saved ♥' : 'Wishlist'}</span>
              </button>
            </div>

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={maxStock <= 0}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black text-sm shadow-pink flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:bg-slate-300 min-h-tap"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Shopping Bag ♥</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={maxStock <= 0}
                className="w-full py-3.5 px-6 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-black text-sm shadow-md transition-transform active:scale-[0.98] disabled:bg-slate-200 min-h-tap"
              >
                Buy Now (Instant MoMo)
              </button>
            </div>
          </div>

          {addedToast && (
            <div className="p-3 bg-pink-100 border border-pink-200 rounded-2xl text-pink-900 text-xs font-bold flex items-center justify-between animate-fadeIn shadow-xs">
              <span>Added to shopping bag! ♥</span>
              <button
                onClick={() => setIsCartOpen(true)}
                className="underline font-black text-pink-700"
              >
                View Bag &rarr;
              </button>
            </div>
          )}

          {/* Delivery & Trust */}
          <div className="border-t border-pink-100 pt-5 space-y-3 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <Truck className="w-4 h-4 text-pink-600 shrink-0" />
              <span>Express delivery across Accra & Tema. 1-3 days nationwide across Ghana.</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-pink-600 shrink-0" />
              <span>Instant secure checkout with MTN MoMo, Telecel Cash, AT Money or Card.</span>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="w-4 h-4 text-pink-600 shrink-0" />
              <span>7-day return guarantee for unworn items with tags intact.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Specifications */}
      <section className="bg-white rounded-4xl border border-pink-100 p-6 sm:p-10 shadow-soft space-y-6">
        <div>
          <h2 className="text-base font-black text-slate-900 border-b border-pink-100 pb-3">
            Product Glamour & Details
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-4 whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {product.specifications && (
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
              Product Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {Object.entries(product.specifications).map(([key, val]) => (
                <div key={key} className="bg-pink-50/50 p-3 rounded-2xl border border-pink-100 flex justify-between">
                  <span className="font-semibold text-slate-600">{key}:</span>
                  <span className="font-bold text-slate-900">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>You May Also Love</span>
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {relatedProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
