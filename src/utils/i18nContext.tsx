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
    btn_see_more: 'See More',
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

    // Additional Navigation & Admin
    nav_inventory: 'Inventory',
    nav_inventory_overview: 'Inventory Overview',
    btn_back_to_store: 'Back to Store',

    // Account & Authentication
    account_sign_in_tab: 'Sign In',
    account_register_tab: 'Create Account',
    account_sign_out: 'Sign Out',
    account_status_active: 'Active',
    account_admin_desc: 'View and manage full business product inventory',
    account_vip_discount: '15% VIP Discount',
    account_apply_bag: 'Apply to your shopping bag',
    account_autoship_desc: 'Manage recurring jar deliveries',
    account_track_desc: 'Check live delivery progress',
    account_checkout_note: 'Delivery address & phone are asked only at checkout.',
    account_login_subtitle: 'Sign in to access your 15% VIP discount and Autoship perks.',
    account_register_subtitle: 'Quick sign-up — delivery address and phone are only asked when you order.',
    form_password: 'Password',
    form_confirm_password: 'Confirm Password',
    btn_creating_account: 'Creating Account...',
    btn_signing_in: 'Signing In...',
    account_demo_accounts: 'Demo accounts:',
    account_demo_user: 'Normal User Demo',
    account_demo_admin: 'Admin Demo',

    // Product Names & Package
    product_honey_butter_name: 'Honey Butter Artisan Cashews',
    product_chili_lime_name: 'Chili Lime Artisan Cashews',
    bundle_complete_4pack_name: 'The Complete Harvest 4-Pack',
    bundle_complete_4pack_desc: 'Includes 2× 250g Glass Jars & 2× 100g Pouches (Both Honey Butter & Chili Lime).',
    bundle_jars_duo_name: 'Artisan Glass Jars Duo (2× 250g)',
    bundle_jars_duo_desc: '1× Honey Butter (250g Jar) & 1× Chili Lime (250g Jar) in Airtight Glass Jars.',
    bundle_pouches_duo_name: 'Pocket Snack Pouches Duo (2× 100g)',
    bundle_pouches_duo_desc: '1× Honey Butter (100g Pouch) & 1× Chili Lime (100g Pouch) in Resealable Pouches.',
    bundle_included_box: 'Included in Your Box:',
    package_size_label: 'Package Size',
    macro_sugar: 'Sugar',
    ingredients_label: 'Ingredients',
    recipe_made_with: 'Made with',

    // Stock Status & Alerts
    stock_product_out_of_stock: 'Product is Out of Stock',
    stock_currently_out_of_stock: 'This product is currently Out of Stock.',
    stock_in_stock: 'In Stock',
    stock_only_left: 'Only {count} left',

    // Hero Stats & Features
    hero_stat_1_top: '90%',
    hero_stat_1_bottom: 'Less fat',
    hero_stat_2_top: 'Double',
    hero_stat_2_bottom: 'Protein',
    hero_stat_3_top: '100%',
    hero_stat_3_bottom: 'natural',
    hero_stat_4_top: '1/3',
    hero_stat_4_bottom: 'Calories',
    hero_stat_5_top: '2×',
    hero_stat_5_bottom: 'Protein',
    hero_feat_real_nuts_title: 'Made From\nReal Nuts',
    hero_feat_real_nuts_headline: '100% From Real Nuts',
    hero_feat_real_nuts_detail: 'Crafted from premium roasted Kampot cashews with zero fillers, preservatives, or artificial stabilizers. Just pure nut goodness in every handful.',
    hero_feat_slow_roasted_title: 'Slow\nRoasted',
    hero_feat_slow_roasted_headline: 'Small-Batch Roasted Perfection',
    hero_feat_slow_roasted_detail: 'Slow dry-roasting locks in natural aroma, micronutrients, and rich buttery crunch without deep-frying in heavy industrial oils.',
    hero_feat_no_sugar_title: 'No Refined\nSugar',
    hero_feat_no_sugar_headline: 'No Refined Sugar',
    hero_feat_no_sugar_detail: 'Zero refined white sugar, zero corn syrup, and zero artificial sweeteners. Glazed only with pure wildflower honey or natural citrus.',
    hero_feat_no_flavoring_title: 'No Artificial\nFlavoring',
    hero_feat_no_flavoring_headline: 'No Artificial Flavoring',
    hero_feat_no_flavoring_detail: 'No chemical extracts, no synthetic aromas, and no artificial preservatives. What you taste is 100% authentic Kampot cashews.',
    hero_feat_double_protein_title: 'Nutrient\nDense',
    hero_feat_double_protein_headline: 'High Clean Plant Protein & Healthy Fats',
    hero_feat_double_protein_detail: 'Naturally packed with magnesium, zinc, and healthy monounsaturated fats to fuel your active day with sustained clean energy.',

    // Smart Recommendations & Replacements
    rec_available_alt: 'Available Alternative — In Stock Now',
    rec_in_stock: 'in stock',
    rec_view_option: 'View Option',
    rec_replacements: 'Recommended In-Stock Replacements',
    rec_curated: 'Curated For Your Taste',
    rec_available_alternatives: 'Available Alternatives & Related Products',
    rec_related: 'Related Products',
    rec_you_may_like: 'You May Also Like',
    rec_bought_together: 'Frequently Bought Together',
    rec_view_product: 'View Product',

    // Cart, Checkout & Order Extras
    checkout_insufficient_stock: 'Unable to place order due to insufficient stock.',
    order_num_prefix: 'Order #',
    order_confirmed_suffix: 'Confirmed!',
    cart_autoship_badge: 'Autoship & Save (15% Off)',
    promo_applied: 'Applied ✓',
    cart_shipping_free_badge: 'FREE',
    cart_explore_flavors: 'Explore our artisan roasted Kampot cashews in Honey Butter and Chili Lime.',
    nav_rewards_title: 'Botenz Rewards & Bundles',
    nav_autoship_title: 'Botenz Autoship & Save',
    autoship_headline: 'Never Run Out of Clean Nut Protein — Save Extra 15%',
    autoship_subdesc: 'Subscribe to your favorite glass-jar nut butter powders on your schedule. Pause, swap flavors, or cancel anytime with one click.',
    btn_create_account_autoship: 'Create Account to Start Autoship',
    way_story_title: 'The Kampot Way: Pure, Glass-Sealed & Artisan Roasted',
    way_story_desc: 'Why we craft our cashews in reusable glass jars—and why fair trade, zero refined sugar, and small-batch roasting make all the difference for your body and the planet.',
    calc_servings_unit: 'servings / week',

    // Timeline & Order Tracking Status
    track_checking: 'Checking...',
    order_placed_prefix: 'Placed',
    order_tracking_prefix: 'Tracking',
    order_status_in_transit: 'In Transit',
    order_status_out_for_delivery: 'Out for Delivery',
    order_status_delivered: 'Delivered',
    order_status_processing: 'Processing',
    timeline_order_placed: 'Order Placed',
    timeline_order_confirmed: 'Order Confirmed',
    timeline_batch_roasted: 'Small-Batch Roasted',
    timeline_dispatched: 'Dispatched with Eco-Courier',
    timeline_local_hub: 'Arrived at Local Hub',
    timeline_out_for_delivery: 'Out for Delivery',
    timeline_delivered: 'Delivered',

    // Feedback Modal Extras
    fb_error_required: 'Please enter your name and your Kampot Harvest story or recipe.',
    fb_name_placeholder: 'e.g. Sokha Chan',
    fb_role_placeholder: 'e.g. Nutrition Coach, Home Baker, Runner',

    // AI Sommelier
    sommelier_title: 'Kampot AI Sommelier',
    sommelier_subtitle: 'Artisan Flavor & Pairing Assistant',
    sommelier_welcome: 'Greetings! I am your Kampot Harvest AI Sommelier. Ask me anything about our artisan cashews, Kampot terroir, flavor profiles, or gourmet culinary pairings.',
    sommelier_loading: 'Consulting Kampot culinary sommelier...',
    sommelier_placeholder: 'Ask about pairings, recipes, or flavor notes...',

    // Recipe Names
    recipe_1_title: 'Pistachio Kunafa Toast',
    recipe_2_title: 'Cashew Butter Noodle Bowl',
    recipe_3_title: 'Almond Protein Pancakes',
    recipe_4_title: 'Peanut Butter Smoothie Bowl',
    recipe_5_title: 'Chocolate Crunch Energy Balls',
    recipe_6_title: 'Thai Cashew Salad Dressing',
    recipe_7_title: 'Golden Turmeric Cashew Latte',
    recipe_8_title: 'Crispy Honey Butter Snack Mix',

    // Customer Reviews
    review_1_text: '“Finally, real roasted cashews with authentic wildflower honey! The Honey Butter 250g Jar is pure bliss.”',
    review_2_text: '“Game changer for artisan snacking. Fresh Kampot crunch, single-origin cashews, glass jar looks gorgeous on the table.”',
    review_3_text: '“Our whole family loves the Chili Lime flavor. The heat from Kampot bird’s eye chili with fresh lime zest is unbeatable.”',

    // Toast Messages
    toast_signed_out_admin: 'Signed out of administrator session.',
    toast_signed_in_as: 'Signed in as',
    toast_signed_out: 'Signed out of your Kampot Harvest account.',
    toast_vip_applied: '15% VIP Member Discount (HARVEST15) applied to bag!',
    toast_wholesale_added: 'Added Wholesale Master Case (24× 250g Jars) to Bag!',

    // Product Descriptions & Prompts
    product_honey_butter_desc: 'Slow-roasted Kampot cashews glazed with pure wildflower honey and cultured butter in small batches.',
    product_chili_lime_desc: 'Slow-roasted Kampot cashews dusted with authentic Kampot bird’s eye chili and zesty lime.',
    cart_add_prefix: 'Add',
    cart_confirmed_desc_prefix: 'Thank you,',
    cart_confirmed_desc_body: '! Your freshly roasted Kampot Harvest order is confirmed in our system and being packed for delivery to',
    sommelier_prompt_1: '🍷 What pairs best with wine, whiskey, or craft beer?',
    sommelier_prompt_2: '🧀 Which flavor works best on a gourmet cheese board?',
    sommelier_prompt_3: '🌶️ Tell me about the Kampot bird’s eye chili in Chili Lime',
    sommelier_prompt_4: '🎁 What is the most popular gift bundle?',
    sommelier_fallback_reply: "For a rich, buttery treat, try our Honey Butter Cashews. For bold zest and lingering warmth, our Chili Lime Cashews with Kampot bird's eye chili are unbeatable!",
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
    btn_see_more: 'មើលបន្ថែម',
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

    // Additional Navigation & Admin
    nav_inventory: 'បញ្ជីសារពើភ័ណ្ឌ',
    nav_inventory_overview: 'ទិដ្ឋភាពទូទៅនៃសារពើភ័ណ្ឌ',
    btn_back_to_store: 'ត្រឡប់ទៅហាងវិញ',

    // Account & Authentication
    account_sign_in_tab: 'ចូលគណនី',
    account_register_tab: 'បង្កើតគណនី',
    account_sign_out: 'ចាកចេញ',
    account_status_active: 'សកម្ម',
    account_admin_desc: 'មើល និងគ្រប់គ្រងសារពើភ័ណ្ឌផលិតផលអាជីវកម្មទាំងមូល',
    account_vip_discount: 'បញ្ចុះតម្លៃ ១៥% សម្រាប់សមាជិក VIP',
    account_apply_bag: 'អនុវត្តទៅកន្ត្រកទំនិញរបស់អ្នក',
    account_autoship_desc: 'គ្រប់គ្រងការដឹកជញ្ជូនក្រឡកែវប្រចាំខែ',
    account_track_desc: 'ពិនិត្យដំណើរការដឹកជញ្ជូនផ្ទាល់',
    account_checkout_note: 'អាសយដ្ឋានដឹកជញ្ជូន និងលេខទូរស័ព្ទនឹងត្រូវបានសួរនៅពេលទូទាត់ប្រាក់ប៉ុណ្ណោះ។',
    account_login_subtitle: 'ចូលគណនីដើម្បីទទួលបានការបញ្ចុះតម្លៃ ១៥% VIP និងអត្ថប្រយោជន៍កុម្ម៉ង់ប្រចាំខែ។',
    account_register_subtitle: 'ចុះឈ្មោះរហ័ស — អាសយដ្ឋានដឹកជញ្ជូន និងទូរស័ព្ទនឹងត្រូវបានសួរនៅពេលបញ្ជាទិញ។',
    form_password: 'ពាក្យសម្ងាត់',
    form_confirm_password: 'បញ្ជាក់ពាក្យសម្ងាត់',
    btn_creating_account: 'កំពុងបង្កើតគណនី...',
    btn_signing_in: 'កំពុងចូលគណនី...',
    account_demo_accounts: 'គណនីសាកល្បង៖',
    account_demo_user: 'គណនីអ្នកប្រើប្រាស់ទូទៅ',
    account_demo_admin: 'គណនីអ្នកគ្រប់គ្រង',

    // Product Names & Package
    product_honey_butter_name: 'គ្រាប់ស្វាយចន្ទីសិប្បកម្ម រសជាតិទឹកឃ្មុំប៊័រ',
    product_chili_lime_name: 'គ្រាប់ស្វាយចន្ទីសិប្បកម្ម រសជាតិម្ទេសក្រូចឆ្មា',
    bundle_complete_4pack_name: 'ឈុតពេញលេញ ៤ មុខ កំពត ហារវេស',
    bundle_complete_4pack_desc: 'រួមបញ្ចូលក្រឡកែវ ២៥០ក្រាម ចំនួន ២ និងកញ្ចប់ ១០០ក្រាម ចំនួន ២ (ទាំងរសជាតិទឹកឃ្មុំប៊័រ និងម្ទេសក្រូចឆ្មា)',
    bundle_jars_duo_name: 'ឈុតក្រឡកែវសិប្បកម្ម ២ ក្រឡ (២× ២៥០ក្រាម)',
    bundle_jars_duo_desc: '១× ទឹកឃ្មុំប៊័រ (ក្រឡកែវ ២៥០ក្រាម) និង ១× ម្ទេសក្រូចឆ្មា (ក្រឡកែវ ២៥០ក្រាម) ក្នុងក្រឡកែវការពារខ្យល់',
    bundle_pouches_duo_name: 'ឈុតកញ្ចប់ដាក់ហោប៉ៅ ២ កញ្ចប់ (២× ១០០ក្រាម)',
    bundle_pouches_duo_desc: '១× ទឹកឃ្មុំប៊័រ (កញ្ចប់ ១០០ក្រាម) និង ១× ម្ទេសក្រូចឆ្មា (កញ្ចប់ ១០០ក្រាម) ក្នុងកញ្ចប់បិទជិត',
    bundle_included_box: 'រួមបញ្ចូលក្នុងប្រអប់របស់អ្នក៖',
    package_size_label: 'ទំហំកញ្ចប់',
    macro_sugar: 'ជាតិស្ករ',
    ingredients_label: 'គ្រឿងផ្សំ',
    recipe_made_with: 'ផលិតជាមួយ',

    // Stock Status & Alerts
    stock_product_out_of_stock: 'ផលិតផលអស់ពីស្តុកហើយ',
    stock_currently_out_of_stock: 'ផលិតផលនេះបច្ចុប្បន្នអស់ពីស្តុកហើយ។',
    stock_in_stock: 'មានក្នុងស្តុក',
    stock_only_left: 'សល់ត្រឹមតែ {count} ប៉ុណ្ណោះ',

    // Hero Stats & Features
    hero_stat_1_top: '៩០%',
    hero_stat_1_bottom: 'ខ្លាញ់តិចជាង',
    hero_stat_2_top: 'ទ្វេដង',
    hero_stat_2_bottom: 'ប្រូតេអ៊ីន',
    hero_stat_3_top: '១០០%',
    hero_stat_3_bottom: 'ធម្មជាតិ',
    hero_stat_4_top: '១/៣',
    hero_stat_4_bottom: 'កាឡូរី',
    hero_stat_5_top: '២×',
    hero_stat_5_bottom: 'ប្រូតេអ៊ីន',
    hero_feat_real_nuts_title: 'ផលិតពី\nគ្រាប់ពិតៗ',
    hero_feat_real_nuts_headline: '១០០% ពីគ្រាប់ស្វាយចន្ទីពិត',
    hero_feat_real_nuts_detail: 'ផលិតចេញពីគ្រាប់ស្វាយចន្ទីកំពតលីងគុណភាពខ្ពស់ គ្មានសារធាតុរក្សាទុក ឬជាតិគីមីឡើយ។ ផ្តល់នូវរសជាតិធម្មជាតិពិតៗគ្រប់គ្រាប់។',
    hero_feat_slow_roasted_title: 'លីងយឺតៗ\nបែបបុរាណ',
    hero_feat_slow_roasted_headline: 'លីងក្នុងបរិមាណតិចតួចយ៉ាងល្អឥតខ្ចោះ',
    hero_feat_slow_roasted_detail: 'ការលីងយឺតៗដោយកម្ដៅស្ងួតជួយរក្សាក្លិនក្រអូប ជីវជាតិ និងភាពស្រួយឆ្ងាញ់ ដោយមិនបាច់បំពងក្នុងប្រេងឧស្សាហកម្មឡើយ។',
    hero_feat_no_sugar_title: 'គ្មានជាតិស្ករ\nកែច្នៃ',
    hero_feat_no_sugar_headline: 'គ្មានជាតិស្ករសកែច្នៃ',
    hero_feat_no_sugar_detail: 'គ្មានស្ករស គ្មានទឹកស៊ីរ៉ូ និងគ្មានជាតិផ្អែមសិប្បនិម្មិត។ ស្រោបតែជាមួយទឹកឃ្មុំព្រៃធម្មជាតិ និងក្រូចឆ្មាស្រស់ប៉ុណ្ណោះ។',
    hero_feat_no_flavoring_title: 'គ្មានក្លិន\nសិប្បនិម្មិត',
    hero_feat_no_flavoring_headline: 'គ្មានសារធាតុបង្កើតក្លិនសិប្បនិម្មិត',
    hero_feat_no_flavoring_detail: 'គ្មានសារធាតុគីមី គ្មានក្លិនសំយោគ និងគ្មានជាតិគីមីការពារផ្អួរ។ អ្វីដែលអ្នកភ្លក្សគឺជាគ្រាប់ស្វាយចន្ទីកំពតសុទ្ធ ១០០%។',
    hero_feat_double_protein_title: 'សម្បូរ\nសារធាតុចិញ្ចឹម',
    hero_feat_double_protein_headline: 'ប្រូតេអ៊ីនរុក្ខជាតិស្អាតខ្ពស់ និងខ្លាញ់ល្អ',
    hero_feat_double_protein_detail: 'សម្បូរទៅដោយម៉ាញ៉េស្យូម ស័ង្កសី និងខ្លាញ់មិនទាន់ឆ្អែតល្អសម្រាប់សុខភាព ដើម្បីផ្តល់ថាមពលពេញមួយថ្ងៃ។',

    // Smart Recommendations & Replacements
    rec_available_alt: 'ជម្រើសជំនួសដែលអាចរកបាន — មានក្នុងស្តុកឥឡូវនេះ',
    rec_in_stock: 'ក្នុងស្តុក',
    rec_view_option: 'មើលជម្រើស',
    rec_replacements: 'ទំនិញជំនួសដែលត្រូវបានណែនាំក្នុងស្តុក',
    rec_curated: 'ជ្រើសរើសពិសេសសម្រាប់ចំណង់ចំណូលចិត្តរបស់អ្នក',
    rec_available_alternatives: 'ជម្រើសដែលអាចរកបាន និងផលិតផលពាក់ព័ន្ធ',
    rec_related: 'ផលិតផលពាក់ព័ន្ធ',
    rec_you_may_like: 'អ្នកក៏ប្រហែលជាចូលចិត្ត',
    rec_bought_together: 'ទំនិញដែលតែងតែទិញជាមួយគ្នា',
    rec_view_product: 'មើលផលិតផល',

    // Cart, Checkout & Order Extras
    checkout_insufficient_stock: 'មិនអាចបញ្ជាទិញបានទេ ដោយសារចំនួនស្តុកមិនគ្រប់គ្រាន់។',
    order_num_prefix: 'ការបញ្ជាទិញលេខ ',
    order_confirmed_suffix: 'ទទួលបានជោគជ័យ!',
    cart_autoship_badge: 'កុម្ម៉ង់ប្រចាំខែ (បញ្ចុះ ១៥%)',
    promo_applied: 'បានអនុវត្ត ✓',
    cart_shipping_free_badge: 'ឥតគិតថ្លៃ',
    cart_explore_flavors: 'ស្វែងយល់ពីគ្រាប់ស្វាយចន្ទីកំពតលីងសិប្បកម្មរសជាតិទឹកឃ្មុំប៊័រ និងម្ទេសក្រូចឆ្មា។',
    nav_rewards_title: 'រង្វាន់ និងឈុតពិសេស',
    nav_autoship_title: 'កុម្ម៉ង់ប្រចាំខែ និងការសន្សំសំចៃ',
    autoship_headline: 'មិនដែលខ្វះប្រូតេអ៊ីនស្អាតពីគ្រាប់ធញ្ញជាតិ — សន្សំថែម ១៥%',
    autoship_subdesc: 'កុម្ម៉ង់ជាប្រចាំនូវគ្រាប់ស្វាយចន្ទីក្រឡកែវតាមកាលវិភាគរបស់អ្នក។ ផ្អាក ប្តូររសជាតិ ឬបោះបង់នៅពេលណាក៏បានដោយគ្រាន់តែចុចម្តង។',
    btn_create_account_autoship: 'បង្កើតគណនីដើម្បីចាប់ផ្តើមកុម្ម៉ង់ប្រចាំខែ',
    way_story_title: 'ដំណើរជីវិតកំពត៖ ធម្មជាតិសុទ្ធ ក្រឡកែវ និងលីងបែបសិប្បកម្ម',
    way_story_desc: 'មូលហេតុដែលយើងវេចខ្ចប់ក្នុងក្រឡកែវប្រើឡើងវិញបាន—និងមូលហេតុដែលពាណិជ្ជកម្មយុត្តិធម៌ គ្មានស្ករកែច្នៃ និងការលីងក្នុងបរិមាណតិចតួចបង្កើតភាពខុសប្លែកសម្រាប់សុខភាព និងផែនដី។',
    calc_servings_unit: 'ការទទួលទាន / សប្តាហ៍',

    // Timeline & Order Tracking Status
    track_checking: 'កំពុងពិនិត្យ...',
    order_placed_prefix: 'កាលបរិច្ឆេទបញ្ជាទិញ',
    order_tracking_prefix: 'លេខតាមដាន',
    order_status_in_transit: 'កំពុងដឹកជញ្ជូន',
    order_status_out_for_delivery: 'កំពុងចេញដឹកជញ្ជូន',
    order_status_delivered: 'បានដឹកជញ្ជូនដល់',
    order_status_processing: 'កំពុងរៀបចំ',
    timeline_order_placed: 'បានបញ្ជាទិញ',
    timeline_order_confirmed: 'ការបញ្ជាទិញត្រូវបានបញ្ជាក់',
    timeline_batch_roasted: 'លីងថ្មីៗក្នុងបរិមាណតិចតួច',
    timeline_dispatched: 'បានប្រគល់ជូនអ្នកដឹកជញ្ជូន',
    timeline_local_hub: 'បានមកដល់មជ្ឈមណ្ឌលចែកចាយ',
    timeline_out_for_delivery: 'កំពុងចេញដឹកជញ្ជូនដល់ផ្ទះ',
    timeline_delivered: 'បានដឹកជញ្ជូនជោគជ័យ',

    // Feedback Modal Extras
    fb_error_required: 'សូមបញ្ចូលឈ្មោះ និងរឿងរ៉ាវ ឬរូបមន្តម្ហូបរបស់អ្នក។',
    fb_name_placeholder: 'ឧ. សុខា ចាន់',
    fb_role_placeholder: 'ឧ. គ្រូបង្វឹកអាហារូបត្ថម្ភ, អ្នកដុតនំ, អ្នករត់ប្រណាំង',

    // AI Sommelier
    sommelier_title: 'អ្នកជំនាញរសជាតិ AI កំពត',
    sommelier_subtitle: 'ជំនួយការផ្គូផ្គងរសជាតិសិប្បកម្ម',
    sommelier_welcome: 'សូមជម្រាបសួរ! ខ្ញុំជាអ្នកជំនាញរសជាតិ AI របស់ កំពត ហារវេស។ សូមសួរខ្ញុំអំពីគ្រាប់ស្វាយចន្ទីសិប្បកម្ម ដីកំពត រសជាតិ ឬការផ្គូផ្គងជាមួយម្ហូបអាហារផ្សេងៗ។',
    sommelier_loading: 'កំពុងពិគ្រោះជាមួយអ្នកជំនាញរសជាតិកំពត...',
    sommelier_placeholder: 'សួរអំពីការផ្គូផ្គង រូបមន្ត ឬរសជាតិ...',

    // Recipe Names
    recipe_1_title: 'នំប៉័ងដុត ភីស្តាឈីអូ គូណាហ្វា',
    recipe_2_title: 'មីគោកប៊័រគ្រាប់ស្វាយចន្ទី',
    recipe_3_title: 'នំផេនខេកប្រូតេអ៊ីន អាល់ម៉ុន',
    recipe_4_title: 'ចានទឹកក្រឡុកប៊័រសណ្តែកដី',
    recipe_5_title: 'ដុំថាមពលសូកូឡាស្រួយ',
    recipe_6_title: 'ទឹកជ្រលក់សាឡាត់គ្រាប់ស្វាយចន្ទី',
    recipe_7_title: 'ឡាតេគ្រាប់ស្វាយចន្ទីរមៀតមាស',
    recipe_8_title: 'គ្រាប់ស្វាយចន្ទីលីងទឹកឃ្មុំប៊័រស្រួយ',

    // Customer Reviews
    review_1_text: '«ទីបំផុត បានញ៉ាំគ្រាប់ស្វាយចន្ទីលីងពិតៗជាមួយទឹកឃ្មុំព្រៃធម្មជាតិ! រសជាតិទឹកឃ្មុំប៊័រក្នុងក្រឡកែវ ២៥០ក្រាម គឺពិតជាឆ្ងាញ់អស្ចារ្យ។»',
    review_2_text: '«ផ្លាស់ប្តូរទម្លាប់ញ៉ាំអាហារសម្រន់ទាំងស្រុង។ គ្រាប់ស្វាយចន្ទីកំពតស្រួយស្រស់ ប្រភពដើមសុទ្ធ ក្រឡកែវដាក់លើតុយ៉ាងប្រណីត។»',
    review_3_text: '«ក្រុមគ្រួសារខ្ញុំទាំងមូលចូលចិត្តរសជាតិម្ទេសក្រូចឆ្មា។ ភាពហឹរឈ្ងុយនៃម្ទេសអាចម៍សត្វកំពតជាមួយក្រូចឆ្មាស្រស់ ពិតជាគ្មានអ្វីប្រៀបបាន។»',

    // Toast Messages
    toast_signed_out_admin: 'បានចាកចេញពីសម័យគ្រប់គ្រង។',
    toast_signed_in_as: 'បានចូលគណនីជា',
    toast_signed_out: 'បានចាកចេញពីគណនី កំពត ហារវេស របស់អ្នក។',
    toast_vip_applied: 'បានអនុវត្តការបញ្ចុះតម្លៃ ១៥% សមាជិក VIP (HARVEST15) ទៅកន្ត្រក!',
    toast_wholesale_added: 'បានបន្ថែមឈុតលក់ដុំធំ (២៤× ក្រឡកែវ ២៥០ក្រាម) ទៅកន្ត្រក!',

    // Product Descriptions & Prompts
    product_honey_butter_desc: 'គ្រាប់ស្វាយចន្ទីកំពតលីងតាមកម្ដៅតិចៗ ស្រោបដោយទឹកឃ្មុំព្រៃធម្មជាតិ និងប៊័រស្រស់យ៉ាងឈ្ងុយឆ្ងាញ់។',
    product_chili_lime_desc: 'គ្រាប់ស្វាយចន្ទីកំពតលីងកម្ដៅតិចៗ ជាមួយម្ទេសអាចម៍សត្វកំពតពិតៗ និងក្រូចឆ្មាស្រស់ហឹរឈ្ងុយ។',
    cart_add_prefix: 'បន្ថែម',
    cart_confirmed_desc_prefix: 'សូមអរគុណ',
    cart_confirmed_desc_body: '! ការកុម្ម៉ង់គ្រាប់ស្វាយចន្ទីលីងស្រស់ៗរបស់អ្នកត្រូវបានបញ្ជាក់ ហើយកំពុងរៀបចំដឹកជញ្ជូនទៅកាន់',
    sommelier_prompt_1: '🍷 តើអ្វីដែលត្រូវគ្នាបំផុតជាមួយស្រាក្រហម វីស្គី ឬស្រាបៀរ?',
    sommelier_prompt_2: '🧀 តើរូបមន្តរសជាតិមួយណាដែលល្អបំផុតសម្រាប់ថាសឈីស?',
    sommelier_prompt_3: '🌶️ ប្រាប់ខ្ញុំអំពីម្ទេសអាចម៍សត្វកំពតនៅក្នុងរសជាតិម្ទេសក្រូចឆ្មា',
    sommelier_prompt_4: '🎁 តើកញ្ចប់កាដូមួយណាដែលពេញនិយមជាងគេ?',
    sommelier_fallback_reply: 'សម្រាប់រសជាតិផ្អែមឈ្ងុយប៊័រ សូមសាកល្បងគ្រាប់ស្វាយចន្ទីទឹកឃ្មុំប៊័រ។ សម្រាប់រសជាតិហឹរឈ្ងុយស្រស់ស្រាយ គ្រាប់ស្វាយចន្ទីម្ទេសក្រូចឆ្មាជាមួយម្ទេសអាចម៍សត្វកំពត ពិតជាគ្មានអ្វីប្រៀបបានឡើយ!',
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
    btn_see_more: '查看更多',
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

    // Additional Navigation & Admin
    nav_inventory: '库存概览',
    nav_inventory_overview: '库存管理概览',
    btn_back_to_store: '返回商城',

    // Account & Authentication
    account_sign_in_tab: '登录账户',
    account_register_tab: '创建新账户',
    account_sign_out: '退出登录',
    account_status_active: '正常激活',
    account_admin_desc: '查看并管理全店商品库存',
    account_vip_discount: 'VIP 会员立减 15% 礼遇',
    account_apply_bag: '立即应用至购物袋',
    account_autoship_desc: '管理定期配送计划',
    account_track_desc: '实时查看物流进展',
    account_checkout_note: '收货地址与联系电话仅在结账时填写。',
    account_login_subtitle: '登录即可享受 15% VIP 优惠及定期配送特权。',
    account_register_subtitle: '快捷注册 — 配送地址与电话仅在下单结账时需要。',
    form_password: '登录密码',
    form_confirm_password: '确认密码',
    btn_creating_account: '正在创建账户...',
    btn_signing_in: '正在登录...',
    account_demo_accounts: '测试账户：',
    account_demo_user: '普通用户演示',
    account_demo_admin: '管理员演示',

    // Product Names & Package
    product_honey_butter_name: '蜂蜜黄油手作慢烤腰果',
    product_chili_lime_name: '辣椒青柠手作慢烤腰果',
    bundle_complete_4pack_name: '贡布丰收4件全享尊享套组',
    bundle_complete_4pack_desc: '内含 250克玻璃罐装 2 罐及 100克便携袋装 2 袋（同时涵盖蜂蜜黄油与辣椒青柠双重风味）。',
    bundle_jars_duo_name: '手作典藏玻璃双罐套组 (2× 250克)',
    bundle_jars_duo_desc: '1罐蜂蜜黄油（250克）与1罐辣椒青柠（250克）密封保鲜玻璃罐装。',
    bundle_pouches_duo_name: '随身便携自封双袋套组 (2× 100克)',
    bundle_pouches_duo_desc: '1袋蜂蜜黄油（100克）与1袋辣椒青柠（100克）轻便自封保鲜袋装。',
    bundle_included_box: '礼盒所含商品清单：',
    package_size_label: '包装规格',
    macro_sugar: '糖分',
    ingredients_label: '主要配料',
    recipe_made_with: '所用原料',

    // Stock Status & Alerts
    stock_product_out_of_stock: '该商品已售罄',
    stock_currently_out_of_stock: '此商品当前暂无库存。',
    stock_in_stock: '有现货',
    stock_only_left: '仅剩 {count} 件',

    // Hero Stats & Features
    hero_stat_1_top: '90%',
    hero_stat_1_bottom: '更低油脂',
    hero_stat_2_top: '双倍',
    hero_stat_2_bottom: '优质蛋白',
    hero_stat_3_top: '100%',
    hero_stat_3_bottom: '天然纯粹',
    hero_stat_4_top: '1/3',
    hero_stat_4_bottom: '轻卡低热',
    hero_stat_5_top: '2×',
    hero_stat_5_bottom: '高蛋白质',
    hero_feat_real_nuts_title: '整颗原粒\n真材实料',
    hero_feat_real_nuts_headline: '100% 原粒特级腰果',
    hero_feat_real_nuts_detail: '甄选柬埔寨贡布顶级腰果烘烤，零填充剂、零防腐剂、零人工乳化剂。每一口都是大自然原汁原味的坚果香气。',
    hero_feat_slow_roasted_title: '小批量\n低温慢烤',
    hero_feat_slow_roasted_headline: '小批量精细慢烤极致风味',
    hero_feat_slow_roasted_detail: '低温干烤牢牢锁住天然坚果油脂与微量营养元素，香脆不焦，告别传统高油深炸。',
    hero_feat_no_sugar_title: '零添加\n精制白糖',
    hero_feat_no_sugar_headline: '不含精炼白糖',
    hero_feat_no_sugar_detail: '零白砂糖、零高果糖浆、零人工甜味剂。仅使用纯天然野生百花原蜜与鲜榨青柠汁增味。',
    hero_feat_no_flavoring_title: '绝无\n人工香精',
    hero_feat_no_flavoring_headline: '无任何化学调味剂',
    hero_feat_no_flavoring_detail: '无化学提取香精、无合成香气，品尝到的每一口皆是纯正柬埔寨贡布腰果天然香郁。',
    hero_feat_double_protein_title: '高密度\n充沛营养',
    hero_feat_double_protein_headline: '丰富植物蛋白与天然良性油脂',
    hero_feat_double_protein_detail: '天然富含镁、锌与单不饱和健康脂肪酸，为活力日常提供源源不断的纯净持久能量。',

    // Smart Recommendations & Replacements
    rec_available_alt: '可用替代方案 — 现货即发',
    rec_in_stock: '件现货',
    rec_view_option: '查看规格',
    rec_replacements: '精选有现货的替代推荐',
    rec_curated: '为您量身甄选',
    rec_available_alternatives: '现货替代方案与相关优选',
    rec_related: '相关甄选商品',
    rec_you_may_like: '猜您可能也喜欢',
    rec_bought_together: '常被一同选购',
    rec_view_product: '查看详情',

    // Cart, Checkout & Order Extras
    checkout_insufficient_stock: '由于库存不足，无法提交订单。',
    order_num_prefix: '订单编号 #',
    order_confirmed_suffix: '已确认!',
    cart_autoship_badge: '定期订购立享 15% 优惠',
    promo_applied: '已成功应用 ✓',
    cart_shipping_free_badge: '包邮免费',
    cart_explore_flavors: '探索我们选用贡布特级腰果精制的蜂蜜黄油与辣椒青柠双重风味。',
    nav_rewards_title: '会员礼遇与超值套组',
    nav_autoship_title: '定期配送省心省钱',
    autoship_headline: '高品质纯净坚果蛋白从不断供 — 享额外 15% 优惠',
    autoship_subdesc: '按您的生活节奏定期配送心仪的玻璃罐装坚果。一键暂停、随心更换口味或随时取消。',
    btn_create_account_autoship: '创建账户以开启定期配送',
    way_story_title: '贡布之道：纯净天然、密封玻璃罐与匠心慢烤',
    way_story_desc: '为什么我们坚持使用环保玻璃罐封存新鲜——公平贸易、零添加精制糖以及小火慢焙如何为您的身心健康与地球生态带来美好改变。',
    calc_servings_unit: '次享用 / 每周',

    // Timeline & Order Tracking Status
    track_checking: '正在查询...',
    order_placed_prefix: '下单日期',
    order_tracking_prefix: '物流单号',
    order_status_in_transit: '正在运输中',
    order_status_out_for_delivery: '派送中',
    order_status_delivered: '已妥投送达',
    order_status_processing: '处理中',
    timeline_order_placed: '订单已提交',
    timeline_order_confirmed: '订单已确认',
    timeline_batch_roasted: '小批量新鲜慢烤',
    timeline_dispatched: '已交由绿色快递发货',
    timeline_local_hub: '到达本地配送中心',
    timeline_out_for_delivery: '正在派送途中',
    timeline_delivered: '已妥投送达',

    // Feedback Modal Extras
    fb_error_required: '请填写您的姓名以及您的体验故事或食谱。',
    fb_name_placeholder: '例如：张小明',
    fb_role_placeholder: '例如：营养师、烘焙爱好者、健身达人',

    // AI Sommelier
    sommelier_title: '贡布 AI 品鉴侍酒师',
    sommelier_subtitle: '专属风味搭配与美食品鉴助手',
    sommelier_welcome: '您好！我是您的贡布丰收 AI 品鉴侍酒师。有关我们的手作慢烤腰果、贡布风土特质、独特风味谱系或美酒美食品鉴搭配，欢迎随时向我咨询。',
    sommelier_loading: '正在向贡布美食专家咨询中...',
    sommelier_placeholder: '向品鉴师提问搭配灵感、食谱妙用或风味细节...',

    // Recipe Names
    recipe_1_title: '开心果库纳法香脆吐司',
    recipe_2_title: '浓郁腰果酱拌面碗',
    recipe_3_title: '高蛋白巴旦木舒芙蕾松饼',
    recipe_4_title: '花生酱能量思慕雪碗',
    recipe_5_title: '香脆黑巧能量轻食球',
    recipe_6_title: '泰风腰果泰式沙拉轻酱',
    recipe_7_title: '黄金姜黄腰果暖心拿铁',
    recipe_8_title: '蜂蜜黄油香脆烘烤腰果拼盘',

    // Customer Reviews
    review_1_text: '“终于找到真正用天然百花蜜烘烤的手作腰果了！250克玻璃罐装的蜂蜜黄油风味简直让人回味无穷。”',
    review_2_text: '“彻底颠覆了我对高品质小食的认知。贡布原产的新鲜酥脆，单一产区腰果品质出众，玻璃罐摆在餐桌上格外精致。”',
    review_3_text: '“我们全家都超级喜爱辣椒青柠风味。正宗贡布日晒鸟眼辣椒的温润辣意配上鲜摘青柠的果香，简直绝配。”',

    // Toast Messages
    toast_signed_out_admin: '已退出管理员会话。',
    toast_signed_in_as: '已登录为',
    toast_signed_out: '已退出您的贡布丰收账户。',
    toast_vip_applied: '已成功应用 VIP 会员 15% 折扣 (HARVEST15)！',
    toast_wholesale_added: '已将大宗批发大箱（24× 250克玻璃罐）加入购物袋！',

    // Product Descriptions & Prompts
    product_honey_butter_desc: '精选柬埔寨贡布特级腰果小批量低温慢烤，轻裹纯野生百花蜜与天然发酵黄油。',
    product_chili_lime_desc: '小批量精细慢烤贡布原产腰果，点缀地道贡布艳阳日晒鸟眼辣椒与鲜榨青柠清香。',
    cart_add_prefix: '再选购',
    cart_confirmed_desc_prefix: '非常感谢您，',
    cart_confirmed_desc_body: '！您的贡布丰收新鲜慢烤腰果订单已成功确认，正在精心包装准备发往',
    sommelier_prompt_1: '🍷 哪款腰果最适合搭配红酒、威士忌或精酿啤酒？',
    sommelier_prompt_2: '🧀 哪款风味最适合搭配高档芝士冷盘？',
    sommelier_prompt_3: '🌶️ 详细介绍一下辣椒青柠风味中的贡布日晒鸟眼辣椒',
    sommelier_prompt_4: '🎁 目前最受欢迎的送礼尊享套组是哪一款？',
    sommelier_fallback_reply: '若喜爱浓郁醇厚的奶香，推荐品尝我们的蜂蜜黄油腰果；若追求鲜爽微辣与回味温润，加入正宗贡布鸟眼辣椒的辣椒青柠腰果绝对是惊艳之选！',
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

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const langCode = language === 'KM' ? 'km' : language === 'ZH' ? 'zh' : 'en';
      document.documentElement.lang = langCode;
      if (language === 'KM') {
        document.documentElement.classList.add('font-khmer');
      } else {
        document.documentElement.classList.remove('font-khmer');
      }
      if (language === 'ZH') {
        document.documentElement.classList.add('font-chinese');
      } else {
        document.documentElement.classList.remove('font-chinese');
      }
    }
  }, [language]);

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
