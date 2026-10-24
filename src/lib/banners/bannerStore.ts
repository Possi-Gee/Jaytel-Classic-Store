import { BannerSlide } from '@/types';

export const initialBanners: BannerSlide[] = [
  {
    id: 'banner-glamour-crossbody',
    badgeText: "Accra's Premier Boutique",
    title: 'Unleash Your',
    highlightText: 'Girlish Glamour.',
    subtitle: 'Curated statement bags, satin gowns & viral glam pieces — hand-delivered across Ghana with instant MoMo checkout.',
    primaryBtnText: 'Shop Glamour',
    primaryBtnLink: '/shop',
    secondaryBtnText: 'Explore Luxe Bags',
    secondaryBtnLink: '/shop?category=shoes-bags',
    featuredCard: {
      tag: 'TRENDING #1',
      price: 'GH₵ 320.00',
      categoryTag: 'SIGNATURE HANDBAG',
      title: 'Jaytel Royal Pink Quilted Crossbody',
      rating: '★ 4.9',
      reviewCount: '(46 reviews)',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
      link: '/product/jaytel-royal-pink-quilted-crossbody-mini-bag',
      dispatchBadge: 'Ready to Dispatch',
      guaranteeBadge: '100% Authentic Luxe',
    },
    bgGradient: 'from-rose-950 via-pink-900 to-rose-900',
    isActive: true,
    order: 1,
    createdAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'banner-african-prints-lace',
    badgeText: 'Heritage & Luxury Textiles',
    title: 'Authentic African Prints',
    highlightText: '& Royal Lace Fabrics.',
    subtitle: 'Vibrant Ghana Kente, authentic Ankara wax, Swiss dry lace & French cords for weddings and prestigious celebrations.',
    primaryBtnText: 'Explore Fabrics',
    primaryBtnLink: '/shop?category=african-prints',
    secondaryBtnText: 'Lace Collections',
    secondaryBtnLink: '/shop?category=lace-fabrics',
    featuredCard: {
      tag: 'NEW ARRIVAL',
      price: 'GH₵ 280.00',
      categoryTag: 'AUTHENTIC TEXTILE',
      title: 'Handwoven Bonwire Kente 3-Piece',
      rating: '★ 5.0',
      reviewCount: '(34 reviews)',
      image: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=800&q=80',
      link: '/shop?category=african-prints',
      dispatchBadge: 'In Stock',
      guaranteeBadge: '100% Handcrafted',
    },
    bgGradient: 'from-amber-950 via-rose-950 to-pink-950',
    isActive: true,
    order: 2,
    createdAt: '2026-03-02T00:00:00Z',
  },
  {
    id: 'banner-kitchen-cookware',
    badgeText: 'Modern Homeware Essentials',
    title: 'Upgrade Your Home with',
    highlightText: 'Granite Cookware.',
    subtitle: 'Heavy-duty non-stick pot sets, stylish wooden silicone utensils, and chef cutlery made to make cooking effortless.',
    primaryBtnText: 'Shop Kitchenware',
    primaryBtnLink: '/shop?category=kitchen-ware',
    secondaryBtnText: 'Kitchen Utensils',
    secondaryBtnLink: '/shop?category=kitchen-utensils',
    featuredCard: {
      tag: "CHEF'S CHOICE",
      price: 'GH₵ 490.00',
      categoryTag: 'NON-STICK GRANITE',
      title: '12-Pc Royal Non-Stick Cookware Set',
      rating: '★ 4.9',
      reviewCount: '(58 reviews)',
      image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',
      link: '/shop?category=kitchen-ware',
      dispatchBadge: 'Ready to Dispatch',
      guaranteeBadge: 'Durable Granite',
    },
    bgGradient: 'from-slate-950 via-purple-950 to-pink-950',
    isActive: true,
    order: 3,
    createdAt: '2026-03-03T00:00:00Z',
  },
  {
    id: 'banner-men-kids-wear',
    badgeText: 'Family Elegance & Tailoring',
    title: 'Tailored Men & Kids Wear',
    highlightText: 'Plus Sewing Accessories.',
    subtitle: 'Sharply tailored suits, darling kids partywear, colorful thread sets, shears and tailoring supplies for every look.',
    primaryBtnText: 'Shop Men & Kids',
    primaryBtnLink: '/shop?category=men-kids-wear',
    secondaryBtnText: 'Sewing Accessories',
    secondaryBtnLink: '/shop?category=sewing-accessories',
    featuredCard: {
      tag: 'HOT SPECIAL',
      price: 'GH₵ 240.00',
      categoryTag: 'BOYS WEDDING SET',
      title: 'Boys 4-Piece Tuxedo & Bowtie Set',
      rating: '★ 4.8',
      reviewCount: '(27 reviews)',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
      link: '/shop?category=men-kids-wear',
      dispatchBadge: 'Fast Dispatch',
      guaranteeBadge: 'Premium Tailored',
    },
    bgGradient: 'from-fuchsia-950 via-pink-950 to-rose-950',
    isActive: true,
    order: 4,
    createdAt: '2026-03-04T00:00:00Z',
  },
];

// Runtime in-memory banners list
export const activeBanners: BannerSlide[] = [...initialBanners];

let isInitialized = false;

async function getAdminDb() {
  if (typeof window === 'undefined') {
    try {
      const { getAdminFirestore } = await import('@/lib/firebase/admin');
      return getAdminFirestore();
    } catch {
      return null;
    }
  }
  return null;
}

