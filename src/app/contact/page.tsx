'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Clock, CheckCircle, Heart, Crown } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-black mb-1">
          <Crown className="w-3.5 h-3.5 text-pink-500" />
          <span>Customer Care & Concierge</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Contact Jaytel Classic Store
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Need styling advice, order tracking assistance, or sizing support? We’re always here for you!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-pink-100 shadow-soft flex items-start gap-4">
            <div className="p-3 bg-pink-100 text-pink-600 rounded-2xl">
              <Phone className="w-5 h-5" />
            </div>
            <div className="text-xs space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">Phone & WhatsApp Support</h3>
              <p className="text-slate-600 font-semibold">+233 (0) 24 412 3456</p>
              <p className="text-[11px] text-pink-600">Available Mon - Sat, 9:00 AM - 7:30 PM GMT</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-pink-100 shadow-soft flex items-start gap-4">
            <div className="p-3 bg-pink-100 text-pink-600 rounded-2xl">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="text-xs space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">Jaytel Classic Boutique</h3>
              <p className="text-slate-600">Lagos Avenue, East Legon / Osu, Accra, Ghana</p>
              <p className="text-[11px] text-pink-700 font-mono font-semibold">
                Digital Address: GA-182-9014
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-pink-100 shadow-soft flex items-start gap-4">
            <div className="p-3 bg-pink-100 text-pink-600 rounded-2xl">
              <Mail className="w-5 h-5" />
            </div>
            <div className="text-xs space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">Email Inquiries</h3>
              <p className="text-slate-600">orders@jaytelclassic.com</p>
              <p className="text-slate-600">glam@jaytelclassic.com</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white p-6 sm:p-8 rounded-4xl border border-pink-100 shadow-soft">
          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-pink-500 mx-auto" />
              <h3 className="font-black text-base text-slate-900">Message Received ♥</h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Thank you darling! Our Jaytel team in Accra will get back to your WhatsApp/phone shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <h2 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                <span>Send Us a Direct Note</span>
                <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
              </h2>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ama Serwaa"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-pink-50/30 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghana Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="024 412 3456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 bg-pink-50/30 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="How can we assist you with your Jaytel order?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 bg-pink-50/30 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black rounded-xl shadow-pink transition-all min-h-tap"
              >
                Send Message ♥
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
