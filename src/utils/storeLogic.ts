import { PRODUCTS, BUNDLES, type Product, type BundleItem } from '../data/botenzData';

export interface CartItem {
  id: string;
  name: string;
  variantLabel?: string;
  price: number;
  originalPrice: number;
  quantity: number;
  image: string;
  isAutoship?: boolean;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  originalSubtotal: number;
  promoDiscount: number;
  autoshipSavings: number;
  shippingFee: number;
  total: number;
  freeShippingProgress: number;
  qualifiesForFreeShipping: boolean;
}

export const STORE_CURRENCY = 'USD';
export const CURRENCY_SYMBOL = '$';
export const FREE_SHIPPING_THRESHOLD = 50;
export const STANDARD_SHIPPING_FEE = 5.99;

export function calculateCartSummary(
  items: CartItem[],
  promoCodeActive: boolean = false
): CartSummary {
  let itemCount = 0;
  let subtotal = 0;
  let originalSubtotal = 0;
  let autoshipSavings = 0;

  for (const item of items) {
    if (item.quantity <= 0) continue;
    itemCount += item.quantity;
    const effectiveUnitPrice = item.isAutoship
      ? Math.round(item.price * 0.85 * 100) / 100
      : item.price;
    if (item.isAutoship) {
      autoshipSavings += (item.price - effectiveUnitPrice) * item.quantity;
    }
    subtotal += effectiveUnitPrice * item.quantity;
    originalSubtotal += item.originalPrice * item.quantity;
  }

  const promoDiscount = promoCodeActive ? Math.round(subtotal * 0.15 * 100) / 100 : 0;
  const afterPromo = Math.max(0, subtotal - promoDiscount);
  const qualifiesForFreeShipping = afterPromo >= FREE_SHIPPING_THRESHOLD || afterPromo === 0;
  const shippingFee = qualifiesForFreeShipping ? 0 : STANDARD_SHIPPING_FEE;
  const total = Math.round((afterPromo + shippingFee) * 100) / 100;
  const freeShippingProgress = Math.min(
    100,
    Math.round((afterPromo / FREE_SHIPPING_THRESHOLD) * 100)
  );

  return {
    itemCount,
    subtotal: Math.round(subtotal * 100) / 100,
    originalSubtotal: Math.round(originalSubtotal * 100) / 100,
    promoDiscount,
    autoshipSavings: Math.round(autoshipSavings * 100) / 100,
    shippingFee,
    total,
    freeShippingProgress,
    qualifiesForFreeShipping: afterPromo >= FREE_SHIPPING_THRESHOLD,
  };
}

export function formatUSD(amount: number): string {
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export const formatINR = formatUSD;

export interface CheckoutFormInput {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
}

export interface CheckoutValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof CheckoutFormInput, string>>;
}

