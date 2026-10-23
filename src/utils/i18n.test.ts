import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LANGUAGES,
  CURRENCIES,
  TRANSLATIONS,
  convertPrice,
  formatCurrency,
  Language,
  Currency,
} from './i18nContext';

test('i18n configuration contains all requested languages: EN, KM, and ZH', () => {
  const languagesList = Object.values(LANGUAGES);
  const codes = languagesList.map((l) => l.code);
  assert.deepEqual(codes, ['EN', 'KM', 'ZH']);
  assert.equal(LANGUAGES.EN.label, 'English');
  assert.equal(LANGUAGES.KM.nativeLabel, 'ភាសាខ្មែរ');
  assert.equal(LANGUAGES.ZH.nativeLabel, '简体中文');
});

test('i18n configuration supports USD, KHR, and INR with USD as default', () => {
  const currenciesList = Object.values(CURRENCIES);
  const codes = currenciesList.map((c) => c.code);
  assert.ok(codes.includes('USD'));
  assert.ok(codes.includes('KHR'));
  assert.ok(codes.includes('INR'));
  assert.equal(CURRENCIES.USD.code, 'USD');
  assert.equal(CURRENCIES.USD.symbol, '$');
  assert.equal(CURRENCIES.KHR.symbol, '៛');
  assert.equal(CURRENCIES.INR.symbol, '₹');
});

test('convertPrice accurately converts base USD amounts', () => {
  // USD -> USD (1:1)
  assert.equal(convertPrice(10, 'USD'), 10);
  assert.equal(convertPrice(20, 'USD'), 20);

  // USD -> KHR (rate 4100)
  assert.equal(convertPrice(10, 'KHR'), 41000);
  assert.equal(convertPrice(20, 'KHR'), 82000);

  // USD -> INR (rate 83.5)
  assert.equal(convertPrice(10, 'INR'), 835);
  assert.equal(convertPrice(20, 'INR'), 1670);
});

test('formatCurrency formats all currencies cleanly and accurately', () => {
  // USD
  assert.equal(formatCurrency(10, 'USD'), '$10.00');
  assert.equal(formatCurrency(20, 'USD'), '$20.00');
  assert.equal(formatCurrency(14.99, 'USD'), '$14.99');

  // KHR
  const formattedKHR = formatCurrency(10, 'KHR');
  assert.ok(formattedKHR.startsWith('៛'));
  assert.ok(formattedKHR.includes('41'));

  // INR
  const formattedINR = formatCurrency(10, 'INR');
  assert.ok(formattedINR.startsWith('₹'));
  assert.ok(formattedINR.includes('835'));
});

test('translations dictionary has consistent keys for EN, KM, and ZH', () => {
  const enKeys = Object.keys(TRANSLATIONS.EN);
  const kmKeys = Object.keys(TRANSLATIONS.KM);
  const zhKeys = Object.keys(TRANSLATIONS.ZH);

  assert.equal(kmKeys.length, enKeys.length, 'Khmer keys count matches English');
  assert.equal(zhKeys.length, enKeys.length, 'Chinese keys count matches English');

  for (const key of enKeys) {
    assert.ok(TRANSLATIONS.KM[key], `Missing Khmer translation for key: ${key}`);
    assert.ok(TRANSLATIONS.ZH[key], `Missing Chinese translation for key: ${key}`);
  }
});
