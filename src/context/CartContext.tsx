'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant, Coupon } from '@/types';
import { mockCoupons, mockDeliveryZones } from '@/data/mockData';

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  appliedCoupon: Coupon | null;
  selectedDeliveryZoneId: string;
  isCartOpen: boolean;
  addToCart: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  setSelectedDeliveryZoneId: (zoneId: string) => void;
  setIsCartOpen: (open: boolean) => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [selectedDeliveryZoneId, setSelectedDeliveryZoneId] = useState<string>('zone-accra-core');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('jaytel_classic_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      const savedZone = localStorage.getItem('jaytel_classic_delivery_zone');
      if (savedZone) {
        setSelectedDeliveryZoneId(savedZone);
      }
    } catch {}
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('jaytel_classic_cart', JSON.stringify(cart));
        localStorage.setItem('jaytel_classic_delivery_zone', selectedDeliveryZoneId);
      } catch {}
    }
  }, [cart, selectedDeliveryZoneId, isLoaded]);

  const addToCart = (product: Product, quantity = 1, variant?: ProductVariant) => {
    setCart((prev) => {
      const variantKey = variant ? variant.id : 'default';
      const cartItemId = `${product.id}-${variantKey}`;
      const existingIndex = prev.findIndex((item) => item.id === cartItemId);
      const effectivePrice = variant?.salePrice ?? variant?.price ?? product.salePrice ?? product.price;
      const maxStock = variant ? variant.stock : product.stock;

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = Math.min(updated[existingIndex].quantity + quantity, maxStock);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        return updated;
      }

      const newItem: CartItem = {
        id: cartItemId,
        productId: product.id,
        title: product.title,
        price: effectivePrice,
        image: product.images[0] || '',
        quantity: Math.min(quantity, maxStock),
        selectedVariant: variant,
        maxStock,
      };
      return [...prev, newItem];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          const qty = Math.min(newQuantity, item.maxStock);
          return { ...item, quantity: qty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const selectedZone = mockDeliveryZones.find((z) => z.id === selectedDeliveryZoneId);
  const deliveryFee = selectedZone ? selectedZone.deliveryFee : 25;

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = (subtotal * appliedCoupon.discountValue) / 100;
    } else if (appliedCoupon.discountType === 'fixed') {
      discount = appliedCoupon.discountValue;
    }
  }

  const total = Math.max(0, subtotal - discount + deliveryFee);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const found = mockCoupons.find((c) => c.code === cleanCode && c.isActive);

    if (!found) {
      return { success: false, message: 'Invalid or expired coupon code' };
    }

    if (found.minOrderAmount && subtotal < found.minOrderAmount) {
      return {
        success: false,
        message: `This coupon requires a minimum subtotal of GH₵ ${found.minOrderAmount}`,
      };
    }

    setAppliedCoupon(found);
    return { success: true, message: `Coupon ${found.code} applied successfully!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        subtotal,
        deliveryFee,
        discount,
        appliedCoupon,
        selectedDeliveryZoneId,
        isCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        setSelectedDeliveryZoneId,
        setIsCartOpen,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
