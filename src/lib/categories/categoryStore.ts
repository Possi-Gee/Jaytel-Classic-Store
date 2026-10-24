import { ProductCategory } from '@/types';

export const initialCategories: ProductCategory[] = [
  {
    id: 'cat-african-prints',
    name: 'African Prints',
    slug: 'african-prints',
    description: 'Authentic Ghanaian Kente, vibrant Ankara wax prints, woodin fabrics, and traditional ceremonial textiles.',
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=800&q=80',
    icon: 'Sparkles',
    productCount: 42,
    featured: true,
    isActive: true,
    order: 1,
  },
  {
    id: 'cat-lace-fabrics',
    name: 'Lace / Fabrics',
    slug: 'lace-fabrics',
    description: 'Luxury French corded lace, Swiss dry lace, bridal organza, brocade, and haute couture textiles.',
    image: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=800&q=80',
    icon: 'Gem',
    productCount: 36,
    featured: true,
    isActive: true,
    order: 2,
  },
  {
    id: 'cat-ladies-wear',
    name: 'Ladies Wear',
    slug: 'ladies-wear',
    description: 'Chic satin dresses, cocktail gowns, girlish brunch two-pieces, skirts, and glamorous jumpsuits.',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
    icon: 'Heart',
    productCount: 48,
    featured: true,
    isActive: true,
    order: 3,
  },
  {
    id: 'cat-men-kids-wear',
    name: 'Men & Kids Wear',
    slug: 'men-kids-wear',
    description: 'Gentlemen tailored suits, smart shirts, boys luxury wedding sets, and girls fairy dresses.',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    icon: 'Crown',
    productCount: 29,
    featured: true,
    isActive: true,
    order: 4,
  },
  {
    id: 'cat-shoes-bags',
    name: 'Shoes / Bags',
    slug: 'shoes-bags',
    description: 'Designer quilted mini crossbody bags, statement tote purses, stiletto heels, and luxury loafers.',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    icon: 'ShoppingBag',
    productCount: 52,
    featured: true,
    isActive: true,
    order: 5,
  },
  {
    id: 'cat-kitchen-ware',
    name: 'Kitchen Ware',
    slug: 'kitchen-ware',
    description: 'Non-stick granite pots, stainless steel casserole sets, durable frying pans, and premium dining sets.',
    image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',
    icon: 'Package',
    productCount: 24,
    featured: true,
    isActive: true,
    order: 6,
  },
  {
    id: 'cat-kitchen-utensils',
    name: 'Kitchen Utensils',
    slug: 'kitchen-utensils',
    description: 'Heat-resistant silicone spatulas, chef knife blocks, ladles, whisks, and stylish kitchen organizers.',
    image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=800&q=80',
    icon: 'Package',
    productCount: 19,
    featured: false,
    isActive: true,
    order: 7,
  },
  {
    id: 'cat-cosmetics',
    name: 'Cosmetics',
    slug: 'cosmetics',
    description: 'Nourishing peptide lip oils, velvety lip liners, glowing foundations, fragrances, and beauty essentials.',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
    icon: 'Heart',
    productCount: 38,
    featured: true,
    isActive: true,
    order: 8,
  },
  {
    id: 'cat-sewing-accessories',
    name: 'Sewing Accessories',
    slug: 'sewing-accessories',
    description: 'High-grade sewing threads, tailoring shears, dressmaker needles, tape measures, buttons, and zippers.',
    image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=800&q=80',
    icon: 'Sparkles',
    productCount: 22,
    featured: false,
    isActive: true,
    order: 9,
  },
  {
    id: 'cat-and-more',
    name: 'And More',
    slug: 'and-more',
    description: '18K rose gold jewelry, sparkling bracelets, gift surprises, household decor, and trending novelties.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    icon: 'Gem',
    productCount: 31,
    featured: true,
    isActive: true,
    order: 10,
  },
];

