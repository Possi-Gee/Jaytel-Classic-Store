import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Heart, Gift, CheckCircle2, Crown, Gem, ShoppingBag, Truck } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { getProducts } from '@/lib/products/productStore';

import HeroCarousel from '@/components/home/HeroCarousel';
import CategoryGrid from '@/components/home/CategoryGrid';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const allProducts = await getProducts();
  const bestSellers = allProducts.filter((p) => p.bestSeller);
  const newArrivals = allProducts.filter((p) => p.isNewArrival);

  return (
    <div className="space-y-10 sm:space-y-16">
      {/* Auto-scrolling Hero Banner Carousel with complete luxury aesthetic & admin controls */}
      <HeroCarousel />

      {/* Dynamic Collections Grid aligning with store flyer and admin management */}
      <CategoryGrid />

      {/* Girlish Promotional Coupon Banner */}
      <section className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 rounded-3xl p-5 sm:p-6 text-white shadow-pink flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base flex items-center gap-1.5">
              <span>Special Jaytel Classic Welcome Treat</span>
              <Heart className="w-3.5 h-3.5 fill-pink-200 text-pink-200" />
            </h3>
            <p className="text-xs text-pink-100 mt-0.5">
              Apply code <span className="font-mono font-black bg-white text-pink-600 px-2 py-0.5 rounded-full shadow-xs">JAYTEL10</span> at checkout for 10% off your entire order.
            </p>
          </div>
        </div>
        <Link
          href="/shop"
          className="shrink-0 px-6 py-2.5 bg-slate-950 text-white rounded-full font-bold text-xs hover:bg-slate-900 shadow-md transition-colors"
        >
          Claim Offer ♥
        </Link>
      </section>

      {/* Bestselling Girlish Glamour */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Customer Favorites in Ghana</span>
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
            </h2>
            <p className="text-xs text-slate-500">Most loved bags, dresses, and lip kits by our Ghana babes.</p>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1"
          >
            <span>See more</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Girlish Spotlight Brand Story */}
      <section className="bg-white rounded-4xl border border-pink-100 p-6 sm:p-10 shadow-soft grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-inner border border-pink-100">
          <Image
            src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"
            alt="Jaytel Classic Pink Bags and Style"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div className="space-y-4">
          <span className="text-xs font-black text-pink-600 uppercase tracking-widest flex items-center gap-1">
            <Crown className="w-3.5 h-3.5 text-pink-500" />
            <span>The Jaytel Classic Experience</span>
          </span>
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 leading-tight">
            Designed for the Girl Who Loves All Things Chic & Pretty
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            At Jaytel Classic Store, we believe every woman deserves to indulge her inner princess. We curate head-turning accessories, velvety lip formulas, and stunning outfits that celebrate beauty, confidence, and joyful self-expression.
          </p>

          <ul className="space-y-2 text-xs text-slate-700 font-medium">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-pink-500 shrink-0" />
              <span>Premium high-grade vegan leathers, satins & luxury hardware</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-pink-500 shrink-0" />
              <span>Transparent Ghana Cedi pricing (GH₵) with instant MoMo prompt</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-pink-500 shrink-0" />
              <span>Fast doorstep delivery to all 16 regions of Ghana</span>
            </li>
          </ul>

          <div className="pt-2">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-xs font-extrabold text-pink-600 hover:text-pink-700 underline"
            >
              <span>Read the Jaytel story & mission &rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Fresh New Arrivals */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Fresh Glam Drops</span>
              <Sparkles className="w-4 h-4 text-pink-500" />
            </h2>
            <p className="text-xs text-slate-500">Newly added treats for your wardrobe this week.</p>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
