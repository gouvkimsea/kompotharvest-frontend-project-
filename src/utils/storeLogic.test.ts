import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCartSummary,
  formatUSD,
  STORE_CURRENCY,
  CURRENCY_SYMBOL,
  validateCheckoutForm,
  calculateNutritionSaving,
  validateOrderNumber,
  lookupOrderStatus,
  validateAccountRegistration,
  createUserAccount,
  verifyUserAccount,
  hasAccountPermission,
  getRolePermissions,
  isAdminAccount,
  migrateAccountRecord,
  createInitialInventory,
  calculateInventoryStats,
  applyInventoryOrderDeduction,
  adjustInventoryStock,
} from './storeLogic';
import { PRODUCTS } from '../data/botenzData';

test('calculateCartSummary computes empty cart accurately', () => {
  const summary = calculateCartSummary([]);
  assert.equal(summary.itemCount, 0);
  assert.equal(summary.subtotal, 0);
  assert.equal(summary.shippingFee, 0);
  assert.equal(summary.total, 0);
  assert.equal(summary.qualifiesForFreeShipping, false);
});

test('calculateCartSummary computes single item below free shipping threshold in USD', () => {
  const summary = calculateCartSummary([
    {
      id: 'peanut-butter-powder',
      name: 'Peanut Butter Powder',
      price: 11.99,
      originalPrice: 13.5,
      quantity: 1,
      image: 'test.webp',
    },
  ]);
  assert.equal(summary.itemCount, 1);
  assert.equal(summary.subtotal, 11.99);
  assert.equal(summary.shippingFee, 5.99);
  assert.equal(summary.total, 17.98);
  assert.equal(summary.qualifiesForFreeShipping, false);
});

test('calculateCartSummary applies free shipping above $50 and 15% promo code', () => {
  const summary = calculateCartSummary(
    [
      {
        id: 'bundle-complete',
        name: 'The Complete Collection',
        price: 34.99,
        originalPrice: 46.99,
        quantity: 2,
        image: 'test.webp',
      },
    ],
    true
  );
  assert.equal(summary.itemCount, 2);
  assert.equal(summary.subtotal, 69.98);
  assert.equal(summary.promoDiscount, 10.5);
  assert.equal(summary.shippingFee, 0);
  assert.equal(summary.total, 59.48);
  assert.equal(summary.qualifiesForFreeShipping, true);
});

test('formatUSD formats US Dollars ($) with 2 decimal places', () => {
  assert.equal(STORE_CURRENCY, 'USD');
  assert.equal(CURRENCY_SYMBOL, '$');
  assert.equal(formatUSD(0), '$0.00');
  assert.equal(formatUSD(11.99), '$11.99');
  assert.equal(formatUSD(34.99), '$34.99');
});

test('validateCheckoutForm rejects empty/invalid inputs and accepts valid Indian address', () => {
  const invalid = validateCheckoutForm({
    fullName: '',
    email: 'not-an-email',
    phone: '123',
    address: '',
    city: '',
    pincode: '12',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.fullName);
  assert.ok(invalid.errors.email);
  assert.ok(invalid.errors.phone);
  assert.ok(invalid.errors.pincode);

  const valid = validateCheckoutForm({
    fullName: 'Aarav Sharma',
    email: 'aarav@example.com',
    phone: '9876543210',
    address: '42 Linking Road, Bandra West',
    city: 'Mumbai',
    pincode: '400050',
  });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});
});

test('calculateNutritionSaving computes weekly calorie and fat reduction', () => {
  const res = calculateNutritionSaving(7);
  assert.equal(res.botenzCalories, 406);
  assert.equal(res.regularCalories, 1295);
  assert.equal(res.caloriesSavedWeekly, 889);
  assert.equal(res.fatSavedGramsWeekly, 93.1);
});

test('PRODUCTS catalog matches Artisan Roasted Cashews specification ($10 for 100g Pouch, $20 for 250g Jar)', () => {
  assert.equal(PRODUCTS.length, 4);
  for (const product of PRODUCTS) {
    assert.equal(product.name, 'Artisan Roasted Cashews');
    assert.ok(product.flavor === 'Honey Butter' || product.flavor === 'Chili Lime');
    assert.ok(product.packageSize === '100g Pouch' || product.packageSize === '250g Jar');
    if (product.packageSize === '100g Pouch') {
      assert.equal(product.price, 10);
    } else {
      assert.equal(product.price, 20);
    }
  }
});

