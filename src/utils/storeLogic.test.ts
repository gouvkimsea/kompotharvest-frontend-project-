import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCartSummary,
  formatUSD,
  STORE_CURRENCY,
  CURRENCY_SYMBOL,
  validateCheckoutForm,
  calculateNutritionSaving,
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

