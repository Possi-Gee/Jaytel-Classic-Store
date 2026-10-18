// Automated Test Suite for Jaytel Classic Store
// Tests: Cart calculations, Ghana phone validations, Network detection, Order pricing & coupon logic

import assert from 'node:assert';

function formatGHS(amount) {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace('GHS', 'GH₵');
}

function isValidGhanaPhone(phone) {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-()]/g, '');
  const ghanaRegex = /^(?:(?:\+?233)|0)(2[0-9]|5[0-9])[0-9]{7}$/;
  return ghanaRegex.test(cleaned);
}

function detectGhanaNetwork(phone) {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  let local = cleaned;
  if (local.startsWith('+233')) local = '0' + local.slice(4);
  else if (local.startsWith('233')) local = '0' + local.slice(3);

  const prefix = local.slice(0, 3);
  if (['024', '054', '055', '059', '025'].includes(prefix)) return 'MTN';
  if (['020', '050'].includes(prefix)) return 'Telecel';
  if (['027', '057', '026', '056'].includes(prefix)) return 'AirtelTigo';
  return 'Unknown';
}

function generateOrderNumber() {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(10000 + Math.random() * 90000);
  return `JTC-${year}-${randomPart}`;
}

function calculateOrderTotal({ items, deliveryFee, coupon }) {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  let discount = 0;
  if (coupon && coupon.isActive) {
    if (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount) {
      if (coupon.discountType === 'percentage') {
        discount = (subtotal * coupon.discountValue) / 100;
      } else if (coupon.discountType === 'fixed') {
        discount = coupon.discountValue;
      }
    }
  }
  const total = Math.max(0, subtotal - discount + deliveryFee);
  return { subtotal, discount, total };
}

console.log('🧪 Starting Jaytel Classic Store Verification Tests...\n');

let testsPassed = 0;
let testsFailed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${desc}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${desc}`);
    console.error(`     Error: ${err.message}`);
    testsFailed++;
  }
}

it('should accept valid standard Ghana local numbers', () => {
  assert.strictEqual(isValidGhanaPhone('0244123456'), true);
  assert.strictEqual(isValidGhanaPhone('0551234567'), true);
  assert.strictEqual(isValidGhanaPhone('0201234567'), true);
  assert.strictEqual(isValidGhanaPhone('0271234567'), true);
});

it('should accept valid international Ghana numbers', () => {
  assert.strictEqual(isValidGhanaPhone('+233244123456'), true);
  assert.strictEqual(isValidGhanaPhone('233551234567'), true);
  assert.strictEqual(isValidGhanaPhone('+233 20 123 4567'), true);
});

it('should reject invalid phone numbers', () => {
  assert.strictEqual(isValidGhanaPhone('12345'), false);
  assert.strictEqual(isValidGhanaPhone('0123456789'), false);
  assert.strictEqual(isValidGhanaPhone('0302123456'), false);
  assert.strictEqual(isValidGhanaPhone(''), false);
});

it('should detect MTN Ghana networks correctly', () => {
  assert.strictEqual(detectGhanaNetwork('0244123456'), 'MTN');
  assert.strictEqual(detectGhanaNetwork('0551234567'), 'MTN');
  assert.strictEqual(detectGhanaNetwork('+233541234567'), 'MTN');
});

it('should detect Telecel Cash networks correctly', () => {
  assert.strictEqual(detectGhanaNetwork('0201234567'), 'Telecel');
  assert.strictEqual(detectGhanaNetwork('+233501234567'), 'Telecel');
});

it('should detect AirtelTigo networks correctly', () => {
  assert.strictEqual(detectGhanaNetwork('0271234567'), 'AirtelTigo');
  assert.strictEqual(detectGhanaNetwork('0571234567'), 'AirtelTigo');
});

it('should generate JTC- formatted order number', () => {
  const orderNum = generateOrderNumber();
  assert.strictEqual(orderNum.startsWith('JTC-'), true);
});

it('should apply 10% percentage discount correctly with JAYTEL10', () => {
  const items = [{ price: 320, quantity: 1 }, { price: 390, quantity: 1 }]; // 710 GHS
  const coupon = {
    code: 'JAYTEL10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 100,
    isActive: true,
  };
  const res = calculateOrderTotal({ items, deliveryFee: 25, coupon });
  assert.strictEqual(res.subtotal, 710);
  assert.strictEqual(res.discount, 71);
  assert.strictEqual(res.total, 664);
});

it('should format amounts with Ghana cedi symbol', () => {
  const formatted = formatGHS(320);
  assert.strictEqual(formatted.includes('GH₵'), true);
});

console.log(`\n========================================`);
console.log(`Summary: ${testsPassed} passed, ${testsFailed} failed`);
console.log(`========================================\n`);

if (testsFailed > 0) {
  process.exit(1);
}
