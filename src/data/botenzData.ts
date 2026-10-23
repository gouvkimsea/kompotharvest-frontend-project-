export interface ProductVariant {
  id: string;
  label: string;
  weight: string;
  price: number;
  originalPrice: number;
}

export interface Product {
  id: string;
  name: string;
  flavor: 'Honey Butter' | 'Chili Lime';
  packageSize: '100g Pouch' | '250g Jar';
  slug: string;
  category: 'powders' | 'bundles' | 'accessories' | 'soon';
  price: number;
  originalPrice: number;
  discountBadge?: string;
  rating: number;
  reviewCount: number;
  image: string;
  secondaryImage?: string;
  shortDesc: string;
  description: string;
  hasVariants?: boolean;
  variants?: ProductVariant[];
  nutrition: {
    servingSize: string;
    calories: number;
    protein: string;
    fat: string;
    carbs: string;
    sugar: string;
  };
  ingredients: string;
  accentColor: string;
}

export interface BundleItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  rating: number;
  image: string;
  description: string;
  includedItems: string[];
}

export interface RecipeItem {
  id: string;
  title: string;
  slug: string;
  productFilter: string;
  protein: string;
  time: string;
  timeUnit?: string;
  kcal: string;
  kcalUnit?: string;
  image: string;
  featuredOnHome?: boolean;
  ingredients: string[];
  steps: string[];
}

export interface InfluencerItem {
  id: string;
  name: string;
  role: string;
  rating: number;
  platform: 'YouTube' | 'Shorts';
  videoTitle: string;
  handle: string;
  quote: string;
  avatarColor: string;
  featured?: boolean;
}

export const ASSETS = {
  logoGreen: '/assets/aistudio/image_2e860bec.png',
  logoWhite: '/assets/aistudio/image_2e860bec.png',
  heroBg: 'https://botenz.in/wp-content/uploads/2026/05/Hero-Section-Background-scaled.webp',
  homeBottomWave: 'https://botenz.in/wp-content/uploads/2026/05/home-bottom-1.svg',
  bundleLeftSpoon: '/assets/aistudio/spoon-cashews-left.png',
  bundleRightSpoon: '/assets/aistudio/spoon-cashews-right.png',
  bundleCardShape: 'https://botenz.in/wp-content/uploads/2026/05/Image-Container-1.svg',
  kitchenIconsStrip: 'https://botenz.in/wp-content/uploads/2026/02/Group-768.svg',
  compareBotenzJar: '/assets/aistudio/product-honey-butter-jar-250g.png',
  compareOtherJar: '/assets/aistudio/image_ba343137.png',
  productsWaveBg: 'https://botenz.in/wp-content/uploads/2026/05/products-background.svg',
  influencerPistachioSide: '/assets/aistudio/image_d5761b5f.png',
  howToEnjoyTwoSpoons: 'https://botenz.in/wp-content/uploads/2026/02/Group-912.svg',
  howToEnjoyWaterMilk: 'https://botenz.in/wp-content/uploads/2026/02/Group-911.svg',
  iconSpreadIt: 'https://botenz.in/wp-content/uploads/2026/02/Vector-11.svg',
  iconBlendIt: 'https://botenz.in/wp-content/uploads/2026/02/Vector-9.svg',
  iconSpoonIt: 'https://botenz.in/wp-content/uploads/2026/02/Vector-12.svg',
  iconCookBake: 'https://botenz.in/wp-content/uploads/2026/02/Vector-10.svg',
  feedbackChatIcon: 'https://botenz.in/wp-content/uploads/2026/02/Group-848.svg',
  feedbackStarIcon: 'https://botenz.in/wp-content/uploads/2026/02/Star-35.svg',
  feedbackCollage: 'https://botenz.in/wp-content/uploads/2025/11/Group-929.png.webp',
  feedbackSparkleLeft: 'https://botenz.in/wp-content/uploads/2026/02/Group-935.svg',
  feedbackSparkleRight: 'https://botenz.in/wp-content/uploads/2026/02/Group-868-1.svg',
  ecoGlassOnly: 'https://botenz.in/wp-content/uploads/2026/02/Group-799.svg',
  ecoSaveEarth: 'https://botenz.in/wp-content/uploads/2026/02/Group-975.svg',
  ecoJarFresh: 'https://botenz.in/wp-content/uploads/2026/02/Group-974.svg',
  ecoCleanProtein: 'https://botenz.in/wp-content/uploads/2026/02/Group-800.svg',
  instagramIcon: 'https://botenz.in/wp-content/uploads/2025/08/Symbol.svg',
  offerBoxModal: '/assets/aistudio/image_3fc2233f.png',
  offerLeftBg: 'https://botenz.in/wp-content/uploads/2026/10/left-background.webp',
  // Mega menu images
  megaShopBundles: '/assets/aistudio/bundle-complete-4pack.png',
  megaShopSachets: '/assets/aistudio/bundle-pouches-duo.png',
  megaShopPowders: '/assets/aistudio/bundle-jars-duo.png',
  megaShopGifts: '/assets/aistudio/product-honey-butter-jar-250g.png',
  megaShopFullSet: '/assets/aistudio/image_3fc2233f.png',
  megaWayAbout: 'https://botenz.in/wp-content/uploads/2026/04/4fefc2d9-c10c-43b4-951d-5b820ce4e4ee.png.webp',
  megaWayQuality: 'https://botenz.in/wp-content/uploads/2026/04/Peeling-nuts-1.png.webp',
  megaWayGlass: '/assets/aistudio/bundle-jars-duo.png',
  megaWayEco: 'https://botenz.in/wp-content/uploads/2026/04/ChatGPT-Image-Apr-30-2026-03_45_44-AM.png.webp',
};

