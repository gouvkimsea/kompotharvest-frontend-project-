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