// Runtime in-memory categories list
export const activeCategories: ProductCategory[] = [...initialCategories];

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
    const filePath = path.join(process.cwd(), 'src', 'data', 'persistedCategories.json');
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
            activeCategories.length = 0;
            activeCategories.push(...parsed);
          }
        } else {
          await storage.fs.writeFile(storage.filePath, JSON.stringify(activeCategories, null, 2), 'utf8');
        }
      }
    } catch (e) {
      console.warn('Could not load categories from disk cache:', e);
    }
    isInitialized = true;
  }
}

async function syncLocalFile() {
  if (typeof window === 'undefined') {
    try {
      const storage = await getFsAndPath();
      if (storage) {
        await storage.fs.writeFile(storage.filePath, JSON.stringify(activeCategories, null, 2), 'utf8');
      }
    } catch (err) {
      console.warn('Failed to persist categories to disk:', err);
    }
  }
}

/**
 * Retrieve all active categories (ordered)
 */
export async function getCategories(includeInactive = false): Promise<ProductCategory[]> {
  await ensureLoaded();

  const adminDb = await getAdminDb();
  if (adminDb) {
    try {
      const snap = await adminDb.collection('categories').get();
      if (!snap.empty) {
        const firestoreCats: ProductCategory[] = [];
        snap.forEach((docSnap) => {
          firestoreCats.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });

        const existingIds = new Set(firestoreCats.map((c) => c.id));
        const merged = [...firestoreCats, ...activeCategories.filter((c) => !existingIds.has(c.id))];
        activeCategories.length = 0;
        activeCategories.push(...merged);
        await syncLocalFile();
      }
    } catch {
      // Non-fatal fallback
    }
  }

  const list = includeInactive ? activeCategories : activeCategories.filter((c) => c.isActive !== false);
  return [...list].sort((a, b) => (a.order || 99) - (b.order || 99));
}

/**
 * Add a new category
 */
export async function addCategory(categoryData: Omit<ProductCategory, 'id'>): Promise<ProductCategory> {
  await ensureLoaded();

  const newId = `cat-${Date.now()}`;
  const slug = categoryData.slug || categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const newCat: ProductCategory = {
    id: newId,
    name: categoryData.name,
    slug,
    description: categoryData.description || `Browse quality ${categoryData.name} at Jaytel Classic Store.`,
    image: categoryData.image || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    icon: categoryData.icon || 'Sparkles',
    productCount: categoryData.productCount || 0,
    featured: categoryData.featured ?? false,
    isActive: categoryData.isActive ?? true,
    order: categoryData.order || activeCategories.length + 1,
  };

  activeCategories.push(newCat);
  await syncLocalFile();

  const adminDb = await getAdminDb();
  if (adminDb) {
    try {
      await adminDb.collection('categories').doc(newId).set(newCat);
    } catch (e: any) {
      console.warn('Firestore set category notice:', e?.message || e);
    }
  }

  return newCat;
}

/**
 * Update existing category
 */
export async function updateCategory(id: string, updates: Partial<ProductCategory>): Promise<ProductCategory | null> {
  await ensureLoaded();

  const index = activeCategories.findIndex((c) => c.id === id);
  if (index === -1) return null;

  activeCategories[index] = {
    ...activeCategories[index],
    ...updates,
    id, // preserve ID
  };

  await syncLocalFile();

  const adminDb = await getAdminDb();
  if (adminDb) {
    try {
      await adminDb.collection('categories').doc(id).set(activeCategories[index], { merge: true });
    } catch (e: any) {
      console.warn('Firestore update category notice:', e?.message || e);
    }
  }

  return activeCategories[index];
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string): Promise<boolean> {
  await ensureLoaded();

  const index = activeCategories.findIndex((c) => c.id === id);
  if (index === -1) return false;

  activeCategories.splice(index, 1);
  await syncLocalFile();

  const adminDb = await getAdminDb();
  if (adminDb) {
    try {
      await adminDb.collection('categories').doc(id).delete();
    } catch (e: any) {
      console.warn('Firestore delete category notice:', e?.message || e);
    }
  }

  return true;
}