export const HERO_STATS = [
  { top: '90%', bottom: 'Less fat' },
  { top: 'Double', bottom: 'Protein' },
  { top: '100%', bottom: 'natural' },
  { top: '1/3', bottom: 'Calories' },
  { top: '2×', bottom: 'Protein' },
];

export const HERO_FEATURES = [
  {
    id: 'real-nuts',
    title: 'Made From\nReal Nuts',
    headline: '100% From Real Nuts',
    detail: 'Crafted from premium roasted Kampot cashews with zero fillers, preservatives, or artificial stabilizers. Just pure nut goodness in every handful.',
    iconType: 'peanut' as const,
  },
  {
    id: 'cold-pressed',
    title: 'Slow\nRoasted',
    headline: 'Small-Batch Roasted Perfection',
    detail: 'Slow dry-roasting locks in natural aroma, micronutrients, and rich buttery crunch without deep-frying in heavy industrial oils.',
    iconType: 'cold' as const,
  },
  {
    id: 'no-sugar',
    title: 'No Refined\nSugar',
    headline: 'No Refined Sugar',
    detail: 'Zero refined white sugar, zero corn syrup, and zero artificial sweeteners. Glazed only with pure wildflower honey or natural citrus.',
    iconType: 'nosugar' as const,
  },
  {
    id: 'no-flavoring',
    title: 'No Artificial\nFlavoring',
    headline: 'No Artificial Flavoring',
    detail: 'No chemical extracts, no synthetic aromas, and no artificial preservatives. What you taste is 100% authentic Kampot cashews.',
    iconType: 'natural' as const,
  },
  {
    id: 'double-protein',
    title: '2× The\nProtein',
    headline: 'High Plant Protein Density',
    detail: 'Packed with clean plant protein and heart-healthy minerals in every crunchy serving of Kampot Harvest Co. Artisan Roasted Cashews.',
    iconType: 'protein' as const,
  },
];

