import { Coupon } from '@/types';

export const initialCoupons: Coupon[] = [
  {
    id: 'coup-pinkglam',
    code: 'PINKGLAM',
    description: 'Welcome gift discount of 10% on orders above GH₵ 200',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 200,
    expiryDate: '2026-12-31T23:59:59Z',
    usageLimit: 1000,
    usedCount: 142,
    isActive: true,
  },
  {
    id: 'coup-jaytel10',
    code: 'JAYTEL10',
    description: '10% off sitewide on orders above GH₵ 150',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 150,
    expiryDate: '2026-12-31T23:59:59Z',
    usageLimit: 500,
    usedCount: 88,
    isActive: true,
  },
  {
    id: 'coup-accrafree',
    code: 'ACCRAFREE',
    description: 'Free standard delivery discount (GH₵ 25 OFF) on orders above GH₵ 350',
    discountType: 'fixed',
    discountValue: 25,
    minOrderAmount: 350,
    expiryDate: '2026-06-30T23:59:59Z',
    usageLimit: 200,
    usedCount: 45,
    isActive: true,
  },
];

export const activeCoupons: Coupon[] = [...initialCoupons];
let isInitialized = false;

async function getFsAndPath() {
  if (typeof window === 'undefined') {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'src', 'data', 'persistedCoupons.json');
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
            activeCoupons.length = 0;
            activeCoupons.push(...parsed);
          }
        } else {
          await storage.fs.writeFile(storage.filePath, JSON.stringify(activeCoupons, null, 2), 'utf8');
        }
      }
    } catch (e) {
      console.warn('Could not load coupons from disk cache:', e);
    }
    isInitialized = true;
  }
}

async function syncLocalFile() {
  if (typeof window === 'undefined') {
    try {
      const storage = await getFsAndPath();
      if (storage) {
        await storage.fs.writeFile(storage.filePath, JSON.stringify(activeCoupons, null, 2), 'utf8');
      }
    } catch (err) {
      console.warn('Failed to persist coupons to disk:', err);
    }
  }
}

/**
 * Retrieve all coupons
 */
export async function getCoupons(includeInactive = false): Promise<Coupon[]> {
  await ensureLoaded();
  return includeInactive ? activeCoupons : activeCoupons.filter((c) => c.isActive);
}

/**
 * Find coupon by uppercase code
 */
export async function findCouponByCode(code: string): Promise<Coupon | null> {
  await ensureLoaded();
  const normalized = code.trim().toUpperCase();
  const c = activeCoupons.find((item) => item.code.toUpperCase() === normalized && item.isActive);
  return c || null;
}

/**
 * Validate coupon against order subtotal
 */
export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<{ valid: boolean; coupon?: Coupon; discountAmount?: number; error?: string }> {
  await ensureLoaded();
  const coupon = await findCouponByCode(code);
  if (!coupon) {
    return { valid: false, error: 'Invalid or inactive coupon code' };
  }

  // Check expiry
  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
    return { valid: false, error: 'This coupon has expired' };
  }

  // Check usage limit
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, error: 'This coupon usage limit has been reached' };
  }

  // Check minimum order amount
  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    return {
      valid: false,
      error: `Minimum order amount of GH₵ ${coupon.minOrderAmount} required for this coupon`,
    };
  }

  // Calculate discount amount
  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (subtotal * coupon.discountValue) / 100;
  } else {
    discount = Math.min(coupon.discountValue, subtotal);
  }

  return {
    valid: true,
    coupon,
    discountAmount: Math.round(discount * 100) / 100,
  };
}

/**
 * Increment coupon usage count after completed payment
 */
export async function recordCouponUsage(couponId: string): Promise<void> {
  await ensureLoaded();
  const c = activeCoupons.find((item) => item.id === couponId);
  if (c) {
    c.usedCount += 1;
    await syncLocalFile();
  }
}

/**
 * Add a new coupon
 */
export async function addCoupon(couponData: Omit<Coupon, 'id' | 'usedCount'>): Promise<Coupon> {
  await ensureLoaded();
  const newCoupon: Coupon = {
    id: `coup-${Date.now()}`,
    code: couponData.code.trim().toUpperCase(),
    description: couponData.description || 'Special Jaytel Classic discount promo.',
    discountType: couponData.discountType,
    discountValue: Number(couponData.discountValue),
    minOrderAmount: couponData.minOrderAmount ? Number(couponData.minOrderAmount) : undefined,
    expiryDate: couponData.expiryDate,
    usageLimit: couponData.usageLimit ? Number(couponData.usageLimit) : undefined,
    usedCount: 0,
    isActive: couponData.isActive !== false,
  };

  activeCoupons.unshift(newCoupon);
  await syncLocalFile();
  return newCoupon;
}

/**
 * Update an existing coupon
 */
export async function updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon | null> {
  await ensureLoaded();
  const index = activeCoupons.findIndex((c) => c.id === id);
  if (index === -1) return null;

  activeCoupons[index] = {
    ...activeCoupons[index],
    ...updates,
    id,
    code: updates.code ? updates.code.trim().toUpperCase() : activeCoupons[index].code,
  };

  await syncLocalFile();
  return activeCoupons[index];
}

/**
 * Delete a coupon
 */
export async function deleteCoupon(id: string): Promise<boolean> {
  await ensureLoaded();
  const index = activeCoupons.findIndex((c) => c.id === id);
  if (index === -1) return false;

  activeCoupons.splice(index, 1);
  await syncLocalFile();
  return true;
}
