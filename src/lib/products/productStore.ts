import { Product } from '@/types';
import { mockProducts } from '@/data/mockData';

// In-memory runtime cache initialized with mockProducts
export const activeProducts: Product[] = [...mockProducts];

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
    const filePath = path.join(process.cwd(), 'src', 'data', 'persistedProducts.json');
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
            activeProducts.length = 0;
            activeProducts.push(...parsed);
          }
        } else {
          await storage.fs.writeFile(storage.filePath, JSON.stringify(activeProducts, null, 2), 'utf8');
        }
      }
    } catch (e) {
      console.warn('Could not load products from disk cache:', e);
    }
    isInitialized = true;
  }
}

async function syncLocalFile() {
  if (typeof window === 'undefined') {
    try {
      const storage = await getFsAndPath();
      if (storage) {
        await storage.fs.writeFile(storage.filePath, JSON.stringify(activeProducts, null, 2), 'utf8');
      }
    } catch (err) {
      console.warn('Failed to persist products to disk:', err);
    }
  }
}

/**
 * Retrieve products with optional filtering
 */
export async function getProducts(filters?: {
  category?: string;
  featured?: boolean;
  bestSeller?: boolean;
  isNewArrival?: boolean;
  search?: string;
}): Promise<Product[]> {
  await ensureLoaded();

  // If Firebase Admin Firestore is configured, load products from the 'products' collection
  const adminDb = await getAdminDb();
  if (adminDb) {
    try {
      const snap = await adminDb.collection('products').get();
      if (!snap.empty) {
        const firestoreProducts: Product[] = [];
        snap.forEach((docSnap) => {
          firestoreProducts.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });

        // Merge: firestore products take priority, then any local products not in firestore
        const existingIds = new Set(firestoreProducts.map((p) => p.id));
        const merged = [...firestoreProducts, ...activeProducts.filter((p) => !existingIds.has(p.id))];
        activeProducts.length = 0;
        activeProducts.push(...merged);
        await syncLocalFile();
      }
    } catch (e: any) {
      // Non-fatal fallback (e.g. if Firestore database has not been initialized in console yet)
    }
  }

  let products = [...activeProducts];

  // Apply filters
  if (filters?.category && filters.category.toLowerCase() !== 'all') {
    const catQuery = filters.category.toLowerCase().trim();
    products = products.filter((p) => {
      const catName = (p.category || '').toLowerCase().trim();
      const catSlug = (p.category || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const catId = (p.categoryId || '').toLowerCase();
      return catName === catQuery || catSlug === catQuery || catId === catQuery;
    });
  }

  if (filters?.featured) {
    products = products.filter((p) => Boolean(p.featured));
  }

  if (filters?.bestSeller) {
    products = products.filter((p) => Boolean(p.bestSeller));
  }

  if (filters?.isNewArrival) {
    products = products.filter((p) => Boolean(p.isNewArrival));
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase().trim();
    products = products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }

  return products;
}

/**
 * Retrieve a single product by slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const all = await getProducts();
  const normalizedSlug = slug.toLowerCase().trim();
  return all.find((p) => p.slug.toLowerCase() === normalizedSlug) || null;
}

/**
 * Retrieve a single product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  const all = await getProducts();
  return all.find((p) => p.id === id) || null;
}

/**
 * Add a new product
 */
export async function addProduct(productData: Partial<Product>): Promise<Product> {
  await ensureLoaded();

  const title = (productData.title || '').trim();
  const slug =
    productData.slug ||
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ||
    `product-${Date.now()}`;

  const newId = productData.id || `prod-${Date.now()}`;

  const newProduct: Product = {
    id: newId,
    title,
    slug,
    category: productData.category || 'Shoes / Bags',
    categoryId: productData.categoryId || 'cat-shoes-bags',
    price: Number(productData.price) || 0,
    salePrice: productData.salePrice ? Number(productData.salePrice) : undefined,
    stock: Number(productData.stock) >= 0 ? Number(productData.stock) : 10,
    description: productData.description || 'Jaytel Classic premium glamorous piece.',
    images: Array.isArray(productData.images) && productData.images.length > 0
      ? productData.images
      : ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'],
    variants: productData.variants || [],
    featured: Boolean(productData.featured),
    bestSeller: Boolean(productData.bestSeller),
    isNewArrival: productData.isNewArrival !== undefined ? Boolean(productData.isNewArrival) : true,
    specifications: productData.specifications || {},
    rating: 5.0,
    reviewCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Add to active products at the beginning (so it displays first)
  activeProducts.unshift(newProduct);

  // Sync to mockProducts array in memory as well
  mockProducts.unshift(newProduct);

  // Persist locally to disk immediately
  await syncLocalFile();

  // Persist to Firestore with Admin SDK
  const adminDb = await getAdminDb();
  if (adminDb) {
    try {
      await adminDb.collection('products').doc(newId).set(newProduct);
      console.log(`Product "${newProduct.title}" (${newId}) saved to Firestore successfully.`);
    } catch (e: any) {
      console.warn('Firestore set product notice (safely stored locally):', e?.message || e);
    }
  }

  // Ensure category is automatically registered in categoryStore if new
  if (newProduct.category) {
    try {
      const { getCategories, addCategory } = await import('@/lib/categories/categoryStore');
      const existingCats = await getCategories(true);
      const exists = existingCats.some(
        (c) => c.name.toLowerCase() === newProduct.category.toLowerCase()
      );
      if (!exists) {
        await addCategory({
          name: newProduct.category,
          slug: newProduct.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          description: `Shop luxury ${newProduct.category} at Jaytel Classic Store.`,
          image: newProduct.images[0] || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
          icon: 'Sparkles',
          productCount: 1,
          featured: false,
          isActive: true,
          order: existingCats.length + 1,
        });
      }
    } catch {
      // Non-blocking
    }
  }

  return newProduct;
}

/**
 * Update an existing product
 */
export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  await ensureLoaded();

  const index = activeProducts.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updated: Product = {
    ...activeProducts[index],
    ...updates,
    id, // preserve ID
    updatedAt: new Date().toISOString(),
  };

  activeProducts[index] = updated;

  const mockIdx = mockProducts.findIndex((p) => p.id === id);
  if (mockIdx !== -1) {
    mockProducts[mockIdx] = updated;
  }

  await syncLocalFile();

  const adminDb = await getAdminDb();
  if (adminDb) {
    try {
      await adminDb.collection('products').doc(id).set(updated, { merge: true });
    } catch (e: any) {
      console.warn('Firestore update product notice (safely stored locally):', e?.message || e);
    }
  }

  return updated;
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string): Promise<boolean> {
  await ensureLoaded();

  const index = activeProducts.findIndex((p) => p.id === id);
  if (index !== -1) {
    activeProducts.splice(index, 1);
  }

  const mockIdx = mockProducts.findIndex((p) => p.id === id);
  if (mockIdx !== -1) {
    mockProducts.splice(mockIdx, 1);
  }

  await syncLocalFile();

  const adminDb = await getAdminDb();
  if (adminDb) {
    try {
      await adminDb.collection('products').doc(id).delete();
    } catch (e: any) {
      console.warn('Firestore delete product notice:', e?.message || e);
    }
  }

  return true;
}