export const BUNDLES: BundleItem[] = [
  {
    id: 'bundle-complete',
    name: 'The Complete Collection',
    price: 45.0,
    originalPrice: 60.0,
    rating: 4.95,
    image: '/assets/aistudio/bundle-complete-4pack.png',
    description: 'Save 25% on all 4 Kampot Harvest Co. Artisan Roasted Cashews: Honey Butter (250g Jar), Chili Lime (250g Jar), Honey Butter (100g Pouch), and Chili Lime (100g Pouch).',
    includedItems: [
      'Artisan Roasted Cashews — Honey Butter (250g Jar · $20.00)',
      'Artisan Roasted Cashews — Chili Lime (250g Jar · $20.00)',
      'Artisan Roasted Cashews — Honey Butter (100g Pouch · $10.00)',
      'Artisan Roasted Cashews — Chili Lime (100g Pouch · $10.00)',
    ],
  },
  {
    id: 'bundle-nut-lovers',
    name: 'Artisan 250g Jar Duo',
    price: 30.0,
    originalPrice: 40.0,
    rating: 4.93,
    image: '/assets/aistudio/bundle-jars-duo.png',
    description: 'Both signature 250g jars of Kampot Harvest Co. Artisan Roasted Cashews—golden Honey Butter and zesty Chili Lime—sealed for peak crunch and freshness.',
    includedItems: [
      'Artisan Roasted Cashews — Honey Butter (250g Jar · $20.00)',
      'Artisan Roasted Cashews — Chili Lime (250g Jar · $20.00)',
    ],
  },
  {
    id: 'bundle-best-seller',
    name: 'Artisan 100g Pouch Duo',
    price: 15.0,
    originalPrice: 20.0,
    rating: 4.89,
    image: '/assets/aistudio/bundle-pouches-duo.png',
    description: 'Both resealable 100g pouches of our Honey Butter and Chili Lime Artisan Roasted Cashews—crafted for on-the-go snacking, travel, and gifting.',
    includedItems: [
      'Artisan Roasted Cashews — Honey Butter (100g Pouch · $10.00)',
      'Artisan Roasted Cashews — Chili Lime (100g Pouch · $10.00)',
    ],
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 'honey-butter-100g-pouch',
    name: 'Artisan Roasted Cashews',
    flavor: 'Honey Butter',
    packageSize: '100g Pouch',
    slug: 'artisan-roasted-cashews-honey-butter-100g-pouch',
    category: 'powders',
    price: 10.0,
    originalPrice: 10.0,
    rating: 4.9,
    reviewCount: 342,
    image: '/assets/aistudio/product-honey-butter-pouch-100g.png',
    secondaryImage: '/assets/aistudio/image_3fc2233f.png',
    shortDesc: 'Honey Butter · 100g Pouch · USD 10',
    description: 'Small-batch Kampot Harvest Co. Artisan Roasted Cashews glazed in golden wildflower honey and creamy cultured butter. Packed in a resealable 100g Pouch for crisp on-the-go snacking.',
    hasVariants: true,
    variants: [
      { id: 'hb-pouch-100', label: '100g Pouch', weight: '100g', price: 10.0, originalPrice: 10.0 },
      { id: 'hb-jar-250', label: '250g Jar', weight: '250g', price: 20.0, originalPrice: 20.0 },
    ],
    nutrition: {
      servingSize: '30g (Approx. 18 cashews)',
      calories: 165,
      protein: '5.5g',
      fat: '12.5g',
      carbs: '8.5g',
      sugar: '4.2g (Pure Honey)',
    },
    ingredients: 'Whole Kampot Cashews (88%), Pure Wildflower Honey, Cultured Butter, Sea Salt.',
    accentColor: '#D49B35',
  },
  {
    id: 'chili-lime-100g-pouch',
    name: 'Artisan Roasted Cashews',
    flavor: 'Chili Lime',
    packageSize: '100g Pouch',
    slug: 'artisan-roasted-cashews-chili-lime-100g-pouch',
    category: 'powders',
    price: 10.0,
    originalPrice: 10.0,
    rating: 4.9,
    reviewCount: 284,
    image: '/assets/aistudio/product-chili-lime-pouch-100g.png',
    secondaryImage: '/assets/aistudio/image_3fc2233f.png',
    shortDesc: 'Chili Lime · 100g Pouch · USD 10',
    description: 'Bold, zesty Kampot Harvest Co. Artisan Roasted Cashews tossed with sun-ripened red chili and fresh-squeezed lime zest in a convenient 100g Pouch.',
    hasVariants: true,
    variants: [
      { id: 'cl-pouch-100', label: '100g Pouch', weight: '100g', price: 10.0, originalPrice: 10.0 },
      { id: 'cl-jar-250', label: '250g Jar', weight: '250g', price: 20.0, originalPrice: 20.0 },
    ],
    nutrition: {
      servingSize: '30g (Approx. 18 cashews)',
      calories: 160,
      protein: '5.8g',
      fat: '12.0g',
      carbs: '7.8g',
      sugar: '1.5g (Natural)',
    },
    ingredients: 'Whole Kampot Cashews (92%), Red Chili Pepper, Fresh Lime Juice Powder, Sea Salt.',
    accentColor: '#C93B2B',
  },
  {
    id: 'honey-butter-250g-jar',
    name: 'Artisan Roasted Cashews',
    flavor: 'Honey Butter',
    packageSize: '250g Jar',
    slug: 'artisan-roasted-cashews-honey-butter-250g-jar',
    category: 'powders',
    price: 20.0,
    originalPrice: 20.0,
    rating: 4.95,
    reviewCount: 418,
    image: '/assets/aistudio/product-honey-butter-jar-250g.png',
    secondaryImage: '/assets/aistudio/image_3fc2233f.png',
    shortDesc: 'Honey Butter · 250g Jar · USD 20',
    description: 'Our signature 250g Jar filled with jumbo Kampot Harvest Co. Artisan Roasted Cashews in rich Honey Butter glaze. Airtight glass-sealed for lasting crunch.',
    hasVariants: true,
    variants: [
      { id: 'hb-jar-250-main', label: '250g Jar', weight: '250g', price: 20.0, originalPrice: 20.0 },
      { id: 'hb-pouch-100-alt', label: '100g Pouch', weight: '100g', price: 10.0, originalPrice: 10.0 },
    ],
    nutrition: {
      servingSize: '30g (Approx. 18 cashews)',
      calories: 165,
      protein: '5.5g',
      fat: '12.5g',
      carbs: '8.5g',
      sugar: '4.2g (Pure Honey)',
    },
    ingredients: 'Whole Kampot Cashews (88%), Pure Wildflower Honey, Cultured Butter, Sea Salt.',
    accentColor: '#D49B35',
  },
  {
    id: 'chilli-lime-250g-jar',
    name: 'Artisan Roasted Cashews',
    flavor: 'Chili Lime',
    packageSize: '250g Jar',
    slug: 'artisan-roasted-cashews-chili-lime-250g-jar',
    category: 'powders',
    price: 20.0,
    originalPrice: 20.0,
    rating: 4.92,
    reviewCount: 365,
    image: '/assets/aistudio/product-chilli-lime-jar-250g.png',
    secondaryImage: '/assets/aistudio/image_3fc2233f.png',
    shortDesc: 'Chili Lime · 250g Jar · USD 20',
    description: 'Our premium 250g Jar of Kampot Harvest Co. Artisan Roasted Cashews seasoned with fiery red chili and bright citrus lime.',
    hasVariants: true,
    variants: [
      { id: 'cl-jar-250-main', label: '250g Jar', weight: '250g', price: 20.0, originalPrice: 20.0 },
      { id: 'cl-pouch-100-alt', label: '100g Pouch', weight: '100g', price: 10.0, originalPrice: 10.0 },
    ],
    nutrition: {
      servingSize: '30g (Approx. 18 cashews)',
      calories: 160,
      protein: '5.8g',
      fat: '12.0g',
      carbs: '7.8g',
      sugar: '1.5g (Natural)',
    },
    ingredients: 'Whole Kampot Cashews (92%), Red Chili Pepper, Fresh Lime Zest, Sea Salt.',
    accentColor: '#C93B2B',
  },
];

