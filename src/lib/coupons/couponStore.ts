import { Coupon } from '@/types';
import { db, isFirebaseConfigured } from '@/lib/firebase/config';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

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

/**
 * Retrieve all coupons
 */
export async function getCoupons(includeInactive = false): Promise<Coupon[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'coupons'));
      if (!snap.empty) {
        const firestoreCoupons: Coupon[] = [];
        snap.forEach((docSnap) => {
          firestoreCoupons.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        return includeInactive ? firestoreCoupons : firestoreCoupons.filter((c) => c.isActive);
      }
    } catch (e) {
      console.warn('Firestore coupons fetch failed, using memory store:', e);
    }
  }

  return includeInactive ? activeCoupons : activeCoupons.filter((c) => c.isActive);
}

/**
 * Find coupon by uppercase code
 */
export async function findCouponByCode(code: string): Promise<Coupon | null> {
  const clean = code.trim().toUpperCase();
  const coupons = await getCoupons(true);
  return coupons.find((c) => c.code.toUpperCase() === clean) || null;
}

/**
 * Validate coupon against subtotal
 */
export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<{
  valid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  message: string;
}> {
  const coupon = await findCouponByCode(code);

  if (!coupon) {
    return { valid: false, message: 'Invalid promo code' };
  }

  if (!coupon.isActive) {
    return { valid: false, message: 'This promo code is no longer active' };
  }

  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
    return { valid: false, message: 'This promo code has expired' };
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, message: 'This promo code has reached its usage limit' };
  }

  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    return {
      valid: false,
      message: `Minimum order amount of GH₵ ${coupon.minOrderAmount} required for this promo code.`,
    };
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (subtotal * coupon.discountValue) / 100;
  } else {
    discountAmount = coupon.discountValue;
  }

  return {
    valid: true,
    coupon,
    discountAmount: Math.min(discountAmount, subtotal),
    message: `Promo code "${coupon.code}" applied successfully!`,
  };
}

/**
 * Add a new coupon
 */
export async function addCoupon(couponData: Omit<Coupon, 'id' | 'usedCount'>): Promise<Coupon> {
  const cleanCode = couponData.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  const id = `coup-${Date.now()}`;

  const newCoupon: Coupon = {
    id,
    code: cleanCode,
    description: couponData.description || `Special discount code ${cleanCode}`,
    discountType: couponData.discountType || 'percentage',
    discountValue: Number(couponData.discountValue),
    minOrderAmount: couponData.minOrderAmount ? Number(couponData.minOrderAmount) : 0,
    expiryDate: couponData.expiryDate || undefined,
    usageLimit: couponData.usageLimit ? Number(couponData.usageLimit) : undefined,
    usedCount: 0,
    isActive: couponData.isActive ?? true,
  };

  // Remove existing if matching code exists
  const existingIdx = activeCoupons.findIndex((c) => c.code.toUpperCase() === cleanCode);
  if (existingIdx >= 0) {
    activeCoupons[existingIdx] = newCoupon;
  } else {
    activeCoupons.unshift(newCoupon);
  }

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'coupons', id), newCoupon);
    } catch (e) {
      console.warn('Firestore set coupon failed:', e);
    }
  }

  return newCoupon;
}

/**
 * Update an existing coupon
 */
export async function updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon | null> {
  const index = activeCoupons.findIndex((c) => c.id === id || c.code === id);
  if (index === -1) return null;

  activeCoupons[index] = {
    ...activeCoupons[index],
    ...updates,
  };

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'coupons', activeCoupons[index].id || id), updates as any);
    } catch (e) {
      console.warn('Firestore update coupon failed:', e);
    }
  }

  return activeCoupons[index];
}

/**
 * Delete coupon
 */
export async function deleteCoupon(id: string): Promise<boolean> {
  const index = activeCoupons.findIndex((c) => c.id === id || c.code === id);
  if (index === -1) return false;

  const realId = activeCoupons[index].id || id;
  activeCoupons.splice(index, 1);

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'coupons', realId));
    } catch (e) {
      console.warn('Firestore delete coupon failed:', e);
    }
  }

  return true;
}
