import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'EN' | 'KM' | 'ZH';
export type Currency = 'USD' | 'KHR' | 'INR';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  label: string;
  rate: number; // Rate relative to 1 USD
}

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    label: 'USD ($)',
    rate: 1.0,
  },
  KHR: {
    code: 'KHR',
    symbol: '៛',
    label: 'KHR (៛)',
    rate: 4100.0,
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    label: 'INR (₹)',
    rate: 83.5,
  },
};

export function convertPrice(amountInUSD: number, currency: Currency): number {
  if (isNaN(amountInUSD)) return 0;
  const rate = CURRENCIES[currency]?.rate ?? 1.0;
  if (currency === 'KHR') {
    return Math.round(amountInUSD * rate);
  }
  return Math.round(amountInUSD * rate * 100) / 100;
}

export function formatCurrency(amountInUSD: number, currency: Currency): string {
  if (isNaN(amountInUSD)) amountInUSD = 0;

  if (currency === 'KHR') {
    const khrAmount = convertPrice(amountInUSD, 'KHR');
    return `៛${khrAmount.toLocaleString('km-KH')}`;
  }

  if (currency === 'INR') {
    const inrAmount = convertPrice(amountInUSD, 'INR');
    return `₹${inrAmount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  // Default: USD ($10.00)
  return `$${amountInUSD.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export interface LanguageConfig {
  code: Language;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const LANGUAGES: Record<Language, LanguageConfig> = {
  EN: {
    code: 'EN',
    label: 'English',
    nativeLabel: 'English',
    flag: '🇺🇸',
  },
  KM: {
    code: 'KM',
    label: 'Khmer',
    nativeLabel: 'ភាសាខ្មែរ',
    flag: '🇰🇭',
  },
  ZH: {
    code: 'ZH',
    label: 'Chinese',
    nativeLabel: '简体中文',
    flag: '🇨🇳',
  },
};

// Translations Dictionary
export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  EN: {
    // Brand & Headings
    brand_name: 'KAMPOT HARVEST',
    brand_subtitle: 'Artisan Roasted Cashews',
    explore_cashews: 'Explore Artisan Roasted Cashews',
    hero_tagline: 'The Pride of Kampot, Roasted to Perfection.',
    hero_desc: 'Hand-selected Cambodian cashews slow-roasted in small batches. Infused with wild forest honey, creamy churned butter, and sun-dried Kampot bird’s eye chili.',
    
    // Navigation & Mega Menus
    nav_shop: 'Shop',
    nav_way: 'The Kampot Way',
    nav_autoship: 'Autoship & Save',
    nav_recipes: 'Recipes',
    nav_rewards: 'Rewards',
    nav_new_arrivals: 'New Arrivals',
    nav_variety_packs: 'Variety Packs',
    nav_gift_reward: 'Gift $20, Get $20',
    nav_gifts_extras: 'Gifts & Extras',
    nav_gifts_extras_desc: 'Small touches for everyday use',
    nav_cant_choose: "Can’t Choose? Get Them All",
    nav_bundle_desc: 'All our jars, in one easy bundle for anyone who wants to try the full range.',
    nav_about_us: 'About Us',
    nav_about_desc: 'The Pride of Kampot, Roasted to Perfection.',
    nav_product_quality: 'Product Quality',
    nav_quality_desc: 'Natural taste, planet-first!',
    nav_why_glass: 'Why Glass',
    nav_glass_desc: 'For health, taste, and planet care.',
    nav_eco_events: 'Our Eco Events',
    nav_eco_desc: 'Learning through environmental care',
    nav_shop_special: 'Shop Special Edition',
    nav_shop_all: 'Shop All Products',
    nav_bundles_discount: 'Botenz Bundles (25% OFF)',
    
    // Selectors & Controls
    lang_select_title: 'Language',
    curr_select_title: 'Currency',
    
    // Product Attributes & Categories
    flavors_title: 'Flavors',
    flavor_honey_butter: 'Honey Butter',
    flavor_chili_lime: 'Chili Lime',
    size_pouch_100: '100g Pouch',
    size_jar_250: '250g Jar',
    cat_all: 'All Sizes & Flavors (4)',
    cat_bundles: 'Bundles',
    cat_jars: '250g Jar',
    cat_pouches: '100g Pouch',
    
    // Actions & Buttons
    btn_add_to_cart: 'Add to Cart',
    btn_added: 'Added to Bag!',
    btn_buy_now: 'Buy Now',
    btn_checkout: 'Proceed to Checkout',
    btn_place_order: 'Place Order',
    btn_back: 'Back',
    btn_continue_shopping: 'Continue Shopping',
    btn_processing: 'Processing Order...',
    btn_apply: 'Apply',
    btn_unlock_discount: 'Enjoy 15% OFF Your First Order',
    btn_ask_ai: 'Ask AI Sommelier',
    btn_tell_story: 'Tell Your Story',
    btn_start_autoship: 'Start Autoship',
    btn_close: 'Close',
    cart_view_bag: 'View Bag',

    // Hero & Bundles
    hero_title_1: 'The Pride of Kampot,',
    hero_title_2: 'Roasted to Perfection.',
    btn_go_shop: 'Go to Shop',
    hero_batch_badge: '★ Limited Batch Roasted Fresh in Kampot ★',
    hero_bundle_offer_title: '25% OFF',
    hero_bundle_offer_sub: 'Don’t Miss This Bundle Offer',
    btn_claim_offer: 'Claim Offer',
    hero_bundle_offer_desc: 'Save 25% On Artisan Roasted Cashews: Honey Butter & Chili Lime in 250g Jar ($20) & 100g Pouch ($10)',
    btn_learn_more: 'Learn more',
    flavor_pill_honey: 'Honey Butter Glazed',
    flavor_pill_chili: 'Chili Lime Seasoned',

    // Comparison & Macro Section
    compare_title_1: 'What Makes Us',
    compare_title_2: 'Different',
    compare_col_kampot: 'Artisan Roasted\nCashews',
    compare_col_others: 'Regular Fried\nNuts',
    macro_calories: 'Calories',
    macro_fat: 'Fat',
    macro_protein: 'Protein',
    compare_others_badge: 'Others',
    btn_explore_products: 'Explore The Products Now',
    compare_showing_all: 'Showing All 4 Artisan Roasted Cashews',

    // Influencers & How to Enjoy
    influencer_title_1: 'What Influencer',
    influencer_title_2: 'Says About Us',
    influencer_subtitle: 'Take a moment for those who trust us',
    btn_shop_now: 'Shop Now',
    btn_watch_review: 'Watch Review',
    enjoy_title: 'How to Enjoy Botenz',
    btn_see_recipes: 'See recipes',
    enjoy_combine_stir: 'Combine and stir\nuntil smooth',
    enjoy_spread: 'Spread it',
    enjoy_spread_desc: 'On toast, cracker & fruit',
    enjoy_blend: 'Blend it',
    enjoy_blend_desc: 'In smoothies & shakes',
    enjoy_spoon: 'Spoon it',
    enjoy_spoon_desc: 'Straight from the jar',
    enjoy_bake: 'Cook/Bake',
    enjoy_bake_desc: 'In recipes and desserts',
    creator_story: 'Creator Story',
    shop_favorites: 'Shop Favorites',

    // Recipes & Community Feedback
    recipes_section_title_1: 'Healthy With',
    recipes_section_title_2: 'Botenz - Recipes',
    time_minutes: 'minutes',
    macro_kcal: 'kcal',
    btn_view_more_recipes: 'View more recipes',
    feedback_title_1: 'Customer',
    feedback_title_2: 'feedback',
    feedback_subtitle: 'What do you think about Botenz?',
    feedback_tell_story: 'Tell your story',
    btn_share_feedback: 'Share your feedback',

    // Eco Pillars
    eco_pillar_1_title: '100% Recyclable Glass Jars',
    eco_pillar_1_desc: 'Endlessly reusable and dishwasher-safe, preserving crunch without plastic waste.',
    eco_pillar_2_title: 'Zero Artificial Additives',
    eco_pillar_2_desc: 'Only natural whole-food ingredients: pure wildflower honey, churned butter, fresh chili.',
    eco_pillar_3_title: 'Fair-Trade Kampot Growers',
    eco_pillar_3_desc: 'Direct ethical partnerships supporting cashew farming families across southern Cambodia.',
    eco_pillar_4_title: 'Solar-Powered Roastery',
    eco_pillar_4_desc: 'Crafted in small batches using clean renewable solar energy in our eco-facility.',

    // Footer
    footer_artisan_title: 'Artisan Roasted Cashews',
    footer_artisan_desc: 'Crafted in small batches with single-origin Cambodian cashews. Choose your favorite flavor in on-the-go resealable pouches or reusable glass jars.',
    footer_pouch_desc: 'Resealable Fresh Pouch',
    footer_jar_desc: 'Airtight Glass Jar',
    footer_honey_bullet: '100% Wildflower Honey & Pure Cultured Butter',
    footer_chili_bullet: 'Authentic Sun-Ripened Chili & Fresh Lime',
    footer_single_bullet: 'Single-Origin Kampot Harvest',
    btn_order_now: 'Order Now',
    footer_cta_msg: 'The Pride of Kampot, Roasted to Perfection. Taste the difference from the first bite.',
    footer_sec_info: 'Info:',
    footer_sec_about: 'About:',
    footer_sec_shop: 'Shop:',
    footer_sec_more: 'More:',
    footer_contact: 'Contact',
    footer_wholesale: 'Wholesale',
    footer_affiliate: 'Affiliate',
    footer_account: 'Account',
    footer_our_way: 'Our Way',
    footer_blogs: 'Blogs',
    footer_faq: 'FAQ',
    footer_products: 'Products',
    footer_jars: 'Jars',
    footer_kits: 'Kits',
    footer_gifts: 'Gifts',
    footer_privacy: 'Privacy',
    footer_terms: 'Terms',
    footer_labs: 'Labs',
    footer_track_order: 'Track Order',
    track_modal_title: 'Track Your Order',
    track_modal_subtitle: 'Enter your Kampot Harvest order number to view live roasting and delivery status.',
    track_input_label: 'Order Number',
    track_input_placeholder: 'e.g. KH-2026-1042',
    track_btn_check: 'Check Status',
    track_sample_label: 'Try sample order:',
    track_est_delivery: 'Estimated Delivery',
    track_current_loc: 'Current Location',
    track_carrier: 'Eco-Carrier',
    track_Destination: 'Destination',
    track_timeline_title: 'Real-Time Delivery Timeline',
    track_items_title: 'Order Summary',

    // Subpages & Modals
    autoship_step_1: '1. Select Your Artisan Flavor',
    autoship_step_2: '2. Delivery Frequency',
    autoship_freq_30: 'Every 30 Days (Most Popular)',
    autoship_freq_45: 'Every 45 Days',
    autoship_freq_60: 'Every 60 Days',
    btn_explore_bundles: 'Explore 25% Off Bundles',
    calc_impact_title: 'Calculate Your Weekly Botenz Impact',
    calc_impact_desc: 'See how much excess oil and calories you save by swapping regular fried nuts for Kampot Harvest artisan roasted cashews.',
    calc_servings_label: 'Servings per week (30g portion):',
    calc_calories_saved: 'Calories Saved / Week',
    calc_fat_reduced: 'Fat Reduced / Week',
    calc_plant_protein: 'Clean Plant Protein',
    calc_oil_less: '90% less saturated oil',
    calc_density: '2× protein density per kcal',
    offer_modal_title: 'Enjoy 15% OFF\nYour First\nOrder',
    offer_modal_subtitle: 'To Unlock Select:\nWhat is your health goal today?',
    offer_goal_weight: 'Weight Goals',
    offer_goal_protein: 'Protein Powder',
    offer_goal_lifestyle: 'Health Lifestyle',
    offer_decline: "No Thanks, I'll Pay Full Price...",
    fb_modal_title: 'Tell Your Botenz Story',
    fb_name_label: 'Your Name *',
    fb_role_label: 'Role / Passion (Optional)',
    fb_msg_label: 'Your Review, Recipe, or Inquiry *',
    fb_placeholder_msg: 'How do you enjoy Kampot Harvest Artisan Cashews?',
    btn_submit_feedback: 'Submit Feedback',
    fb_success_title: 'Thank you for sharing!',
    fb_success_desc: "Our team reviews every customer story and recipe submission—and we've added a 15% thank-you reward to your session!",
    btn_done: 'Done',
    recipe_ingredients_title: 'Ingredients:',
    recipe_prep_steps_title: '1-Minute Preparation:',
    recipe_detail_protein: 'Protein',
    recipe_detail_prep: 'Prep Time',
    recipe_detail_calories: 'Calories',
    btn_shop_recipe_ingredient: 'Shop Ingredients',
    recipes_page_title: 'Botenz recipes',
    recipes_all_tab: 'All Recipes',
    btn_share_recipe: 'Share Your Recipe',
    
    // Cart & Checkout
    cart_title: 'Your Shopping Bag',
    cart_empty: 'Your shopping bag is empty',
    cart_subtotal: 'Subtotal',
    cart_shipping: 'Shipping',
    cart_shipping_free: 'FREE Glass-Safe Shipping unlocked!',
    cart_shipping_add_more: 'more for FREE Shipping',
    cart_discount: 'First Order 15% Discount',
    cart_autoship_savings: 'Autoship 15% Savings',
    cart_total: 'Total',
    cart_order_confirmed: 'Order Confirmed!',
    cart_order_receipt_msg: 'Your order is recorded and being prepared with zero-plastic cushioning.',
    promo_code_label: 'Have a promo code?',
    promo_code_placeholder: 'e.g. HARVEST15',
    
    // Customer Form
    form_full_name: 'Full Name',
    form_email: 'Email Address',
    form_phone: 'Phone Number',
    form_address: 'Street Address',
    form_city: 'City (e.g. Phnom Penh, Siem Reap)',
    form_postal: 'ZIP / Postal Code',
    
    // Badges & Stock
    badge_in_stock: 'In Stock',
    badge_out_of_stock: 'Not Available',
    badge_organic: '100% Organic Soil',
    badge_single_origin: 'Cambodian Single-Origin',
    badge_pgi: 'Kampot Origin Guaranteed',
  },
  KM: {
    // Brand & Headings
    brand_name: 'កំពត ហារវេស',
    brand_subtitle: 'គ្រាប់ស្វាយចន្ទីលីងបែបសិប្បកម្ម',
    explore_cashews: 'ស្វែងយល់ពីគ្រាប់ស្វាយចន្ទីលីងសិប្បកម្ម',
    hero_tagline: 'មោទនភាពខេត្តកំពត លីងឡើងយ៉ាងឈ្ងុយឆ្ងាញ់ឥតខ្ចោះ។',
    hero_desc: 'គ្រាប់ស្វាយចន្ទីខ្មែរជ្រើសរើសយ៉ាងសម្រិតសម្រាំង លីងក្នុងបរិមាណតិចតួចតាមបែបប្រពៃណី ជាមួយទឹកឃ្មុំព្រៃធម្មជាតិ ប៊័រស្រស់ និងម្ទេសអាចម៍សត្វកំពតហាលថ្ងៃ។',
    
    // Navigation & Mega Menus
    nav_shop: 'ហាងទំនិញ',
    nav_way: 'ដំណើរជីវិតកំពត',
    nav_autoship: 'កុម្ម៉ង់ប្រចាំខែ',
    nav_recipes: 'រូបមន្តម្ហូប',
    nav_rewards: 'រង្វាន់សមាជិក',
    nav_new_arrivals: 'ទំនិញទើបមកដល់',
    nav_variety_packs: 'កញ្ចប់ចម្រុះរសជាតិ',
    nav_gift_reward: 'ជូនកាដូ $20 ទទួលបាន $20',
    nav_gifts_extras: 'កាដូ និងរបស់ពិសេស',
    nav_gifts_extras_desc: 'គ្រឿងលម្អិតដ៏ពិសេសសម្រាប់ការរស់នៅប្រចាំថ្ងៃ',
    nav_cant_choose: 'ពិបាកជ្រើសរើស? យកទាំងអស់!',
    nav_bundle_desc: 'គ្រប់រសជាតិទាំងអស់ក្នុងមួយកញ្ចប់ សម្រាប់លោកអ្នកដែលចង់ភ្លក្សគ្រប់រសជាតិ។',
    nav_about_us: 'អំពីពួកយើង',
    nav_about_desc: 'មោទនភាពខេត្តកំពត លីងឡើងយ៉ាងឈ្ងុយឆ្ងាញ់ឥតខ្ចោះ។',
    nav_product_quality: 'គុណភាពផលិតផល',
    nav_quality_desc: 'រសជាតិធម្មជាតិ គិតគូរដល់ភពផែនដីជាចម្បង!',
    nav_why_glass: 'ហេតុអ្វីជ្រើសរើសកែវ',
    nav_glass_desc: 'ដើម្បីសុខភាព រសជាតិឈ្ងុយឆ្ងាញ់ និងបរិស្ថាន។',
    nav_eco_events: 'សកម្មភាពបរិស្ថាន',
    nav_eco_desc: 'ការរៀនសូត្រតាមរយៈការថែរក្សាបរិស្ថាន',
    nav_shop_special: 'ទិញឈុតពិសេស',
    nav_shop_all: 'ទំនិញទាំងអស់',
    nav_bundles_discount: 'ឈុតពិសេស (បញ្ចុះ ២៥%)',
    
    // Selectors & Controls
    lang_select_title: 'ភាសា',
    curr_select_title: 'រូបិយប័ណ្ណ',
    
    // Product Attributes & Categories
    flavors_title: 'រសជាតិ',
    flavor_honey_butter: 'ទឹកឃ្មុំប៊័រ',
    flavor_chili_lime: 'ម្ទេសក្រូចឆ្មា',
    size_pouch_100: 'កញ្ចប់ ១០០ក្រាម',
    size_jar_250: 'ក្រឡកែវ ២៥០ក្រាម',
    cat_all: 'គ្រប់ទំហំ និងរសជាតិ (៤)',
    cat_bundles: 'ឈុតកញ្ចប់ពិសេស',
    cat_jars: 'ក្រឡកែវ ២៥០ក្រាម',
    cat_pouches: 'កញ្ចប់ ១០០ក្រាម',
    
    // Actions & Buttons
    btn_add_to_cart: 'ដាក់ក្នុងកន្ត្រក',
    btn_added: 'បានដាក់ក្នុងកន្ត្រក!',
    btn_buy_now: 'ទិញភ្លាមៗ',
    btn_checkout: 'បន្តទៅការទូទាត់',
    btn_place_order: 'បញ្ជាក់ការបញ្ជាទិញ',
    btn_back: 'ត្រឡប់ក្រោយ',
    btn_continue_shopping: 'បន្តទិញទំនិញ',
    btn_processing: 'កំពុងដំណើរការ...',
    btn_apply: 'អនុវត្ត',
    btn_unlock_discount: 'ទទួលបានការបញ្ចុះតម្លៃ ១៥%',
    btn_ask_ai: 'សួរអ្នកជំនាញ AI',
    btn_tell_story: 'ចែករំលែករឿងរ៉ាវ',
    btn_start_autoship: 'ចាប់ផ្តើមកុម្ម៉ង់ប្រចាំខែ',
    btn_close: 'បិទ',
    cart_view_bag: 'មើលកន្ត្រកទំនិញ',

    // Hero & Bundles
    hero_title_1: 'មោទនភាពខេត្តកំពត',
    hero_title_2: 'លីងឡើងយ៉ាងឈ្ងុយឆ្ងាញ់ឥតខ្ចោះ។',
    btn_go_shop: 'ចូលទៅកាន់ហាង',
    hero_batch_badge: '★ ផលិតថ្មីៗក្នុងបរិមាណកំណត់នៅខេត្តកំពត ★',
    hero_bundle_offer_title: 'បញ្ចុះ ២៥%',
    hero_bundle_offer_sub: 'កុំរំលងការផ្តល់ជូនពិសេសនេះ',
    btn_claim_offer: 'ទទួលយកការផ្តល់ជូន',
    hero_bundle_offer_desc: 'សន្សំ ២៥% លើគ្រាប់ស្វាយចន្ទីលីងសិប្បកម្ម៖ រសជាតិទឹកឃ្មុំប៊័រ និង ម្ទេសក្រូចឆ្មា ក្នុងក្រឡកែវ ២៥០ក្រាម និងកញ្ចប់ ១០០ក្រាម',
    btn_learn_more: 'ស្វែងយល់បន្ថែម',
    flavor_pill_honey: 'ស្រោបទឹកឃ្មុំប៊័រ',
    flavor_pill_chili: 'រសជាតិម្ទេសក្រូចឆ្មា',

    // Comparison & Macro Section
    compare_title_1: 'អ្វីដែលធ្វើឱ្យយើង',
    compare_title_2: 'មានភាពប្លែកគេ',
    compare_col_kampot: 'គ្រាប់ស្វាយចន្ទី\nលីងសិប្បកម្ម',
    compare_col_others: 'គ្រាប់ធញ្ញជាតិ\nបំពងទូទៅ',
    macro_calories: 'កាឡូរី',
    macro_fat: 'ជាតិខ្លាញ់',
    macro_protein: 'ប្រូតេអ៊ីន',
    compare_others_badge: 'ទំនិញទូទៅ',
    btn_explore_products: 'ស្វែងយល់ពីផលិតផលឥឡូវនេះ',
    compare_showing_all: 'បង្ហាញគ្រាប់ស្វាយចន្ទីលីងសិប្បកម្មទាំង ៤',

    // Influencers & How to Enjoy
    influencer_title_1: 'មតិរបស់អ្នកល្បី',
    influencer_title_2: 'និយាយអំពីពួកយើង',
    influencer_subtitle: 'ចំណាយពេលបន្តិចដើម្បីមើលអ្នកដែលជឿជាក់លើពួកយើង',
    btn_shop_now: 'ទិញឥឡូវនេះ',
    btn_watch_review: 'ទស្សនាការវាយតម្លៃ',
    enjoy_title: 'របៀបទទួលទានឱ្យកាន់តែឆ្ងាញ់',
    btn_see_recipes: 'មើលរូបមន្តម្ហូប',
    enjoy_combine_stir: 'លាយនិងកូរ\nឱ្យសព្វល្អ',
    enjoy_spread: 'លាបលើអាហារ',
    enjoy_spread_desc: 'លើនំប៉័ង ប៊ីស្គីត និងផ្លែឈើ',
    enjoy_blend: 'ក្រឡុកចូលគ្នា',
    enjoy_blend_desc: 'ក្នុងទឹកក្រឡុក និងភេសជ្ជៈ',
    enjoy_spoon: 'ដួសញ៉ាំផ្ទាល់',
    enjoy_spoon_desc: 'ផ្ទាល់ពីក្រឡកែវ',
    enjoy_bake: 'ចម្អិន/ដុតនំ',
    enjoy_bake_desc: 'ក្នុងរូបមន្តម្ហូប និងបង្អែម',
    creator_story: 'រឿងរ៉ាវរបស់អ្នកបង្កើតមាតិកា',
    shop_favorites: 'ទិញទំនិញពេញនិយម',

    // Recipes & Community Feedback
    recipes_section_title_1: 'សុខភាពល្អជាមួយ',
    recipes_section_title_2: 'កំពត ហារវេស - រូបមន្តម្ហូប',
    time_minutes: 'នាទី',
    macro_kcal: 'កាឡូរី',
    btn_view_more_recipes: 'មើលរូបមន្តបន្ថែម',
    feedback_title_1: 'មតិកែលម្អ',
    feedback_title_2: 'ពីអតិថិជន',
    feedback_subtitle: 'តើលោកអ្នកយល់យ៉ាងណាចំពោះ កំពត ហារវេស?',
    feedback_tell_story: 'ចែករំលែករឿងរ៉ាវរបស់អ្នក',
    btn_share_feedback: 'ចែករំលែកមតិកែលម្អ',

    // Eco Pillars
    eco_pillar_1_title: 'ក្រឡកែវកែច្នៃឡើងវិញ ១០០%',
    eco_pillar_1_desc: 'អាចប្រើប្រាស់ឡើងវិញបានជានិរន្តរ៍ និងលាងសម្អាតងាយស្រួល រក្សាភាពស្រួយដោយគ្មានកាកសំណល់ប្លាស្ទិក។',
    eco_pillar_2_title: 'គ្មានសារធាតុបន្ថែមសិប្បនិម្មិត',
    eco_pillar_2_desc: 'ប្រើប្រាស់តែគ្រឿងផ្សំធម្មជាតិពិតៗ៖ ទឹកឃ្មុំព្រៃ ប៊័រស្រស់ និងម្ទេសកំពត។',
    eco_pillar_3_title: 'កសិករកំពតពាណិជ្ជកម្មយុត្តិធម៌',
    eco_pillar_3_desc: 'ភាពជាដៃគូផ្ទាល់ប្រកបដោយក្រមសីលធម៌ ដើម្បីគាំទ្រគ្រួសារកសិករដាំស្វាយចន្ទីនៅកម្ពុជា។',
    eco_pillar_4_title: 'រោងចក្រថាមពលពន្លឺព្រះអាទិត្យ',
    eco_pillar_4_desc: 'ផលិតក្នុងបរិមាណកំណត់ដោយប្រើប្រាស់ថាមពលពន្លឺព្រះអាទិត្យស្អាត ក្នុងរោងចក្រធម្មជាតិរបស់យើង។',

    // Footer
    footer_artisan_title: 'គ្រាប់ស្វាយចន្ទីលីងសិប្បកម្ម',
    footer_artisan_desc: 'ផលិតក្នុងបរិមាណកំណត់ពីគ្រាប់ស្វាយចន្ទីកម្ពុជាសុទ្ធ។ ជ្រើសរើសរសជាតិដែលអ្នកចូលចិត្តក្នុងកញ្ចប់ងាយស្រួលយកតាមខ្លួន ឬក្រឡកែវដែលប្រើប្រាស់ឡើងវិញបាន។',
    footer_pouch_desc: 'កញ្ចប់រក្សាភាពស្រស់',
    footer_jar_desc: 'ក្រឡកែវការពារខ្យល់',
    footer_honey_bullet: 'ទឹកឃ្មុំព្រៃ ១០០% និងប៊័រធម្មជាតិសុទ្ធ',
    footer_chili_bullet: 'ម្ទេសហាលថ្ងៃពិតៗ និងក្រូចឆ្មាស្រស់',
    footer_single_bullet: 'ផលិតផលប្រភពដើមពីខេត្តកំពត',
    btn_order_now: 'កុម្ម៉ង់ឥឡូវនេះ',
    footer_cta_msg: 'មោទនភាពខេត្តកំពត លីងឡើងយ៉ាងឈ្ងុយឆ្ងាញ់ឥតខ្ចោះ។ ភ្លក្សភាពប្លែកពីការញ៉ាំម៉ាត់ដំបូង។',
    footer_sec_info: 'ព័ត៌មាន៖',
    footer_sec_about: 'អំពី៖',
    footer_sec_shop: 'ហាង៖',
    footer_sec_more: 'ផ្សេងទៀត៖',
    footer_contact: 'ទំនាក់ទំនង',
    footer_wholesale: 'លក់ដុំ',
    footer_affiliate: 'ដៃគូលក់',
    footer_account: 'គណនី',
    footer_our_way: 'ដំណើររបស់យើង',
    footer_blogs: 'អត្ថបទ',
    footer_faq: 'សំណួរញឹកញាប់',
    footer_products: 'ផលិតផល',
    footer_jars: 'ក្រឡកែវ',
    footer_kits: 'ឈុតកញ្ចប់',
    footer_gifts: 'កាដូ',
    footer_privacy: 'ឯកជនភាព',
    footer_terms: 'លក្ខខណ្ឌ',
    footer_labs: 'វិញ្ញាបនបត្រ',
    footer_track_order: 'តាមដានការបញ្ជាទិញ',
    track_modal_title: 'តាមដានការបញ្ជាទិញរបស់អ្នក',
    track_modal_subtitle: 'បញ្ចូលលេខសម្គាល់ការបញ្ជាទិញរបស់អ្នក ដើម្បីមើលស្ថានភាពដឹកជញ្ជូនផ្ទាល់។',
    track_input_label: 'លេខកូដបញ្ជាទិញ',
    track_input_placeholder: 'ឧ. KH-2026-1042',
    track_btn_check: 'ពិនិត្យស្ថានភាព',
    track_sample_label: 'សាកល្បងលេខកូដគំរូ៖',
    track_est_delivery: 'ការដឹកជញ្ជូនប៉ាន់ស្មាន',
    track_current_loc: 'ទីតាំងបច្ចុប្បន្ន',
    track_carrier: 'ក្រុមហ៊ុនដឹកជញ្ជូន',
    track_Destination: 'គោលដៅទទួលទំនិញ',
    track_timeline_title: 'ដំណើរការដឹកជញ្ជូនផ្ទាល់',
    track_items_title: 'សង្ខេបទំនិញ',

    // Subpages & Modals
    autoship_step_1: '១. ជ្រើសរើសរសជាតិដែលអ្នកចូលចិត្ត',
    autoship_step_2: '២. ភាពញឹកញាប់នៃការដឹកជញ្ជូន',
    autoship_freq_30: 'រៀងរាល់ ៣០ ថ្ងៃ (ពេញនិយមបំផុត)',
    autoship_freq_45: 'រៀងរាល់ ៤៥ ថ្ងៃ',
    autoship_freq_60: 'រៀងរាល់ ៦០ ថ្ងៃ',
    btn_explore_bundles: 'ស្វែងយល់ពីឈុតបញ្ចុះតម្លៃ ២៥%',
    calc_impact_title: 'គណនាផលប្រយោជន៍សុខភាពប្រចាំសប្តាហ៍',
    calc_impact_desc: 'មើលថាតើអ្នកកាត់បន្ថយបរិមាណខ្លាញ់ និងកាឡូរីបានប៉ុន្មានដោយប្តូរមកញ៉ាំគ្រាប់ស្វាយចន្ទីលីងសិប្បកម្មកំពត។',
    calc_servings_label: 'ការទទួលទានក្នុងមួយសប្តាហ៍ (៣០ក្រាម)៖',
    calc_calories_saved: 'កាឡូរីសន្សំបាន / សប្តាហ៍',
    calc_fat_reduced: 'ខ្លាញ់កាត់បន្ថយ / សប្តាហ៍',
    calc_plant_protein: 'ប្រូតេអ៊ីនរុក្ខជាតិស្អាត',
    calc_oil_less: 'កាត់បន្ថយខ្លាញ់មិនល្អ ៩០%',
    calc_density: 'ប្រូតេអ៊ីនខ្ពស់ជាងមុន ២ ដង',
    offer_modal_title: 'ទទួលបានការបញ្ចុះតម្លៃ ១៥%\nលើការបញ្ជាទិញ\nដំបូង',
    offer_modal_subtitle: 'ដើម្បីទទួលបាន សូមជ្រើសរើស៖\nតើគោលដៅសុខភាពរបស់អ្នកថ្ងៃនេះជាអ្វី?',
    offer_goal_weight: 'គ្រប់គ្រងទម្ងន់',
    offer_goal_protein: 'ម្សៅប្រូតេអ៊ីន',
    offer_goal_lifestyle: 'របៀបរស់នៅសុខភាពល្អ',
    offer_decline: 'ទេ អរគុណ ខ្ញុំបង់ថ្លៃពេញ...',
    fb_modal_title: 'ចែករំលែករឿងរ៉ាវរបស់អ្នក',
    fb_name_label: 'ឈ្មោះរបស់អ្នក *',
    fb_role_label: 'តួនាទី / ចំណង់ចំណូលចិត្ត (ស្រេចចិត្ត)',
    fb_msg_label: 'មតិកែលម្អ រូបមន្ត ឬសំណួររបស់អ្នក *',
    fb_placeholder_msg: 'តើអ្នកចូលចិត្តទទួលទានគ្រាប់ស្វាយចន្ទីកំពតយ៉ាងដូចម្តេច?',
    btn_submit_feedback: 'ផ្ញើមតិកែលម្អ',
    fb_success_title: 'អរគុណសម្រាប់ការចែករំលែក!',
    fb_success_desc: 'ក្រុមការងារយើងខ្ញុំពិនិត្យមើលគ្រប់រឿងរ៉ាវ និងរូបមន្តរបស់អតិថិជន—ហើយយើងបានបន្ថែមរង្វាន់បញ្ចុះតម្លៃ ១៥% ជូនអ្នក!',
    btn_done: 'រួចរាល់',
    recipe_ingredients_title: 'គ្រឿងផ្សំ៖',
    recipe_prep_steps_title: 'ការរៀបចំក្នុង ១ នាទី៖',
    recipe_detail_protein: 'ប្រូតេអ៊ីន',
    recipe_detail_prep: 'ពេលរៀបចំ',
    recipe_detail_calories: 'កាឡូរី',
    btn_shop_recipe_ingredient: 'ទិញគ្រឿងផ្សំ',
    recipes_page_title: 'រូបមន្តម្ហូបកំពត',
    recipes_all_tab: 'រូបមន្តទាំងអស់',
    btn_share_recipe: 'ចែករំលែករូបមន្តរបស់អ្នក',
    
    // Cart & Checkout
    cart_title: 'កន្ត្រកទំនិញរបស់អ្នក',
    cart_empty: 'កន្ត្រកទំនិញរបស់អ្នកទទេស្អាត',
    cart_subtotal: 'សរុបបណ្តោះអាសន្ន',
    cart_shipping: 'ថ្លៃដឹកជញ្ជូន',
    cart_shipping_free: 'ទទួលបានការដឹកជញ្ជូនឥតគិតថ្លៃ!',
    cart_shipping_add_more: 'ទៀតដើម្បីដឹកជញ្ជូនឥតគិតថ្លៃ',
    cart_discount: 'បញ្ចុះតម្លៃ ១៥% លើកដំបូង',
    cart_autoship_savings: 'ការសន្សំសំចៃ ១៥% ពីការកុម្ម៉ង់ប្រចាំខែ',
    cart_total: 'សរុបរួម',
    cart_order_confirmed: 'ការបញ្ជាទិញទទួលបានជោគជ័យ!',
    cart_order_receipt_msg: 'ការបញ្ជាទិញត្រូវបានកត់ត្រា និងកំពុងរៀបចំវេចខ្ចប់យ៉ាងប្រុងប្រយ័ត្ន។',
    promo_code_label: 'មានលេខកូដបញ្ចុះតម្លៃ?',
    promo_code_placeholder: 'ឧ. HARVEST15',
    
    // Customer Form
    form_full_name: 'ឈ្មោះពេញ',
    form_email: 'អាសយដ្ឋានអ៊ីមែល',
    form_phone: 'លេខទូរស័ព្ទ',
    form_address: 'អាសយដ្ឋានដឹកជញ្ជូន',
    form_city: 'រាជធានី/ខេត្ត (ឧ. ភ្នំពេញ, សៀមរាប)',
    form_postal: 'លេខកូដប្រៃសណីយ៍',
    
    // Badges & Stock
    badge_in_stock: 'មានក្នុងស្តុក',
    badge_out_of_stock: 'មិនមានទំនិញ',
    badge_organic: 'ដាំដុះបែបសរីរាង្គ ១០០%',
    badge_single_origin: 'ប្រភពដើមពីកម្ពុជា',
    badge_pgi: 'ធានាប្រភពដើមពីខេត្តកំពត',
  },
  ZH: {
    // Brand & Headings
    brand_name: '贡布丰收有限公司',
    brand_subtitle: '手工烘烤精品腰果',
    explore_cashews: '探索传统手工烘烤腰果',
    hero_tagline: '柬埔寨贡布的骄傲，完美烘烤的醇香风味。',
    hero_desc: '精选柬埔寨顶级天然腰果，小批量低温慢烤。融入野生森林原蜜、天然发酵黄油与贡布艳阳日晒鸟眼辣椒。',
    
    // Navigation & Mega Menus
    nav_shop: '选购商店',
    nav_way: '贡布之道',
    nav_autoship: '定期订购立省',
    nav_recipes: '主厨食谱',
    nav_rewards: '尊享礼遇',
    nav_new_arrivals: '最新上市',
    nav_variety_packs: '多口味组合包',
    nav_gift_reward: '赠礼 $20 享 $20',
    nav_gifts_extras: '伴手礼与专属配件',
    nav_gifts_extras_desc: '增添日常精致体验的点睛之选',
    nav_cant_choose: '难以抉择？整套尊享！',
    nav_bundle_desc: '全套玻璃罐典藏装，一站式品尝所有风味。',
    nav_about_us: '关于我们',
    nav_about_desc: '柬埔寨贡布的骄傲，完美烘烤的醇香风味。',
    nav_product_quality: '卓越品质',
    nav_quality_desc: '纯正天然风味，环保地球优先！',
    nav_why_glass: '为何选择玻璃罐',
    nav_glass_desc: '呵护健康、保留纯味、爱护地球。',
    nav_eco_events: '环保公益活动',
    nav_eco_desc: '在关爱自然环境中持续成长',
    nav_shop_special: '选购特别限定版',
    nav_shop_all: '选购所有商品',
    nav_bundles_discount: '尊享套装 (立减 25%)',
    
    // Selectors & Controls
    lang_select_title: '语言切换',
    curr_select_title: '货币选择',
    
    // Product Attributes & Categories
    flavors_title: '风味甄选',
    flavor_honey_butter: '蜂蜜黄油',
    flavor_chili_lime: '辣椒青柠',
    size_pouch_100: '100克便携袋',
    size_jar_250: '250克玻璃罐',
    cat_all: '所有规格与风味 (4)',
    cat_bundles: '尊享组合',
    cat_jars: '250克玻璃罐',
    cat_pouches: '100克便携袋',
    
    // Actions & Buttons
    btn_add_to_cart: '加入购物袋',
    btn_added: '已加入购物袋!',
    btn_buy_now: '立即购买',
    btn_checkout: '前往结账',
    btn_place_order: '确认并提交订单',
    btn_back: '返回',
    btn_continue_shopping: '继续挑选',
    btn_processing: '正在处理订单...',
    btn_apply: '使用优惠',
    btn_unlock_discount: '首单尊享 15% 礼遇',
    btn_ask_ai: '咨询AI品鉴师',
    btn_tell_story: '分享您的体验',
    btn_start_autoship: '开启定期配送',
    btn_close: '关闭',
    cart_view_bag: '查看购物袋',

    // Hero & Bundles
    hero_title_1: '柬埔寨贡布的骄傲，',
    hero_title_2: '完美烘烤的醇香风味。',
    btn_go_shop: '前往商店选购',
    hero_batch_badge: '★ 贡布当地限量新鲜慢烤 ★',
    hero_bundle_offer_title: '立减 25%',
    hero_bundle_offer_sub: '切勿错过此套组优惠',
    btn_claim_offer: '立即领取优惠',
    hero_bundle_offer_desc: '购买手作腰果享 25% 优惠：蜂蜜黄油与辣椒青柠 250克玻璃罐装 ($20) 与 100克便携袋装 ($10)',
    btn_learn_more: '了解更多',
    flavor_pill_honey: '香浓蜂蜜黄油风味',
    flavor_pill_chili: '酸辣辣椒青柠风味',

    // Comparison & Macro Section
    compare_title_1: '探索我们的',
    compare_title_2: '独特与卓越',
    compare_col_kampot: '手作慢烤\n精品腰果',
    compare_col_others: '普通传统\n油炸坚果',
    macro_calories: '卡路里',
    macro_fat: '脂肪含量',
    macro_protein: '优质蛋白质',
    compare_others_badge: '其他普通坚果',
    btn_explore_products: '立即探索全系商品',
    compare_showing_all: '正在展示全部 4 款手作腰果',

    // Influencers & How to Enjoy
    influencer_title_1: '达人网红',
    influencer_title_2: '真实推荐口碑',
    influencer_subtitle: '倾听信赖并喜爱我们的达人分享',
    btn_shop_now: '立即选购',
    btn_watch_review: '观看评测',
    enjoy_title: '如何畅享美味',
    btn_see_recipes: '查看食谱',
    enjoy_combine_stir: '调配搅拌\n至细腻柔滑',
    enjoy_spread: '丝滑抹酱',
    enjoy_spread_desc: '涂抹于吐司、苏打饼干与水果',
    enjoy_blend: '元气冰沙',
    enjoy_blend_desc: '融入能量思慕昔与健康奶昔',
    enjoy_spoon: '直接享用',
    enjoy_spoon_desc: '开罐整勺品尝纯粹浓醇',
    enjoy_bake: '烘焙烹饪',
    enjoy_bake_desc: '点缀精致烘焙与可口甜点',
    creator_story: '创作者心声',
    shop_favorites: '选购心选好物',

    // Recipes & Community Feedback
    recipes_section_title_1: '吃出健康活力',
    recipes_section_title_2: '贡布丰收 - 创意食谱',
    time_minutes: '分钟',
    macro_kcal: '千卡',
    btn_view_more_recipes: '查看更多美味食谱',
    feedback_title_1: '客户',
    feedback_title_2: '真实口碑',
    feedback_subtitle: '您对我们的手作腰果有何评价？',
    feedback_tell_story: '分享您的体验故事',
    btn_share_feedback: '分享您的真实反馈',

    // Eco Pillars
    eco_pillar_1_title: '100% 可无限回收玻璃罐',
    eco_pillar_1_desc: '支持洗碗机清洗与永久重复使用，严密封存酥脆口感，从源头杜绝塑料废弃。',
    eco_pillar_2_title: '绝无任何人工添加剂',
    eco_pillar_2_desc: '仅甄选天然全食物原料：纯野生森林百花蜜、鲜炼发酵黄油与贡布艳阳辣椒。',
    eco_pillar_3_title: '支持公平贸易农户',
    eco_pillar_3_desc: '建立直接道德伙伴关系，全力支持柬埔寨南部世代耕作的腰果农户家庭。',
    eco_pillar_4_title: '清洁太阳能绿色工厂',
    eco_pillar_4_desc: '在我们的生态工厂中，采用清洁太阳能能源进行小批量低温细致慢烤。',

    // Footer
    footer_artisan_title: '手作慢烤精品腰果',
    footer_artisan_desc: '精选柬埔寨原产单一产区腰果小批量精心烘烤。随心挑选便携自封袋装或环保玻璃罐装。',
    footer_pouch_desc: '便携自封保鲜袋',
    footer_jar_desc: '密封保鲜玻璃罐',
    footer_honey_bullet: '100% 野生百花蜂蜜与天然精炼发酵黄油',
    footer_chili_bullet: '正宗贡布艳阳日晒辣椒与鲜摘青柠',
    footer_single_bullet: '柬埔寨贡布单一纯正原产',
    btn_order_now: '立即订购',
    footer_cta_msg: '柬埔寨贡布的骄傲，尽在手作慢烤。从第一口开始体验截然不同的醇美。',
    footer_sec_info: '信息资讯：',
    footer_sec_about: '关于我们：',
    footer_sec_shop: '商城选购：',
    footer_sec_more: '更多探索：',
    footer_contact: '联系客服',
    footer_wholesale: '大宗批发',
    footer_affiliate: '联盟推广',
    footer_account: '会员中心',
    footer_our_way: '品牌历程',
    footer_blogs: '文章故事',
    footer_faq: '常见问题',
    footer_products: '全部商品',
    footer_jars: '玻璃罐装',
    footer_kits: '超值套组',
    footer_gifts: '精选礼品',
    footer_privacy: '隐私政策',
    footer_terms: '服务条款',
    footer_labs: '化验报告',
    footer_track_order: '追踪订单',
    track_modal_title: '实时追踪您的订单',
    track_modal_subtitle: '输入您的贡布丰收订单编号，查看实时烘焙与配送进度。',
    track_input_label: '订单编号',
    track_input_placeholder: '例如 KH-2026-1042',
    track_btn_check: '查询状态',
    track_sample_label: '示例订单号：',
    track_est_delivery: '预计送达时间',
    track_current_loc: '当前所在位置',
    track_carrier: '绿色物流承运',
    track_Destination: '配送目的地',
    track_timeline_title: '实时物流追踪进度',
    track_items_title: '订单商品明细',

    // Subpages & Modals
    autoship_step_1: '1. 选择您喜爱的腰果风味与规格',
    autoship_step_2: '2. 选择配送周期',
    autoship_freq_30: '每 30 天配送一次（最受欢迎）',
    autoship_freq_45: '每 45 天配送一次',
    autoship_freq_60: '每 60 天配送一次',
    btn_explore_bundles: '探索立减 25% 优惠套组',
    calc_impact_title: '测算您的每周健康营养提升',
    calc_impact_desc: '看看将传统高油炸坚果换成贡布丰收手作慢烤腰果后，您能减少多少多余油脂与热量摄入。',
    calc_servings_label: '每周享用份数（每份 30克）：',
    calc_calories_saved: '每周节省热量',
    calc_fat_reduced: '每周减少脂肪',
    calc_plant_protein: '纯净植物蛋白',
    calc_oil_less: '减少 90% 不健康油脂',
    calc_density: '热量蛋白质密度翻倍',
    offer_modal_title: '首单尊享\n15% 专属礼遇',
    offer_modal_subtitle: '立即解锁：\n请选择您今日的健康生活目标',
    offer_goal_weight: '身材体重管理',
    offer_goal_protein: '高蛋白能量补充',
    offer_goal_lifestyle: '健康品质生活',
    offer_decline: '暂不享受，我愿按原价支付...',
    fb_modal_title: '分享您的故事与心得',
    fb_name_label: '您的姓名 *',
    fb_role_label: '职业 / 爱好（选填）',
    fb_msg_label: '您的评价、创新食谱或咨询建议 *',
    fb_placeholder_msg: '您如何享用贡布丰收手作腰果？',
    btn_submit_feedback: '提交真实反馈',
    fb_success_title: '感谢您的热情分享！',
    fb_success_desc: '我们的团队用心阅读每一份顾客心声与创新食谱，已为您的本次选购奉上 15% 感恩礼遇！',
    btn_done: '完成',
    recipe_ingredients_title: '所需食材：',
    recipe_prep_steps_title: '1分钟极速享用指南：',
    recipe_detail_protein: '优质蛋白质',
    recipe_detail_prep: '准备时间',
    recipe_detail_calories: '卡路里',
    btn_shop_recipe_ingredient: '选购此款原料',
    recipes_page_title: '风味腰果甄选食谱',
    recipes_all_tab: '全部食谱',
    btn_share_recipe: '分享您的独家食谱',
    
    // Cart & Checkout
    cart_title: '您的专属购物袋',
    cart_empty: '购物袋暂无商品',
    cart_subtotal: '商品小计',
    cart_shipping: '配送运费',
    cart_shipping_free: '已尊享全免运费无碎防破损包装!',
    cart_shipping_add_more: '即可享受免运费配送',
    cart_discount: '首单特惠 15% 折扣',
    cart_autoship_savings: '定期订购立省 15%',
    cart_total: '应付总额',
    cart_order_confirmed: '订单已成功确认!',
    cart_order_receipt_msg: '您的订单已录入系统，正在使用环保缓冲包装细致准备发货。',
    promo_code_label: '输入优惠代码',
    promo_code_placeholder: '例如 HARVEST15',
    
    // Customer Form
    form_full_name: '您的姓名',
    form_email: '电子邮箱地址',
    form_phone: '联系电话',
    form_address: '详细收货地址',
    form_city: '所在城市（如：金边、暹粒）',
    form_postal: '邮政编码',
    
    // Badges & Stock
    badge_in_stock: '有现货',
    badge_out_of_stock: '暂无库存',
    badge_organic: '100% 天然有机土壤',
    badge_single_origin: '柬埔寨单一产区',
    badge_pgi: '贡布原产地理标志认证',
  },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  t: (key: string, fallback?: string) => string;
  formatPrice: (amountInUSD: number) => string;
  currencies: typeof CURRENCIES;
  languages: typeof LANGUAGES;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load persisted language or default to 'EN'
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('kampot_lang') as Language;
      if (saved && (saved === 'EN' || saved === 'KM' || saved === 'ZH')) {
        return saved;
      }
    } catch {}
    return 'EN';
  });

  // Default currency is USD ($)
  const [currency, setCurrencyState] = useState<Currency>(() => {
    try {
      localStorage.setItem('kampot_curr', 'USD');
    } catch {}
    return 'USD';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('kampot_lang', lang);
    } catch {}
  };

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    try {
      localStorage.setItem('kampot_curr', curr);
    } catch {}
  };

  // Translation helper
  const t = (key: string, fallback?: string): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.EN;
    return dict[key] || fallback || TRANSLATIONS.EN[key] || key;
  };

  // Accurate currency formatter (never just swaps symbol)
  const formatPrice = (amountInUSD: number): string => formatCurrency(amountInUSD, currency);

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        currency,
        setCurrency,
        t,
        formatPrice,
        currencies: CURRENCIES,
        languages: LANGUAGES,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