export const ACCESSORIES_AND_SOON: Product[] = [];

export const INFLUENCERS: InfluencerItem[] = [
  {
    id: 'inf-1',
    name: 'Bhava',
    role: 'Travel Blogger',
    rating: 4.9,
    platform: 'YouTube',
    videoTitle: 'How I Carry Clean Protein On Every Himalayan Trek',
    handle: '@bhava_travels',
    quote: 'Zero oil leaks in my backpack and 2× protein in my morning camp oats. Total game changer!',
    avatarColor: '#3B5224',
    featured: true,
  },
  {
    id: 'inf-2',
    name: 'Payal',
    role: 'Wellnes coach',
    rating: 4.7,
    platform: 'Shorts',
    videoTitle: '58 Calories vs 185 Calories: The Peanut Butter Swap',
    handle: '@payal_wellness',
    quote: 'My clients love that they can still enjoy rich peanut butter toast while cutting 90% of saturated fats.',
    avatarColor: '#698051',
  },
  {
    id: 'inf-3',
    name: 'Shruti',
    role: 'Travel Blogger',
    rating: 4.7,
    platform: 'YouTube',
    videoTitle: '1-Minute Pistachio Kunafa Toast Recipe with Botenz',
    handle: '@shrutiontheroad',
    quote: 'The Pistachio powder tastes like pure roasted nuts and blends into a glossy spread in 10 seconds!',
    avatarColor: '#698051',
  },
  {
    id: 'inf-4',
    name: 'Divyanshi',
    role: 'Fashion Brand Ceo',
    rating: 4.7,
    platform: 'YouTube',
    videoTitle: 'What I Eat In A Day As A Founder | High Protein Edition',
    handle: '@divyanshi.studio',
    quote: 'Glass jars on my kitchen counter + zero plastic guilt. Peanut Cacao in cold brew is my daily 4pm ritual.',
    avatarColor: '#698051',
  },
  {
    id: 'inf-5',
    name: 'Aarav',
    role: 'Fitness Coach',
    rating: 4.9,
    platform: 'Shorts',
    videoTitle: 'No Clumps! Mixing 30g Plant Protein Shake with Botenz',
    handle: '@aarav_lifts',
    quote: 'Unlike chalky pea protein, Botenz mixes silky smooth in water or milk with real roasted nut taste.',
    avatarColor: '#698051',
  },
];