test('validateOrderNumber and lookupOrderStatus validate and return real-time delivery status', () => {
  const emptyCheck = validateOrderNumber('   ');
  assert.equal(emptyCheck.valid, false);
  assert.ok(emptyCheck.error);

  const badFormat = validateOrderNumber('12345');
  assert.equal(badFormat.valid, false);
  assert.ok(badFormat.error);

  const validCheck = validateOrderNumber('#kh-2026-1042');
  assert.equal(validCheck.valid, true);
  assert.equal(validCheck.normalized, 'KH-2026-1042');

  const foundRes = lookupOrderStatus('kh-2026-1042');
  assert.equal(foundRes.found, true);
  assert.equal(foundRes.order?.orderId, 'KH-2026-1042');
  assert.equal(foundRes.order?.status, 'in_transit');
  assert.equal(foundRes.order?.timeline.length, 5);

  const missingRes = lookupOrderStatus('KH-2026-9999');
  assert.equal(missingRes.found, false);
  assert.ok(missingRes.error?.includes('KH-2026-9999'));
});

test('validateAccountRegistration rejects empty or invalid inputs with clear field errors', () => {
  const emptyRes = validateAccountRegistration({
    fullName: '',
    email: 'invalid-email',
    phone: '12345',
    password: 'short',
    confirmPassword: 'mismatch',
    role: 'wholesale',
    companyName: '',
    postalCode: '12',
  });
  assert.equal(emptyRes.valid, false);
  assert.ok(emptyRes.errors.fullName);
  assert.ok(emptyRes.errors.email);
  assert.ok(emptyRes.errors.phone);
  assert.ok(emptyRes.errors.password);
  assert.ok(emptyRes.errors.confirmPassword);
  assert.ok(emptyRes.errors.companyName);
  assert.ok(emptyRes.errors.postalCode);
});

test('createUserAccount creates customer, affiliate, and wholesale accounts without requiring phone/address at registration and prevents duplicates', () => {
  const customerRes = createUserAccount({
    fullName: 'Sokha Chan',
    email: 'Sokha.Chan@example.com',
    password: 'Password123',
    confirmPassword: 'Password123',
    role: 'customer',
  });

  assert.equal(customerRes.success, true);
  assert.ok(customerRes.account);
  assert.equal(customerRes.account.email, 'sokha.chan@example.com');
  assert.equal(customerRes.account.status, 'active');
  assert.equal(customerRes.account.verified, true);
  assert.equal(customerRes.account.discountCode, 'HARVEST15');
  assert.equal(hasAccountPermission(customerRes.account, 'autoship:manage'), true);
  assert.equal(hasAccountPermission(customerRes.account, 'wholesale:bulk_order'), false);

  // Duplicate email prevention (case-insensitive)
  const dupRes = createUserAccount(
    {
      fullName: 'Another Sokha',
      email: 'SOKHA.CHAN@EXAMPLE.COM',
      password: 'Password123',
      confirmPassword: 'Password123',
      role: 'customer',
    },
    [customerRes.account]
  );
  assert.equal(dupRes.success, false);
  assert.ok(dupRes.error?.includes('already exists'));
  assert.ok(dupRes.fieldErrors?.email);

  // Affiliate account receives active status and referralCode + affiliate:referrals permission
  const affiliateRes = createUserAccount(
    {
      fullName: 'Dara Pich',
      email: 'dara@example.com',
      phone: '0123456789',
      password: 'Password123',
      confirmPassword: 'Password123',
      role: 'affiliate',
    },
    [customerRes.account]
  );
  assert.equal(affiliateRes.success, true);
  assert.equal(affiliateRes.account?.status, 'active');
  assert.ok(affiliateRes.account?.referralCode?.startsWith('KH-REF-'));
  assert.equal(hasAccountPermission(affiliateRes.account, 'affiliate:referrals'), true);

  // Wholesale account starts in pending_verification and unlocks wholesale:bulk_order only after verification
  const wholesaleRes = createUserAccount(
    {
      fullName: 'Mealea Vong',
      email: 'mealea@b2bmarket.com',
      phone: '0987654321',
      password: 'Password123',
      confirmPassword: 'Password123',
      role: 'wholesale',
      companyName: 'Mekong Organic Grocers',
    },
    [customerRes.account, affiliateRes.account!]
  );
  assert.equal(wholesaleRes.success, true);
  assert.equal(wholesaleRes.account?.status, 'pending_verification');
  assert.equal(wholesaleRes.account?.verified, false);
  assert.equal(hasAccountPermission(wholesaleRes.account, 'wholesale:bulk_order'), false);

  const verifiedWholesale = verifyUserAccount(wholesaleRes.account!);
  assert.equal(verifiedWholesale.status, 'active');
  assert.equal(verifiedWholesale.verified, true);
  assert.equal(hasAccountPermission(verifiedWholesale, 'wholesale:bulk_order'), true);

  // Suspended accounts have zero permissions
  assert.deepEqual(getRolePermissions('customer', 'suspended'), []);
});

