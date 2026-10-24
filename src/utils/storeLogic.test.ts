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
  LOW_STOCK_RED_THRESHOLD,
  isLowStockRedHighlight,
  resolveInventoryItemId,
  getProductStockQuantity,
  isProductOutOfStock,
  getProductAvailabilityLabel,
  promoteAccountToAdmin,
  deactivateUserAccount,
  validateAndProcessSale,
  reverseStockMovement,
  createInitialPurchaseOrders,
  createPurchaseOrder,
  approvePurchaseOrder,
  cancelPurchaseOrder,
  receivePurchaseOrderDelivery,
  validateNewInventoryProduct,
  createInventoryProduct,
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
  assert.equal(stats.totalStockUnits, 84 + 0 + 62 + 9 + 28 + 0 + 45);
  assert.equal(stats.lowStockCount, 1); // chilli-lime-250g-jar (9<=15)
  assert.equal(stats.outOfStockCount, 2); // chili-lime-100g-pouch (0), bundle-nut-lovers (0)
  assert.equal(stats.unitsByMeasure.pouches, 84);
  assert.equal(stats.unitsByMeasure.jars, 62 + 9);
  assert.equal(stats.unitsByMeasure.bundles, 28 + 45);
  assert.equal(stats.replenishmentNeeded.length, 3); // KH-CL-100P, KH-CL-250J, KH-BND-250D

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

test('isLowStockRedHighlight identifies products with stockQuantity < 10', () => {
  assert.equal(LOW_STOCK_RED_THRESHOLD, 10);
  assert.equal(isLowStockRedHighlight(0), true);
  assert.equal(isLowStockRedHighlight(9), true);
  assert.equal(isLowStockRedHighlight(10), false);
  assert.equal(isLowStockRedHighlight(14), false);

  const initial = createInitialInventory();
  const redHighlightedSkus = initial
    .filter((item) => isLowStockRedHighlight(item.stockQuantity))
    .map((item) => item.sku);
  assert.deepEqual(redHighlightedSkus, ['KH-CL-100P', 'KH-CL-250J', 'KH-BND-250D']);
});

test('isProductOutOfStock and getProductAvailabilityLabel accurately detect out-of-stock products and variants', () => {
  const initial = createInitialInventory();

  assert.equal(resolveInventoryItemId('cl-pouch-100'), 'chili-lime-100g-pouch');
  assert.equal(resolveInventoryItemId('cl-jar-250'), 'chilli-lime-250g-jar');

  assert.equal(getProductStockQuantity('chili-lime-100g-pouch', initial), 0);
  assert.equal(isProductOutOfStock('chili-lime-100g-pouch', initial), true);
  assert.equal(isProductOutOfStock('cl-pouch-100', initial), true);
  assert.equal(getProductAvailabilityLabel('chili-lime-100g-pouch', initial), 'Out of Stock');

  assert.equal(getProductStockQuantity('bundle-nut-lovers', initial), 0);
  assert.equal(isProductOutOfStock('bundle-nut-lovers', initial), true);
  assert.equal(getProductAvailabilityLabel('bundle-nut-lovers', initial), 'Out of Stock');

  assert.equal(getProductStockQuantity('honey-butter-100g-pouch', initial), 84);
  assert.equal(isProductOutOfStock('honey-butter-100g-pouch', initial), false);
  assert.equal(getProductAvailabilityLabel('honey-butter-100g-pouch', initial), 'In Stock');

  assert.equal(getProductStockQuantity('chilli-lime-250g-jar', initial), 9);
  assert.equal(isProductOutOfStock('chilli-lime-250g-jar', initial), false);
  assert.equal(getProductAvailabilityLabel('chilli-lime-250g-jar', initial), 'Only 9 left in stock');
});

