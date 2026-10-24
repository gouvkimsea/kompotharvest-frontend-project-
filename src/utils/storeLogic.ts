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

export type AccountRole = 'customer' | 'wholesale' | 'affiliate';
export type AccountStatus = 'active' | 'pending_verification' | 'suspended';
export type AccountPermission =
  | 'store:shop'
  | 'vip:first_order_discount'
  | 'autoship:manage'
  | 'orders:track'
  | 'affiliate:referrals'
  | 'wholesale:bulk_order';

export interface AccountRegistrationInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: AccountRole;
  companyName?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

export interface UserAccount {
  accountId: string;
  fullName: string;
  email: string;
  phone: string;
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

  const cleanPhone = (input.phone || '').replace(/\D/g, '');
  if (cleanPhone.length < 10) {
    errors.phone = 'Please enter a valid 10-digit phone number';
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

  const validRoles: AccountRole[] = ['customer', 'wholesale', 'affiliate'];
  if (!input.role || !validRoles.includes(input.role)) {
    errors.role = 'Please select a valid account type';
  }

  if (input.role === 'wholesale') {
    if (!input.companyName || input.companyName.trim().length < 2) {
      errors.companyName = 'Business or company name is required for Wholesale accounts';
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
      error: 'Please correct the highlighted fields.',
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

  // Wholesale accounts start in pending_verification status until business is verified
  const initialStatus: AccountStatus =
    input.role === 'wholesale' ? 'pending_verification' : 'active';
  const verified = initialStatus === 'active';
  const permissions = getRolePermissions(input.role, initialStatus);

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
    phone: input.phone.trim(),
    role: input.role,
    status: initialStatus,
    verified,
    permissions,
    companyName:
      input.role === 'wholesale' && input.companyName
        ? input.companyName.trim()
        : undefined,
    address: input.address?.trim() || undefined,
    city: input.city?.trim() || undefined,
    postalCode: input.postalCode?.trim() || undefined,
    discountCode: 'HARVEST15',
    referralCode:
      input.role === 'affiliate' ? `KH-REF-${cleanNameCode}${suffix}` : undefined,
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


