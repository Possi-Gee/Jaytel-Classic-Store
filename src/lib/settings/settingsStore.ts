import { StoreSettings } from '@/types';

export const initialSettings: StoreSettings = {
  storeName: 'Jaytel Classic Store',
  tagline: 'Home of Quality and Affordable',
  contactPhones: ['0243484468', '0507080720'],
  socialHandle: 'jaytel_classic_store',
  announcementText: 'Jaytel Classic Store • Home of Quality and Affordable • Call / WhatsApp: 0243484468 / 0507080720 • Code',
  announcementCode: 'PINKGLAM',
  bannerAutoScrollSeconds: 5,
};

export let activeSettings: StoreSettings = { ...initialSettings };
let isInitialized = false;

async function getFsAndPath() {
  if (typeof window === 'undefined') {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'src', 'data', 'persistedSettings.json');
    return { fs, filePath };
  }
  return null;
}

async function ensureLoaded() {
  if (typeof window === 'undefined' && !isInitialized) {
    try {
      const storage = await getFsAndPath();
      if (storage) {
        const exists = await storage.fs.access(storage.filePath).then(() => true).catch(() => false);
        if (exists) {
          const content = await storage.fs.readFile(storage.filePath, 'utf8');
          const parsed = JSON.parse(content);
          if (parsed && typeof parsed === 'object') {
            activeSettings = { ...activeSettings, ...parsed };
          }
        } else {
          await storage.fs.writeFile(storage.filePath, JSON.stringify(activeSettings, null, 2), 'utf8');
        }
      }
    } catch (e) {
      console.warn('Could not load settings from disk:', e);
    }
    isInitialized = true;
  }
}

async function syncLocalFile() {
  if (typeof window === 'undefined') {
    try {
      const storage = await getFsAndPath();
      if (storage) {
        await storage.fs.writeFile(storage.filePath, JSON.stringify(activeSettings, null, 2), 'utf8');
      }
    } catch (err) {
      console.warn('Failed to persist settings to disk:', err);
    }
  }
}

export async function getStoreSettings(): Promise<StoreSettings> {
  await ensureLoaded();
  return activeSettings;
}

export async function updateStoreSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
  await ensureLoaded();
  activeSettings = {
    ...activeSettings,
    ...updates,
  };
  await syncLocalFile();
  return activeSettings;
}