test('Comprehensive Business Scenarios: PO Receiving (50 units & partial), Sales (10 units & oversell protection), Returns, Idempotency & Reversals', () => {
  const adminAccount = {
    accountId: 'KH-ADM-0001',
    fullName: 'Kampot Harvest Admin',
    email: 'admin@kampotharvest.com',
    role: 'admin' as const,
    status: 'active' as const,
    verified: true,
    permissions: getRolePermissions('admin', 'active'),
    discountCode: 'HARVEST15',
    createdAt: '2026-10-01T08:00:00.000Z',
  };

  const normalUser = createUserAccount({
    fullName: 'Normal Customer',
    email: 'customer@example.com',
    password: 'Password123',
    confirmPassword: 'Password123',
  }).account!;

  // 1. Unauthorized user cannot promote accounts or create POs
  assert.equal(promoteAccountToAdmin(normalUser, normalUser).success, false);
  const promoted = promoteAccountToAdmin(normalUser, adminAccount);
  assert.equal(promoted.success, true);
  assert.equal(isAdminAccount(promoted.account), true);

  const deactivated = deactivateUserAccount(promoted.account!, adminAccount);
  assert.equal(deactivated.success, true);
  assert.equal(deactivated.account?.status, 'suspended');
  assert.equal(isAdminAccount(deactivated.account), false);

  // 2. Purchasing & Supplier Receiving Workflow (50 units + partial delivery + cancelled PO guard)
  let inv = createInitialInventory();
  const initialPos = createInitialPurchaseOrders();
  const po401 = initialPos[0]; // Approved PO with 50x KH-CL-100P (currently 0) and 30x KH-BND-250D (currently 0)

  // Normal user cannot receive delivery
  assert.equal(
    receivePurchaseOrderDelivery(
      po401,
      inv,
      [{ itemId: 'chili-lime-100g-pouch', acceptedQty: 50 }],
      normalUser
    ).success,
    false
  );

  // Admin receives 50 units of chili-lime-100g-pouch and partial 15 units of bundle-nut-lovers
  const partialReceipt = receivePurchaseOrderDelivery(
    po401,
    inv,
    [
      { itemId: 'chili-lime-100g-pouch', acceptedQty: 50 },
      { itemId: 'bundle-nut-lovers', acceptedQty: 15 },
    ],
    adminAccount,
    'RCPT-001'
  );
  assert.equal(partialReceipt.success, true);
  assert.equal(partialReceipt.updatedPO?.status, 'partially_received');
  inv = partialReceipt.updatedInventory;
  assert.equal(getProductStockQuantity('chili-lime-100g-pouch', inv), 50);
  assert.equal(getProductStockQuantity('bundle-nut-lovers', inv), 15);

  // Duplicate receipt with same receiptId is rejected
  const dupReceipt = receivePurchaseOrderDelivery(
    partialReceipt.updatedPO!,
    inv,
    [{ itemId: 'bundle-nut-lovers', acceptedQty: 15 }],
    adminAccount,
    'RCPT-001'
  );
  assert.equal(dupReceipt.success, false);
  assert.ok(dupReceipt.error?.includes('Duplicate delivery receipt'));

  // Receive remaining 15 units of bundle-nut-lovers -> status transitions to 'received'
  const finalReceipt = receivePurchaseOrderDelivery(
    partialReceipt.updatedPO!,
    inv,
    [{ itemId: 'bundle-nut-lovers', acceptedQty: 15 }],
    adminAccount,
    'RCPT-002'
  );
  assert.equal(finalReceipt.success, true);
  assert.equal(finalReceipt.updatedPO?.status, 'received');
  inv = finalReceipt.updatedInventory;
  assert.equal(getProductStockQuantity('bundle-nut-lovers', inv), 30);

  // Cancelled PO cannot be approved or received
  const newPoRes = createPurchaseOrder(
    inv,
    {
      supplierName: 'Mekong Glassworks',
      items: [{ itemId: 'honey-butter-250g-jar', orderedQty: 20, unitCost: 8.5 }],
    },
    adminAccount,
    initialPos
  );
  assert.equal(newPoRes.success, true);
  const cancelledPo = cancelPurchaseOrder(newPoRes.purchaseOrder!, adminAccount);
  assert.equal(cancelledPo.success, true);
  assert.equal(cancelledPo.purchaseOrder?.status, 'cancelled');
  assert.equal(
    receivePurchaseOrderDelivery(
      cancelledPo.purchaseOrder!,
      inv,
      [{ itemId: 'honey-butter-250g-jar', acceptedQty: 20 }],
      adminAccount
    ).success,
    false
  );

  // 3. Selling 10 units and verifying stock decrease + idempotency
  const sale10 = validateAndProcessSale(
    inv,
    [
      {
        id: 'chili-lime-100g-pouch',
        name: 'Artisan Roasted Cashews',
        variantLabel: '100g Pouch',
        price: 10,
        originalPrice: 10,
        quantity: 10,
        image: '',
      },
    ],
    'KH-2026-5001',
    { idempotencyKey: 'CHK-KEY-1001', existingMovements: [] }
  );
  assert.equal(sale10.success, true);
  inv = sale10.updatedInventory;
  assert.equal(getProductStockQuantity('chili-lime-100g-pouch', inv), 40);

  // Duplicate sale submission with same idempotencyKey is rejected
  const dupSale = validateAndProcessSale(
    inv,
    [
      {
        id: 'chili-lime-100g-pouch',
        name: 'Artisan Roasted Cashews',
        variantLabel: '100g Pouch',
        price: 10,
        originalPrice: 10,
        quantity: 10,
        image: '',
      },
    ],
    'KH-2026-5001',
    { idempotencyKey: 'CHK-KEY-1001', existingMovements: sale10.movements }
  );
  assert.equal(dupSale.success, false);
  assert.equal(dupSale.duplicate, true);
  assert.equal(getProductStockQuantity('chili-lime-100g-pouch', inv), 40);

  // 4. Rejecting a sale that exceeds available stock & handling simultaneous sales without overselling
  // chilli-lime-250g-jar has 9 units in stock
  const oversellAttempt = validateAndProcessSale(
    inv,
    [
      {
        id: 'chilli-lime-250g-jar',
        name: 'Artisan Roasted Cashews',
        variantLabel: '250g Jar',
        price: 20,
        originalPrice: 20,
        quantity: 12,
        image: '',
      },
    ],
    'KH-2026-5002'
  );
  assert.equal(oversellAttempt.success, false);
  assert.ok(oversellAttempt.error?.includes('Insufficient stock'));
  assert.equal(getProductStockQuantity('chilli-lime-250g-jar', inv), 9);

  // Simultaneous sales: Buyer A buys 6 of 9, Buyer B tries to buy 5 of remaining 3 -> Buyer B is rejected
  const buyerA = validateAndProcessSale(
    inv,
    [
      {
        id: 'chilli-lime-250g-jar',
        name: 'Artisan Roasted Cashews',
        variantLabel: '250g Jar',
        price: 20,
        originalPrice: 20,
        quantity: 6,
        image: '',
      },
    ],
    'KH-2026-5003'
  );
  assert.equal(buyerA.success, true);
  inv = buyerA.updatedInventory;
  assert.equal(getProductStockQuantity('chilli-lime-250g-jar', inv), 3);

  const buyerB = validateAndProcessSale(
    inv,
    [
      {
        id: 'chilli-lime-250g-jar',
        name: 'Artisan Roasted Cashews',
        variantLabel: '250g Jar',
        price: 20,
        originalPrice: 20,
        quantity: 5,
        image: '',
      },
    ],
    'KH-2026-5004'
  );
  assert.equal(buyerB.success, false);
  assert.equal(getProductStockQuantity('chilli-lime-250g-jar', inv), 3);

  // 5. Processing eligible customer returns & preventing duplicate restocking
  const return1 = adjustInventoryStock(
    inv,
    'chilli-lime-250g-jar',
    2,
    'return',
    'Customer return Order KH-2026-5003',
    {
      performedBy: adminAccount.fullName,
      referenceId: 'RET-KH-2026-5003',
      existingMovements: [],
    }
  );
  assert.equal(return1.success, true);
  inv = return1.updatedInventory;
  assert.equal(getProductStockQuantity('chilli-lime-250g-jar', inv), 5);

  const duplicateReturn = adjustInventoryStock(
    inv,
    'chilli-lime-250g-jar',
    2,
    'return',
    'Duplicate customer return submission',
    {
      performedBy: adminAccount.fullName,
      referenceId: 'RET-KH-2026-5003',
      existingMovements: [return1.movement!],
    }
  );
  assert.equal(duplicateReturn.success, false);
  assert.ok(duplicateReturn.error?.includes('already been restocked'));
  assert.equal(getProductStockQuantity('chilli-lime-250g-jar', inv), 5);

  // 6. Compensating reversal (e.g. cancelling sale10 restores the 10 units without deleting history)
  const reversal = reverseStockMovement(
    inv,
    sale10.movements,
    sale10.movements[0].movementId,
    adminAccount.fullName,
    'Order KH-2026-5001 cancelled before dispatch'
  );
  assert.equal(reversal.success, true);
  inv = reversal.updatedInventory;
  assert.equal(getProductStockQuantity('chili-lime-100g-pouch', inv), 50);
  assert.equal(reversal.updatedMovements.length, 2);

  // Cannot reverse the same movement twice
  const doubleReversal = reverseStockMovement(
    inv,
    reversal.updatedMovements,
    sale10.movements[0].movementId,
    adminAccount.fullName
  );
  assert.equal(doubleReversal.success, false);
});

