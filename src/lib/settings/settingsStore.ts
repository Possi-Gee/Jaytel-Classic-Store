import { StoreSettings } from '@/types';
import { db, isFirebaseConfigured } from '@/lib/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const initialSettings: StoreSettings = {
  storeName: 'Jaytel Classic Store',
  tagline: 'Home of Quality and Affordable',
  contactPhones: ['0243484468', '0507080720'],
  socialHandle: 'jaytel_classic_store',
  announcementText: 'Welcome to Jaytel Classic Store • Free Gift with orders above GH₵ 300 with code',
  announcementCode: 'PINKGLAM',
  bannerAutoScrollSeconds: 5,
};

export let activeSettings: StoreSettings = { ...initialSettings };

export async function getStoreSettings(): Promise<StoreSettings> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'settings', 'general'));
      if (snap.exists()) {
        activeSettings = { ...activeSettings, ...(snap.data() as StoreSettings) };
      }
    } catch (e) {
      console.warn('Firestore settings fetch failed:', e);
    }
  }
  return activeSettings;
}

export async function updateStoreSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
  activeSettings = {
    ...activeSettings,
    ...updates,
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'settings', 'general'), activeSettings, { merge: true });
    } catch (e) {
      console.warn('Firestore set settings failed:', e);
    }
  }

  return activeSettings;
}