test('Public registration blocks self-assigning admin role and migrateAccountRecord preserves existing accounts', () => {
  const selfAdminAttempt = createUserAccount({
    fullName: 'Attacker User',
    email: 'attacker@example.com',
    password: 'Password123',
    confirmPassword: 'Password123',
    role: 'admin',
  });
  assert.equal(selfAdminAttempt.success, false);
  assert.ok(selfAdminAttempt.error?.includes('Admin role cannot be assigned'));

  const normalUserRes = createUserAccount({
    fullName: 'VannakLim',
    email: 'vannak@example.com',
    password: 'Password123',
    confirmPassword: 'Password123',
  });
  assert.equal(normalUserRes.success, true);
  assert.equal(normalUserRes.account?.role, 'user');
  assert.equal(isAdminAccount(normalUserRes.account), false);

  // Migrate legacy customer record safely to 'user' while preserving all fields
  const migratedUser = migrateAccountRecord({
    ...normalUserRes.account!,
    role: 'customer',
  });
  assert.equal(migratedUser.role, 'user');
  assert.equal(migratedUser.email, 'vannak@example.com');
  assert.equal(hasAccountPermission(migratedUser, 'admin:inventory'), false);
});

test('Inventory calculations, order deductions, and stock adjustments reflect business rules', () => {
  const initial = createInitialInventory();
  const stats = calculateInventoryStats(initial);

  assert.equal(stats.totalProducts, 7);
  assert.equal(stats.totalStockUnits, 84 + 14 + 62 + 9 + 28 + 0 + 45);
  assert.equal(stats.lowStockCount, 2); // chili-lime-100g-pouch (14<=20), chilli-lime-250g-jar (9<=15)
  assert.equal(stats.outOfStockCount, 1); // bundle-nut-lovers (0)

  // Deduct stock on completed purchase
  const afterOrder = applyInventoryOrderDeduction(
    initial,
    [
      {
        id: 'honey-butter-100g-pouch',
        name: 'Artisan Roasted Cashews — Honey Butter (100g Pouch)',
        variantLabel: '100g Pouch',
        price: 10,
        originalPrice: 10,
        quantity: 4,
        image: '',
      },
    ],
    'KH-2026-9001'
  );
  const hbItem = afterOrder.updatedInventory.find((i) => i.id === 'honey-butter-100g-pouch');
  assert.equal(hbItem?.stockQuantity, 80);
  assert.equal(afterOrder.movements.length, 1);
  assert.equal(afterOrder.movements[0].quantityDelta, -4);

  // Restock an out-of-stock item via adjustInventoryStock
  const restocked = adjustInventoryStock(
    afterOrder.updatedInventory,
    'bundle-nut-lovers',
    25,
    'restock',
    'New Kampot roastery batch'
  );
  assert.equal(restocked.success, true);
  assert.equal(restocked.updatedItem?.stockQuantity, 25);
  assert.equal(restocked.updatedItem?.status, 'in_stock');

  // Prevent negative stock adjustments
  const invalidNegative = adjustInventoryStock(
    restocked.updatedInventory,
    'bundle-nut-lovers',
    -100,
    'adjustment',
    'Invalid reduction'
  );
  assert.equal(invalidNegative.success, false);
  assert.ok(invalidNegative.error?.includes('Cannot reduce stock below 0'));
});