test('createInventoryProduct allows admins to add new products, prevents duplicate SKUs, and records initial stock movements', () => {
  const initialInv = createInitialInventory();
  const adminAccount = {
    accountId: 'KH-ADM-0001',
    fullName: 'Kampot Harvest Admin',
    email: 'admin@kampotharvest.com',
    role: 'admin' as const,
    status: 'active' as const,
    verified: true,
    permissions: getRolePermissions('admin', 'active'),
    discountCode: 'HARVEST15',
    createdAt: '2026-10-01T00:00:00.000Z',
  };
  const normalUser = {
    accountId: 'KH-USR-1001',
    fullName: 'Sokha Chan',
    email: 'sokha.chan@example.com',
    role: 'user' as const,
    status: 'active' as const,
    verified: true,
    permissions: getRolePermissions('user', 'active'),
    discountCode: 'HARVEST15',
    createdAt: '2026-10-01T00:00:00.000Z',
  };

  // Unauthorized non-admin cannot add product
  const unauthCreate = createInventoryProduct(
    initialInv,
    {
      name: 'Artisan Roasted Cashews — Kampot Black Pepper (250g Jar)',
      sku: 'KH-BP-250J',
      category: 'Glass Jars (250g)',
      price: 22,
      unitCost: 9.5,
      initialStock: 35,
      reorderThreshold: 12,
    },
    { actorAccount: normalUser }
  );
  assert.equal(unauthCreate.success, false);

  // Duplicate SKU is rejected
  const dupSku = validateNewInventoryProduct(
    {
      name: 'Duplicate Honey Butter Pouch',
      sku: 'kh-hb-100p',
      category: 'Single Pouches (100g)',
      price: 10,
      initialStock: 10,
      reorderThreshold: 5,
    },
    initialInv
  );
  assert.equal(dupSku.valid, false);
  assert.ok(dupSku.errors.sku?.includes('already exists'));

  // Valid admin product creation
  const created = createInventoryProduct(
    initialInv,
    {
      name: 'Artisan Roasted Cashews — Kampot Black Pepper (250g Jar)',
      sku: 'kh-bp-250j',
      variantLabel: 'Kampot Black Pepper · 250g Glass Jar',
      category: 'Glass Jars (250g)',
      price: 22,
      unitCost: 9.5,
      initialStock: 35,
      reorderThreshold: 12,
    },
    { actorAccount: adminAccount }
  );
  assert.equal(created.success, true);
  assert.equal(created.updatedInventory.length, initialInv.length + 1);
  assert.equal(created.newItem?.sku, 'KH-BP-250J');
  assert.equal(created.newItem?.status, 'in_stock');
  assert.equal(created.movement?.quantityDelta, 35);
  assert.equal(created.movement?.type, 'restock');
});