export const RECIPES: RecipeItem[] = [
  {
    id: 'peanut-smoothie-bowl',
    title: 'Peanut Smoothie Bowl',
    slug: 'vegan-peanut-butter-smoothie-bowl',
    productFilter: 'Botenz Peanut Butter Powder',
    protein: '18g',
    time: '10',
    timeUnit: 'minutes',
    kcal: '275',
    kcalUnit: 'kcal',
    image: 'https://botenz.in/wp-content/uploads/2026/05/Gemini_Generated_Image_xkuwwixkuwwixkuw-2.png.webp',
    featuredOnHome: true,
    ingredients: [
      '3 tbsp Botenz Peanut Butter Powder',
      '1 frozen banana, sliced',
      '120ml chilled almond or oat milk',
      '2 tbsp rolled oats & toasted granola',
      '1 tsp chia seeds & coconut flakes for topping',
    ],
    steps: [
      'Blend the frozen banana, chilled milk, and 2 tbsp Botenz Peanut Butter Powder until thick and creamy.',
      'Pour into a chilled ceramic bowl and smooth the top with the back of a spoon.',
      'Whisk 1 tbsp Botenz Peanut Butter Powder with 2 tsp warm water to create a glossy peanut drizzle.',
      'Top with sliced banana, crunchy granola, coconut flakes, and drizzle generously.',
    ],
  },
  {
    id: 'pistachio-kunafa-toast',
    title: 'Pistachio Kunafa Toast',
    slug: 'pistachio-kunafa-toasts',
    productFilter: 'Botenz Pistachio Butter Powder',
    protein: '11g',
    time: '10',
    timeUnit: 'minutes',
    kcal: '205',
    kcalUnit: 'kcal',
    image: 'https://botenz.in/wp-content/uploads/2026/05/WhatsApp-Image-2026-05-30-at-00.50.37.jpeg.webp',
    featuredOnHome: true,
    ingredients: [
      '2.5 tbsp Botenz Pistachio Butter Powder',
      '1 slice artisanal sourdough or multigrain bread',
      '20g toasted kataifi (shredded phyllo pastry) or vermicelli',
      '2 tbsp warm water or milk',
      'Crushed roasted pistachios for garnish',
    ],
    steps: [
      'Combine Botenz Pistachio Butter Powder with warm water in a bowl and stir for 15 seconds until smooth and velvety.',
      'Fold half of the toasted crispy kataifi shreds into the pistachio cream.',
      'Toast the sourdough slice until golden and spread the pistachio kunafa mixture edge to edge.',
      'Garnish with crushed roasted pistachios and remaining crispy kataifi.',
    ],
  },
  {
    id: 'peanut-baked-oats',
    title: 'Peanut Baked Oats',
    slug: 'peanut-butter-baked-oats',
    productFilter: 'Botenz Peanut Butter Powder',
    protein: '23g',
    time: '25',
    timeUnit: 'minutes',
    kcal: '420',
    kcalUnit: 'kcal',
    image: 'https://botenz.in/wp-content/uploads/2026/05/Gemini_Generated_Image_9oid2p9oid2p9oid-2-e1780094679881-1536x1527.png.webp',
    featuredOnHome: true,
    ingredients: [
      '3 tbsp Botenz Peanut Butter Powder',
      '1/2 cup rolled oats',
      '1/2 ripe banana, mashed',
      '1/2 cup milk of choice',
      '1/2 tsp baking powder & dark chocolate chips',
    ],
    steps: [
      'Preheat oven or air-fryer to 180°C (350°F) and grease a ramekin.',
      'Blend oats, banana, milk, baking powder, and 2 tbsp Botenz Peanut Butter Powder until smooth.',
      'Pour into ramekin, scatter dark chocolate chips on top, and bake for 20–22 minutes.',
      'Mix 1 tbsp Botenz powder with water for a warm peanut butter swirl on top before serving.',
    ],
  },
  {
    id: 'choco-pb-smoothie',
    title: 'Choco & PB Smoothie',
    slug: 'chocolate-banana-peanut-butter-smoothie',
    productFilter: 'Peanut Choco Butter Powder',
    protein: '23g',
    time: '5',
    timeUnit: 'minutes',
    kcal: '320',
    kcalUnit: 'kcal',
    image: 'https://botenz.in/wp-content/uploads/2026/05/image-3.png.webp',
    featuredOnHome: true,
    ingredients: [
      '3 tbsp Botenz Peanut Cacao Powder',
      '1 frozen banana',
      '200ml cold milk or soy milk',
      '4 ice cubes',
      'Grated dark chocolate curls for topping',
    ],
    steps: [
      'Add cold milk, frozen banana, ice cubes, and Botenz Peanut Cacao Powder to a high-speed blender.',
      'Blend on high for 45 seconds until frothy and milkshake-thick.',
      'Pour into a tall glass and garnish with a banana coin and dark chocolate shavings.',
    ],
  },
  {
    id: 'chinese-protein-chutney',
    title: 'Chinese Protein Chutney',
    slug: 'chinese-protein-chutney',
    productFilter: 'Botenz Peanut Butter Powder',
    protein: '16g',
    time: '8',
    timeUnit: 'minutes',
    kcal: '190',
    kcalUnit: 'kcal',
    image: 'https://botenz.in/wp-content/uploads/2026/06/chinese-protein-chutney-recipe-hero.png.webp',
    ingredients: [
      '3 tbsp Botenz Peanut Butter Powder',
      '1 tbsp low-sodium soy sauce & 1 tsp rice vinegar',
      '1 tsp toasted chili oil & grated ginger-garlic',
      '4 tbsp warm water',
    ],
    steps: [
      'Whisk Botenz Peanut Butter Powder with warm water until glossy.',
      'Stir in soy sauce, rice vinegar, ginger-garlic, and chili oil.',
      'Toss with steamed wontons, soba noodles, or crunchy cucumber salad.',
    ],
  },
  {
    id: 'italian-protein-pancakes',
    title: 'Italian Protein Pancakes',
    slug: 'italian-protein-pancakes',
    productFilter: 'Almond Butter Powder',
    protein: '20g',
    time: '12',
    timeUnit: 'minutes',
    kcal: '360',
    kcalUnit: 'kcal',
    image: 'https://botenz.in/wp-content/uploads/2026/06/italian-protein-pancakes-recipe-hero.png.webp',
    ingredients: [
      '3 tbsp Botenz Almond Butter Powder',
      '1/2 cup oat flour',
      '1/3 cup ricotta or Greek yogurt',
      '1/2 cup milk & 1 tsp lemon zest',
    ],
    steps: [
      'Whisk Botenz Almond Butter Powder, oat flour, yogurt, and milk into a thick batter.',
      'Cook silver-dollar pancakes on a non-stick skillet for 2 minutes per side until golden.',
      'Stack and finish with fresh herbs or berries.',
    ],
  },
  {
    id: 'keto-protein-ladoo',
    title: 'Keto Protein Ladoo',
    slug: 'keto-protein-ladoo',
    productFilter: 'Peanut Choco Butter Powder',
    protein: '19g',
    time: '10',
    timeUnit: 'minutes',
    kcal: '210',
    kcalUnit: 'kcal',
    image: 'https://botenz.in/wp-content/uploads/2026/06/keto-protein-ladoo-recipe-hero.png.webp',
    ingredients: [
      '1/2 cup Botenz Peanut Cacao Powder',
      '2 tbsp melted coconut oil or ghee',
      '1 tbsp chopped roasted peanuts & sesame seeds',
      '1/2 tsp green cardamom powder',
    ],
    steps: [
      'Combine Botenz Peanut Cacao Powder and cardamom in a mixing bowl.',
      'Add warm ghee and 2 tbsp warm water; knead into a pliable fudge dough.',
      'Fold in crushed peanuts and roll into bite-sized protein ladoos.',
    ],
  },
  {
    id: 'protein-botenz-cake',
    title: 'Protein Botenz Cake',
    slug: 'protein-botenz-cake',
    productFilter: 'Botenz Cashew Butter Powder',
    protein: '25g',
    time: '30',
    timeUnit: 'minutes',
    kcal: '340',
    kcalUnit: 'kcal',
    image: 'https://botenz.in/wp-content/uploads/2026/05/9cf85ea0-3672-4384-8eb1-f85c209557a3.png.webp',
    ingredients: [
      '4 tbsp Botenz Cashew Butter Powder',
      '1/2 cup whole wheat or almond flour',
      '2 tbsp jaggery or maple syrup',
      '1/2 cup plant milk & 1 tsp baking powder',
    ],
    steps: [
      'Whisk wet and dry ingredients together until lump-free.',
      'Bake at 175°C for 25 minutes until a toothpick comes out clean.',
      'Frost with reconstituted Botenz Cashew & Pistachio cream.',
    ],
  },
];

