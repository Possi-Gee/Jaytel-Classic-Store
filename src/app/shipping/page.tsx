import React from 'react';
import { Truck, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { mockDeliveryZones } from '@/data/mockData';
import { formatGHS } from '@/lib/utils';

export default function ShippingPolicyPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Truck className="w-6 h-6 text-primary-700" />
          <span>Ghana Shipping & Delivery Zones</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Detailed delivery rates, schedules, and carrier information across Ghana
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockDeliveryZones.map((z) => (
          <div key={z.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex justify-between items-start">
              <h2 className="font-bold text-sm text-slate-900">{z.name}</h2>
              <span className="font-extrabold text-primary-800 text-sm">{formatGHS(z.deliveryFee)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{z.estimatedDeliveryTime}</span>
            </div>
            <p className="text-[11px] text-slate-600 pt-1">
              Serviced Regions: {z.regions.join(', ')}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed shadow-sm">
        <h2 className="font-extrabold text-base text-slate-900">Delivery Guidelines</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Accra Same-Day Delivery:</strong> Orders confirmed before 2:00 PM GMT on business days are dispatched for same-day delivery via our express rider network.
          </li>
          <li>
            <strong>Regional Dispatch:</strong> Parcels traveling outside Greater Accra are safely packed in tamper-evident sealed packaging and sent through trusted inter-regional couriers (VIP Express / DHL Ghana).
          </li>
          <li>
            <strong>Delivery Notification:</strong> Our delivery rider will call the provided contact phone number 30-45 minutes before arrival at your address.
          </li>
          <li>
            <strong>Free Osu Store Pickup:</strong> Customers may choose store pickup at our Osu Oxford Street branch at zero shipping cost.
          </li>
        </ul>
      </div>
    </div>
  );
}
