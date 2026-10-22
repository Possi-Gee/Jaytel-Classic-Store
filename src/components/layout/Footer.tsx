import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, ShieldCheck, Truck, Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-12 pb-16 lg:pb-12 border-t border-pink-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Propositions / Trust Grid with Girlish Pink Accent */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-10 border-b border-slate-800">
          <div className="flex items-center space-x-4 bg-slate-900/60 p-4 rounded-2xl border border-pink-900/30">
            <div className="p-3 bg-pink-900/60 text-pink-400 rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Glam Express Delivery</h4>
              <p className="text-xs text-slate-400">Same-day in Accra, 1-3 days across all Ghana regions.</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-slate-900/60 p-4 rounded-2xl border border-pink-900/30">
            <div className="p-3 bg-pink-900/60 text-pink-400 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Instant MoMo & Cards</h4>
              <p className="text-xs text-slate-400">MTN MoMo, Telecel Cash, AT Money & Visa/Mastercard.</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-slate-900/60 p-4 rounded-2xl border border-pink-900/30">
            <div className="p-3 bg-pink-900/60 text-pink-400 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Girlish Glamour Guarantee</h4>
              <p className="text-xs text-slate-400">100% Quality checked luxe bags, dresses, and beauty.</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10">
          {/* Brand Info */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2.5 mb-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white border-2 border-pink-400 shrink-0 shadow-sm">
                <Image src="/logo.png" alt="Jaytel Classic Store" fill className="object-cover" />
              </div>
              <div>
                <span className="font-extrabold text-white text-lg tracking-tight block leading-tight">
                  Jaytel <span className="text-pink-500">Classic</span>
                </span>
                <span className="text-[10px] text-pink-300 font-semibold uppercase tracking-wider block">
                  Quality & Affordable
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Ghana's trusted home of quality and affordable African prints, luxury lace, chic dresses, men & kids wear, shoes, bags, and modern kitchenware.
            </p>
            <div className="text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <span>East Legon / Accra, Ghana</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <span className="font-semibold text-pink-300">0243484468 / 0507080720</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <span>Instagram: @jaytel_classic_store</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <span>orders@jaytelclassic.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Shop Collections</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/shop" className="hover:text-pink-400 transition-colors">
                  All Collections
                </Link>
              </li>
              <li>
                <Link href="/shop?category=african-prints" className="hover:text-pink-400 transition-colors">
                  African Prints & Kente
                </Link>
              </li>
              <li>
                <Link href="/shop?category=lace-fabrics" className="hover:text-pink-400 transition-colors">
                  Lace & Luxury Fabrics
                </Link>
              </li>
              <li>
                <Link href="/shop?category=ladies-wear" className="hover:text-pink-400 transition-colors">
                  Ladies Wear & Dresses
                </Link>
              </li>
              <li>
                <Link href="/shop?category=shoes-bags" className="hover:text-pink-400 transition-colors">
                  Shoes & Handbags
                </Link>
              </li>
              <li>
                <Link href="/shop?category=kitchen-ware" className="hover:text-pink-400 transition-colors">
                  Cookware & Kitchen Utensils
                </Link>
              </li>
              <li>
                <Link href="/shop?category=cosmetics" className="hover:text-pink-400 transition-colors">
                  Cosmetics & Beauty
                </Link>
              </li>
              <li>
                <Link href="/shop?category=sewing-accessories" className="hover:text-pink-400 transition-colors">
                  Sewing Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h5 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Customer Care</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/orders" className="hover:text-pink-400 transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-pink-400 transition-colors">
                  Ghana Delivery Zones & Fees
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-pink-400 transition-colors">
                  7-Day Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-pink-400 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-pink-400 transition-colors">
                  WhatsApp Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h5 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Accepted Payments</h5>
            <p className="text-[11px] text-slate-400 mb-3">
              We accept all Ghana Mobile Money networks and bank cards instantly.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 bg-yellow-400 text-slate-900 rounded-md font-bold text-[10px]">
                MTN MoMo
              </span>
              <span className="px-2 py-1 bg-red-600 text-white rounded-md font-bold text-[10px]">
                Telecel Cash
              </span>
              <span className="px-2 py-1 bg-blue-600 text-white rounded-md font-bold text-[10px]">
                AirtelTigo
              </span>
              <span className="px-2 py-1 bg-pink-900/70 text-pink-300 border border-pink-700/60 rounded-md font-bold text-[10px]">
                Visa / Master
              </span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-500">
              <Link href="/privacy" className="hover:underline block">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:underline block">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-6 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1">
          <span>© {new Date().getFullYear()} Jaytel Classic Store. Made with</span>
          <Heart className="w-3 h-3 text-pink-500 fill-pink-500 inline" />
          <span>in Ghana. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