export function validateCheckoutForm(input: CheckoutFormInput): CheckoutValidationResult {
  const errors: Partial<Record<keyof CheckoutFormInput, string>> = {};

  if (!input.fullName || input.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full name';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!input.email || !emailRegex.test(input.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  const cleanPhone = input.phone.replace(/\D/g, '');
  if (cleanPhone.length < 10) {
    errors.phone = 'Please enter a valid 10-digit phone number';
  }

  if (!input.address || input.address.trim().length < 5) {
    errors.address = 'Please enter your street delivery address';
  }

  if (!input.city || input.city.trim().length < 2) {
    errors.city = 'Please enter your city';
  }

  const cleanPincode = input.pincode.replace(/\D/g, '');
  if (cleanPincode.length < 5 || cleanPincode.length > 6) {
    errors.pincode = 'Please enter a valid 5 or 6-digit ZIP / Postal code';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function calculateNutritionSaving(servingsPerWeek: number) {
  const safeServings = Math.max(1, Math.min(28, servingsPerWeek));
  const botenzCalories = safeServings * 58;
  const regularCalories = safeServings * 185;
  const caloriesSavedWeekly = regularCalories - botenzCalories;
  const fatSavedGramsWeekly = Math.round(safeServings * (15 - 1.7) * 10) / 10;
  const extraProteinGramsWeekly = safeServings * (7 - 6);

  return {
    servingsPerWeek: safeServings,
    botenzCalories,
    regularCalories,
    caloriesSavedWeekly,
    fatSavedGramsWeekly,
    extraProteinGramsWeekly,
  };
}

export type OrderStage =
  | 'confirmed'
  | 'roasting'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered';

export interface TrackingStep {
  stage: OrderStage;
  title: string;
  location: string;
  timestamp: string;
  completed: boolean;
  current: boolean;
}

export interface TrackedOrder {
  orderId: string;
  createdAt: string;
  estimatedDelivery: string;
  status: OrderStage;
  statusLabel: string;
  currentLocation: string;
  carrier: string;
  trackingCode: string;
  customer: {
    name: string;
    city: string;
    postalCode: string;
  };
  items: Array<{
    name: string;
    variantLabel?: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  timeline: TrackingStep[];
}

export const DEMO_TRACKED_ORDERS: Record<string, TrackedOrder> = {
  'KH-2026-1042': {
    orderId: 'KH-2026-1042',
    createdAt: '2026-10-22 09:15',
    estimatedDelivery: '2026-10-25 by 18:00',
    status: 'in_transit',
    statusLabel: 'In Transit',
    currentLocation: 'Phnom Penh Express Sort Facility',
    carrier: 'Kampot Eco-Express',
    trackingCode: 'KEX-8841209-KH',
    customer: {
      name: 'Sokha Chan',
      city: 'Phnom Penh',
      postalCode: '12000',
    },
    items: [
      {
        name: 'Artisan Roasted Cashews (Honey Butter)',
        variantLabel: '250g Jar',
        quantity: 2,
        price: 20,
      },
      {
        name: 'Artisan Roasted Cashews (Chili Lime)',
        variantLabel: '100g Pouch',
        quantity: 1,
        price: 10,
      },
    ],
    total: 50,
    timeline: [
      {
        stage: 'confirmed',
        title: 'Order Confirmed',
        location: 'Kampot Harvest Roastery',
        timestamp: 'Oct 22, 09:15',
        completed: true,
        current: false,
      },
      {
        stage: 'roasting',
        title: 'Small-Batch Roasted & Glass Sealed',
        location: 'Kampot Solar Roastery, Batch #KH-408',
        timestamp: 'Oct 22, 16:40',
        completed: true,
        current: false,
      },
      {
        stage: 'in_transit',
        title: 'In Transit to Destination Hub',
        location: 'Phnom Penh Express Sort Facility',
        timestamp: 'Oct 24, 06:20',
        completed: true,
        current: true,
      },
      {
        stage: 'out_for_delivery',
        title: 'Out for Local Eco-Courier Delivery',
        location: 'Phnom Penh (12000)',
        timestamp: 'Expected Oct 25, Morning',
        completed: false,
        current: false,
      },
      {
        stage: 'delivered',
        title: 'Delivered',
        location: 'Customer Address · Phnom Penh',
        timestamp: 'Estimated Oct 25 by 18:00',
        completed: false,
        current: false,
      },
    ],
  },
  'KH-2026-8831': {
    orderId: 'KH-2026-8831',
    createdAt: '2026-10-21 14:10',
    estimatedDelivery: 'Today by 17:30',
    status: 'out_for_delivery',
    statusLabel: 'Out for Delivery',
    currentLocation: 'Siem Reap Old Market Dispatch Hub',
    carrier: 'Angkor Green Courier',
    trackingCode: 'AGC-5529104-SR',
    customer: {
      name: 'Dara Pich',
      city: 'Siem Reap',
      postalCode: '17252',
    },
    items: [
      {
        name: 'The Complete 4-Pack Tasting Collection',
        variantLabel: '2x 250g Jars + 2x 100g Pouches',
        quantity: 1,
        price: 45,
      },
    ],
    total: 50.99,
    timeline: [
      {
        stage: 'confirmed',
        title: 'Order Confirmed',
        location: 'Kampot Harvest Roastery',
        timestamp: 'Oct 21, 14:10',
        completed: true,
        current: false,
      },
      {
        stage: 'roasting',
        title: 'Small-Batch Roasted & Glass Sealed',
        location: 'Kampot Solar Roastery, Batch #KH-405',
        timestamp: 'Oct 21, 19:05',
        completed: true,
        current: false,
      },
      {
        stage: 'in_transit',
        title: 'In Transit to Destination Hub',
        location: 'Siem Reap Regional Distribution Hub',
        timestamp: 'Oct 23, 18:30',
        completed: true,
        current: false,
      },
      {
        stage: 'out_for_delivery',
        title: 'Out for Local Eco-Courier Delivery',
        location: 'Courier En Route · Siem Reap (17252)',
        timestamp: 'Oct 24, 08:15',
        completed: true,
        current: true,
      },
      {
        stage: 'delivered',
        title: 'Delivered',
        location: 'Customer Address · Siem Reap',
        timestamp: 'Estimated Today by 17:30',
        completed: false,
        current: false,
      },
    ],
  },
  'KH-2026-5190': {
    orderId: 'KH-2026-5190',
    createdAt: '2026-10-18 11:00',
    estimatedDelivery: 'Delivered Oct 20, 15:42',
    status: 'delivered',
    statusLabel: 'Delivered',
    currentLocation: 'Delivered to Front Desk · BKK1, Phnom Penh',
    carrier: 'Kampot Eco-Express',
    trackingCode: 'KEX-3190442-KH',
    customer: {
      name: 'Mealea Vong',
      city: 'Phnom Penh',
      postalCode: '12302',
    },
    items: [
      {
        name: 'Artisan Roasted Cashews (Chili Lime)',
        variantLabel: '250g Jar',
        quantity: 2,
        price: 20,
      },
    ],
    total: 45.99,
    timeline: [
      {
        stage: 'confirmed',
        title: 'Order Confirmed',
        location: 'Kampot Harvest Roastery',
        timestamp: 'Oct 18, 11:00',
        completed: true,
        current: false,
      },
      {
        stage: 'roasting',
        title: 'Small-Batch Roasted & Glass Sealed',
        location: 'Kampot Solar Roastery, Batch #KH-399',
        timestamp: 'Oct 18, 17:20',
        completed: true,
        current: false,
      },
      {
        stage: 'in_transit',
        title: 'In Transit to Destination Hub',
        location: 'Phnom Penh Express Sort Facility',
        timestamp: 'Oct 19, 14:10',
        completed: true,
        current: false,
      },
      {
        stage: 'out_for_delivery',
        title: 'Out for Local Eco-Courier Delivery',
        location: 'BKK1 District Courier Route',
        timestamp: 'Oct 20, 09:30',
        completed: true,
        current: false,
      },
      {
        stage: 'delivered',
        title: 'Delivered',
        location: 'Signed by Mealea V. · Phnom Penh',
        timestamp: 'Oct 20, 15:42',
        completed: true,
        current: true,
      },
    ],
  },
};

export interface OrderNumberValidation {
  valid: boolean;
  normalized: string;
  error?: string;
}

export function validateOrderNumber(rawInput: string): OrderNumberValidation {
  const cleaned = (rawInput || '').trim().replace(/^#/, '').toUpperCase();
  if (!cleaned) {
    return {
      valid: false,
      normalized: '',
      error: 'Please enter your order number (e.g. KH-2026-1042)',
    };
  }

  const pattern = /^KH-\d{4}-\d{4,6}$/;
  if (!pattern.test(cleaned)) {
    return {
      valid: false,
      normalized: cleaned,
      error: 'Order number must match format KH-YYYY-XXXX (e.g. KH-2026-1042)',
    };
  }

  return {
    valid: true,
    normalized: cleaned,
  };
}

export function lookupOrderStatus(
  rawInput: string,
  customOrders: TrackedOrder[] = []
): { found: boolean; order?: TrackedOrder; error?: string } {
  const validation = validateOrderNumber(rawInput);
  if (!validation.valid) {
    return {
      found: false,
      error: validation.error,
    };
  }

  const normalized = validation.normalized;

  const customMatch = customOrders.find(
    (o) => o.orderId.toUpperCase() === normalized
  );
  if (customMatch) {
    return { found: true, order: customMatch };
  }

  const demoMatch = DEMO_TRACKED_ORDERS[normalized];
  if (demoMatch) {
    return { found: true, order: demoMatch };
  }

  return {
    found: false,
    error: `No order found matching ${normalized}. Try sample order KH-2026-1042, KH-2026-8831, or KH-2026-5190.`,
  };
}

/* ============================================================================
 * USER ACCOUNT CREATION, ROLES, PERMISSIONS & AUTHENTICATION LOGIC
 * ========================================================================== */

export type AccountRole = 'admin' | 'user' | 'customer' | 'wholesale' | 'affiliate';
export type AccountStatus = 'active' | 'pending_verification' | 'suspended';
export type AccountPermission =
  | 'store:shop'
  | 'vip:first_order_discount'
  | 'autoship:manage'
  | 'orders:track'
  | 'affiliate:referrals'
  | 'wholesale:bulk_order'
  | 'admin:inventory'
  | 'admin:dashboard';

export interface AccountRegistrationInput {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  role?: AccountRole;
  companyName?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

export interface UserAccount {
  accountId: string;
  fullName: string;
  email: string;
  phone?: string;
  role: AccountRole;
  status: AccountStatus;
  verified: boolean;
  permissions: AccountPermission[];
  companyName?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  discountCode: string;
  referralCode?: string;
  createdAt: string;
}

export interface AccountValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof AccountRegistrationInput, string>>;
}

export function getRolePermissions(
  role: AccountRole,
  status: AccountStatus
): AccountPermission[] {
  if (status === 'suspended') {
    return [];
  }

  const base: AccountPermission[] = [
    'store:shop',
    'vip:first_order_discount',
    'autoship:manage',
    'orders:track',
  ];

  if (role === 'admin') {
    return [
      ...base,
      'admin:inventory',
      'admin:dashboard',
      'wholesale:bulk_order',
    ];
  }

  if (role === 'affiliate') {
    return [...base, 'affiliate:referrals'];
  }

  if (role === 'wholesale') {
    // Wholesale bulk ordering requires active (verified) status
    return status === 'active'
      ? [...base, 'wholesale:bulk_order']
      : base;
  }

  return base;
}

export function isAdminAccount(account: UserAccount | null | undefined): boolean {
  if (!account || account.status !== 'active') {
    return false;
  }
  return (
    account.role === 'admin' &&
    account.permissions.includes('admin:inventory')
  );
}

export function migrateAccountRecord(account: UserAccount): UserAccount {
  // Preserve existing admin accounts; normalize standard customer accounts while preserving all data
  const normalizedRole: AccountRole =
    account.role === 'admin'
      ? 'admin'
      : account.role === 'wholesale' || account.role === 'affiliate'
      ? account.role
      : 'user';

  return {
    ...account,
    role: normalizedRole,
    permissions: getRolePermissions(normalizedRole, account.status),
  };
}

export function validateAccountRegistration(
  input: AccountRegistrationInput
): AccountValidationResult {
  const errors: Partial<Record<keyof AccountRegistrationInput, string>> = {};

  if (!input.fullName || input.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full name (at least 2 characters)';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!input.email || !emailRegex.test(input.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  // Phone is optional at account registration (collected at checkout when ordering)
  if (input.phone && input.phone.trim().length > 0) {
    const cleanPhone = input.phone.replace(/\D/g, '');
    if (cleanPhone.length < 9) {
      errors.phone = 'Please enter a valid phone number';
    }
  }

  if (!input.password || input.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
  } else if (!/[A-Za-z]/.test(input.password) || !/\d/.test(input.password)) {
    errors.password = 'Password must include at least one letter and one number';
  }

  if (!input.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (input.password !== input.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  // Security rule: Normal users can NEVER select or self-assign the 'admin' role during registration
  if (input.role === 'admin') {
    errors.role = 'Admin role cannot be assigned through public registration';
  } else {
    const resolvedRole: AccountRole = input.role || 'user';
    const allowedPublicRoles: AccountRole[] = ['user', 'customer', 'wholesale', 'affiliate'];
    if (!allowedPublicRoles.includes(resolvedRole)) {
      errors.role = 'Please select a valid account type';
    }
    if (resolvedRole === 'wholesale') {
      if (!input.companyName || input.companyName.trim().length < 2) {
        errors.companyName = 'Business or company name is required for Wholesale accounts';
      }
    }
  }

  if (input.postalCode && input.postalCode.trim().length > 0) {
    const cleanPostal = input.postalCode.replace(/\D/g, '');
    if (cleanPostal.length < 5 || cleanPostal.length > 6) {
      errors.postalCode = 'Postal code must be 5 or 6 digits';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function createUserAccount(
  input: AccountRegistrationInput,
  existingAccounts: UserAccount[] = []
): {
  success: boolean;
  account?: UserAccount;
  error?: string;
  fieldErrors?: Partial<Record<keyof AccountRegistrationInput, string>>;
} {
  const validation = validateAccountRegistration(input);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.errors.role || 'Please correct the highlighted fields.',
      fieldErrors: validation.errors,
    };
  }

  const normalizedEmail = input.email.trim().toLowerCase();
  const duplicate = existingAccounts.find(
    (acc) => acc.email.toLowerCase() === normalizedEmail
  );
  if (duplicate) {
    return {
      success: false,
      error: 'An account with this email address already exists',
      fieldErrors: {
        email: 'An account with this email address already exists',
      },
    };
  }

  // Enforce non-admin role on public account creation
  const resolvedRole: AccountRole =
    input.role && input.role !== 'admin' ? input.role : 'user';
  const initialStatus: AccountStatus =
    resolvedRole === 'wholesale' ? 'pending_verification' : 'active';
  const verified = initialStatus === 'active';
  const permissions = getRolePermissions(resolvedRole, initialStatus);

  const suffix = String(1000 + existingAccounts.length + 1);
  const accountId = `KH-USR-${suffix}`;
  const cleanNameCode = input.fullName
    .trim()
    .replace(/[^A-Za-z]/g, '')
    .toUpperCase()
    .slice(0, 4) || 'VIP';

  const account: UserAccount = {
    accountId,
    fullName: input.fullName.trim(),
    email: normalizedEmail,
    phone: input.phone?.trim() || undefined,
    role: resolvedRole,
    status: initialStatus,
    verified,
    permissions,
    companyName:
      resolvedRole === 'wholesale' && input.companyName
        ? input.companyName.trim()
        : undefined,
    address: input.address?.trim() || undefined,
    city: input.city?.trim() || undefined,
    postalCode: input.postalCode?.trim() || undefined,
    discountCode: 'HARVEST15',
    referralCode:
      resolvedRole === 'affiliate' ? `KH-REF-${cleanNameCode}${suffix}` : undefined,
    createdAt: new Date().toISOString(),
  };

  return {
    success: true,
    account,
  };
}

export function verifyUserAccount(account: UserAccount): UserAccount {
  if (account.status === 'suspended') {
    return account;
  }
  const updatedStatus: AccountStatus = 'active';
  return {
    ...account,
    status: updatedStatus,
    verified: true,
    permissions: getRolePermissions(account.role, updatedStatus),
  };
}

export function hasAccountPermission(
  account: UserAccount | null | undefined,
  permission: AccountPermission
): boolean {
  if (!account || account.status === 'suspended') {
    return false;
  }
  return account.permissions.includes(permission);
}

export function promoteAccountToAdmin(
  targetAccount: UserAccount,
  actorAccount: UserAccount | null | undefined
): { success: boolean; account?: UserAccount; error?: string } {
  if (!isAdminAccount(actorAccount)) {
    return {
      success: false,
      error: 'Forbidden: Only an authorized administrator can promote an account to admin',
    };
  }
  if (targetAccount.status === 'suspended') {
    return {
      success: false,
      error: 'Cannot promote a suspended account',
    };
  }
  const updated: UserAccount = {
    ...targetAccount,
    role: 'admin',
    status: 'active',
    verified: true,
    permissions: getRolePermissions('admin', 'active'),
  };
  return { success: true, account: updated };
}

export function deactivateUserAccount(
  targetAccount: UserAccount,
  actorAccount: UserAccount | null | undefined
): { success: boolean; account?: UserAccount; error?: string } {
  if (!isAdminAccount(actorAccount)) {
    return {
      success: false,
      error: 'Forbidden: Only an authorized administrator can deactivate an account',
    };
  }
  const updated: UserAccount = {
    ...targetAccount,
    status: 'suspended',
    permissions: [],
  };
  return { success: true, account: updated };
}

/* ============================================================================
 * BUSINESS INVENTORY MANAGEMENT & STOCK MOVEMENT LOGIC
 * ========================================================================== */

export type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type InventoryCategory =
  | 'Single Pouches (100g)'
  | 'Glass Jars (250g)'
  | 'Value Bundles';
export type UnitOfMeasure = '100g Pouch' | '250g Glass Jar' | 'Bundle Box';

export interface InventoryItem {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  variantLabel: string;
  category: InventoryCategory;
  unitOfMeasure?: UnitOfMeasure;
  unitCost?: number;
  price: number;
  stockQuantity: number;
  reservedQuantity?: number;
  damagedQuantity?: number;
  reorderThreshold: number;
  status: InventoryStatus;
  image: string;
  lastUpdated: string;
}

export type StockMovementType =
  | 'sale'
  | 'restock'
  | 'supplier_delivery'
  | 'return'
  | 'supplier_return'
  | 'loss_damage'
  | 'adjustment'
  | 'reversal';

export interface StockMovementRecord {
  movementId: string;
  idempotencyKey?: string;
  itemId: string;
  sku: string;
  productName: string;
  type: StockMovementType;
  quantityDelta: number;
  previousStock?: number;
  resultingStock: number;
  unitCost?: number;
  unitPrice?: number;
  reason: string;
  performedBy?: string;
  referenceId?: string;
  reversedByMovementId?: string;
  timestamp: string;
}

export interface ReplenishmentItem {
  id: string;
  sku: string;
  name: string;
  category: InventoryCategory;
  unitOfMeasure: UnitOfMeasure;
  stockQuantity: number;
  reorderThreshold: number;
  deficit: number;
  recommendedOrderQty: number;
  unitCost: number;
  estimatedRestockCostUSD: number;
  status: InventoryStatus;
}

export interface InventoryStats {
  totalProducts: number;
  totalStockUnits: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalInventoryValueUSD: number;
  totalInventoryCostUSD: number;
  unitsByMeasure: {
    pouches: number;
    jars: number;
    bundles: number;
  };
  replenishmentNeeded: ReplenishmentItem[];
}

export const LOW_STOCK_RED_THRESHOLD = 10;

export function isLowStockRedHighlight(stockQuantity: number): boolean {
  return Number(stockQuantity) < LOW_STOCK_RED_THRESHOLD;
}

export function computeInventoryStatus(
  stockQuantity: number,
  reorderThreshold: number
): InventoryStatus {
  if (stockQuantity <= 0) {
    return 'out_of_stock';
  }
  if (stockQuantity <= reorderThreshold) {
    return 'low_stock';
  }
  return 'in_stock';
}

export function calculateInventoryStats(items: InventoryItem[]): InventoryStats {
  // Deduplicate by item.id to prevent double-counting across joins or records
  const uniqueMap = new Map<string, InventoryItem>();
  for (const item of items) {
    if (!uniqueMap.has(item.id)) {
      uniqueMap.set(item.id, item);
    }
  }
  const uniqueItems = Array.from(uniqueMap.values());

  let totalStockUnits = 0;
  let inStockCount = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  let totalInventoryValueUSD = 0;
  let totalInventoryCostUSD = 0;
  const unitsByMeasure = {
    pouches: 0,
    jars: 0,
    bundles: 0,
  };
  const replenishmentNeeded: ReplenishmentItem[] = [];

  for (const item of uniqueItems) {
    const reserved = Math.max(0, Number(item.reservedQuantity) || 0);
    const physicalQty = Math.max(0, Number(item.stockQuantity) || 0);
    const availableQty = Math.max(0, physicalQty - reserved);
    const status = computeInventoryStatus(availableQty, item.reorderThreshold);
    const unitCost = Number(item.unitCost ?? Number((item.price * 0.45).toFixed(2)));
    const uom: UnitOfMeasure =
      item.unitOfMeasure ||
      (item.category === 'Single Pouches (100g)'
        ? '100g Pouch'
        : item.category === 'Glass Jars (250g)'
        ? '250g Glass Jar'
        : 'Bundle Box');

    totalStockUnits += availableQty;
    totalInventoryValueUSD += Number((availableQty * item.price).toFixed(2));
    totalInventoryCostUSD += Number((availableQty * unitCost).toFixed(2));

    if (uom === '100g Pouch') {
      unitsByMeasure.pouches += availableQty;
    } else if (uom === '250g Glass Jar') {
      unitsByMeasure.jars += availableQty;
    } else {
      unitsByMeasure.bundles += availableQty;
    }

    if (status === 'out_of_stock') {
      outOfStockCount += 1;
    } else if (status === 'low_stock') {
      lowStockCount += 1;
    } else {
      inStockCount += 1;
    }

    if (availableQty <= item.reorderThreshold) {
      const deficit = Math.max(0, item.reorderThreshold - availableQty);
      const recommendedOrderQty = Math.max(item.reorderThreshold * 2 - availableQty, 10);
      replenishmentNeeded.push({
        id: item.id,
        sku: item.sku,
        name: item.name,
        category: item.category,
        unitOfMeasure: uom,
        stockQuantity: availableQty,
        reorderThreshold: item.reorderThreshold,
        deficit,
        recommendedOrderQty,
        unitCost,
        estimatedRestockCostUSD: Number((recommendedOrderQty * unitCost).toFixed(2)),
        status,
      });
    }
  }

  return {
    totalProducts: uniqueItems.length,
    totalStockUnits,
    inStockCount,
    lowStockCount,
    outOfStockCount,
    totalInventoryValueUSD: Number(totalInventoryValueUSD.toFixed(2)),
    totalInventoryCostUSD: Number(totalInventoryCostUSD.toFixed(2)),
    unitsByMeasure,
    replenishmentNeeded,
  };
}

export function createInitialInventory(): InventoryItem[] {
  const initialSeeds: Array<{
    id: string;
    sku: string;
    barcode: string;
    name: string;
    variantLabel: string;
    category: InventoryCategory;
    unitOfMeasure: UnitOfMeasure;
    unitCost: number;
    price: number;
    stockQuantity: number;
    reorderThreshold: number;
    image: string;
  }> = [
    {
      id: 'honey-butter-100g-pouch',
      sku: 'KH-HB-100P',
      barcode: '8847102026011',
      name: 'Artisan Roasted Cashews — Honey Butter (100g Pouch)',
      variantLabel: 'Honey Butter · 100g Pouch',
      category: 'Single Pouches (100g)',
      unitOfMeasure: '100g Pouch',
      unitCost: 4.5,
      price: 10.0,
      stockQuantity: 84,
      reorderThreshold: 20,
      image: '/assets/aistudio/product-honey-butter-pouch-100g.png',
    },
    {
      id: 'chili-lime-100g-pouch',
      sku: 'KH-CL-100P',
      barcode: '8847102026028',
      name: 'Artisan Roasted Cashews — Chili Lime (100g Pouch)',
      variantLabel: 'Chili Lime · 100g Pouch',
      category: 'Single Pouches (100g)',
      unitOfMeasure: '100g Pouch',
      unitCost: 4.5,
      price: 10.0,
      stockQuantity: 0,
      reorderThreshold: 20,
      image: '/assets/aistudio/product-chili-lime-pouch-100g.png',
    },
    {
      id: 'honey-butter-250g-jar',
      sku: 'KH-HB-250J',
      barcode: '8847102026035',
      name: 'Artisan Roasted Cashews — Honey Butter (250g Jar)',
      variantLabel: 'Honey Butter · 250g Glass Jar',
      category: 'Glass Jars (250g)',
      unitOfMeasure: '250g Glass Jar',
      unitCost: 8.5,
      price: 20.0,
      stockQuantity: 62,
      reorderThreshold: 15,
      image: '/assets/aistudio/product-honey-butter-jar-250g.png',
    },
    {
      id: 'chilli-lime-250g-jar',
      sku: 'KH-CL-250J',
      barcode: '8847102026042',
      name: 'Artisan Roasted Cashews — Chili Lime (250g Jar)',
      variantLabel: 'Chili Lime · 250g Glass Jar',
      category: 'Glass Jars (250g)',
      unitOfMeasure: '250g Glass Jar',
      unitCost: 8.5,
      price: 20.0,
      stockQuantity: 9,
      reorderThreshold: 15,
      image: '/assets/aistudio/product-chilli-lime-jar-250g.png',
    },
    {
      id: 'bundle-complete',
      sku: 'KH-BND-4PK',
      barcode: '8847102026059',
      name: 'The Complete Collection (4-Pack Tasting Bundle)',
      variantLabel: '2× 250g Jars + 2× 100g Pouches',
      category: 'Value Bundles',
      unitOfMeasure: 'Bundle Box',
      unitCost: 19.0,
      price: 45.0,
      stockQuantity: 28,
      reorderThreshold: 10,
      image: '/assets/aistudio/bundle-complete-4pack.png',
    },
    {
      id: 'bundle-nut-lovers',
      sku: 'KH-BND-250D',
      barcode: '8847102026066',
      name: 'Artisan 250g Jar Duo',
      variantLabel: 'Honey Butter + Chili Lime (250g Jars)',
      category: 'Value Bundles',
      unitOfMeasure: 'Bundle Box',
      unitCost: 13.0,
      price: 30.0,
      stockQuantity: 0,
      reorderThreshold: 10,
      image: '/assets/aistudio/bundle-jars-duo.png',
    },
    {
      id: 'bundle-best-seller',
      sku: 'KH-BND-100D',
      barcode: '8847102026073',
      name: 'Artisan 100g Pouch Duo',
      variantLabel: 'Honey Butter + Chili Lime (100g Pouches)',
      category: 'Value Bundles',
      unitOfMeasure: 'Bundle Box',
      unitCost: 6.5,
      price: 15.0,
      stockQuantity: 45,
      reorderThreshold: 12,
      image: '/assets/aistudio/bundle-pouches-duo.png',
    },
  ];

  const timestamp = '2026-10-24T05:00:00.000Z';
  return initialSeeds.map((seed) => ({
    ...seed,
    reservedQuantity: 0,
    damagedQuantity: 0,
    status: computeInventoryStatus(seed.stockQuantity, seed.reorderThreshold),
    lastUpdated: timestamp,
  }));
}

const VARIANT_TO_INVENTORY_ID_MAP: Record<string, string> = {
  'hb-pouch-100': 'honey-butter-100g-pouch',
  'hb-pouch-100-alt': 'honey-butter-100g-pouch',
  'hb-jar-250': 'honey-butter-250g-jar',
  'hb-jar-250-main': 'honey-butter-250g-jar',
  'cl-pouch-100': 'chili-lime-100g-pouch',
  'cl-pouch-100-alt': 'chili-lime-100g-pouch',
  'cl-jar-250': 'chilli-lime-250g-jar',
  'cl-jar-250-main': 'chilli-lime-250g-jar',
};

export function resolveInventoryItemId(productOrVariantId: string): string {
  const cleaned = (productOrVariantId || '')
    .trim()
    .split('__')[0]
    .replace(/-(100g Pouch|250g Jar)-(sub|once)$/i, '');
  return VARIANT_TO_INVENTORY_ID_MAP[cleaned] || cleaned;
}

export function getProductStockQuantity(
  first: string | InventoryItem[],
  second: InventoryItem[] | string,
  variantLabel?: string
): number {
  const inventory = Array.isArray(first) ? first : Array.isArray(second) ? second : [];
  const rawId = typeof first === 'string' ? first : typeof second === 'string' ? second : '';
  if (!inventory || inventory.length === 0 || !rawId) {
    return 0;
  }

  let resolvedId = resolveInventoryItemId(rawId);
  if (variantLabel) {
    const isHoney = resolvedId.includes('honey-butter');
    const isChili = resolvedId.includes('chili-lime') || resolvedId.includes('chilli-lime');
    if (isHoney && variantLabel.includes('250g')) {
      resolvedId = 'honey-butter-250g-jar';
    } else if (isHoney && variantLabel.includes('100g')) {
      resolvedId = 'honey-butter-100g-pouch';
    } else if (isChili && variantLabel.includes('250g')) {
      resolvedId = 'chilli-lime-250g-jar';
    } else if (isChili && variantLabel.includes('100g')) {
      resolvedId = 'chili-lime-100g-pouch';
    }
  }

  const found = inventory.find(
    (item) =>
      item.id === resolvedId ||
      item.sku.toLowerCase() === resolvedId.toLowerCase()
  );
  if (!found) return 0;
  const reserved = Math.max(0, Number(found.reservedQuantity) || 0);
  return Math.max(0, (Number(found.stockQuantity) || 0) - reserved);
}

export function isProductOutOfStock(
  first: string | InventoryItem[],
  second: InventoryItem[] | string,
  variantLabel?: string
): boolean {
  return getProductStockQuantity(first, second, variantLabel) <= 0;
}

export function getProductAvailabilityLabel(
  first: string | InventoryItem[],
  second: InventoryItem[] | string,
  variantLabel?: string
): string {
  const qty = getProductStockQuantity(first, second, variantLabel);
  if (qty <= 0) {
    return 'Out of Stock';
  }
  if (qty < LOW_STOCK_RED_THRESHOLD) {
    return `Only ${qty} left in stock`;
  }
  return 'In Stock';
}

export function validateAndProcessSale(
  inventory: InventoryItem[],
  cartItems: CartItem[],
  orderId: string,
  options?: {
    idempotencyKey?: string;
    existingMovements?: StockMovementRecord[];
    performedBy?: string;
    promoCodeActive?: boolean;
  }
): {
  success: boolean;
  updatedInventory: InventoryItem[];
  movements: StockMovementRecord[];
  validatedItems?: CartItem[];
  validatedSummary?: CartSummary;
  error?: string;
  duplicate?: boolean;
} {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return {
      success: false,
      updatedInventory: inventory,
      movements: [],
      error: 'Order must contain at least one valid item',
    };
  }

  // Prevent duplicate processing when the same idempotencyKey or orderId has already been processed
  if (options?.existingMovements && options.existingMovements.length > 0) {
    const duplicateMatch = options.existingMovements.find(
      (m) =>
        m.type === 'sale' &&
        ((options.idempotencyKey && m.idempotencyKey === options.idempotencyKey) ||
          m.referenceId === orderId)
    );
    if (duplicateMatch) {
      return {
        success: false,
        duplicate: true,
        updatedInventory: inventory,
        movements: [],
        error: `Duplicate sale request detected for ${options.idempotencyKey || orderId}`,
      };
    }
  }

  // Step 1: Aggregate requested quantities per inventory item & validate every product first
  const aggregatedDemand = new Map<string, { target: InventoryItem; totalQty: number }>();
  const validatedItems: CartItem[] = [];

  for (const cartItem of cartItems) {
    const rawQty = Number(cartItem.quantity);
    if (!Number.isFinite(rawQty) || rawQty <= 0 || !Number.isInteger(rawQty)) {
      return {
        success: false,
        updatedInventory: inventory,
        movements: [],
        error: `Invalid quantity (${cartItem.quantity}) for item ${cartItem.name || cartItem.id}`,
      };
    }

    const resolvedId = resolveInventoryItemId(cartItem.id);
    // Also check if variantLabel specifies '250g Jar' or '100g Pouch' on a base product
    let target = inventory.find(
      (inv) =>
        inv.id === resolvedId ||
        inv.sku.toLowerCase() === resolvedId.toLowerCase() ||
        inv.name.toLowerCase() === (cartItem.name || '').toLowerCase()
    );

    if (target && cartItem.variantLabel) {
      const isHoney = target.id.includes('honey-butter');
      const isChili = target.id.includes('chili-lime') || target.id.includes('chilli-lime');
      if (isHoney && cartItem.variantLabel.includes('250g')) {
        target = inventory.find((i) => i.id === 'honey-butter-250g-jar') || target;
      } else if (isHoney && cartItem.variantLabel.includes('100g')) {
        target = inventory.find((i) => i.id === 'honey-butter-100g-pouch') || target;
      } else if (isChili && cartItem.variantLabel.includes('250g')) {
        target = inventory.find((i) => i.id === 'chilli-lime-250g-jar') || target;
      } else if (isChili && cartItem.variantLabel.includes('100g')) {
        target = inventory.find((i) => i.id === 'chili-lime-100g-pouch') || target;
      }
    }

    if (!target) {
      return {
        success: false,
        updatedInventory: inventory,
        movements: [],
        error: `Product "${cartItem.name || cartItem.id}" does not exist in inventory`,
      };
    }

    const currentEntry = aggregatedDemand.get(target.id);
    const nextTotal = (currentEntry?.totalQty || 0) + rawQty;
    const availableStock = Math.max(
      0,
      target.stockQuantity - (target.reservedQuantity || 0)
    );

    if (nextTotal > availableStock) {
      return {
        success: false,
        updatedInventory: inventory,
        movements: [],
        error:
          availableStock <= 0
            ? `${target.name} is currently Out of Stock (0 available)`
            : `Insufficient stock for ${target.name}: requested ${nextTotal}, only ${availableStock} available`,
      };
    }

    aggregatedDemand.set(target.id, { target, totalQty: nextTotal });

    // Enforce trusted server-side catalog pricing
    validatedItems.push({
      ...cartItem,
      price: target.price,
      originalPrice: Math.max(target.price, cartItem.originalPrice || target.price),
      quantity: rawQty,
    });
  }

  // Step 2: All validations passed — apply atomic stock deductions
  const now = new Date().toISOString();
  const movements: StockMovementRecord[] = [];
  const nextInventory = inventory.map((item) => {
    const demand = aggregatedDemand.get(item.id);
    if (!demand) return { ...item };

    const previousStock = item.stockQuantity;
    const newStock = previousStock - demand.totalQty;
    const updatedItem: InventoryItem = {
      ...item,
      stockQuantity: newStock,
      status: computeInventoryStatus(newStock, item.reorderThreshold),
      lastUpdated: now,
    };

    movements.push({
      movementId: `MOV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}-${item.sku}`,
      idempotencyKey: options?.idempotencyKey,
      itemId: item.id,
      sku: item.sku,
      productName: item.name,
      type: 'sale',
      quantityDelta: -demand.totalQty,
      previousStock,
      resultingStock: newStock,
      unitCost: item.unitCost,
      unitPrice: item.price,
      reason: `Completed Order ${orderId}`,
      performedBy: options?.performedBy || 'Customer Checkout',
      referenceId: orderId,
      timestamp: now,
    });

    return updatedItem;
  });

  const validatedSummary = calculateCartSummary(
    validatedItems,
    Boolean(options?.promoCodeActive)
  );

  return {
    success: true,
    updatedInventory: nextInventory,
    movements,
    validatedItems,
    validatedSummary,
  };
}

export function applyInventoryOrderDeduction(
  inventory: InventoryItem[],
  cartItems: CartItem[],
  orderId = 'ORDER'
): {
  updatedInventory: InventoryItem[];
  movements: StockMovementRecord[];
} {
  const res = validateAndProcessSale(inventory, cartItems, orderId);
  if (res.success) {
    return {
      updatedInventory: res.updatedInventory,
      movements: res.movements,
    };
  }

  // Fallback for legacy calls where partial clamp was expected
  const now = new Date().toISOString();
  const movements: StockMovementRecord[] = [];
  const nextInventory = inventory.map((item) => ({ ...item }));

  for (const cartItem of cartItems) {
    const qtyToDeduct = Math.max(0, Number(cartItem.quantity) || 0);
    if (qtyToDeduct <= 0) continue;

    const baseId = resolveInventoryItemId(cartItem.id);
    const target = nextInventory.find(
      (inv) =>
        inv.id === cartItem.id ||
        inv.id === baseId ||
        inv.name.toLowerCase() === cartItem.name.toLowerCase()
    );

    if (target) {
      const previousStock = target.stockQuantity;
      const newStock = Math.max(0, previousStock - qtyToDeduct);
      const actualDeducted = previousStock - newStock;
      target.stockQuantity = newStock;
      target.status = computeInventoryStatus(newStock, target.reorderThreshold);
      target.lastUpdated = now;

      if (actualDeducted > 0) {
        movements.push({
          movementId: `MOV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          itemId: target.id,
          sku: target.sku,
          productName: target.name,
          type: 'sale',
          quantityDelta: -actualDeducted,
          previousStock,
          resultingStock: newStock,
          reason: `Completed Order ${orderId}`,
          referenceId: orderId,
          timestamp: now,
        });
      }
    }
  }

  return {
    updatedInventory: nextInventory,
    movements,
  };
}

export function adjustInventoryStock(
  inventory: InventoryItem[],
  itemId: string,
  quantityDelta: number,
  type: StockMovementType = 'adjustment',
  reason = 'Admin inventory update',
  options?: {
    performedBy?: string;
    referenceId?: string;
    idempotencyKey?: string;
    existingMovements?: StockMovementRecord[];
  }
): {
  success: boolean;
  updatedInventory: InventoryItem[];
  updatedItem?: InventoryItem;
  movement?: StockMovementRecord;
  error?: string;
} {
  const delta = Number(quantityDelta);
  if (!Number.isFinite(delta) || delta === 0 || !Number.isInteger(delta)) {
    return {
      success: false,
      updatedInventory: inventory,
      error: 'Adjustment quantity must be a non-zero whole number',
    };
  }

  // Prevent duplicate transaction processing when idempotencyKey matches an existing movement
  if (options?.idempotencyKey && options.existingMovements) {
    const dup = options.existingMovements.find(
      (m) => m.idempotencyKey === options.idempotencyKey
    );
    if (dup) {
      return {
        success: false,
        updatedInventory: inventory,
        error: `Duplicate transaction rejected (idempotency key: ${options.idempotencyKey})`,
      };
    }
  }

  // Prevent duplicate customer return restocking for the same return referenceId + itemId
  if (type === 'return' && options?.referenceId && options.existingMovements) {
    const dupReturn = options.existingMovements.find(
      (m) =>
        m.type === 'return' &&
        m.referenceId === options.referenceId &&
        (m.itemId === itemId || m.sku.toLowerCase() === itemId.toLowerCase())
    );
    if (dupReturn) {
      return {
        success: false,
        updatedInventory: inventory,
        error: `Return ${options.referenceId} for item ${itemId} has already been restocked`,
      };
    }
  }

  const targetIndex = inventory.findIndex(
    (item) => item.id === itemId || item.sku.toLowerCase() === itemId.toLowerCase()
  );
  if (targetIndex === -1) {
    return {
      success: false,
      updatedInventory: inventory,
      error: `Product ${itemId} not found in inventory`,
    };
  }

  const currentItem = inventory[targetIndex];
  const previousStock = currentItem.stockQuantity;
  const nextStock = previousStock + delta;
  if (nextStock < 0) {
    return {
      success: false,
      updatedInventory: inventory,
      error: `Cannot reduce stock below 0 (current stock: ${currentItem.stockQuantity})`,
    };
  }

  const now = new Date().toISOString();
  const updatedItem: InventoryItem = {
    ...currentItem,
    stockQuantity: nextStock,
    damagedQuantity:
      type === 'loss_damage' && delta < 0
        ? (currentItem.damagedQuantity || 0) + Math.abs(delta)
        : currentItem.damagedQuantity || 0,
    status: computeInventoryStatus(nextStock, currentItem.reorderThreshold),
    lastUpdated: now,
  };

  const updatedInventory = inventory.map((item, idx) =>
    idx === targetIndex ? updatedItem : item
  );

  const movement: StockMovementRecord = {
    movementId: `MOV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    idempotencyKey: options?.idempotencyKey,
    itemId: updatedItem.id,
    sku: updatedItem.sku,
    productName: updatedItem.name,
    type,
    quantityDelta: delta,
    previousStock,
    resultingStock: nextStock,
    unitCost: updatedItem.unitCost,
    unitPrice: updatedItem.price,
    reason: reason.trim() || 'Admin stock adjustment',
    performedBy: options?.performedBy || 'Kampot Harvest Admin',
    referenceId: options?.referenceId,
    timestamp: now,
  };

  return {
    success: true,
    updatedInventory,
    updatedItem,
    movement,
  };
}

export function reverseStockMovement(
  inventory: InventoryItem[],
  movements: StockMovementRecord[],
  movementIdToReverse: string,
  performedBy: string,
  reason = 'Compensating reversal transaction'
): {
  success: boolean;
  updatedInventory: InventoryItem[];
  updatedMovements: StockMovementRecord[];
  reversalMovement?: StockMovementRecord;
  error?: string;
} {
  const original = movements.find((m) => m.movementId === movementIdToReverse);
  if (!original) {
    return {
      success: false,
      updatedInventory: inventory,
      updatedMovements: movements,
      error: `Stock movement ${movementIdToReverse} not found`,
    };
  }
  if (original.type === 'reversal') {
    return {
      success: false,
      updatedInventory: inventory,
      updatedMovements: movements,
      error: 'Cannot reverse a reversal transaction',
    };
  }
  const alreadyReversed = movements.some(
    (m) => m.type === 'reversal' && m.referenceId === movementIdToReverse
  );
  if (alreadyReversed || original.reversedByMovementId) {
    return {
      success: false,
      updatedInventory: inventory,
      updatedMovements: movements,
      error: `Movement ${movementIdToReverse} has already been reversed`,
    };
  }

  const compensatingDelta = -original.quantityDelta;
  const adjustRes = adjustInventoryStock(
    inventory,
    original.itemId,
    compensatingDelta,
    'reversal',
    `${reason} (Reversal of ${original.movementId})`,
    {
      performedBy,
      referenceId: original.movementId,
    }
  );

  if (!adjustRes.success || !adjustRes.movement) {
    return {
      success: false,
      updatedInventory: inventory,
      updatedMovements: movements,
      error: adjustRes.error || 'Failed to apply compensating reversal',
    };
  }

  // Keep historical movement values intact; only link reversedByMovementId metadata
  const updatedMovements = [
    adjustRes.movement,
    ...movements.map((m) =>
      m.movementId === original.movementId
        ? { ...m, reversedByMovementId: adjustRes.movement!.movementId }
        : m
    ),
  ];

  return {
    success: true,
    updatedInventory: adjustRes.updatedInventory,
    updatedMovements,
    reversalMovement: adjustRes.movement,
  };
}

/* ============================================================================
 * PURCHASING & SUPPLIER RECEIVING WORKFLOW
 * ========================================================================== */

export type PurchaseOrderStatus =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'partially_received'
  | 'received'
  | 'cancelled';

export type SupplierInvoiceStatus = 'unbilled' | 'invoiced' | 'paid';

export interface PurchaseOrderItem {
  itemId: string;
  sku: string;
  productName: string;
  orderedQty: number;
  receivedQty: number;
  unitCost: number;
}

export interface PurchaseOrder {
  poId: string;
  supplierName: string;
  status: PurchaseOrderStatus;
  invoiceStatus: SupplierInvoiceStatus;
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
  items: PurchaseOrderItem[];
  totalCostUSD: number;
  processedReceiptIds: string[];
  notes?: string;
}

export function createInitialPurchaseOrders(): PurchaseOrder[] {
  return [
    {
      poId: 'PO-2026-401',
      supplierName: 'Kampot Organic Cashew Cooperative',
      status: 'approved',
      invoiceStatus: 'invoiced',
      createdBy: 'Kampot Harvest Admin',
      approvedBy: 'Kampot Harvest Admin',
      createdAt: '2026-10-23T09:00:00.000Z',
      updatedAt: '2026-10-23T10:30:00.000Z',
      items: [
        {
          itemId: 'chili-lime-100g-pouch',
          sku: 'KH-CL-100P',
          productName: 'Artisan Roasted Cashews — Chili Lime (100g Pouch)',
          orderedQty: 50,
          receivedQty: 0,
          unitCost: 4.5,
        },
        {
          itemId: 'bundle-nut-lovers',
          sku: 'KH-BND-250D',
          productName: 'Artisan 250g Jar Duo',
          orderedQty: 30,
          receivedQty: 0,
          unitCost: 13.0,
        },
      ],
      totalCostUSD: Number((50 * 4.5 + 30 * 13.0).toFixed(2)),
      processedReceiptIds: [],
      notes: 'Urgent replenishment for out-of-stock SKUs',
    },
  ];
}

export function createPurchaseOrder(
  inventory: InventoryItem[],
  input: {
    supplierName: string;
    items: Array<{ itemId: string; orderedQty: number; unitCost?: number }>;
    status?: 'draft' | 'submitted';
    notes?: string;
  },
  actorAccount: UserAccount | null | undefined,
  existingOrders: PurchaseOrder[] = []
): {
  success: boolean;
  purchaseOrder?: PurchaseOrder;
  error?: string;
} {
  if (!isAdminAccount(actorAccount)) {
    return {
      success: false,
      error: 'Forbidden: Only authorized administrators can create purchase orders',
    };
  }
  if (!input.supplierName || input.supplierName.trim().length < 2) {
    return {
      success: false,
      error: 'Supplier name is required',
    };
  }
  if (!Array.isArray(input.items) || input.items.length === 0) {
    return {
      success: false,
      error: 'Purchase order must contain at least one product line item',
    };
  }

  const poItems: PurchaseOrderItem[] = [];
  let totalCostUSD = 0;

  for (const line of input.items) {
    const qty = Number(line.orderedQty);
    if (!Number.isFinite(qty) || qty <= 0 || !Number.isInteger(qty)) {
      return {
        success: false,
        error: 'Ordered quantity must be a positive whole number',
      };
    }

    const invItem = inventory.find(
      (i) => i.id === line.itemId || i.sku.toLowerCase() === line.itemId.toLowerCase()
    );
    if (!invItem) {
      return {
        success: false,
        error: `Product ${line.itemId} not found in catalog`,
      };
    }

    const unitCost =
      line.unitCost !== undefined && Number(line.unitCost) > 0
        ? Number(line.unitCost)
        : invItem.unitCost || Number((invItem.price * 0.45).toFixed(2));

    poItems.push({
      itemId: invItem.id,
      sku: invItem.sku,
      productName: invItem.name,
      orderedQty: qty,
      receivedQty: 0,
      unitCost,
    });
    totalCostUSD += qty * unitCost;
  }

  const now = new Date().toISOString();
  const poId = `PO-2026-${400 + existingOrders.length + 1}`;
  const purchaseOrder: PurchaseOrder = {
    poId,
    supplierName: input.supplierName.trim(),
    status: input.status || 'submitted',
    invoiceStatus: 'unbilled',
    createdBy: actorAccount!.fullName,
    createdAt: now,
    updatedAt: now,
    items: poItems,
    totalCostUSD: Number(totalCostUSD.toFixed(2)),
    processedReceiptIds: [],
    notes: input.notes?.trim() || undefined,
  };

  return {
    success: true,
    purchaseOrder,
  };
}

export function approvePurchaseOrder(
  po: PurchaseOrder,
  actorAccount: UserAccount | null | undefined
): {
  success: boolean;
  purchaseOrder?: PurchaseOrder;
  error?: string;
} {
  if (!isAdminAccount(actorAccount)) {
    return {
      success: false,
      error: 'Forbidden: Only authorized administrators can approve purchase orders',
    };
  }
  if (po.status === 'cancelled') {
    return {
      success: false,
      error: 'Cannot approve a cancelled purchase order',
    };
  }
  if (po.status === 'received' || po.status === 'partially_received') {
    return {
      success: false,
      error: 'Purchase order is already approved and in receiving',
    };
  }

  return {
    success: true,
    purchaseOrder: {
      ...po,
      status: 'approved',
      approvedBy: actorAccount!.fullName,
      updatedAt: new Date().toISOString(),
    },
  };
}

export function cancelPurchaseOrder(
  po: PurchaseOrder,
  actorAccount: UserAccount | null | undefined
): {
  success: boolean;
  purchaseOrder?: PurchaseOrder;
  error?: string;
} {
  if (!isAdminAccount(actorAccount)) {
    return {
      success: false,
      error: 'Forbidden: Only authorized administrators can cancel purchase orders',
    };
  }
  const anyReceived = po.items.some((item) => item.receivedQty > 0);
  if (anyReceived || po.status === 'received' || po.status === 'partially_received') {
    return {
      success: false,
      error: 'Cannot cancel a purchase order that has already received stock deliveries',
    };
  }

  return {
    success: true,
    purchaseOrder: {
      ...po,
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    },
  };
}

export function receivePurchaseOrderDelivery(
  po: PurchaseOrder,
  inventory: InventoryItem[],
  deliveries: Array<{ itemId: string; acceptedQty: number }>,
  actorAccount: UserAccount | null | undefined,
  receiptId?: string
): {
  success: boolean;
  updatedPO?: PurchaseOrder;
  updatedInventory: InventoryItem[];
  movements: StockMovementRecord[];
  error?: string;
} {
  if (!isAdminAccount(actorAccount)) {
    return {
      success: false,
      updatedInventory: inventory,
      movements: [],
      error: 'Forbidden: Only authorized staff can record supplier deliveries',
    };
  }
  if (po.status === 'cancelled') {
    return {
      success: false,
      updatedInventory: inventory,
      movements: [],
      error: 'Cannot receive delivery for a cancelled purchase order',
    };
  }
  if (po.status === 'draft' || po.status === 'submitted') {
    return {
      success: false,
      updatedInventory: inventory,
      movements: [],
      error: 'Purchase order must be approved before receiving stock',
    };
  }
  if (po.status === 'received') {
    return {
      success: false,
      updatedInventory: inventory,
      movements: [],
      error: 'Purchase order has already been fully received',
    };
  }
  if (receiptId && po.processedReceiptIds.includes(receiptId)) {
    return {
      success: false,
      updatedInventory: inventory,
      movements: [],
      error: `Duplicate delivery receipt (${receiptId}) rejected`,
    };
  }
  if (!Array.isArray(deliveries) || deliveries.length === 0) {
    return {
      success: false,
      updatedInventory: inventory,
      movements: [],
      error: 'Delivery must specify at least one accepted product quantity',
    };
  }

  let currentInventory = inventory.map((i) => ({ ...i }));
  const updatedPOItems = po.items.map((i) => ({ ...i }));
  const movements: StockMovementRecord[] = [];
  let totalAcceptedInBatch = 0;

  for (const d of deliveries) {
    const acceptedQty = Number(d.acceptedQty);
    if (!Number.isFinite(acceptedQty) || acceptedQty < 0 || !Number.isInteger(acceptedQty)) {
      return {
        success: false,
        updatedInventory: inventory,
        movements: [],
        error: 'Accepted delivery quantity must be a non-negative whole number',
      };
    }
    if (acceptedQty === 0) continue;

    const poLine = updatedPOItems.find(
      (line) =>
        line.itemId === d.itemId || line.sku.toLowerCase() === d.itemId.toLowerCase()
    );
    if (!poLine) {
      return {
        success: false,
        updatedInventory: inventory,
        movements: [],
        error: `Item ${d.itemId} is not part of purchase order ${po.poId}`,
      };
    }

    const remainingQty = poLine.orderedQty - poLine.receivedQty;
    if (acceptedQty > remainingQty) {
      return {
        success: false,
        updatedInventory: inventory,
        movements: [],
        error: `Accepted quantity (${acceptedQty}) exceeds remaining open quantity (${remainingQty}) for ${poLine.productName}`,
      };
    }

    const adjustRes = adjustInventoryStock(
      currentInventory,
      poLine.itemId,
      acceptedQty,
      'supplier_delivery',
      `PO ${po.poId} Delivery from ${po.supplierName}`,
      {
        performedBy: actorAccount!.fullName,
        referenceId: po.poId,
        idempotencyKey: receiptId ? `${receiptId}-${poLine.itemId}` : undefined,
      }
    );

    if (!adjustRes.success || !adjustRes.movement) {
      return {
        success: false,
        updatedInventory: inventory,
        movements: [],
        error: adjustRes.error || 'Failed to update stock on PO receipt',
      };
    }

    currentInventory = adjustRes.updatedInventory;
    poLine.receivedQty += acceptedQty;
    totalAcceptedInBatch += acceptedQty;
    movements.push(adjustRes.movement);
  }

  if (totalAcceptedInBatch <= 0) {
    return {
      success: false,
      updatedInventory: inventory,
      movements: [],
      error: 'At least one item must have a positive accepted quantity (> 0)',
    };
  }

  const allFullyReceived = updatedPOItems.every(
    (line) => line.receivedQty >= line.orderedQty
  );

  const updatedPO: PurchaseOrder = {
    ...po,
    items: updatedPOItems,
    status: allFullyReceived ? 'received' : 'partially_received',
    processedReceiptIds: receiptId
      ? [...po.processedReceiptIds, receiptId]
      : po.processedReceiptIds,
    updatedAt: new Date().toISOString(),
  };

  return {
    success: true,
    updatedPO,
    updatedInventory: currentInventory,
    movements,
  };
}

export interface CreateInventoryProductInput {
  id?: string;
  name: string;
  sku: string;
  barcode?: string;
  variantLabel?: string;
  category: InventoryCategory;
  unitOfMeasure?: UnitOfMeasure;
  unitCost?: number;
  price: number;
  initialStock: number;
  reorderThreshold: number;
  image?: string;
}

export function validateNewInventoryProduct(
  input: CreateInventoryProductInput,
  existingInventory: InventoryItem[] = []
): {
  valid: boolean;
  errors: Partial<Record<keyof CreateInventoryProductInput, string>>;
} {
  const errors: Partial<Record<keyof CreateInventoryProductInput, string>> = {};

  if (!input.name || input.name.trim().length < 2) {
    errors.name = 'Product name must be at least 2 characters long';
  }

  const trimmedSku = (input.sku || '').trim().toUpperCase();
  if (!trimmedSku || trimmedSku.length < 3) {
    errors.sku = 'Product SKU must be at least 3 characters (e.g., KH-BP-250J)';
  } else {
    const duplicateSku = existingInventory.some(
      (item) => item.sku.trim().toUpperCase() === trimmedSku
    );
    if (duplicateSku) {
      errors.sku = `A product with SKU "${trimmedSku}" already exists in inventory`;
    }
  }

  const trimmedBarcode = (input.barcode || '').trim();
  if (trimmedBarcode) {
    if (!/^\d{8,14}$/.test(trimmedBarcode)) {
      errors.barcode = 'Barcode must be 8 to 14 digits';
    } else {
      const duplicateBarcode = existingInventory.some(
        (item) => item.barcode.trim() === trimmedBarcode
      );
      if (duplicateBarcode) {
        errors.barcode = `A product with barcode "${trimmedBarcode}" already exists`;
      }
    }
  }

  const validCategories: InventoryCategory[] = [
    'Single Pouches (100g)',
    'Glass Jars (250g)',
    'Value Bundles',
  ];
  if (!input.category || !validCategories.includes(input.category)) {
    errors.category = 'Please select a valid product category';
  }

  const numericPrice = Number(input.price);
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    errors.price = 'Selling price must be greater than $0.00';
  }

  if (input.unitCost !== undefined) {
    const numericCost = Number(input.unitCost);
    if (!Number.isFinite(numericCost) || numericCost < 0) {
      errors.unitCost = 'Unit cost cannot be negative';
    }
  }

  const numericStock = Number(input.initialStock);
  if (
    !Number.isFinite(numericStock) ||
    numericStock < 0 ||
    !Number.isInteger(numericStock)
  ) {
    errors.initialStock = 'Initial stock quantity must be a whole number (0 or greater)';
  }

  const numericThreshold = Number(input.reorderThreshold);
  if (
    !Number.isFinite(numericThreshold) ||
    numericThreshold < 0 ||
    !Number.isInteger(numericThreshold)
  ) {
    errors.reorderThreshold = 'Reorder threshold must be a whole number (0 or greater)';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function createInventoryProduct(
  inventory: InventoryItem[],
  input: CreateInventoryProductInput,
  options?: {
    performedBy?: string;
    actorAccount?: UserAccount | null;
  }
): {
  success: boolean;
  newItem?: InventoryItem;
  updatedInventory: InventoryItem[];
  movement?: StockMovementRecord;
  error?: string;
  fieldErrors?: Partial<Record<keyof CreateInventoryProductInput, string>>;
} {
  if (options?.actorAccount !== undefined && !isAdminAccount(options.actorAccount)) {
    return {
      success: false,
      updatedInventory: inventory,
      error: 'Unauthorized: Only an active admin account can add new products',
    };
  }

  const validation = validateNewInventoryProduct(input, inventory);
  if (!validation.valid) {
    const firstError =
      Object.values(validation.errors)[0] ||
      'Please fix the highlighted product fields';
    return {
      success: false,
      updatedInventory: inventory,
      error: firstError,
      fieldErrors: validation.errors,
    };
  }

  const normalizedSku = input.sku.trim().toUpperCase();
  const baseSlug = (input.id || input.name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const resolvedId =
    inventory.some((item) => item.id === baseSlug) || !baseSlug
      ? `${baseSlug || 'product'}-${normalizedSku.toLowerCase()}`
      : baseSlug;

  const resolvedBarcode =
    input.barcode && input.barcode.trim().length > 0
      ? input.barcode.trim()
      : `8847102${String(100000 + inventory.length * 17 + 1).slice(-6)}`;

  const resolvedUom: UnitOfMeasure =
    input.unitOfMeasure ||
    (input.category === 'Single Pouches (100g)'
      ? '100g Pouch'
      : input.category === 'Glass Jars (250g)'
      ? '250g Glass Jar'
      : 'Bundle Box');

  const resolvedPrice = Number(Number(input.price).toFixed(2));
  const resolvedCost =
    input.unitCost !== undefined && Number.isFinite(Number(input.unitCost))
      ? Number(Number(input.unitCost).toFixed(2))
      : Number((resolvedPrice * 0.45).toFixed(2));

  const resolvedDefaultImage =
    input.image && input.image.trim().length > 0
      ? input.image.trim()
      : input.category === 'Single Pouches (100g)'
      ? '/assets/aistudio/product-honey-butter-pouch-100g.png'
      : input.category === 'Glass Jars (250g)'
      ? '/assets/aistudio/product-honey-butter-jar-250g.png'
      : '/assets/aistudio/bundle-complete-4pack.png';

  const initialStock = Math.max(0, Math.floor(Number(input.initialStock)));
  const reorderThreshold = Math.max(0, Math.floor(Number(input.reorderThreshold)));
  const timestamp = new Date().toISOString();

  const newItem: InventoryItem = {
    id: resolvedId,
    sku: normalizedSku,
    barcode: resolvedBarcode,
    name: input.name.trim(),
    variantLabel:
      input.variantLabel && input.variantLabel.trim().length > 0
        ? input.variantLabel.trim()
        : `${resolvedUom} · ${normalizedSku}`,
    category: input.category,
    unitOfMeasure: resolvedUom,
    unitCost: resolvedCost,
    price: resolvedPrice,
    stockQuantity: initialStock,
    reservedQuantity: 0,
    damagedQuantity: 0,
    reorderThreshold,
    status: computeInventoryStatus(initialStock, reorderThreshold),
    image: resolvedDefaultImage,
    lastUpdated: timestamp,
  };

  let movement: StockMovementRecord | undefined;
  if (initialStock > 0) {
    movement = {
      movementId: `MOV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      itemId: newItem.id,
      sku: newItem.sku,
      productName: newItem.name,
      type: 'restock',
      quantityDelta: initialStock,
      previousStock: 0,
      resultingStock: initialStock,
      unitCost: resolvedCost,
      unitPrice: resolvedPrice,
      reason: 'Initial stock on new product creation',
      referenceId: `NEW-${newItem.sku}`,
      performedBy:
        options?.performedBy ||
        options?.actorAccount?.email ||
        'Kampot Harvest Admin',
      timestamp,
    };
  }

  return {
    success: true,
    newItem,
    updatedInventory: [...inventory, newItem],
    movement,
  };
}

/* ============================================================================
 * SMART PRODUCT RECOMMENDATION ENGINE
 * ========================================================================== */

export type RecommendationReasonTag =
  | 'In-Stock Alternative'
  | 'Same Category'
  | 'Matching Flavor'
  | 'Matching Package Size'
  | 'Value Bundle Upgrade'
  | 'Similar Price Range'
  | 'Bestseller'
  | 'Based on Your Browsing';

export interface RecommendedCatalogItem {
  id: string;
  itemType: 'product' | 'bundle';
  name: string;
  subtitle: string;
  category: InventoryCategory;
  storeCategory: 'powders' | 'bundles';
  brand: string;
  flavor?: 'Honey Butter' | 'Chili Lime';
  packageSize?: '100g Pouch' | '250g Jar' | 'Bundle Box';
  tags: string[];
  price: number;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  image: string;
  stockQuantity: number;
  reorderThreshold: number;
  inStock: boolean;
  availabilityLabel: string;
  isOutOfStockAlternative: boolean;
  reasonTag: RecommendationReasonTag;
  reasonDescription: string;
  score: number;
  productRef?: Product;
  bundleRef?: BundleItem;
}

export interface SmartRecommendationsOptions {
  variantLabel?: string;
  recentlyViewedIds?: string[];
  maxResults?: number;
  includeOutOfStockFallback?: boolean;
}

export interface SmartRecommendationsResult {
  targetId: string;
  targetName: string;
  targetOutOfStock: boolean;
  alternativesForUnavailable: RecommendedCatalogItem[];
  relatedProducts: RecommendedCatalogItem[];
  frequentlyBoughtTogether: RecommendedCatalogItem[];
  youMayAlsoLike: RecommendedCatalogItem[];
}

function buildUnifiedCatalogCandidates(
  inventory: InventoryItem[]
): Omit<
  RecommendedCatalogItem,
  'isOutOfStockAlternative' | 'reasonTag' | 'reasonDescription' | 'score'
>[] {
  const safeInventory =
    Array.isArray(inventory) && inventory.length > 0
      ? inventory
      : createInitialInventory();

  const catalogMap = new Map<
    string,
    Omit<
      RecommendedCatalogItem,
      'isOutOfStockAlternative' | 'reasonTag' | 'reasonDescription' | 'score'
    >
  >();

  // 1. Standard Individual Products synced with live inventory
  for (const prod of PRODUCTS) {
    const invRecord = safeInventory.find((i) => i.id === prod.id);
    const livePrice = invRecord ? Number(invRecord.price) : prod.price;
    const origPrice = Math.max(prod.originalPrice, livePrice);
    const discountPercent =
      origPrice > livePrice
        ? Math.round(((origPrice - livePrice) / origPrice) * 100)
        : 0;
    const stockQty = getProductStockQuantity(safeInventory, prod.id);
    const reorderThreshold = invRecord ? invRecord.reorderThreshold : 15;
    const invCategory: InventoryCategory =
      invRecord?.category ||
      (prod.packageSize === '250g Jar'
        ? 'Glass Jars (250g)'
        : 'Single Pouches (100g)');

    const tags = [
      'kampot-harvest',
      'artisan-cashews',
      'high-protein',
      'no-refined-sugar',
      prod.flavor.toLowerCase().replace(/\s+/g, '-'),
      prod.packageSize === '250g Jar' ? 'glass-jar' : 'resealable-pouch',
      prod.packageSize === '250g Jar' ? '250g' : '100g',
    ];

    const syncedProduct: Product = {
      ...prod,
      price: livePrice,
      image: invRecord?.image || prod.image,
    };

    catalogMap.set(prod.id, {
      id: prod.id,
      itemType: 'product',
      name: `${prod.name} — ${prod.flavor}`,
      subtitle: `${prod.packageSize} · ${prod.flavor}`,
      category: invCategory,
      storeCategory: 'powders',
      brand: 'Kampot Harvest Co.',
      flavor: prod.flavor,
      packageSize: prod.packageSize,
      tags,
      price: livePrice,
      originalPrice: origPrice,
      discountPercent,
      rating: prod.rating,
      reviewCount: prod.reviewCount,
      image: invRecord?.image || prod.image,
      stockQuantity: stockQty,
      reorderThreshold,
      inStock: stockQty > 0,
      availabilityLabel: getProductAvailabilityLabel(safeInventory, prod.id),
      productRef: syncedProduct,
    });
  }

  // 2. Standard Value Bundles synced with live inventory
  for (const bnd of BUNDLES) {
    const invRecord = safeInventory.find((i) => i.id === bnd.id);
    const livePrice = invRecord ? Number(invRecord.price) : bnd.price;
    const origPrice = Math.max(bnd.originalPrice, livePrice);
    const discountPercent =
      origPrice > livePrice
        ? Math.round(((origPrice - livePrice) / origPrice) * 100)
        : 25;
    const stockQty = getProductStockQuantity(safeInventory, bnd.id);
    const reorderThreshold = invRecord ? invRecord.reorderThreshold : 10;

    const includesJar = bnd.includedItems.some((line) => line.includes('250g Jar'));
    const includesPouch = bnd.includedItems.some((line) => line.includes('100g Pouch'));

    const tags = [
      'kampot-harvest',
      'artisan-cashews',
      'value-bundle',
      'gift-set',
      'honey-butter',
      'chili-lime',
      ...(includesJar ? ['glass-jar', '250g'] : []),
      ...(includesPouch ? ['resealable-pouch', '100g'] : []),
    ];

    const reviewCountMap: Record<string, number> = {
      'bundle-complete': 512,
      'bundle-nut-lovers': 389,
      'bundle-best-seller': 446,
    };

    const syncedBundle: BundleItem = {
      ...bnd,
      price: livePrice,
      image: invRecord?.image || bnd.image,
    };

    catalogMap.set(bnd.id, {
      id: bnd.id,
      itemType: 'bundle',
      name: bnd.name,
      subtitle: invRecord?.variantLabel || '25% OFF Tasting Bundle',
      category: 'Value Bundles',
      storeCategory: 'bundles',
      brand: 'Kampot Harvest Co.',
      packageSize: 'Bundle Box',
      tags,
      price: livePrice,
      originalPrice: origPrice,
      discountPercent,
      rating: bnd.rating,
      reviewCount: reviewCountMap[bnd.id] || 310,
      image: invRecord?.image || bnd.image,
      stockQuantity: stockQty,
      reorderThreshold,
      inStock: stockQty > 0,
      availabilityLabel: getProductAvailabilityLabel(safeInventory, bnd.id),
      bundleRef: syncedBundle,
    });
  }

  // 3. Custom Admin-Created Inventory Products (dynamically added at runtime)
  for (const inv of safeInventory) {
    if (catalogMap.has(inv.id)) continue;

    const stockQty = getProductStockQuantity(safeInventory, inv.id);
    const isBundle = inv.category === 'Value Bundles';
    const inferredFlavor: 'Honey Butter' | 'Chili Lime' =
      inv.name.toLowerCase().includes('chili') ||
      inv.name.toLowerCase().includes('lime') ||
      inv.name.toLowerCase().includes('pepper')
        ? 'Chili Lime'
        : 'Honey Butter';
    const inferredSize: '100g Pouch' | '250g Jar' =
      inv.category === 'Glass Jars (250g)' ? '250g Jar' : '100g Pouch';

    const tags = [
      'kampot-harvest',
      'artisan-cashews',
      inferredFlavor.toLowerCase().replace(/\s+/g, '-'),
      isBundle
        ? 'value-bundle'
        : inferredSize === '250g Jar'
        ? 'glass-jar'
        : 'resealable-pouch',
    ];

    if (isBundle) {
      const customBundle: BundleItem = {
        id: inv.id,
        name: inv.name,
        price: inv.price,
        originalPrice: Number((inv.price * 1.25).toFixed(2)),
        rating: 4.9,
        image: inv.image,
        description: `${inv.name} (${inv.variantLabel}) — Small-batch Kampot Harvest Co. specialty bundle.`,
        includedItems: [inv.variantLabel || inv.name],
      };

      catalogMap.set(inv.id, {
        id: inv.id,
        itemType: 'bundle',
        name: inv.name,
        subtitle: inv.variantLabel,
        category: inv.category,
        storeCategory: 'bundles',
        brand: 'Kampot Harvest Co.',
        packageSize: 'Bundle Box',
        tags,
        price: inv.price,
        originalPrice: customBundle.originalPrice,
        discountPercent: 20,
        rating: 4.9,
        reviewCount: 128,
        image: inv.image,
        stockQuantity: stockQty,
        reorderThreshold: inv.reorderThreshold,
        inStock: stockQty > 0,
        availabilityLabel: getProductAvailabilityLabel(safeInventory, inv.id),
        bundleRef: customBundle,
      });
    } else {
      const customProduct: Product = {
        id: inv.id,
        name: inv.name,
        flavor: inferredFlavor,
        packageSize: inferredSize,
        slug: inv.id,
        category: 'powders',
        price: inv.price,
        originalPrice: inv.price,
        rating: 4.9,
        reviewCount: 145,
        image: inv.image,
        shortDesc: `${inferredFlavor} · ${inferredSize} · USD ${inv.price}`,
        description: `${inv.name} (${inv.variantLabel}) — Freshly roasted in small batches at Kampot Harvest Co.`,
        hasVariants: false,
        nutrition: {
          servingSize: '30g (Approx. 18 cashews)',
          calories: 162,
          protein: '5.6g',
          fat: '12.2g',
          carbs: '8.0g',
          sugar: '2.5g',
        },
        ingredients: 'Whole Kampot Cashews, Natural Artisanal Seasoning, Sea Salt.',
        accentColor: inferredFlavor === 'Chili Lime' ? '#C93B2B' : '#D49B35',
      };

      catalogMap.set(inv.id, {
        id: inv.id,
        itemType: 'product',
        name: inv.name,
        subtitle: inv.variantLabel,
        category: inv.category,
        storeCategory: 'powders',
        brand: 'Kampot Harvest Co.',
        flavor: inferredFlavor,
        packageSize: inferredSize,
        tags,
        price: inv.price,
        originalPrice: inv.price,
        discountPercent: 0,
        rating: 4.9,
        reviewCount: 145,
        image: inv.image,
        stockQuantity: stockQty,
        reorderThreshold: inv.reorderThreshold,
        inStock: stockQty > 0,
        availabilityLabel: getProductAvailabilityLabel(safeInventory, inv.id),
        productRef: customProduct,
      });
    }
  }

  return Array.from(catalogMap.values());
}

export function getSmartProductRecommendations(
  targetId: string,
  inventory: InventoryItem[] = createInitialInventory(),
  options?: SmartRecommendationsOptions
): SmartRecommendationsResult {
  const safeInventory =
    Array.isArray(inventory) && inventory.length > 0
      ? inventory
      : createInitialInventory();

  const maxResults = Math.max(1, options?.maxResults ?? 4);
  const rawCleanedId = (targetId || '').trim();
  let resolvedTargetId = resolveInventoryItemId(rawCleanedId);

  if (options?.variantLabel) {
    const isHoney = resolvedTargetId.includes('honey-butter');
    const isChili =
      resolvedTargetId.includes('chili-lime') ||
      resolvedTargetId.includes('chilli-lime');
    if (isHoney && options.variantLabel.includes('250g')) {
      resolvedTargetId = 'honey-butter-250g-jar';
    } else if (isHoney && options.variantLabel.includes('100g')) {
      resolvedTargetId = 'honey-butter-100g-pouch';
    } else if (isChili && options.variantLabel.includes('250g')) {
      resolvedTargetId = 'chilli-lime-250g-jar';
    } else if (isChili && options.variantLabel.includes('100g')) {
      resolvedTargetId = 'chili-lime-100g-pouch';
    }
  }

  const allCatalog = buildUnifiedCatalogCandidates(safeInventory);
  const targetItem =
    allCatalog.find(
      (c) =>
        c.id === resolvedTargetId ||
        c.id === rawCleanedId ||
        c.productRef?.slug === rawCleanedId
    ) || null;

  const targetOutOfStock = targetItem
    ? !targetItem.inStock
    : isProductOutOfStock(safeInventory, resolvedTargetId, options?.variantLabel);

  // Collect browsing history attributes to personalize without inventing fake data
  const recentlyViewedSet = new Set(
    (options?.recentlyViewedIds || [])
      .map((id) => resolveInventoryItemId(id))
      .filter((id) => id && id !== resolvedTargetId && id !== rawCleanedId)
  );
  const viewedFlavors = new Set<string>();
  const viewedCategories = new Set<string>();
  for (const viewedId of recentlyViewedSet) {
    const viewedObj = allCatalog.find((c) => c.id === viewedId);
    if (viewedObj?.flavor) viewedFlavors.add(viewedObj.flavor);
    if (viewedObj?.category) viewedCategories.add(viewedObj.category);
  }

  // Rule: Never display the current product as its own recommendation
  const nonSelfCandidates = allCatalog.filter(
    (c) => c.id !== resolvedTargetId && c.id !== rawCleanedId
  );

  // Rule: Exclude unavailable products from primary recommendations
  const inStockCandidates = nonSelfCandidates.filter((c) => c.inStock);
  const outOfStockCandidates = nonSelfCandidates.filter((c) => !c.inStock);

  const activePool =
    inStockCandidates.length > 0
      ? inStockCandidates.map((c) => ({ ...c, isOutOfStockAlternative: false }))
      : options?.includeOutOfStockFallback
      ? outOfStockCandidates.map((c) => ({ ...c, isOutOfStockAlternative: true }))
      : [];

  // Score each candidate according to the 4-tier priority order:
  // 1. Similar products in the same category
  // 2. Products with matching tags, brands, flavors, or attributes (+ browsing behavior)
  // 3. Products within a similar price range
  // 4. Bestsellers or popular products as fallback options
  const scoredCandidates: RecommendedCatalogItem[] = activePool.map((cand) => {
    let score = 0;
    let reasonTag: RecommendationReasonTag = 'Bestseller';
    let reasonDescription = `Popular choice (${cand.rating.toFixed(2)}★ · ${cand.reviewCount} reviews)`;

    const sameExactCategory =
      targetItem !== null && cand.category === targetItem.category;
    const sameStoreCategory =
      targetItem !== null && cand.storeCategory === targetItem.storeCategory;
    const sameFlavor =
      targetItem?.flavor !== undefined &&
      cand.flavor !== undefined &&
      cand.flavor === targetItem.flavor;
    const samePackageSize =
      targetItem?.packageSize !== undefined &&
      cand.packageSize !== undefined &&
      cand.packageSize === targetItem.packageSize;

    const sharedTagsCount = targetItem
      ? cand.tags.filter((t) => targetItem.tags.includes(t)).length
      : 0;

    const priceDiff = targetItem
      ? Math.abs(cand.price - targetItem.price)
      : Math.abs(cand.price - 20);
    const similarPriceRange = priceDiff <= 10;

    // Tier 1: Same Category (Highest base priority)
    if (sameExactCategory) {
      score += 400;
    } else if (sameStoreCategory) {
      score += 260;
    }

    // Tier 2: Matching Flavor, Package Size, Tags, Brand & Browsing Behavior
    if (sameFlavor) {
      score += 240;
    }
    if (samePackageSize) {
      score += 140;
    }
    score += sharedTagsCount * 25;

    if (cand.brand === (targetItem?.brand || 'Kampot Harvest Co.')) {
      score += 20;
    }

    if (recentlyViewedSet.has(cand.id)) {
      score += 45;
    } else if (cand.flavor && viewedFlavors.has(cand.flavor)) {
      score += 30;
    } else if (viewedCategories.has(cand.category)) {
      score += 20;
    }

    // If current product is Out of Stock, strongly prioritize direct in-stock replacements
    // (same flavor in another size, or same size in another flavor, or bundle containing that item)
    if (targetOutOfStock && cand.inStock) {
      if (sameFlavor) {
        score += 350;
      } else if (sameExactCategory) {
        score += 220;
      } else if (
        targetItem?.flavor &&
        cand.tags.includes(targetItem.flavor.toLowerCase().replace(/\s+/g, '-'))
      ) {
        score += 180;
      }
    }

    // Tier 3: Similar Price Range
    if (similarPriceRange) {
      score += Math.max(20, 110 - priceDiff * 8);
    } else {
      score += Math.max(0, 40 - priceDiff);
    }

    // Tier 4: Bestseller / Popularity & Rating Fallback
    score += Math.round(cand.rating * 10) + Math.min(60, Math.round(cand.reviewCount / 10));

    // Assign human-readable reason tag & description
    if (targetOutOfStock && cand.inStock && (sameFlavor || sameExactCategory)) {
      reasonTag = 'In-Stock Alternative';
      reasonDescription = sameFlavor
        ? `Available now in ${cand.packageSize} — same ${cand.flavor} flavor`
        : `In-stock ${cand.category.toLowerCase()} ready to ship`;
    } else if (sameExactCategory && samePackageSize) {
      reasonTag = 'Same Category';
      reasonDescription = `Sister ${cand.packageSize} in our ${cand.category} collection`;
    } else if (sameFlavor) {
      reasonTag = 'Matching Flavor';
      reasonDescription = `More of our signature ${cand.flavor} roast in ${cand.packageSize}`;
    } else if (sameExactCategory) {
      reasonTag = 'Same Category';
      reasonDescription = `Popular pick from ${cand.category}`;
    } else if (cand.itemType === 'bundle' && targetItem?.itemType === 'product') {
      reasonTag = 'Value Bundle Upgrade';
      reasonDescription = `Save ${cand.discountPercent}% with this curated bundle`;
    } else if (recentlyViewedSet.has(cand.id) || (cand.flavor && viewedFlavors.has(cand.flavor))) {
      reasonTag = 'Based on Your Browsing';
      reasonDescription = `Matches your recent interest in ${cand.flavor || cand.category}`;
    } else if (similarPriceRange) {
      reasonTag = 'Similar Price Range';
      reasonDescription = `Great option around ${formatUSD(cand.price)}`;
    } else {
      reasonTag = 'Bestseller';
      reasonDescription = `Customer favorite (${cand.rating.toFixed(2)}★ rating)`;
    }

    return {
      ...cand,
      reasonTag,
      reasonDescription,
      score,
    };
  });

  // Sort strictly by descending score, then rating, then reviewCount
  const relatedProducts = [...scoredCandidates]
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.reviewCount - a.reviewCount;
    })
    .slice(0, maxResults);

  // Alternatives specifically for out-of-stock products
  const alternativesForUnavailable = targetOutOfStock
    ? relatedProducts
        .filter((c) => c.inStock)
        .map((c) => ({
          ...c,
          reasonTag: 'In-Stock Alternative' as RecommendationReasonTag,
        }))
        .slice(0, 3)
    : [];

  // Frequently Bought Together: Complementary pairings (opposite flavor or value bundle)
  const frequentlyBoughtTogether = [...scoredCandidates]
    .sort((a, b) => {
      let compA = a.score;
      let compB = b.score;
      if (targetItem?.itemType === 'product') {
        // Boost complementary flavor or bundle upgrade
        if (a.flavor && targetItem.flavor && a.flavor !== targetItem.flavor) compA += 220;
        if (b.flavor && targetItem.flavor && b.flavor !== targetItem.flavor) compB += 220;
        if (a.itemType === 'bundle') compA += 200;
        if (b.itemType === 'bundle') compB += 200;
      } else {
        // Viewing a bundle -> boost individual jars/pouches
        if (a.itemType === 'product') compA += 220;
        if (b.itemType === 'product') compB += 220;
      }
      return compB - compA;
    })
    .slice(0, 2);

  // You May Also Like: Bestsellers & complementary catalog items
  const youMayAlsoLike = [...scoredCandidates]
    .sort((a, b) => {
      const popA = a.reviewCount + a.rating * 100 + (recentlyViewedSet.has(a.id) ? 150 : 0);
      const popB = b.reviewCount + b.rating * 100 + (recentlyViewedSet.has(b.id) ? 150 : 0);
      return popB - popA;
    })
    .slice(0, maxResults);

  return {
    targetId: resolvedTargetId,
    targetName: targetItem?.name || rawCleanedId,
    targetOutOfStock,
    alternativesForUnavailable,
    relatedProducts,
    frequentlyBoughtTogether,
    youMayAlsoLike,
  };
}


