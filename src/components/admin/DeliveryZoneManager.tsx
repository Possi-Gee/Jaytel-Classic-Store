'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck,
  Edit2,
  CheckCircle,
  XCircle,
  Save,
  X,
  AlertCircle,
  MapPin,
  Clock,
} from 'lucide-react';
import { DeliveryZone } from '@/types';
import { formatGHS } from '@/lib/utils';
import { mockDeliveryZones } from '@/data/mockData';

export default function DeliveryZoneManager() {
  const [zones, setZones] = useState<DeliveryZone[]>(mockDeliveryZones);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Per-zone edit buffer
  const [editFee, setEditFee] = useState('');
  const [editName, setEditName] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load zones from API
  const fetchZones = async () => {
    try {
      const res = await fetch('/api/admin/zones');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.zones)) {
          setZones(data.zones);
        }
      }
    } catch (e) {
      console.warn('Failed to load zones from API, using local:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const startEdit = (zone: DeliveryZone) => {
    setEditingId(zone.id);
    setEditFee(zone.deliveryFee.toString());
    setEditName(zone.name);
    setEditTime(zone.estimatedDeliveryTime);
    setEditActive(zone.isActive);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (zone: DeliveryZone) => {
    if (!editFee || isNaN(Number(editFee)) || Number(editFee) < 0) {
      setStatusMsg({ text: 'Please enter a valid delivery fee (0 or more)', isError: true });
      setTimeout(() => setStatusMsg(null), 3000);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/zones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zoneId: zone.id,
          name: editName.trim() || zone.name,
          deliveryFee: parseFloat(editFee),
          estimatedDeliveryTime: editTime.trim() || zone.estimatedDeliveryTime,
          isActive: editActive,
        }),
      });
      const data = await res.json();
      if (data.success && data.zone) {
        setZones((prev) => prev.map((z) => (z.id === zone.id ? data.zone : z)));
        setEditingId(null);
        setStatusMsg({
          text: `"${data.zone.name}" updated — new fee: ${formatGHS(data.zone.deliveryFee)}`,
          isError: false,
        });
        setTimeout(() => setStatusMsg(null), 3500);
      } else {
        setStatusMsg({ text: data.error || 'Failed to save changes', isError: true });
        setTimeout(() => setStatusMsg(null), 3500);
      }
    } catch (err) {
      setStatusMsg({ text: 'Network error saving zone', isError: true });
      setTimeout(() => setStatusMsg(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-4xl border border-pink-100 p-6 shadow-soft space-y-6">
      {/* Header */}
      <div className="border-b border-pink-50 pb-5">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </span>
          <h2 className="font-black text-lg text-slate-900">Ghana Delivery Zones & Fees</h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Click the edit button on any zone to update its name, delivery fee, estimated time, or enable/disable it for checkout.
        </p>
      </div>

      {/* Status Alert */}
      {statusMsg && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            statusMsg.isError
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          {statusMsg.isError ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Zone Cards */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading delivery zones…</div>
      ) : (
        <div className="space-y-3">
          {zones.map((zone) => {
            const isEditing = editingId === zone.id;

            return (
              <div
                key={zone.id}
                className={`p-5 rounded-3xl border transition-all ${
                  isEditing
                    ? 'border-pink-400 bg-pink-50/70 ring-2 ring-pink-300/40 shadow-soft'
                    : zone.isActive
                    ? 'border-pink-100 bg-white hover:border-pink-200 hover:bg-pink-50/30'
                    : 'border-slate-200 bg-slate-50/60 opacity-70'
                }`}
              >
                {isEditing ? (
                  /* — EDIT MODE — */
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-sm text-pink-800">Editing Zone</h3>
                      <button
                        onClick={cancelEdit}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Zone Name */}
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Zone Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full p-2.5 bg-white border border-pink-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                      </div>

                      {/* Delivery Fee */}
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Delivery Fee (GH₵) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={editFee}
                          onChange={(e) => setEditFee(e.target.value)}
                          className="w-full p-2.5 bg-white border border-pink-300 rounded-xl font-black text-pink-700 text-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                      </div>
                    </div>

                    {/* Estimated Time */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-pink-400" />
                        Estimated Delivery Time
                      </label>
                      <input
                        type="text"
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        placeholder="e.g. 1-2 business days"
                        className="w-full p-2.5 bg-white border border-pink-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>

                    {/* Regions covered (read-only info) */}
                    <div className="p-3 bg-white rounded-2xl border border-pink-100">
                      <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mb-1">
                        <MapPin className="w-3 h-3 text-pink-400" />
                        Regions Covered ({zone.regions.length})
                      </p>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {zone.regions.join(', ')}
                      </p>
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-pink-100">
                      <input
                        type="checkbox"
                        id={`zone-active-${zone.id}`}
                        checked={editActive}
                        onChange={(e) => setEditActive(e.target.checked)}
                        className="w-4 h-4 accent-pink-600 rounded cursor-pointer"
                      />
                      <label htmlFor={`zone-active-${zone.id}`} className="font-bold text-slate-700 cursor-pointer">
                        Zone is Active (visible at checkout for customers)
                      </label>
                    </div>

                    {/* Save / Cancel */}
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={() => saveEdit(zone)}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl shadow-pink hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 transition-all text-xs"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {saving ? 'Saving…' : 'Save Zone Changes'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* — VIEW MODE — */
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-slate-900 text-sm">{zone.name}</h4>
                        {zone.isActive ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            Disabled
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-pink-400 shrink-0" />
                        {zone.estimatedDeliveryTime}
                      </p>

                      <p className="text-[11px] text-slate-400">
                        {zone.regions.slice(0, 5).join(', ')}
                        {zone.regions.length > 5 && ` +${zone.regions.length - 5} more`}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="font-black text-pink-600 text-xl block">
                          {formatGHS(zone.deliveryFee)}
                        </span>
                        <span className="text-[10px] text-slate-400">delivery fee</span>
                      </div>

                      <button
                        onClick={() => startEdit(zone)}
                        className="p-2.5 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-2xl border border-pink-200 transition-all flex items-center gap-1.5 text-xs font-bold"
                        title="Edit this zone's fee and details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Info Note */}
      <div className="p-4 bg-amber-50/60 border border-amber-200/60 rounded-3xl text-xs text-amber-800 space-y-1">
        <p className="font-bold">📦 How Delivery Zones Work</p>
        <p className="text-amber-700 leading-relaxed">
          Zones and their fees are shown to customers at checkout based on their selected Ghana region. Changes take effect immediately for new orders. Disabling a zone hides it from customer checkout.
        </p>
      </div>
    </div>
  );
}
