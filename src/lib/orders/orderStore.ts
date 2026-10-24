import { Order, OrderStatus } from '@/types';
import { mockProducts } from '@/data/mockData';

// Centralized order store (in-memory for runtime + persistent on disk)
export const activeOrders: Order[] = [];

// Idempotency tracking for checkout attempts: Map<idempotencyKey, orderId>
export const idempotencyKeys = new Map<string, string>();

// Consumed payment references: Set<reference> -> maps to orderId
export const consumedPaymentReferences = new Map<string, string>();

let isInitialized = false;

async function getFsAndPath() {
  if (typeof window === 'undefined') {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'src', 'data', 'persistedOrders.json');
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
            activeOrders.length = 0;
            activeOrders.push(...parsed);
          }
        } else {
          await storage.fs.writeFile(storage.filePath, JSON.stringify(activeOrders, null, 2), 'utf8');
        }
      }
    } catch (e) {
      console.warn('Could not load orders from disk cache:', e);
    }
    isInitialized = true;
  }
}

async function syncLocalFile() {
  if (typeof window === 'undefined') {
    try {
      const storage = await getFsAndPath();
      if (storage) {
        await storage.fs.writeFile(storage.filePath, JSON.stringify(activeOrders, null, 2), 'utf8');
      }
    } catch (err) {
      console.warn('Failed to persist orders to disk:', err);
    }
  }
}

// Kick off initial load
ensureLoaded().catch(() => {});

/**
 * Find order by ID or order number
 */
export function findOrder(idOrNumber: string): Order | undefined {
  const normalized = idOrNumber.trim().toUpperCase();
  return activeOrders.find(
    (o) => o.id === idOrNumber || o.orderNumber.toUpperCase() === normalized
  );
}

/**
 * Save new order with optional idempotency check
 */
export function saveOrder(order: Order, idempotencyKey?: string): { success: boolean; order: Order; isDuplicate: boolean } {
  if (idempotencyKey && idempotencyKeys.has(idempotencyKey)) {
    const existingOrderId = idempotencyKeys.get(idempotencyKey);
    const existingOrder = activeOrders.find((o) => o.id === existingOrderId);
    if (existingOrder) {
      return { success: true, order: existingOrder, isDuplicate: true };
    }
  }

  // Check if order with same ID already exists
  const existingIdx = activeOrders.findIndex((o) => o.id === order.id);
  if (existingIdx >= 0) {
    activeOrders[existingIdx] = order;
  } else {
    activeOrders.unshift(order);
  }

  if (idempotencyKey) {
    idempotencyKeys.set(idempotencyKey, order.id);
  }

  syncLocalFile().catch(() => {});

  return { success: true, order, isDuplicate: false };
}

/**
 * Update order status and append timeline note
 */
export function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note: string,
  metadata?: Record<string, unknown>
): Order | null {
  const order = findOrder(orderId);
  if (!order) return null;

  order.status = status;
  order.updatedAt = new Date().toISOString();
  order.timeline.push({
    status,
    note,
    timestamp: new Date().toISOString(),
  });

  if (metadata) {
    Object.assign(order, metadata);
  }

  syncLocalFile().catch(() => {});

  return order;
}

/**
 * Decrement inventory stock on confirmed order
 */
export function decrementStockForOrder(order: Order) {
  for (const item of order.items) {
    const prod = mockProducts.find((p) => p.id === item.productId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
      if (item.variantId && prod.variants) {
        const variant = prod.variants.find((v) => v.id === item.variantId);
        if (variant) {
          variant.stock = Math.max(0, variant.stock - item.quantity);
        }
      }
    }
  }
}

/**
 * Sanitize order for public tracking (hide personal identity, phone, address details)
 */
export function sanitizeOrderForPublic(order: Order) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    deliveryType: order.deliveryType,
    pickupLocation: order.pickupLocation,
    courierDetails: order.courierDetails,
    deliveryFee: order.deliveryFee,
    discount: order.discount,
    subtotal: order.subtotal,
    total: order.total,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    timeline: order.timeline,
    items: order.items.map((item) => ({
      productId: item.productId,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      variantName: item.variantName,
      subtotal: item.subtotal,
    })),
    maskedCustomer: {
      name: order.customerName ? `${order.customerName[0]}***` : 'Customer',
      phone: order.customerPhone ? `${order.customerPhone.slice(0, 3)}****${order.customerPhone.slice(-2)}` : '',
    },
  };
}