export const CUSTOMER_REVIEWS = [
  {
    id: 'rev-1',
    rating: '5.0',
    author: 'Ali Ahmed: Cook',
    text: 'Ali Ahmed: Cook Perfect for shakes and healthy desserts. The flavor is authentic, and it’s guilt-free peanut butter indulgence.',
  },
  {
    id: 'rev-2',
    rating: '4.8',
    author: 'Sarah Khan: Nutrition Coach',
    text: 'Sarah Khan: Nutrition Coach\nThis peanut butter powder has completely changed my breakfast routine. It tastes amazing, mixes easily, and keeps me energized throughout the day.',
  },
  {
    id: 'rev-3',
    rating: '4.7',
    author: 'John Doe: Fitness Enthusiast',
    text: 'John Doe: Fitness Enthusiast\nBotenz Peanut Butter Powder is a game–changer! I love the rich peanut flavor without the guilt – it’s low in calories, high in protein, and absolutely zero fat. Perfect for my smoothies, oatmeal, and even baking. It blends so smoothly and keeps me full for longer. Healthy, natural, and delicious – Botenz is now a daily part of my routine!',
  },
];

export const ECO_PILLARS = [
  {
    id: 'eco-1',
    icon: ASSETS.ecoGlassOnly,
    alt: 'eco product',
    title: 'Glass-Only\nZero Plastic',
    description: 'Responsibly sealed in endlessly reusable glass for microplastic-free freshness that lasts up to one year on shelf.',
  },
  {
    id: 'eco-2',
    icon: ASSETS.ecoSaveEarth,
    alt: 'save earth product',
    title: 'Leading the Eco\nProtein Revolution',
    description: '≈ 50 % less CO₂ per scoop than pea/soy, 80 % less than whey, 99 % less than beef. Power up while the planet chills.',
  },
  {
    id: 'eco-3',
    icon: ASSETS.ecoJarFresh,
    alt: 'the jar of Botenz',
    title: 'Fresh up to 1 year\nLess Waste',
    description: '12-month shelf life with no refrigeration means fewer jars binned and fewer re-shipments. Longer life, lighter footprint.',
  },
  {
    id: 'eco-4',
    icon: ASSETS.ecoCleanProtein,
    alt: 'Botenz Pista Saches',
    title: 'The Cleanest, Least-\nProcessed Protein',
    description: 'No hexane, no harsh pH baths—just light roast, cold press, fine milling. The least-processed plant protein on the market—pure, simple, superior.',
  },
];

