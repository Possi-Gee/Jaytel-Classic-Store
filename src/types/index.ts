// Core Domain Types for Mama Thes Store

export type UserRole = 'customer' | 'admin' | 'staff' | 'delivery';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  savedAddresses?: Address[];
  defaultAddressId?: string;
}

export interface Address {
  id: string;
  fullName: string;
  phoneNumber: string;
  alternativePhoneNumber?: string;
  region: GhanaRegion;
  city: string;
  townOrArea: string;
  streetAddress: string;
  digitalAddress?: string; // Ghana Post GPS, e.g., GA-123-4567
  landmark?: string;
  isDefault?: boolean;
}

export type GhanaRegion =
  | 'Greater Accra'
  | 'Ashanti'
  | 'Western'
  | 'Central'
  | 'Eastern'
  | 'Northern'
  | 'Volta'
  | 'Upper East'
  | 'Upper West'
  | 'Bono'
  | 'Bono East'
  | 'Ahafo'
  | 'Oti'
  | 'North East'
  | 'Savannah'
  | 'Western North';

export interface DeliveryZone {
  id: string;
  name: string; // e.g. "Accra Central", "Tema / Spintex", "Kumasi Metro", "Rest of Ghana"
  regions: GhanaRegion[];
  deliveryFee: number; // in GHS
  estimatedDeliveryTime: string; // e.g., "1-2 business days"
  isActive: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  productCount?: number;
  featured?: boolean;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Size: L / Color: Navy Blue"
  sku?: string;
  price: number; // in GHS
  salePrice?: number;
  stock: number;
  attributes: Record<string, string>; // { size: 'L', color: 'Navy Blue' }
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  categoryId: string;
  price: number; // in GHS
  salePrice?: number;
  rating?: number;
  reviewCount?: number;
  stock: number;
  images: string[];
  featured?: boolean;
  bestSeller?: boolean;
  isNewArrival?: boolean;
  variants?: ProductVariant[];
  tags?: string[];
  specifications?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  selectedVariant?: ProductVariant;
  maxStock: number;
}

export type OrderStatus =
  | 'pending_payment'
  | 'payment_processing'
  | 'confirmed'
  | 'processing'
  | 'ready_for_pickup'
  | 'ready_for_dispatch'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod =
  | 'mobile_money'
  | 'card'
  | 'cash_on_delivery';

export type MobileMoneyProvider = 'MTN' | 'Telecel' | 'AirtelTigo';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'success'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  productId: string;
  title: string;
  price: number; // historical price locked at purchase time
  quantity: number;
  image: string;
  variantId?: string;
  variantName?: string;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryType: 'delivery' | 'pickup';
  shippingAddress?: Address;
  pickupLocation?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  couponCode?: string;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentProviderDetails?: {
    momoNetwork?: MobileMoneyProvider;
    momoNumber?: string;
    transactionReference?: string;
    paidAt?: string;
  };
  courierDetails?: {
    riderName?: string;
    riderPhone?: string;
    vehicleInfo?: string;
    estArrival?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
  timeline: {
    status: OrderStatus;
    note: string;
    timestamp: string;
  }[];
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  expiryDate?: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  status: 'approved' | 'pending' | 'rejected';
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetCollection: string;
  targetId: string;
  details: Record<string, unknown>;
  timestamp: string;
}
