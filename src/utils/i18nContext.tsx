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
