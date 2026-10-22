'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle, Phone, Instagram, Sparkles, Store } from 'lucide-react';
import { StoreSettings } from '@/types';
import { initialSettings } from '@/lib/settings/settingsStore';

export default function StoreSettingsManager() {
  const [settings, setSettings] = useState<StoreSettings>(initialSettings);
  const [phone1, setPhone1] = useState(initialSettings.contactPhones[0] || '0243484468');
  const [phone2, setPhone2] = useState(initialSettings.contactPhones[1] || '0507080720');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.settings) {
            setSettings(data.settings);
            if (Array.isArray(data.settings.contactPhones)) {
              setPhone1(data.settings.contactPhones[0] || '0243484468');
              setPhone2(data.settings.contactPhones[1] || '0507080720');
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load store settings:', err);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);

    const payload: Partial<StoreSettings> = {
      ...settings,
      contactPhones: [phone1.trim(), phone2.trim()].filter(Boolean),
    };

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
        setSuccessMsg('Store settings saved successfully!');
        setTimeout(() => setSuccessMsg(null), 3500);
      } else {
        alert(data.error || 'Failed to save store settings');
      }
    } catch (err: any) {
      alert(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-4xl border border-pink-100 p-6 shadow-soft space-y-6">
      <div className="border-b border-pink-50 pb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-black text-lg text-slate-900">Store Settings & Branding Control</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 font-bold text-xs">
            Global Controls
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Update the contact numbers, flyer social media handles, and announcement promotional code across the entire store.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs max-w-3xl">
        {/* Contact Numbers from flyer */}
        <div className="bg-pink-50/40 p-5 rounded-3xl border border-pink-100 space-y-4">
          <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
            <Phone className="w-4 h-4 text-pink-600" />
            <span>Store Customer Service & WhatsApp Numbers (Flyer)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Primary Contact Line</label>
              <input
                type="text"
                required
                value={phone1}
                onChange={(e) => setPhone1(e.target.value)}
                placeholder="0243484468"
                className="w-full p-2.5 bg-white border border-pink-200 rounded-xl font-bold font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Secondary Contact Line</label>
              <input
                type="text"
                value={phone2}
                onChange={(e) => setPhone2(e.target.value)}
                placeholder="0507080720"
                className="w-full p-2.5 bg-white border border-pink-200 rounded-xl font-bold font-mono text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Branding & Social Handles */}
        <div className="bg-rose-50/40 p-5 rounded-3xl border border-rose-100 space-y-4">
          <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
            <Store className="w-4 h-4 text-pink-600" />
            <span>Store Name & Social Handle</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Store Name</label>
              <input
                type="text"
                required
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full p-2.5 bg-white border border-pink-200 rounded-xl font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Store Slogan / Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                placeholder="Home of Quality and Affordable"
                className="w-full p-2.5 bg-white border border-pink-200 rounded-xl font-bold text-slate-800"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Social Media Handle (Instagram, TikTok, etc.)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">@</span>
                <input
                  type="text"
                  value={settings.socialHandle}
                  onChange={(e) => setSettings({ ...settings, socialHandle: e.target.value })}
                  placeholder="jaytel_classic_store"
                  className="w-full pl-8 p-2.5 bg-white border border-pink-200 rounded-xl font-bold text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="bg-amber-50/40 p-5 rounded-3xl border border-amber-100 space-y-4">
          <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Top Bar Announcement & Welcome Promo</span>
          </h4>

          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Notice Message</label>
              <input
                type="text"
                value={settings.announcementText}
                onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Promotional Discount Code</label>
              <input
                type="text"
                value={settings.announcementCode}
                onChange={(e) => setSettings({ ...settings, announcementCode: e.target.value })}
                placeholder="PINKGLAM"
                className="w-full max-w-xs p-2.5 bg-white border border-amber-200 rounded-xl font-mono font-black text-pink-600 uppercase"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold rounded-2xl shadow-pink flex items-center gap-2 text-xs transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Global Store Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
