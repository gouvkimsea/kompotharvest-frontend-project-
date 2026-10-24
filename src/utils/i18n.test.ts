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
    assert.ok(TRANSLATIONS.KM[key].trim().length > 0, `Empty Khmer translation for key: ${key}`);
    assert.ok(TRANSLATIONS.ZH[key].trim().length > 0, `Empty Chinese translation for key: ${key}`);
  }
});

test('all required component keys exist and are translated across EN, KM, and ZH', () => {
  const componentKeys = [
    // Navbar
    'nav_shop', 'nav_way', 'nav_autoship', 'nav_recipes', 'nav_rewards', 'nav_new_arrivals',
    // Hero & Bundles
    'hero_title_1', 'hero_title_2', 'btn_go_shop', 'hero_batch_badge', 'hero_bundle_offer_title',
    // Comparison
    'compare_title_1', 'compare_title_2', 'compare_col_kampot', 'compare_col_others', 'macro_calories', 'macro_fat', 'macro_protein',
    // Influencer & How To Enjoy
    'influencer_title_1', 'influencer_title_2', 'influencer_subtitle', 'btn_shop_now', 'btn_watch_review',
    'enjoy_title', 'btn_see_recipes', 'enjoy_combine_stir', 'enjoy_spread', 'enjoy_blend', 'enjoy_spoon', 'enjoy_bake',
    // Recipes & Reviews & Eco
    'recipes_section_title_1', 'recipes_section_title_2', 'time_minutes', 'macro_kcal', 'btn_view_more_recipes',
    'feedback_title_1', 'feedback_title_2', 'feedback_subtitle', 'feedback_tell_story', 'btn_share_feedback',
    'eco_pillar_1_title', 'eco_pillar_2_title', 'eco_pillar_3_title', 'eco_pillar_4_title',
    // Footer
    'footer_artisan_title', 'footer_artisan_desc', 'footer_honey_bullet', 'footer_chili_bullet', 'footer_single_bullet',
    'btn_order_now', 'footer_cta_msg', 'footer_sec_info', 'footer_sec_about', 'footer_sec_shop', 'footer_sec_more', 'footer_track_order',
    // Subpages & Modals
    'autoship_step_1', 'autoship_step_2', 'autoship_freq_30', 'autoship_freq_45', 'autoship_freq_60',
    'calc_impact_title', 'calc_impact_desc', 'calc_servings_label', 'calc_calories_saved', 'calc_fat_reduced', 'calc_plant_protein',
    'recipes_page_title', 'recipes_all_tab', 'btn_share_recipe', 'recipe_ingredients_title', 'recipe_prep_steps_title',
    'offer_modal_title', 'offer_modal_subtitle', 'offer_goal_weight', 'offer_goal_protein', 'offer_goal_lifestyle', 'offer_decline',
    'fb_modal_title', 'fb_name_label', 'fb_role_label', 'fb_msg_label', 'btn_submit_feedback', 'btn_done',
    'track_modal_title', 'track_btn_check', 'track_timeline_title',
    // Cart & Checkout
    'cart_title', 'cart_empty', 'cart_subtotal', 'cart_shipping', 'cart_total', 'cart_order_confirmed', 'btn_checkout', 'btn_place_order'
  ];

  for (const key of componentKeys) {
    assert.ok(TRANSLATIONS.EN[key], `Missing EN key: ${key}`);
    assert.ok(TRANSLATIONS.KM[key], `Missing KM key: ${key}`);
    assert.ok(TRANSLATIONS.ZH[key], `Missing ZH key: ${key}`);
  }
});

