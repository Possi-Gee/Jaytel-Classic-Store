'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  User,
  MapPin,
  Package,
  ShieldCheck,
  LogOut,
  Mail,
  Phone,
  Plus,
  Trash2,
  Heart,
  Crown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Address, GhanaRegion } from '@/types';
import { auth, isFirebaseConfigured } from '@/lib/firebase/config';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function AccountPage() {
  const { user, signIn, signUp, signOut, switchDemoRole, isAdmin } = useAuth();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const handlePasswordReset = async () => {
    setResetMsg(null);
    setAuthError(null);
    if (!email.trim()) {
      setAuthError('Please enter your email address first, then click Forgot Password.');
      return;
    }
    if (!isFirebaseConfigured || !auth) {
      setResetMsg('Password reset requires a live Firebase connection. In demo mode, use any email/password to sign in.');
      return;
    }
    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetMsg(`Password reset email sent to ${email}. Check your inbox ♥`);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to send reset email. Check the address and try again.');
    } finally {
      setIsResetting(false);
    }
  };

  const [addresses, setAddresses] = useState<Address[]>(user?.savedAddresses || []);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newTown, setNewTown] = useState('');
  const [newRegion, setNewRegion] = useState<GhanaRegion>('Greater Accra');
  const [newDigital, setNewDigital] = useState('');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (isLoginMode) {
      const res = await signIn(email, password);
      if (!res.success) setAuthError(res.message || 'Login failed');
    } else {
      const res = await signUp(email, password, displayName);
      if (!res.success) setAuthError(res.message || 'Sign up failed');
    }
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet || !newCity) return;

    const newAddr: Address = {
      id: `addr-${Date.now()}`,
      fullName: user?.displayName || 'Customer',
      phoneNumber: user?.phoneNumber || '0244000000',
      region: newRegion,
      city: newCity,
      townOrArea: newTown,
      streetAddress: newStreet,
      digitalAddress: newDigital,
      isDefault: addresses.length === 0,
    };

    setAddresses([...addresses, newAddr]);
    setShowAddAddress(false);
    setNewStreet('');
    setNewCity('');
    setNewTown('');
    setNewDigital('');
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter((a) => a.id !== id));
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden mx-auto bg-white border border-pink-200 shadow-pink">
            <Image src="/logo.png" alt="Jaytel Classic Logo" fill className="object-cover" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isLoginMode ? 'Sign In to Jaytel Classic' : 'Create Glamour Account'}
          </h1>
          <p className="text-xs text-slate-500">
            {isLoginMode
              ? 'Access saved Ghana delivery addresses, orders & exclusive perks'
              : 'Join Jaytel Classic Store for quick MoMo checkout and treats'}
          </p>
        </div>

        {authError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold">
            {authError}
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="bg-white rounded-4xl border border-pink-100 p-6 sm:p-8 shadow-soft space-y-4">
          {!isLoginMode && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="Ama Serwaa"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full text-xs p-3 bg-pink-50/30 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="ama@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs p-3 bg-pink-50/30 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs p-3 bg-pink-50/30 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {isLoginMode && (
            <div className="text-right -mt-1">
              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={isResetting}
                className="text-[11px] text-pink-500 hover:text-pink-700 hover:underline font-semibold disabled:opacity-60"
              >
                {isResetting ? 'Sending...' : 'Forgot password?'}
              </button>
            </div>
          )}

          {resetMsg && (
            <div className="p-3 bg-pink-50 border border-pink-200 text-pink-800 rounded-2xl text-xs font-semibold">
              {resetMsg}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl font-black text-xs shadow-pink transition-transform active:scale-[0.98] min-h-tap"
          >
            {isLoginMode ? 'Sign In ♥' : 'Create Account ♥'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="text-xs text-pink-600 hover:underline font-bold"
            >
              {isLoginMode
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>

        <div className="bg-pink-50 border border-pink-200 rounded-3xl p-4 text-center space-y-2">
          <p className="text-xs font-black text-pink-900">⚡ Quick Demo Test Logins:</p>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => switchDemoRole('customer')}
              className="px-3.5 py-1.5 bg-white border border-pink-300 rounded-xl text-xs font-bold text-pink-900 hover:bg-pink-100 shadow-xs"
            >
              Log in as Customer
            </button>
            <button
              type="button"
              onClick={() => switchDemoRole('admin')}
              className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 shadow-xs"
            >
              Log in as Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-4xl border border-pink-100 p-6 sm:p-8 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-pink-500 to-rose-500 text-white flex items-center justify-center font-black text-2xl shadow-pink">
            {user.displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900">{user.displayName}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-pink-100 text-pink-800">
                {user.role}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-pink-500" />
                {user.email}
              </span>
              {user.phoneNumber && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-pink-500" />
                  {user.phoneNumber}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              href="/admin"
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl text-xs font-bold shadow-pink"
            >
              Admin Dashboard &rarr;
            </Link>
          )}
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-slate-100 hover:bg-pink-50 text-slate-700 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Saved Addresses */}
        <div className="bg-white rounded-4xl border border-pink-100 p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-pink-50 pb-3">
            <h2 className="font-black text-sm text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-pink-500" />
              <span>Saved Ghana Delivery Addresses</span>
            </h2>
            <button
              onClick={() => setShowAddAddress(!showAddAddress)}
              className="p-1 text-pink-600 hover:text-pink-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {showAddAddress && (
            <form onSubmit={handleAddAddress} className="p-4 bg-pink-50/50 rounded-2xl space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="Lagos Avenue, House 24"
                  value={newStreet}
                  onChange={(e) => setNewStreet(e.target.value)}
                  className="w-full p-2 bg-white border border-pink-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="Accra"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full p-2 bg-white border border-pink-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Area / Town</label>
                  <input
                    type="text"
                    required
                    placeholder="East Legon"
                    value={newTown}
                    onChange={(e) => setNewTown(e.target.value)}
                    className="w-full p-2 bg-white border border-pink-200 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">GhanaPost GPS (Optional)</label>
                <input
                  type="text"
                  placeholder="GA-182-9014"
                  value={newDigital}
                  onChange={(e) => setNewDigital(e.target.value)}
                  className="w-full p-2 bg-white border border-pink-200 rounded-lg uppercase"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-lg shadow-pink"
                >
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddAddress(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 font-medium rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {addresses.length === 0 ? (
              <p className="text-xs text-slate-500">No saved addresses yet.</p>
            ) : (
              addresses.map((a) => (
                <div
                  key={a.id}
                  className="p-3.5 bg-pink-50/40 border border-pink-100 rounded-2xl text-xs space-y-1 relative"
                >
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-slate-900">{a.fullName}</p>
                    <button
                      onClick={() => handleDeleteAddress(a.id)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-slate-600">
                    {a.streetAddress}, {a.townOrArea}, {a.city}, {a.region}
                  </p>
                  {a.digitalAddress && (
                    <p className="font-mono text-[10px] text-pink-700">
                      GPS: {a.digitalAddress}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Orders Tracker Link */}
        <div className="bg-white rounded-4xl border border-pink-100 p-6 shadow-soft space-y-4">
          <div className="border-b border-pink-50 pb-3">
            <h2 className="font-black text-sm text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-pink-500" />
              <span>Orders & Activity</span>
            </h2>
          </div>

          <p className="text-xs text-slate-600">
            Check the live delivery and dispatch status of your recent Jaytel Classic purchases.
          </p>

          <Link
            href="/orders"
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <span>View All Orders & Tracking</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
