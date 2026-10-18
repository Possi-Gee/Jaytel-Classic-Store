'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ArrowRight, Sparkles } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/product/ProductCard';

export default function WishlistPage() {
  const { wishlistProducts } = useWishlist();

  return (
    <div className="space-y-6">
      <div className="border-b border-pink-100 pb-5">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
          <span>My Saved Glamour Pieces</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {wishlistProducts.length} items saved in your Jaytel wishlist ♥
        </p>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="bg-white rounded-4xl border border-pink-100 p-12 text-center space-y-4 max-w-md mx-auto shadow-soft">
          <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-400 mx-auto flex items-center justify-center">
            <Heart className="w-8 h-8 fill-pink-100" />
          </div>
          <h2 className="text-base font-black text-slate-800">Your wishlist is empty</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Tap the heart icon on any Jaytel mini bag, satin dress, or lip oil to save it here for later.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full text-xs font-bold shadow-pink hover:opacity-95 transition-opacity"
          >
            <span>Explore Boutique ♥</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
