import { NextRequest, NextResponse } from 'next/server';
import { mockProducts, mockDeliveryZones, mockCoupons } from '@/data/mockData';
import { generateOrderNumber, isValidGhanaPhone } from '@/lib/utils';
import { Order, OrderItem, OrderStatus, PaymentStatus } from '@/types';
import {
  activeOrders,
  findOrder,
  saveOrder,
  sanitizeOrderForPublic,
} from '@/lib/orders/orderStore';
import { getAuthenticatedUser } from '@/lib/auth/serverAuth';
import { checkRateLimit } from '@/lib/security/rateLimit';

export async function POST(req: NextRequest) {
  const rateLimitErr = checkRateLimit(req, { limit: 20, windowSeconds: 60 });
  if (rateLimitErr) return rateLimitErr;

  try {
    const body = await req.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryType,
      shippingAddress,
      pickupLocation,
      items,
      couponCode,
      selectedDeliveryZoneId,
      paymentMethod,
      momoNetwork,
      customerId,
      idempotencyKey,
    } = body;

    // Check optional authenticated user for customerId binding
    const authUser = await getAuthenticatedUser(req);
    const boundCustomerId = authUser?.uid || customerId || undefined;

    // 1. Validation
    if (!customerName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { success: false, error: 'Missing customer contact details' },
        { status: 400 }
      );
    }

    if (!isValidGhanaPhone(customerPhone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Ghanaian phone number format' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Shopping cart is empty' },
        { status: 400 }
      );
    }

    // 2. Server-side price, inventory & subtotal recalculation
    let calculatedSubtotal = 0;
    const validatedOrderItems: OrderItem[] = [];

    for (const clientItem of items) {
      const realProduct = mockProducts.find((p) => p.id === clientItem.productId);
      if (!realProduct) {
        return NextResponse.json(
          { success: false, error: `Product not found: ${clientItem.title}` },
          { status: 400 }
        );
      }

      // Check stock
      if (realProduct.stock < clientItem.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient stock for "${realProduct.title}". Only ${realProduct.stock} available.`,
          },
          { status: 400 }
        );
      }

      let unitPrice = realProduct.salePrice ?? realProduct.price;
      let variantName: string | undefined = undefined;

      if (clientItem.selectedVariant?.id) {
        const realVariant = realProduct.variants?.find((v) => v.id === clientItem.selectedVariant.id);
        if (realVariant) {
          unitPrice = realVariant.salePrice ?? realVariant.price;
          variantName = realVariant.name;
          if (realVariant.stock < clientItem.quantity) {
            return NextResponse.json(
              {
                success: false,
                error: `Insufficient stock for variant "${realVariant.name}".`,
              },
              { status: 400 }
            );
          }
        }
      }

      const itemSubtotal = unitPrice * clientItem.quantity;
      calculatedSubtotal += itemSubtotal;

      validatedOrderItems.push({
        productId: realProduct.id,
        title: realProduct.title,
        price: unitPrice, // Historical price locked
        quantity: clientItem.quantity,
        image: realProduct.images[0] || clientItem.image,
        variantId: clientItem.selectedVariant?.id,
        variantName,
        subtotal: itemSubtotal,
      });
    }

    // 3. Server-side Delivery calculation
    let calculatedDeliveryFee = 0;
    if (deliveryType === 'delivery') {
      const zone = mockDeliveryZones.find((z) => z.id === selectedDeliveryZoneId);
      calculatedDeliveryFee = zone ? zone.deliveryFee : 25;
    } else {
      calculatedDeliveryFee = 0; // Free pickup
    }

    // 4. Server-side Coupon validation & recalculation
    let calculatedDiscount = 0;
    if (couponCode) {
      const coupon = mockCoupons.find(
        (c) => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.isActive
      );
      if (coupon) {
        if (!coupon.minOrderAmount || calculatedSubtotal >= coupon.minOrderAmount) {
          if (coupon.discountType === 'percentage') {
            calculatedDiscount = (calculatedSubtotal * coupon.discountValue) / 100;
          } else if (coupon.discountType === 'fixed') {
            calculatedDiscount = coupon.discountValue;
          }
        }
      }
    }

    const calculatedTotal = Math.max(0, calculatedSubtotal - calculatedDiscount + calculatedDeliveryFee);
    const orderNumber = generateOrderNumber();
    const orderId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const initialStatus: OrderStatus =
      paymentMethod === 'cash_on_delivery' ? 'confirmed' : 'pending_payment';
    const initialPaymentStatus: PaymentStatus =
      paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending';

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerId: boundCustomerId,
      customerName,
      customerEmail,
      customerPhone,
      deliveryType,
      shippingAddress: deliveryType === 'delivery' ? shippingAddress : undefined,
      pickupLocation: deliveryType === 'pickup' ? pickupLocation || 'Jaytel Classic Boutique, Osu, Accra' : undefined,
      items: validatedOrderItems,
      subtotal: calculatedSubtotal,
      deliveryFee: calculatedDeliveryFee,
      discount: calculatedDiscount,
      couponCode: calculatedDiscount > 0 ? couponCode : undefined,
      total: calculatedTotal,
      status: initialStatus,
      paymentStatus: initialPaymentStatus,
      paymentMethod,
      paymentProviderDetails: {
        momoNetwork,
        momoNumber: paymentMethod === 'mobile_money' ? customerPhone : undefined,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          status: initialStatus,
          note:
            paymentMethod === 'cash_on_delivery'
              ? 'Order placed with Cash on Delivery option'
              : 'Order created, awaiting payment authorization',
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const saveResult = saveOrder(newOrder, idempotencyKey);

    return NextResponse.json({
      success: true,
      order: saveResult.order,
      isDuplicate: saveResult.isDuplicate,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Server error processing order' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const rateLimitErr = checkRateLimit(req, { limit: 60, windowSeconds: 60 });
  if (rateLimitErr) return rateLimitErr;

  const { searchParams } = new URL(req.url);
  const idOrNumber = searchParams.get('query');
  const authUser = await getAuthenticatedUser(req);

  // Case A: Query specific order
  if (idOrNumber) {
    const found = findOrder(idOrNumber);
    if (!found) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Verify ownership: Admin or matching authenticated customer gets full order
    const isOwner =
      authUser &&
      (found.customerId === authUser.uid ||
        (authUser.email && found.customerEmail.toLowerCase() === authUser.email.toLowerCase()));

    if (authUser?.isAdmin || isOwner) {
      return NextResponse.json({ success: true, order: found });
    }

    // Public / Unauthenticated requester gets sanitized tracking data (NO phone, NO email, NO private address)
    return NextResponse.json({
      success: true,
      order: sanitizeOrderForPublic(found),
      isPublicTracking: true,
    });
  }

  // Case B: Query all orders - STRICTLY REQUIRES AUTHENTICATION
  if (!authUser) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized: Authentication required to view private order history',
      },
      { status: 401 }
    );
  }

  // Admin gets all orders
  if (authUser.isAdmin) {
    return NextResponse.json({ success: true, orders: activeOrders });
  }

  // Customer gets ONLY their own orders
  const customerOrders = activeOrders.filter(
    (o) =>
      o.customerId === authUser.uid ||
      (authUser.email && o.customerEmail.toLowerCase() === authUser.email.toLowerCase())
  );

  return NextResponse.json({ success: true, orders: customerOrders });
}
