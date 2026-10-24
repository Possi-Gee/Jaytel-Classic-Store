'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Sparkles,
  Heart,
  Crown,
  Gem,
  ShoppingBag,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { BannerSlide } from '@/types';
import { initialBanners } from '@/lib/banners/bannerStore';

interface HeroCarouselProps {
  initialBannersList?: BannerSlide[];
  autoScrollSeconds?: number;
}

export default function HeroCarousel({
  initialBannersList,
  autoScrollSeconds = 5,
}: HeroCarouselProps) {
  const [banners, setBanners] = useState<BannerSlide[]>(
    initialBannersList && initialBannersList.length > 0 ? initialBannersList : initialBanners
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch updated banners dynamically from API
  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await fetch('/api/banners');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.banners) && data.banners.length > 0) {
            setBanners(data.banners);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch dynamic banners, using fallback:', err);
      }
    }
    fetchBanners();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  // Automatic scrolling timer (no manual pause controls needed)
  useEffect(() => {
    if (banners.length <= 1) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, autoScrollSeconds * 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [banners.length, autoScrollSeconds, nextSlide]);

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex] || banners[0];

  return (
    <section
      aria-label="Hero Showcase Carousel"
      className="relative rounded-3xl sm:rounded-4xl overflow-hidden text-white shadow-2xl border border-pink-500/20 h-[480px] sm:h-[500px] lg:h-[540px] flex flex-col justify-center group"
    >
      {/* Background Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${
          currentBanner.bgGradient || 'from-rose-950 via-pink-900 to-rose-900'
        } transition-all duration-1000 ease-in-out`}
      />

      {/* Subtle Ambient Glow Elements */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-rose-500/30 rounded-full blur-3xl pointer-events-none" />

      {/* Mobile background product showcase overlay with fixed proportions */}
      <Link
        href={currentBanner.featuredCard?.link || currentBanner.primaryBtnLink || '/shop'}
        className="absolute right-0 top-0 bottom-0 w-[42%] sm:w-[45%] lg:hidden overflow-hidden block z-0"
        aria-label={currentBanner.featuredCard?.title || currentBanner.title}
      >
        <Image
          src={
            currentBanner.featuredCard?.image ||
            'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'
          }
          alt={currentBanner.featuredCard?.title || 'Jaytel Featured Item'}
          fill
          priority
          sizes="(max-width: 1024px) 50vw, 400px"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-rose-950 via-rose-950/30 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-rose-950/80 via-transparent to-black/30 pointer-events-none" />

        {/* Mobile top pill */}
        <div className="absolute top-2.5 right-2.5">
          <span className="px-2 py-0.5 rounded-full bg-pink-500 text-white text-[9px] font-black tracking-wider uppercase shadow-md flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            <span>{currentBanner.featuredCard?.tag || 'Trending'}</span>
          </span>
        </div>

        {/* Mobile bottom price */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center justify-end">
          <span className="px-2 py-0.5 rounded-full bg-slate-900/85 backdrop-blur-md text-pink-200 border border-white/20 text-[9px] font-mono font-bold shadow-md">
            {currentBanner.featuredCard?.price || 'GH₵ 320'}
          </span>
        </div>
      </Link>

      {/* Main Container - Fixed grid with consistent alignment */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center p-5 sm:p-8 lg:p-12 h-full">
        {/* Left Column: Headline & Action Buttons */}
        <div className="max-w-[62%] sm:max-w-[58%] lg:max-w-none lg:col-span-7 flex flex-col justify-center space-y-3 sm:space-y-4 animate-fadeIn">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[9px] sm:text-xs font-bold text-pink-200 shadow-sm self-start">
            <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-amber-300 animate-pulse" />
            <span>{currentBanner.badgeText || "Accra's Premier Boutique"}</span>
          </div>

          {/* Headline & Description */}
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-xl sm:text-3xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-[1.12] text-white">
              {currentBanner.title} <br />
              <span className="bg-gradient-to-r from-pink-300 via-rose-200 to-pink-400 bg-clip-text text-transparent drop-shadow-sm">
                {currentBanner.highlightText}
              </span>
            </h1>
            <p className="text-[11px] sm:text-sm lg:text-base text-pink-100/90 leading-relaxed font-normal line-clamp-2 sm:line-clamp-3 max-w-xl">
              {currentBanner.subtitle}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-0.5 sm:pt-1">
            <Link
              href={currentBanner.primaryBtnLink || '/shop'}
              className="inline-flex items-center justify-center px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-black text-xs sm:text-sm shadow-pink hover:shadow-pink-lg transition-all active:scale-95 gap-1.5 sm:gap-2 min-h-tap"
            >
              <span>{currentBanner.primaryBtnText || 'Shop Glamour'}</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>

            {currentBanner.secondaryBtnText && (
              <Link
                href={currentBanner.secondaryBtnLink || '/shop'}
                className="hidden sm:inline-flex items-center justify-center px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all active:scale-95 gap-2 min-h-tap"
              >
                <ShoppingBag className="w-4 h-4 text-pink-300" />
                <span>{currentBanner.secondaryBtnText}</span>
              </Link>
            )}
          </div>

          {/* Trust Highlights Strip */}
          <div className="pt-3 border-t border-white/10 hidden md:grid grid-cols-3 gap-2 sm:gap-4 max-w-lg">
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

        {/* Right Column: Featured Product Card (Desktop) - Fixed dimensions */}
        <div className="hidden lg:flex lg:col-span-5 relative justify-center lg:justify-end items-center">
          <div className="relative w-full max-w-[340px] xl:max-w-[360px]">
            {/* Card Container with fixed height so image aspect ratio never shifts banner size */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-white/15 to-white/5 border border-white/25 p-3.5 shadow-2xl backdrop-blur-xl group/card">
              <div className="relative h-[360px] w-full rounded-2xl overflow-hidden bg-pink-950/40">
                <Image
                  src={
                    currentBanner.featuredCard?.image ||
                    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={currentBanner.featuredCard?.title || 'Featured Product'}
                  fill
                  priority
                  sizes="360px"
                  className="object-cover group-hover/card:scale-105 transition-transform duration-700 ease-out"
                />
                {/* Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-black/25" />

                {/* Top Badge */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-pink-500 text-white text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{currentBanner.featuredCard?.tag || 'TRENDING #1'}</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-pink-200 border border-white/20 text-[10px] font-mono font-bold">
                    {currentBanner.featuredCard?.price || 'GH₵ 320.00'}
                  </span>
                </div>

                {/* Bottom Details */}
                <div className="absolute bottom-3 left-3 right-3 space-y-1 text-left">
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-pink-300">
                    {currentBanner.featuredCard?.categoryTag || 'SIGNATURE HANDBAG'}
                  </p>
                  <h3 className="text-sm font-black text-white leading-snug line-clamp-1">
                    {currentBanner.featuredCard?.title || 'Jaytel Royal Pink Quilted Crossbody'}
                  </h3>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 text-[11px] text-amber-300 font-bold">
                      <span>{currentBanner.featuredCard?.rating || '★ 4.9'}</span>
                      <span className="text-white/60 font-normal text-[10px]">
                        {currentBanner.featuredCard?.reviewCount || '(46 reviews)'}
                      </span>
                    </div>
                    <Link
                      href={currentBanner.featuredCard?.link || currentBanner.primaryBtnLink || '/shop'}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-pink-100 text-pink-700 text-[11px] font-black shadow-sm transition-transform active:scale-95"
                    >
                      View Piece &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom floating badge */}
            <div className="absolute -bottom-4 -left-4 hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-pink-500/40 shadow-xl text-left">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center shrink-0">
                <Gem className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-black text-white">
                  {currentBanner.featuredCard?.guaranteeBadge || '100% Authentic Luxe'}
                </p>
                <p className="text-[9px] text-pink-300 font-medium">Packaged with Love in Accra</p>
              </div>
            </div>

            {/* Top status indicator */}
            <div className="absolute -top-3 -right-3 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/85 backdrop-blur-xl border border-emerald-400/40 shadow-lg text-[10px] font-bold text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{currentBanner.featuredCard?.dispatchBadge || 'Ready to Dispatch'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators: Subtle Dots Only (Back, Forward, and Pause/Play removed per user request) */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 left-5 sm:left-8 z-20 flex items-center gap-1.5 bg-slate-950/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full ${
                currentIndex === idx
                  ? 'w-6 h-2 bg-gradient-to-r from-pink-400 to-rose-400'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
