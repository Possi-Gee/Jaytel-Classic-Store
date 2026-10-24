'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/types';
import { auth, isFirebaseConfigured } from '@/lib/firebase/config';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  signUp: (email: string, pass: string, name: string) => Promise<{ success: boolean; message?: string }>;
  signOut: () => Promise<void>;
  switchDemoRole: (role: 'guest' | 'customer' | 'admin') => void;
  isFirebaseLive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const demoCustomer: UserProfile = {
  id: 'usr-customer-01',
  email: 'ama.serwaa@example.com',
  displayName: 'Ama Serwaa',
  phoneNumber: '0244123456',
  role: 'customer',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-03-01T00:00:00Z',
  savedAddresses: [
    {
      id: 'addr-01',
      fullName: 'Ama Serwaa',
      phoneNumber: '0244123456',
      region: 'Greater Accra',
      city: 'Accra',
      townOrArea: 'East Legon',
      streetAddress: 'Lagos Avenue, House 24',
      digitalAddress: 'GA-182-9014',
      landmark: 'Near A&C Mall',
      isDefault: true,
    },
  ],
  defaultAddressId: 'addr-01',
};

const demoAdmin: UserProfile = {
  id: 'usr-admin-01',
  email: 'admin@jaytelclassic.com',
  displayName: 'Jaytel Store Manager',
  phoneNumber: '0244000000',
  role: 'admin',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-03-01T00:00:00Z',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const syncAuthCookie = (token: string | null, role: string | null) => {
    if (typeof document === 'undefined') return;
    if (token && role) {
      document.cookie = `jaytel_token=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `jaytel_role=${encodeURIComponent(role)}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `__session=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax`;
    } else {
      document.cookie = 'jaytel_token=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'jaytel_role=; path=/; max-age=0; SameSite=Lax';
      document.cookie = '__session=; path=/; max-age=0; SameSite=Lax';
    }
  };

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          const tokenResult = await fbUser.getIdTokenResult();
          let role = (tokenResult.claims.role as UserRole);
          const emailLower = (fbUser.email || '').toLowerCase();
          if (!role) {
            if (
              emailLower === 'admin@jaytelclassic.com' ||
              emailLower.includes('admin') ||
              emailLower.includes('jaytel')
            ) {
              role = 'admin';
            } else {
              role = 'customer';
            }
          }
          const token = await fbUser.getIdToken();
          syncAuthCookie(token, role);

          setUser({
            id: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Jaytel Admin',
            phoneNumber: fbUser.phoneNumber || undefined,
            role,
            createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } else {
          // Check if local demo user is active
          try {
            const savedDemo = typeof window !== 'undefined' ? localStorage.getItem('jaytel_demo_user') : null;
            if (savedDemo === 'admin') {
              syncAuthCookie('demo-admin-token', 'admin');
              setUser(demoAdmin);
            } else if (savedDemo === 'customer') {
              syncAuthCookie('demo-customer-token', 'customer');
              setUser(demoCustomer);
            } else {
              syncAuthCookie(null, null);
              setUser(null);
            }
          } catch {
            syncAuthCookie(null, null);
            setUser(null);
          }
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      try {
        const savedDemo = localStorage.getItem('jaytel_demo_user');
        if (savedDemo === 'admin') {
          syncAuthCookie('demo-admin-token', 'admin');
          setUser(demoAdmin);
        } else if (savedDemo === 'customer') {
          syncAuthCookie('demo-customer-token', 'customer');
          setUser(demoCustomer);
        } else {
          syncAuthCookie(null, null);
          setUser(null);
        }
      } catch {
        setUser(null);
      }
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, pass: string) => {
    if (isFirebaseConfigured && auth) {
      try {
        const userCred = await signInWithEmailAndPassword(auth, email, pass);
        const token = await userCred.user.getIdToken();
        const tokenResult = await userCred.user.getIdTokenResult();
        let role = (tokenResult.claims.role as UserRole);
        const emailLower = (userCred.user.email || email).toLowerCase();
        if (!role) {
          if (
            emailLower === 'admin@jaytelclassic.com' ||
            emailLower.includes('admin') ||
            emailLower.includes('jaytel')
          ) {
            role = 'admin';
          } else {
            role = 'customer';
          }
        }
        syncAuthCookie(token, role);
        return { success: true };
      } catch (err: any) {
        return { success: false, message: err.message };
      }
    } else {
      if (email.toLowerCase().includes('admin')) {
        setUser(demoAdmin);
        localStorage.setItem('jaytel_demo_user', 'admin');
        syncAuthCookie('demo-admin-token', 'admin');
      } else {
        setUser(demoCustomer);
        localStorage.setItem('jaytel_demo_user', 'customer');
        syncAuthCookie('demo-customer-token', 'customer');
      }
      return { success: true };
    }
  };

  const signUp = async (email: string, pass: string, name: string) => {
    if (isFirebaseConfigured && auth) {
      try {
        const userCred = await createUserWithEmailAndPassword(auth, email, pass);
        const token = await userCred.user.getIdToken();
        syncAuthCookie(token, 'customer');
        return { success: true };
      } catch (err: any) {
        return { success: false, message: err.message };
      }
    } else {
      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        email,
        displayName: name || email.split('@')[0],
        role: 'customer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(newUser);
      localStorage.setItem('jaytel_demo_user', 'customer');
      syncAuthCookie('demo-customer-token', 'customer');
      return { success: true };
    }
  };

  const signOut = async () => {
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth);
    }
    syncAuthCookie(null, null);
    setUser(null);
    try {
      localStorage.removeItem('jaytel_demo_user');
    } catch {}
  };

  const switchDemoRole = (role: 'guest' | 'customer' | 'admin') => {
    if (role === 'guest') {
      syncAuthCookie(null, null);
      setUser(null);
      try {
        localStorage.removeItem('jaytel_demo_user');
      } catch {}
    } else if (role === 'customer') {
      syncAuthCookie('demo-customer-token', 'customer');
      setUser(demoCustomer);
      try {
        localStorage.setItem('jaytel_demo_user', 'customer');
      } catch {}
    } else if (role === 'admin') {
      syncAuthCookie('demo-admin-token', 'admin');
      setUser(demoAdmin);
      try {
        localStorage.setItem('jaytel_demo_user', 'admin');
      } catch {}
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.role === 'admin',
        signIn,
        signUp,
        signOut,
        switchDemoRole,
        isFirebaseLive: isFirebaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
