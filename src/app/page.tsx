import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Heart, Gift, CheckCircle2, Crown, Gem, ShoppingBag, Truck } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { mockCategories, mockProducts } from '@/data/mockData';

export default function HomePage() {
  const bestSellers = mockProducts.filter((p) => p.bestSeller);
  const newArrivals = mockProducts.filter((p) => p.isNewArrival);

  return (
    <div className="space-y-10 sm:space-y-16">
      {/* Redesigned Luxury Hero Section */}
      <section className="relative rounded-4xl overflow-hidden bg-gradient-to-br from-rose-950 via-pink-900 to-rose-900 text-white shadow-2xl border border-pink-500/20">
        {/* Subtle Ambient Glow Elements */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-rose-500/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center p-6 sm:p-10 lg:p-14">
          {/* Left Column: Editorial Headline & Value Propositions */}
          <div className="lg:col-span-7 space-y-6">
            {/* Luxury Boutique Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-pink-200 shadow-sm">
              <Crown className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Accra's Premier Girlish Boutique</span>
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
              <span className="text-white/80 font-normal">New 2026 Season</span>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
                Unleash Your <br />
                <span className="bg-gradient-to-r from-pink-300 via-rose-200 to-pink-400 bg-clip-text text-transparent drop-shadow-sm">
                  Girlish Glamour.
                </span>
              </h1>
              <p className="text-xs sm:text-base text-pink-100/90 leading-relaxed font-normal max-w-xl pt-2">
                Curated statement mini bags, lustrous satin gowns, viral plumping glosses, and dainty sparkling jewels. Hand-delivered across Ghana with instant Mobile Money checkout.
              </p>
            </div>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-7 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-black text-xs sm:text-sm shadow-pink hover:shadow-pink-lg transition-all active:scale-95 gap-2 min-h-tap"
              >
                <span>Shop All Glamour</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/shop?category=luxe-handbags-mini-bags"
                className="inline-flex items-center justify-center px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all active:scale-95 gap-2 min-h-tap"
              >
                <ShoppingBag className="w-4 h-4 text-pink-300" />
                <span>Explore Luxe Bags</span>
              </Link>
            </div>

            {/* Trust Highlights Strip */}
            <div className="pt-4 border-t border-white/10 grid grid-cols-3 gap-2 sm:gap-4 max-w-lg">
              <div className="flex items-center gap-2 text-left">
                <div className="w-7 h-7 rounded-full bg-pink-500/20 border border-pink-400/30 flex items-center justify-center shrink-0 text-pink-300">
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white leading-tight">Fast Ghana Delivery</p>
                  <p className="text-[9px] text-pink-200/70">Accra Same-Day</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-left">
                <div className="w-7 h-7 rounded-full bg-pink-500/20 border border-pink-400/30 flex items-center justify-center shrink-0 text-pink-300">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white leading-tight">Instant MoMo</p>
                  <p className="text-[9px] text-pink-200/70">MTN • Telecel • AT</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-left">
                <div className="w-7 h-7 rounded-full bg-pink-500/20 border border-pink-400/30 flex items-center justify-center shrink-0 text-pink-300">
                  <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white leading-tight">4.9/5 Rating</p>
                  <p className="text-[9px] text-pink-200/70">5,000+ Babes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Featured Luxury Product Showcase Card */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm">
              {/* Product Card Container */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-white/15 to-white/5 border border-white/25 p-3.5 shadow-2xl backdrop-blur-xl group">
                <div className="relative aspect-[4/4] sm:aspect-[4/4.5] w-full rounded-2xl overflow-hidden bg-pink-950/40">
                  <Image
                    src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"
                    alt="Jaytel Royal Pink Quilted Crossbody Mini Bag"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {/* Subtle vignette for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                  {/* Top Badge */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-pink-500 text-white text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Trending #1</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-900/70 backdrop-blur-md text-pink-200 border border-white/20 text-[10px] font-mono font-bold">
                      GH₵ 320.00
                    </span>
                  </div>

                  {/* Product Details Overlaid on Bottom */}
                  <div className="absolute bottom-3 left-3 right-3 space-y-1 text-left">
                    <p className="text-[10px] uppercase tracking-wider font-extrabold text-pink-300">
                      Signature Handbag
                    </p>
                    <h3 className="text-sm font-black text-white leading-snug line-clamp-1">
                      Jaytel Royal Pink Quilted Crossbody
                    </h3>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1 text-[11px] text-amber-300 font-bold">
                        <span>★ 4.9</span>
                        <span className="text-white/60 font-normal text-[10px]">(46 reviews)</span>
                      </div>
                      <Link
                        href="/product/jaytel-royal-pink-quilted-crossbody-mini-bag"
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-pink-100 text-pink-700 text-[11px] font-black shadow-sm transition-transform active:scale-95"
                      >
                        View Piece &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Decorative Glass Tag: Boutique Guarantee */}
              <div className="absolute -bottom-4 -left-4 hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-pink-500/40 shadow-xl text-left">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center shrink-0">
                  <Gem className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-white">100% Authentic Luxe</p>
                  <p className="text-[9px] text-pink-300 font-medium">Packaged with Love in Accra</p>
                </div>
              </div>

              {/* Floating Decorative Glass Tag: Stock status */}
              <div className="absolute -top-3 -right-3 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 backdrop-blur-xl border border-emerald-400/40 shadow-lg text-[10px] font-bold text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Ready to Dispatch</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Fabulous Collections
            </h2>
            <Sparkles className="w-4 h-4 text-pink-500" />
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {mockCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group relative rounded-3xl overflow-hidden bg-white border border-pink-100 shadow-soft hover:shadow-pink transition-all flex flex-col"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-pink-50">
                <Image
                  src={cat.image || 'https://placehold.co/400x300'}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 20vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                <span className="absolute bottom-2.5 left-3 right-3 text-xs font-bold text-white line-clamp-1 drop-shadow-sm">
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

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
