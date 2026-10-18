'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Star, Sparkles } from 'lucide-react';
import { Product } from '@/types';
import { formatGHS } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isFavorited = isInWishlist(product.id);
  const discountPercent =
    product.salePrice && product.salePrice < product.price
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div className="group relative bg-white rounded-3xl border border-pink-100/90 overflow-hidden shadow-soft hover:shadow-pink transition-all flex flex-col justify-between">
      <div>
        {/* Image Container with Badges */}
        <Link href={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-pink-50/50">
          <Image
            src={product.images[0] || 'https://placehold.co/600x600?text=Product'}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Girlish Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {discountPercent > 0 && (
              <span className="px-2 py-0.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-[10px] rounded-full shadow-xs">
                -{discountPercent}% OFF
              </span>
            )}
            {product.bestSeller && (
              <span className="px-2 py-0.5 bg-slate-900 text-pink-200 font-bold text-[10px] rounded-full shadow-xs">
                Bestseller ♥
              </span>
            )}
            {product.isNewArrival && (
              <span className="px-2 py-0.5 bg-pink-600 text-white font-bold text-[10px] rounded-full shadow-xs flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" />
                <span>New</span>
              </span>
            )}
          </div>

          {/* Wishlist Button with Heart */}
          <button
            type="button"
            onClick={handleWishlistClick}
            className={`absolute top-2.5 right-2.5 p-2 rounded-full shadow-md z-10 transition-transform active:scale-90 min-w-tap min-h-tap flex items-center justify-center ${
              isFavorited
                ? 'bg-pink-50 text-pink-600 ring-2 ring-pink-400'
                : 'bg-white/95 text-slate-400 hover:text-pink-500 hover:bg-white'
            }`}
            aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorited ? 'fill-pink-500 stroke-pink-500' : 'stroke-[2]'
              }`}
            />
          </button>
        </Link>

        {/* Content Info */}
        <div className="p-3.5 sm:p-4">
          <p className="text-[10px] uppercase font-bold text-pink-500 tracking-wider mb-1 line-clamp-1">
            {product.category}
          </p>

          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-pink-600 transition-colors line-clamp-2 leading-snug">
              {product.title}
            </h3>
          </Link>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 mt-1.5 text-xs">
              <Star className="w-3.5 h-3.5 fill-pink-400 stroke-pink-400" />
              <span className="font-bold text-slate-800 text-[11px]">{product.rating}</span>
              <span className="text-pink-300 text-[10px]">({product.reviewCount || 0})</span>
            </div>
          )}
        </div>
      </div>

      {/* Pricing & Add to Cart footer */}
      <div className="p-3.5 sm:p-4 pt-0">
        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="text-sm sm:text-base font-black text-pink-600">
            {formatGHS(product.salePrice ?? product.price)}
          </span>
          {product.salePrice && product.salePrice < product.price && (
            <span className="text-[11px] text-slate-400 line-through">
              {formatGHS(product.price)}
            </span>
          )}
        </div>

        {/* Girlish Quick Add Button */}
        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={product.stock <= 0}
          className="w-full py-2.5 px-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-pink transition-all active:scale-[0.98] disabled:bg-slate-200 disabled:cursor-not-allowed min-h-tap"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{product.stock > 0 ? 'Add to Bag ♥' : 'Sold Out'}</span>
        </button>
      </div>
    </div>
  );
}
