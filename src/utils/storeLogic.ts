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

/* ============================================================================
 * BUSINESS INVENTORY MANAGEMENT & STOCK MOVEMENT LOGIC
 * ========================================================================== */

export type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type InventoryCategory =
  | 'Single Pouches (100g)'
  | 'Glass Jars (250g)'
  | 'Value Bundles';

export interface InventoryItem {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  variantLabel: string;
  category: InventoryCategory;
  price: number;
  stockQuantity: number;
  reorderThreshold: number;
  status: InventoryStatus;
  image: string;
  lastUpdated: string;
}

export interface StockMovementRecord {
  movementId: string;
  itemId: string;
  sku: string;
  productName: string;
  type: 'sale' | 'restock' | 'return' | 'adjustment';
  quantityDelta: number;
  resultingStock: number;
  reason: string;
  timestamp: string;
}

export interface InventoryStats {
  totalProducts: number;
  totalStockUnits: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalInventoryValueUSD: number;
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
  // Deduplicate by item.id to prevent double-counting
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

  for (const item of uniqueItems) {
    const qty = Math.max(0, item.stockQuantity);
    const status = computeInventoryStatus(qty, item.reorderThreshold);
    totalStockUnits += qty;
    totalInventoryValueUSD += Number((qty * item.price).toFixed(2));

    if (status === 'out_of_stock') {
      outOfStockCount += 1;
    } else if (status === 'low_stock') {
      lowStockCount += 1;
    } else {
      inStockCount += 1;
    }
  }

  return {
    totalProducts: uniqueItems.length,
    totalStockUnits,
    inStockCount,
    lowStockCount,
    outOfStockCount,
    totalInventoryValueUSD: Number(totalInventoryValueUSD.toFixed(2)),
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
      price: 10.0,
      stockQuantity: 14,
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
      price: 15.0,
      stockQuantity: 45,
      reorderThreshold: 12,
      image: '/assets/aistudio/bundle-pouches-duo.png',
    },
  ];

  const timestamp = '2026-10-24T05:00:00.000Z';
  return initialSeeds.map((seed) => ({
    ...seed,
    status: computeInventoryStatus(seed.stockQuantity, seed.reorderThreshold),
    lastUpdated: timestamp,
  }));
}

export function applyInventoryOrderDeduction(
  inventory: InventoryItem[],
  cartItems: CartItem[],
  orderId = 'ORDER'
): {
  updatedInventory: InventoryItem[];
  movements: StockMovementRecord[];
} {
  const now = new Date().toISOString();
  const movements: StockMovementRecord[] = [];
  const nextInventory = inventory.map((item) => ({ ...item }));

  for (const cartItem of cartItems) {
    const qtyToDeduct = Math.max(0, Number(cartItem.quantity) || 0);
    if (qtyToDeduct <= 0) continue;

    // Match by exact id or prefix id (for variant ids like honey-butter-100g-pouch__hb-pouch-100)
    const baseId = cartItem.id.split('__')[0];
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
          resultingStock: newStock,
          reason: `Completed Order ${orderId}`,
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
  type: 'restock' | 'return' | 'adjustment' = 'adjustment',
  reason = 'Admin inventory update'
): {
  success: boolean;
  updatedInventory: InventoryItem[];
  updatedItem?: InventoryItem;
  movement?: StockMovementRecord;
  error?: string;
} {
  const delta = Number(quantityDelta);
  if (!Number.isFinite(delta) || delta === 0) {
    return {
      success: false,
      updatedInventory: inventory,
      error: 'Adjustment quantity must be a non-zero number',
    };
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
  const nextStock = currentItem.stockQuantity + delta;
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
    status: computeInventoryStatus(nextStock, currentItem.reorderThreshold),
    lastUpdated: now,
  };

  const updatedInventory = inventory.map((item, idx) =>
    idx === targetIndex ? updatedItem : item
  );

  const movement: StockMovementRecord = {
    movementId: `MOV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    itemId: updatedItem.id,
    sku: updatedItem.sku,
    productName: updatedItem.name,
    type,
    quantityDelta: delta,
    resultingStock: nextStock,
    reason: reason.trim() || 'Admin stock adjustment',
    timestamp: now,
  };

  return {
    success: true,
    updatedInventory,
    updatedItem,
    movement,
  };
}