async function getFsAndPath() {
  if (typeof window === 'undefined') {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'src', 'data', 'persistedBanners.json');
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
          if (Array.isArray(parsed) && parsed.length > 0) {
            activeBanners.length = 0;
            activeBanners.push(...parsed);
          }
        } else {
          await storage.fs.writeFile(storage.filePath, JSON.stringify(activeBanners, null, 2), 'utf8');
        }
      }
    } catch (e) {
      console.warn('Could not load banners from disk cache:', e);
    }
    isInitialized = true;
  }
}

async function syncLocalFile() {
  if (typeof window === 'undefined') {
    try {
      const storage = await getFsAndPath();
      if (storage) {
        await storage.fs.writeFile(storage.filePath, JSON.stringify(activeBanners, null, 2), 'utf8');
      }
    } catch (err) {
      console.warn('Failed to persist banners to disk:', err);
    }
  }
}

/**
 * Retrieve all active banners
 */
export async function getBanners(includeInactive = false): Promise<BannerSlide[]> {
  await ensureLoaded();

  const adminDb = await getAdminDb();
  if (adminDb) {
    try {
      const snap = await adminDb.collection('banners').get();
      if (!snap.empty) {
        const firestoreBanners: BannerSlide[] = [];
        snap.forEach((docSnap) => {
          firestoreBanners.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });

        const existingIds = new Set(firestoreBanners.map((b) => b.id));
        const merged = [...firestoreBanners, ...activeBanners.filter((b) => !existingIds.has(b.id))];
        activeBanners.length = 0;
        activeBanners.push(...merged);
        await syncLocalFile();
      }
    } catch {
      // Non-fatal fallback
    }
  }

  const list = includeInactive ? activeBanners : activeBanners.filter((b) => b.isActive !== false);
  return [...list].sort((a, b) => (a.order || 99) - (b.order || 99));
}

/**
 * Add a new banner
 */
export async function addBanner(bannerData: Omit<BannerSlide, 'id' | 'createdAt'>): Promise<BannerSlide> {
  await ensureLoaded();

  const newId = `banner-${Date.now()}`;
  const newBanner: BannerSlide = {
    id: newId,
    badgeText: bannerData.badgeText || "Accra's Premier Boutique",
    title: bannerData.title || 'Discover Jaytel',
    highlightText: bannerData.highlightText || 'Classic Collections.',
    subtitle: bannerData.subtitle || 'Shop quality fashion, home & beauty with instant Ghana delivery.',
    primaryBtnText: bannerData.primaryBtnText || 'Shop Now',
    primaryBtnLink: bannerData.primaryBtnLink || '/shop',
    secondaryBtnText: bannerData.secondaryBtnText || '',
    secondaryBtnLink: bannerData.secondaryBtnLink || '',
    featuredCard: {
      tag: bannerData.featuredCard?.tag || 'FEATURED',
      price: bannerData.featuredCard?.price || 'GH₵ 250.00',
      categoryTag: bannerData.featuredCard?.categoryTag || 'EXCLUSIVE PIECE',
      title: bannerData.featuredCard?.title || 'Jaytel Classic Special',
      rating: bannerData.featuredCard?.rating || '★ 4.9',
      reviewCount: bannerData.featuredCard?.reviewCount || '(30 reviews)',
      image: bannerData.featuredCard?.image || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
      link: bannerData.featuredCard?.link || '/shop',
      dispatchBadge: bannerData.featuredCard?.dispatchBadge || 'Ready to Dispatch',
      guaranteeBadge: bannerData.featuredCard?.guaranteeBadge || '100% Authentic Luxe',
    },
    bgGradient: bannerData.bgGradient || 'from-rose-950 via-pink-900 to-rose-900',
    isActive: bannerData.isActive ?? true,
    order: bannerData.order || activeBanners.length + 1,
    createdAt: new Date().toISOString(),
  };

  activeBanners.push(newBanner);
  await syncLocalFile();

  const adminDb = await getAdminDb();
  if (adminDb) {
    try {
      await adminDb.collection('banners').doc(newId).set(newBanner);
    } catch (e: any) {
      console.warn('Firestore set banner notice:', e?.message || e);
    }
  }

  return newBanner;
}

/**
 * Update an existing banner
 */
export async function updateBanner(id: string, updates: Partial<BannerSlide>): Promise<BannerSlide | null> {
  await ensureLoaded();

  const index = activeBanners.findIndex((b) => b.id === id);
  if (index === -1) return null;

  activeBanners[index] = {
    ...activeBanners[index],
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  };

  await syncLocalFile();

  const adminDb = await getAdminDb();
  if (adminDb) {
    try {
      await adminDb.collection('banners').doc(id).set(activeBanners[index], { merge: true });
    } catch (e: any) {
      console.warn('Firestore update banner notice:', e?.message || e);
    }
  }

  return activeBanners[index];
}

/**
 * Delete a banner
 */
export async function deleteBanner(id: string): Promise<boolean> {
  await ensureLoaded();

  const index = activeBanners.findIndex((b) => b.id === id);
  if (index === -1) return false;

  activeBanners.splice(index, 1);
  await syncLocalFile();

  const adminDb = await getAdminDb();
  if (adminDb) {
    try {
      await adminDb.collection('banners').doc(id).delete();
    } catch (e: any) {
      console.warn('Firestore delete banner notice:', e?.message || e);
    }
  }

  return true;
}