export const INSTAGRAM_TILES = [
  {
    id: 'ig-1',
    type: 'photo',
    title: 'Kampot Harvest',
    subtitle: 'artisan roasted cashews crafted with wildflower honey butter and zesty chili lime',
    bg: '#E5E2CE',
    textColor: '#384A22',
    image: '/assets/aistudio/product-honey-butter-pouch-100g.png',
  },
  {
    id: 'ig-2',
    type: 'photo',
    title: 'Meet Kampot Harvest',
    subtitle: 'artisan cashews, reimagined',
    bg: '#EDEBE1',
    textColor: '#384A22',
    image: '/assets/aistudio/bundle-complete-4pack.png',
  },
  {
    id: 'ig-3',
    type: 'badge-photo',
    title: "TODAY'S healthy RECIPE",
    bg: '#344B1E',
    textColor: '#F2F0E3',
    image: 'https://botenz.in/wp-content/uploads/2026/05/Gemini_Generated_Image_9oid2p9oid2p9oid-2-e1780094679881-1536x1527.png.webp',
  },
  {
    id: 'ig-4',
    type: 'typography',
    title: 'ca-\nshew',
    bg: '#D58B49',
    textColor: '#F2F0E3',
  },
  {
    id: 'ig-5',
    type: 'jar-showcase',
    title: 'HONEY BUTTER · 250G GLASS JAR',
    bg: '#314B1C',
    textColor: '#F2F0E3',
    image: '/assets/aistudio/product-honey-butter-jar-250g.png',
  },
  {
    id: 'ig-6',
    type: 'eco-rings',
    title: '100%',
    subtitle: 'natural ingredients',
    bg: '#ECEAE0',
    textColor: '#384A22',
    icon: ASSETS.ecoSaveEarth,
  },
  {
    id: 'ig-7',
    type: 'badge-photo',
    title: 'Healthier snacking',
    bg: '#EDE8DC',
    textColor: '#384A22',
    image: 'https://botenz.in/wp-content/uploads/2026/05/image-3.png.webp',
  },
  {
    id: 'ig-8',
    type: 'photo',
    title: 'OUR mission',
    bg: '#ECE9DB',
    textColor: '#384A22',
    image: '/assets/aistudio/product-chili-lime-pouch-100g.png',
  },
  {
    id: 'ig-9',
    type: 'eco-rings',
    title: 'product restocked',
    bg: '#385224',
    textColor: '#F2F0E3',
    icon: ASSETS.ecoJarFresh,
  },
  {
    id: 'ig-10',
    type: 'jar-showcase',
    title: 'NEW flavour',
    bg: '#ECEBE2',
    textColor: '#384A22',
    image: '/assets/aistudio/product-chilli-lime-jar-250g.png',
  },
  {
    id: 'ig-11',
    type: 'photo',
    title: 'kh',
    bg: '#D6C8B4',
    textColor: '#384A22',
    image: 'https://botenz.in/wp-content/uploads/2026/06/keto-protein-ladoo-recipe-hero.png.webp',
  },
  {
    id: 'ig-12',
    type: 'jar-showcase',
    title: 'Explore new tastes',
    bg: '#F2F0E3',
    textColor: '#384A22',
    image: '/assets/aistudio/bundle-pouches-duo.png',
  },
  {
    id: 'ig-13',
    type: 'badge-photo',
    title: 'GOOD MORNING sunshine',
    bg: '#E6E2D3',
    textColor: '#F2F0E3',
    image: '/assets/aistudio/bundle-jars-duo.png',
  },
  {
    id: 'ig-14',
    type: 'photo',
    title: 'Better together',
    bg: '#F2F0E3',
    textColor: '#384A22',
    image: '/assets/aistudio/image_3fc2233f.png',
  },
];
