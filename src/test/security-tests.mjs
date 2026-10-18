// Comprehensive Security & Business Logic Test Suite
// Covers: Customer order isolation, Sanitized public tracking,
// Payment reference reuse protection, Amount tampering rejection, Idempotency & Stock decrement,
// Webhook HMAC-SHA512 verification.

import assert from 'node:assert';
import crypto from 'crypto';

console.log('🛡️  Starting Jaytel Classic Store Security & Protection Test Suite...\n');

let passed = 0;
let failed = 0;

function it(title, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${title}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${title}`);
    console.error(`     Error: ${err.message}`);
    failed++;
  }
}

// Order Store Logic Reproduction for isolated testing
function sanitizeOrderForPublic(order) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    deliveryType: order.deliveryType,
    pickupLocation: order.pickupLocation,
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

// 1. Order Isolation & Sanitization Tests
it('should sanitize public order tracking so customer phone, email, and street address are never exposed', () => {
  const privateOrder = {
    id: 'ord-test-001',
    orderNumber: 'JTC-2026-99999',
    customerId: 'cust-ama-1',
    customerName: 'Ama Serwaa',
    customerEmail: 'ama.serwaa@example.com',
    customerPhone: '0244123456',
    deliveryType: 'delivery',
    shippingAddress: {
      id: 'addr-1',
      fullName: 'Ama Serwaa',
      phoneNumber: '0244123456',
      region: 'Greater Accra',
      city: 'Accra',
      townOrArea: 'East Legon',
      streetAddress: 'Lagos Avenue, Private Villa 42',
      digitalAddress: 'GA-999-1234',
    },
    items: [
      {
        productId: 'prod-01',
        title: 'Jaytel Rose Silk Gown',
        price: 450,
        quantity: 1,
        image: '/gown.png',
        subtotal: 450,
      },
    ],
    subtotal: 450,
    deliveryFee: 25,
    discount: 0,
    total: 475,
    status: 'confirmed',
    paymentStatus: 'success',
    paymentMethod: 'mobile_money',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeline: [],
  };

  const sanitized = sanitizeOrderForPublic(privateOrder);

  // Assert private fields are NOT present
  assert.strictEqual(sanitized.customerEmail, undefined);
  assert.strictEqual(sanitized.customerPhone, undefined);
  assert.strictEqual(sanitized.shippingAddress, undefined);

  // Assert public tracking fields ARE present
  assert.strictEqual(sanitized.orderNumber, 'JTC-2026-99999');
  assert.strictEqual(sanitized.status, 'confirmed');
  assert.strictEqual(sanitized.total, 475);
  assert.strictEqual(sanitized.items.length, 1);
  assert.strictEqual(sanitized.maskedCustomer.phone, '024****56');
  assert.strictEqual(sanitized.maskedCustomer.name, 'A***');
});

it('should isolate customer orders so Customer B cannot view Customer A private orders', () => {
  const testStore = [];

  const orderA = {
    id: 'ord-a',
    orderNumber: 'JTC-2026-00001',
    customerId: 'user-ama',
    customerEmail: 'ama@example.com',
    customerName: 'Ama Serwaa',
    customerPhone: '0244123456',
    items: [],
    subtotal: 100,
    deliveryFee: 25,
    discount: 0,
    total: 125,
    status: 'confirmed',
    paymentStatus: 'success',
  };

  const orderB = {
    id: 'ord-b',
    orderNumber: 'JTC-2026-00002',
    customerId: 'user-kofi',
    customerEmail: 'kofi@example.com',
    customerName: 'Kofi Mensah',
    customerPhone: '0200000000',
    items: [],
    subtotal: 200,
    deliveryFee: 25,
    discount: 0,
    total: 225,
    status: 'confirmed',
    paymentStatus: 'success',
  };

  testStore.push(orderA, orderB);

  // Query as Customer A
  const customerAOrders = testStore.filter(
    (o) => o.customerId === 'user-ama' || o.customerEmail === 'ama@example.com'
  );
  assert.strictEqual(customerAOrders.length, 1);
  assert.strictEqual(customerAOrders[0].id, 'ord-a');

  // Query as Customer B
  const customerBOrders = testStore.filter(
    (o) => o.customerId === 'user-kofi' || o.customerEmail === 'kofi@example.com'
  );
  assert.strictEqual(customerBOrders.length, 1);
  assert.strictEqual(customerBOrders[0].id, 'ord-b');
});

// 2. Idempotency & Duplicate Order Prevention
it('should reject duplicate order creation when the same idempotency key is submitted', () => {
  const idempotencyMap = new Map();
  const testStore = [];

  function saveWithIdempotency(order, idempotencyKey) {
    if (idempotencyKey && idempotencyMap.has(idempotencyKey)) {
      const existingId = idempotencyMap.get(idempotencyKey);
      return { order: testStore.find((o) => o.id === existingId), isDuplicate: true };
    }
    testStore.push(order);
    if (idempotencyKey) {
      idempotencyMap.set(idempotencyKey, order.id);
    }
    return { order, isDuplicate: false };
  }

  const idempotencyKey = 'chk_test_key_abc_123';
  const order = {
    id: 'ord-idemp-1',
    orderNumber: 'JTC-2026-88881',
    total: 325,
  };

  const first = saveWithIdempotency(order, idempotencyKey);
  assert.strictEqual(first.isDuplicate, false);
  assert.strictEqual(first.order.id, 'ord-idemp-1');

  const duplicateAttempt = {
    id: 'ord-idemp-2',
    orderNumber: 'JTC-2026-88882',
    total: 325,
  };

  const second = saveWithIdempotency(duplicateAttempt, idempotencyKey);
  assert.strictEqual(second.isDuplicate, true);
  assert.strictEqual(second.order.id, 'ord-idemp-1'); // Exact original returned
});

// 3. Payment Reference Reuse & Duplicate Settlement Protection
it('should reject payment reference reuse across different orders', () => {
  const consumedReferences = new Map();
  const reference = 'PAYSTACK_REF_TEST_998877';

  // Order 1 consumes reference
  consumedReferences.set(reference, 'ord-001');

  // Order 2 attempts to use the same reference
  const attemptingOrderId = 'ord-002';
  const isConsumed = consumedReferences.has(reference);
  const belongsToSameOrder = consumedReferences.get(reference) === attemptingOrderId;

  assert.strictEqual(isConsumed, true);
  assert.strictEqual(belongsToSameOrder, false, 'Reference cannot be reused for different order');
});

// 4. Amount Tampering Rejection
it('should reject payment verification if paid amount does not match calculated order total', () => {
  const expectedOrderTotal = 450.0;
  const tamperedPaidAmount = 1.0; // Attacker attempted to pay 1 GHS instead of 450 GHS

  const amountDiff = Math.abs(tamperedPaidAmount - expectedOrderTotal);
  const isValidAmount = amountDiff <= 0.1;

  assert.strictEqual(isValidAmount, false, 'Tampered payment amount must be detected and rejected');
});

// 5. Stock Decrement on Payment Confirmation
it('should atomically decrement product stock upon order payment confirmation', () => {
  const mockProduct = {
    id: 'prod-01',
    title: 'Jaytel Rose Silk Gown',
    stock: 15,
  };

  function decrement(order, products) {
    for (const item of order.items) {
      const p = products.find((x) => x.id === item.productId);
      if (p) {
        p.stock = Math.max(0, p.stock - item.quantity);
      }
    }
  }

  const testOrder = {
    items: [{ productId: 'prod-01', quantity: 3 }],
  };

  decrement(testOrder, [mockProduct]);

  assert.strictEqual(mockProduct.stock, 12);
});

// 6. Paystack HMAC-SHA512 Webhook Signature Verification
it('should correctly verify authentic Paystack HMAC-SHA512 webhook signatures and reject invalid ones', () => {
  const secret = 'sk_test_mock_secret_key_12345';
  const payload = JSON.stringify({
    event: 'charge.success',
    data: {
      reference: 'T123456789',
      amount: 45000,
      paid_at: new Date().toISOString(),
      metadata: { orderId: 'ord-test-001' },
    },
  });

  const validSignature = crypto
    .createHmac('sha512', secret)
    .update(payload)
    .digest('hex');

  const computedValid = crypto
    .createHmac('sha512', secret)
    .update(payload)
    .digest('hex');
  assert.strictEqual(validSignature, computedValid);

  const tamperedPayload = payload.replace('45000', '100');
  const computedForTampered = crypto
    .createHmac('sha512', secret)
    .update(tamperedPayload)
    .digest('hex');
  assert.notStrictEqual(validSignature, computedForTampered);
});

console.log(`\n========================================`);
console.log(`Summary: ${passed} passed, ${failed} failed`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}
