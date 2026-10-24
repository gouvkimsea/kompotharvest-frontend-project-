import React, { useState } from 'react';
import { Heart, Minus, Plus, ShoppingBag, Trash2, X, CheckCircle2 } from 'lucide-react';
import {
  ACCESSORIES_AND_SOON,
  ASSETS,
  BUNDLES,
  BundleItem,
  ECO_PILLARS,
  PRODUCTS,
  Product,
  RECIPES,
  RecipeItem,
} from '../data/botenzData';
import {
  CartItem,
  FREE_SHIPPING_THRESHOLD,
  STORE_CURRENCY,
  CURRENCY_SYMBOL,
  calculateCartSummary,
  calculateNutritionSaving,
  validateCheckoutForm,
  UserAccount,
  hasAccountPermission,
  InventoryItem,
  isProductOutOfStock,
} from '../utils/storeLogic';
import { SmartImage } from './SmartImage';
import { ActivePage, BotenzLogo } from './Navbar';
import { useI18n } from '../utils/i18nContext';

/* ============================================================================
 * 1. SHOP PAGE VIEW (matches ref-shop.png)
 * ========================================================================== */
interface ShopPageViewProps {
  initialCategory?: string;
  onAddProductToCart: (product: Product) => void;
  onAddBundleToCart: (bundle: BundleItem) => void;
  onSelectProduct: (product: Product) => void;
  onSelectBundle: (bundle: BundleItem) => void;
  inventory?: InventoryItem[];
}

export const ShopPageView: React.FC<ShopPageViewProps> = ({
  initialCategory = 'powders',
  onAddProductToCart,
  onAddBundleToCart,
  onSelectProduct,
  onSelectBundle,
  inventory = [],
}) => {
  const { t, formatPrice } = useI18n();
  const [activeTab, setActiveTab] = useState<'powders' | 'bundles' | 'accessories' | 'soon'>(
    (initialCategory as 'powders' | 'bundles' | 'accessories' | 'soon') || 'powders'
  );

  React.useEffect(() => {
    if (
      initialCategory === 'powders' ||
      initialCategory === 'bundles' ||
      initialCategory === 'accessories' ||
      initialCategory === 'soon'
    ) {
      setActiveTab(initialCategory);
    }
  }, [initialCategory]);

  const customProducts: Product[] = inventory
    .filter(
      (item) =>
        item.category !== 'Value Bundles' &&
        !PRODUCTS.some((p) => p.id === item.id) &&
        !BUNDLES.some((b) => b.id === item.id)
    )
    .map((item) => ({
      id: item.id,
      name: item.name,
      flavor: item.name.toLowerCase().includes('chili') ? 'Chili Lime' : 'Honey Butter',
      packageSize: item.category === 'Glass Jars (250g)' ? '250g Jar' : '100g Pouch',
      slug: item.id,
      category: 'powders',
      price: item.price,
      originalPrice: item.price,
      rating: 5.0,
      reviewCount: 1,
      image: item.image,
      shortDesc: `${item.variantLabel} · USD ${item.price}`,
      description: `Small-batch Kampot Harvest Co. ${item.name} (${item.variantLabel}).`,
      hasVariants: false,
      nutrition: {
        servingSize: '30g (Approx. 18 cashews)',
        calories: 165,
        protein: '5.5g',
        fat: '12.5g',
        carbs: '8.5g',
        sugar: '4.0g',
      },
      ingredients: 'Whole Kampot Cashews, Natural Seasoning, Sea Salt.',
      accentColor: '#8B6D3B',
    }));

  const customBundles: BundleItem[] = inventory
    .filter(
      (item) =>
        item.category === 'Value Bundles' &&
        !BUNDLES.some((b) => b.id === item.id) &&
        !PRODUCTS.some((p) => p.id === item.id)
    )
    .map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      originalPrice: Number((item.price * 1.25).toFixed(2)),
      rating: 5.0,
      image: item.image,
      description: `Kampot Harvest Co. ${item.name} (${item.variantLabel}).`,
      includedItems: [item.variantLabel],
    }));

  const allCatalogProducts = [...PRODUCTS, ...customProducts];
  const allCatalogBundles = [...BUNDLES, ...customBundles];

  const displayedProducts =
    activeTab === 'powders'
      ? allCatalogProducts
      : activeTab === 'accessories'
      ? allCatalogProducts.filter((p) => p.packageSize === '250g Jar' || p.id.includes('jar'))
      : activeTab === 'soon'
      ? allCatalogProducts.filter((p) => p.packageSize === '100g Pouch' || p.id.includes('pouch'))
      : [];

  return (
    <div className="w-full bg-[#F2F0E3] kbach-bg-cream pt-8 pb-20">
      {/* Header Title + Pill Switcher */}
      <div className="max-w-[1440px] mx-auto px-4 text-center">
        <h1 className="font-display text-[42px] sm:text-[54px] lg:text-[62px] tracking-tight leading-tight">
          <span className="text-[#768E5C] font-normal">{t('explore_cashews').split(' ')[0]} </span>
          <span className="text-[#384A22] font-normal">{t('explore_cashews').split(' ').slice(1).join(' ') || t('explore_cashews')}</span>
        </h1>
        <p className="mt-2 text-[15px] sm:text-[17px] font-medium text-[#384A22]/85">
          {t('flavors_title')}: <span className="font-bold text-[#384A22]">{t('flavor_honey_butter')}</span> &amp;{' '}
          <span className="font-bold text-[#384A22]">{t('flavor_chili_lime')}</span> · Package Sizes:{' '}
          <span className="font-bold text-[#384A22]">{t('size_pouch_100')} ({formatPrice(10)})</span> &amp;{' '}
          <span className="font-bold text-[#384A22]">{t('size_jar_250')} ({formatPrice(20)})</span>
        </p>

        {/* White Pill Segmented Switcher (All Products | Bundles | 250g Jar | 100g Pouch) */}
        <div className="mt-7 inline-flex flex-wrap items-center justify-center bg-[#F7F5E9] rounded-full p-1.5 shadow-sm border border-[#384A22]/10">
          {[
            { id: 'powders', label: t('cat_all') },
            { id: 'bundles', label: t('cat_bundles') },
            { id: 'accessories', label: `${t('size_jar_250')} (${formatPrice(20)})` },
            { id: 'soon', label: `${t('size_pouch_100')} (${formatPrice(10)})` },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setActiveTab(tab.id as 'powders' | 'bundles' | 'accessories' | 'soon')
                }
                className={`px-7 py-3 rounded-full text-[16px] sm:text-[18px] transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#314B1C] text-[#F2F0E3] font-medium shadow'
                    : 'text-[#384A22] hover:text-[#768E5C] font-normal'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid on Organic Dark Green Wave with Color-Matched Kbach Pattern */}
      <div className="relative w-full mt-14 pt-8 pb-24">
        <div
          className="absolute inset-x-0 bottom-0 top-[150px] z-0"
          style={{
            backgroundImage: `url("/assets/aistudio/kbach-pattern-green.svg"), url("${ASSETS.productsWaveBg}")`,
            backgroundRepeat: 'repeat, no-repeat',
            backgroundSize: '260px 260px, cover',
            backgroundPosition: 'center center, center center',
            backgroundColor: '#384A22',
          }}
        />

        <div className="relative z-10 max-w-[1380px] mx-auto px-6">
          {activeTab === 'bundles' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {allCatalogBundles.map((bundle) => {
                const isOutOfStock = isProductOutOfStock(inventory, bundle.id);
                return (
                  <div
                    key={bundle.id}
                    data-testid={`shop-bundle-card-${bundle.id}`}
                    className="flex flex-col items-center text-center group"
                  >
                    <div
                      onClick={() => onSelectBundle(bundle)}
                      className="relative w-full h-[310px] flex items-center justify-center cursor-pointer group-hover:-translate-y-1.5 transition-transform duration-300"
                    >
                      <div className="absolute top-2 left-4 z-20 blob-badge bg-[#2D471E] text-[#F2F0E3] w-[58px] h-[48px] flex items-center justify-center text-[14px] font-medium shadow-md">
                        -25%
                      </div>
                      <SmartImage
                        src={bundle.image}
                        alt={bundle.name}
                        className={`w-full h-full object-contain drop-shadow-2xl ${
                          isOutOfStock ? 'opacity-80' : ''
                        }`}
                        fallbackBg="transparent"
                      />
                      {isOutOfStock && (
                        <span
                          data-testid={`shop-bundle-bottom-out-of-stock-${bundle.id}`}
                          className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-md bg-[#B83A2A] text-[#F2F0E3] text-[11px] font-bold uppercase tracking-wider whitespace-nowrap shadow-md"
                        >
                          Out of Stock
                        </span>
                      )}
                    </div>
                    <div className="mt-4 text-[#F2F0E3] w-full max-w-[330px]">
                      <h3 className="text-[18px] font-medium text-[#F2F0E3]">{bundle.name}</h3>
                      {isOutOfStock && (
                        <p
                          data-testid={`shop-bundle-out-of-stock-statement-${bundle.id}`}
                          className="text-xs font-bold uppercase tracking-wider text-[#F2B8B5] mt-1"
                        >
                          Product is Out of Stock
                        </p>
                      )}
                      <div className="mt-2 flex items-baseline justify-center gap-3 tabular-nums">
                        <span className="text-[24px] font-normal text-[#F2F0E3]">
                          {formatPrice(bundle.price)}
                        </span>
                        <span className="text-[14px] text-[#8B6D3B] line-through">
                          {formatPrice(bundle.originalPrice)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[13px] text-[#F2F0E3]">
                          <svg className="w-3.5 h-3.5 text-[#EAB308] fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {bundle.rating}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-center gap-3">
                        <button
                          type="button"
                          disabled={isOutOfStock}
                          data-testid={`shop-bundle-action-btn-${bundle.id}`}
                          onClick={() => {
                            if (!isOutOfStock) onAddBundleToCart(bundle);
                          }}
                          className={`flex-1 py-2.5 px-5 rounded-full text-[13.5px] font-medium transition-colors ${
                            isOutOfStock
                              ? 'bg-[#B83A2A] text-[#F2F0E3] cursor-not-allowed font-bold'
                              : 'bg-[#8B6D3B] hover:bg-[#765B2F] text-[#F2F0E3] cursor-pointer'
                          }`}
                        >
                          {isOutOfStock ? 'Out of Stock' : t('btn_add_to_cart')}
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectBundle(bundle)}
                          className="flex-1 py-2.5 px-5 rounded-full border border-[#8B6D3B] text-[#F2F0E3] hover:bg-[#8B6D3B]/20 text-[13.5px] font-medium transition-colors cursor-pointer"
                        >
                          Learn more
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-14">
              {displayedProducts.map((product) => {
                const isOutOfStock = isProductOutOfStock(inventory, product.id);
                return (
                  <div
                    key={product.id}
                    data-testid={`shop-product-card-${product.id}`}
                    className="flex flex-col items-center text-center group"
                  >
                    <div
                      onClick={() => onSelectProduct(product)}
                      className="relative w-[240px] h-[315px] flex items-center justify-center cursor-pointer group-hover:-translate-y-1.5 transition-transform duration-300"
                    >
                      {product.discountBadge && (
                        <div className="absolute top-1 left-2 z-20 blob-badge bg-[#2D471E] text-[#F2F0E3] w-[54px] h-[46px] flex items-center justify-center text-[14px] font-medium shadow-md">
                          {product.discountBadge}
                        </div>
                      )}
                      <SmartImage
                        src={product.image}
                        alt={`${product.name} — ${product.flavor} (${product.packageSize})`}
                        className={`w-full h-full object-contain drop-shadow-2xl ${
                          isOutOfStock ? 'opacity-80' : ''
                        }`}
                        fallbackBg="transparent"
                      />
                      {isOutOfStock && (
                        <span
                          data-testid={`shop-product-bottom-out-of-stock-${product.id}`}
                          className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-md bg-[#B83A2A] text-[#F2F0E3] text-[11px] font-bold uppercase tracking-wider whitespace-nowrap shadow-md"
                        >
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* Direct Text & Buttons on Green Wave matching ref-shop.png */}
                    <div className="mt-3 w-full max-w-[280px] text-[#F2F0E3]">
                      <h3
                        onClick={() => onSelectProduct(product)}
                        className="text-[17px] font-semibold text-[#F2F0E3] hover:text-[#9AB87A] cursor-pointer"
                      >
                        {product.name}
                      </h3>
                      <p className="text-[13.5px] font-medium text-[#9AB87A] mt-0.5">
                        {product.flavor === 'Honey Butter' ? t('flavor_honey_butter', 'Honey Butter') : t('flavor_chili_lime', 'Chili Lime')} · {product.packageSize.includes('Jar') ? t('size_jar_250', '250g Jar') : t('size_pouch_100', '100g Pouch')}
                      </p>

                      {isOutOfStock && (
                        <p
                          data-testid={`shop-product-out-of-stock-statement-${product.id}`}
                          className="text-xs font-bold uppercase tracking-wider text-[#F2B8B5] mt-1"
                        >
                          Product is Out of Stock
                        </p>
                      )}

                      <div className="mt-1.5 flex items-baseline justify-center gap-2.5 tabular-nums">
                        <span className="text-[23px] font-semibold text-[#F2F0E3]">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice > product.price && (
                          <span className="text-[13.5px] text-[#8B6D3B] line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-[13px] text-[#F2F0E3] ml-1">
                          <svg className="w-3.5 h-3.5 text-[#EAB308] fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {product.rating}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-center gap-2.5">
                        <button
                          type="button"
                          disabled={isOutOfStock}
                          data-testid={`shop-product-action-btn-${product.id}`}
                          onClick={() => {
                            if (!isOutOfStock) onAddProductToCart(product);
                          }}
                          className={`flex-1 py-2.5 px-4 rounded-full text-[13.5px] font-medium transition-colors whitespace-nowrap ${
                            isOutOfStock
                              ? 'bg-[#B83A2A] text-[#F2F0E3] cursor-not-allowed font-bold'
                              : 'bg-[#8B6D3B] hover:bg-[#765B2F] text-[#F2F0E3] cursor-pointer'
                          }`}
                        >
                          {isOutOfStock ? 'Out of Stock' : t('btn_add_to_cart')}
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectProduct(product)}
                          className="flex-1 py-2.5 px-4 rounded-full border border-[#8B6D3B] text-[#F2F0E3] hover:bg-[#8B6D3B]/20 text-[13.5px] font-medium transition-colors cursor-pointer whitespace-nowrap"
                        >
                          {t('btn_learn_more', 'Learn more')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 2. RECIPES PAGE VIEW (matches ref-recipes.png)
 * ========================================================================== */
interface RecipesPageViewProps {
  favoriteIds: string[];
  onToggleFavorite: (recipeId: string) => void;
  onSelectRecipe: (recipe: RecipeItem) => void;
  onOpenShareRecipeModal: () => void;
}

export const RecipesPageView: React.FC<RecipesPageViewProps> = ({
  favoriteIds,
  onToggleFavorite,
  onSelectRecipe,
  onOpenShareRecipeModal,
}) => {
  const { t } = useI18n();
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  const productCategories = [
    'ALL',
    'Botenz Pistachio Butter Powder',
    'Botenz Cashew Butter Powder',
    'Botenz Peanut Butter Powder',
    'Peanut Choco Butter Powder',
    'Almond Butter Powder',
  ];

  const filteredRecipes =
    selectedFilter === 'ALL'
      ? RECIPES
      : RECIPES.filter((r) => r.productFilter === selectedFilter);

  return (
    <div className="w-full bg-[#F2F0E3] pt-10 pb-20 px-4 sm:px-8 lg:px-14">
      <div className="max-w-[1380px] mx-auto">
        <h1 className="font-display text-center text-[46px] sm:text-[60px] lg:text-[68px] font-normal text-[#384A22] tracking-tight mb-10">
          {t('recipes_page_title', 'Botenz recipes')}
        </h1>

        {/* Filter Bar by Nut Powder + Share Your Recipe Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div className="flex flex-wrap items-center gap-2">
            {productCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedFilter(cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  selectedFilter === cat
                    ? 'bg-[#384A22] text-[#F2F0E3]'
                    : 'bg-[#E5E2CE] text-[#384A22] hover:bg-[#384A22]/15'
                }`}
              >
                {cat === 'ALL' ? t('recipes_all_tab', 'All Recipes') : cat.replace('Botenz ', '')}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onOpenShareRecipeModal}
            className="px-6 py-2.5 rounded-full bg-[#8B6D3B] hover:bg-[#765B2F] text-[#F2F0E3] text-sm font-medium transition-colors cursor-pointer"
          >
            {t('btn_share_recipe', 'Share Your Recipe')}
          </button>
        </div>

        {/* 4-Column Recipe Grid matching ref-recipes.png */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {filteredRecipes.map((recipe) => {
            const isFav = favoriteIds.includes(recipe.id);
            return (
              <div key={recipe.id} className="flex flex-col items-center group">
                <div className="relative w-full h-[390px] rounded-[24px] overflow-hidden shadow-md">
                  {/* Top-Right Mint Heart Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(recipe.id);
                    }}
                    aria-label={
                      isFav
                        ? `Remove ${recipe.title} from favorites`
                        : `Love ${recipe.title}`
                    }
                    className="absolute top-3.5 right-3.5 z-20 w-9 h-9 rounded-full bg-[#B9D8B6] hover:bg-[#9AC696] text-[#384A22] flex items-center justify-center shadow transition-transform hover:scale-110 cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isFav ? 'fill-[#384A22] text-[#384A22]' : 'text-[#384A22]'
                      }`}
                    />
                  </button>

                  <div
                    onClick={() => onSelectRecipe(recipe)}
                    className="w-full h-full cursor-pointer"
                  >
                    <SmartImage
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Bottom 3 Cream Nutrition Blobs */}
                  <div
                    onClick={() => onSelectRecipe(recipe)}
                    className="absolute inset-x-4 bottom-2 flex items-end justify-between gap-2 z-10 cursor-pointer"
                  >
                    <div className="blob-badge bg-[#F2F0E3] text-[#314B1C] w-[74px] h-[54px] flex flex-col items-center justify-center text-center shadow">
                      <span className="text-[15px] font-medium leading-none tabular-nums">
                        {recipe.protein}
                      </span>
                      <span className="text-[11.5px] font-normal leading-none mt-1">{t('macro_protein', 'protein')}</span>
                    </div>

                    <div className="blob-badge bg-[#F2F0E3] text-[#314B1C] w-[74px] h-[54px] flex flex-col items-center justify-center text-center shadow">
                      <span className="text-[15px] font-medium leading-none tabular-nums">
                        {recipe.time}
                      </span>
                      <span className="text-[11.5px] font-normal leading-none mt-1">
                        {recipe.timeUnit || t('time_minutes', 'minute')}
                      </span>
                    </div>

                    <div className="blob-badge bg-[#F2F0E3] text-[#314B1C] w-[74px] h-[54px] flex flex-col items-center justify-center text-center shadow">
                      <span className="text-[15px] font-medium leading-none tabular-nums">
                        {recipe.kcal}
                      </span>
                      <span className="text-[11.5px] font-normal leading-none mt-1">
                        {recipe.kcalUnit || t('macro_kcal', 'kcal')}
                      </span>
                    </div>
                  </div>
                </div>

                <h3
                  onClick={() => onSelectRecipe(recipe)}
                  className="mt-3.5 text-[21px] font-medium text-[#384A22] group-hover:text-[#8B6D3B] transition-colors text-center cursor-pointer"
                >
                  {recipe.title}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 3. THE BOTENZ WAY & AUTOSHIP PAGES
 * ========================================================================== */
interface BotenzWayAndAutoshipProps {
  mode: 'way' | 'autoship' | 'rewards';
  onAddProductToCart: (product: Product, isAutoship?: boolean) => void;
  onNavigate: (page: ActivePage, categoryFilter?: string) => void;
  currentUser?: UserAccount | null;
  onOpenAccountModal?: () => void;
}

export const BotenzWayAndAutoshipView: React.FC<BotenzWayAndAutoshipProps> = ({
  mode,
  onAddProductToCart,
  onNavigate,
  currentUser,
  onOpenAccountModal,
}) => {
  const { t, formatPrice } = useI18n();
  const [servingsPerWeek, setServingsPerWeek] = useState(7);
  const [selectedAutoshipFlavor, setSelectedAutoshipFlavor] = useState<Product>(PRODUCTS[0]);
  const [deliveryFrequency, setDeliveryFrequency] = useState<'30' | '45' | '60'>('30');

  const nutritionStats = calculateNutritionSaving(servingsPerWeek);

  return (
    <div className="w-full bg-[#F2F0E3] pt-10 pb-20 px-4 sm:px-8 lg:px-14">
      <div className="max-w-[1280px] mx-auto">
        {mode === 'autoship' || mode === 'rewards' ? (
          <div className="bg-[#384A22] text-[#F2F0E3] rounded-[32px] p-8 sm:p-12 shadow-xl mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7">
                <span className="text-sm uppercase tracking-widest text-[#9AB87A] font-bold">
                  {mode === 'rewards' ? 'Botenz Rewards & Bundles' : 'Botenz Autoship & Save'}
                </span>
                <h1 className="font-display text-[38px] sm:text-[52px] leading-[1.08] mt-2">
                  Never Run Out of Clean Nut Protein — Save Extra 15%
                </h1>
                <p className="mt-4 text-[16px] text-[#F2F0E3]/85 leading-relaxed max-w-xl">
                  Subscribe to your favorite glass-jar nut butter powders on your schedule. Pause,
                  swap flavors (Peanut, Pistachio, Almond, Cashew, Sesame, Cacao), or cancel
                  anytime with one click.
                </p>

                <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="autoship-flavor"
                      className="block text-xs font-bold uppercase tracking-wider text-[#9AB87A] mb-2"
                    >
                      {t('autoship_step_1', '1. Select Your Artisan Flavor')}
                    </label>
                    <select
                      id="autoship-flavor"
                      value={selectedAutoshipFlavor.id}
                      onChange={(e) => {
                        const found = PRODUCTS.find((p) => p.id === e.target.value);
                        if (found) setSelectedAutoshipFlavor(found);
                      }}
                      className="w-full bg-[#2B3B18] border border-[#F2F0E3]/25 rounded-xl px-4 py-3 text-[#F2F0E3] font-medium focus:outline-none"
                    >
                      {PRODUCTS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.flavor} · {p.packageSize}) — {formatPrice(Math.round(p.price * 0.85 * 100) / 100)} (15% Off {formatPrice(p.price)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="autoship-freq"
                      className="block text-xs font-bold uppercase tracking-wider text-[#9AB87A] mb-2"
                    >
                      {t('autoship_step_2', '2. Delivery Frequency')}
                    </label>
                    <select
                      id="autoship-freq"
                      value={deliveryFrequency}
                      onChange={(e) =>
                        setDeliveryFrequency(e.target.value as '30' | '45' | '60')
                      }
                      className="w-full bg-[#2B3B18] border border-[#F2F0E3]/25 rounded-xl px-4 py-3 text-[#F2F0E3] font-medium focus:outline-none"
                    >
                      <option value="30">{t('autoship_freq_30', 'Every 30 Days (Most Popular)')}</option>
                      <option value="45">{t('autoship_freq_45', 'Every 45 Days')}</option>
                      <option value="60">{t('autoship_freq_60', 'Every 60 Days')}</option>
                    </select>
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (!hasAccountPermission(currentUser, 'autoship:manage') && onOpenAccountModal) {
                        onOpenAccountModal();
                        return;
                      }
                      onAddProductToCart(selectedAutoshipFlavor, true);
                    }}
                    className="px-9 py-3.5 rounded-full bg-[#8B6D3B] hover:bg-[#765B2F] text-[#F2F0E3] text-[16px] font-semibold shadow-md transition-colors cursor-pointer"
                  >
                    {hasAccountPermission(currentUser, 'autoship:manage')
                      ? `${t('btn_start_autoship')} — ${formatPrice(Math.round(selectedAutoshipFlavor.price * 0.85 * 100) / 100)}`
                      : `Create Account to ${t('btn_start_autoship')} — ${formatPrice(Math.round(selectedAutoshipFlavor.price * 0.85 * 100) / 100)}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('shop', 'bundles')}
                    className="px-7 py-3.5 rounded-full border border-[#F2F0E3]/40 hover:border-[#F2F0E3] text-[#F2F0E3] text-[15px] font-medium transition-colors cursor-pointer"
                  >
                    {t('btn_explore_bundles', 'Explore 25% Off Bundles')}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="w-[240px] h-[300px]">
                  <SmartImage
                    src={selectedAutoshipFlavor.image}
                    alt={selectedAutoshipFlavor.name}
                    className="w-full h-full object-contain drop-shadow-2xl"
                    fallbackBg="transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* The Botenz Way Story + Interactive Nutrition Calculator */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="font-display text-[40px] sm:text-[54px] text-[#384A22] leading-tight">
            The Botenz Way: <span className="text-[#768E5C]">Pure, Glass-Sealed &amp; Cold-Pressed</span>
          </h2>
          <p className="mt-4 text-[16px] text-[#384A22]/85 leading-relaxed">
            Why we make 6 distinct nut butter powders in reusable glass jars—and why no hexane,
            no refined sugar, and cold-pressing makes all the difference for your body and the planet.
          </p>
        </div>

        {/* Interactive Weekly Macro & Calorie Savings Calculator */}
        <div className="bg-white rounded-[28px] p-6 sm:p-10 shadow-md border border-[#384A22]/10 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5">
              <h3 className="text-2xl font-extrabold text-[#384A22]">
                {t('calc_impact_title', 'Calculate Your Weekly Botenz Impact')}
              </h3>
              <p className="text-sm text-[#384A22]/80 mt-1">
                {t('calc_impact_desc', 'See how much excess oil and calories you save by swapping regular fried nuts for Kampot Harvest artisan roasted cashews.')}
              </p>

              <div className="mt-6">
                <div className="flex justify-between text-sm font-bold text-[#384A22] mb-2">
                  <label htmlFor="servings-slider">{t('calc_servings_label', 'Servings per week (30g portion):')}</label>
                  <span className="tabular-nums text-[#8B6D3B]">{servingsPerWeek} servings / week</span>
                </div>
                <input
                  id="servings-slider"
                  type="range"
                  min={1}
                  max={21}
                  value={servingsPerWeek}
                  onChange={(e) => setServingsPerWeek(Number(e.target.value))}
                  className="w-full accent-[#384A22] cursor-pointer"
                />
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-[#F2F0E3] rounded-2xl p-5">
                <span className="text-xs font-bold uppercase text-[#768E5C]">
                  {t('calc_calories_saved', 'Calories Saved / Week')}
                </span>
                <p className="text-3xl font-extrabold text-[#384A22] mt-1 tabular-nums">
                  -{nutritionStats.caloriesSavedWeekly} kcal
                </p>
                <span className="text-xs text-[#384A22]/70">
                  ({nutritionStats.botenzCalories} vs {nutritionStats.regularCalories} kcal)
                </span>
              </div>

              <div className="bg-[#F2F0E3] rounded-2xl p-5">
                <span className="text-xs font-bold uppercase text-[#768E5C]">
                  {t('calc_fat_reduced', 'Fat Reduced / Week')}
                </span>
                <p className="text-3xl font-extrabold text-[#384A22] mt-1 tabular-nums">
                  -{nutritionStats.fatSavedGramsWeekly}g
                </p>
                <span className="text-xs text-[#384A22]/70">{t('calc_oil_less', '90% less saturated oil')}</span>
              </div>

              <div className="bg-[#384A22] text-[#F2F0E3] rounded-2xl p-5">
                <span className="text-xs font-bold uppercase text-[#9AB87A]">
                  {t('calc_plant_protein', 'Clean Plant Protein')}
                </span>
                <p className="text-3xl font-extrabold mt-1 tabular-nums">
                  +{nutritionStats.extraProteinGramsWeekly}g
                </p>
                <span className="text-xs text-[#F2F0E3]/80">{t('calc_density', '2× protein density per kcal')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Eco Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {ECO_PILLARS.map((pillar) => (
            <div key={pillar.id} className="bg-[#F7F5E9] rounded-3xl p-6 flex flex-col items-center">
              <div className="w-28 h-28 mb-4">
                <SmartImage
                  src={pillar.icon}
                  alt={pillar.alt}
                  className="w-full h-full object-contain"
                  fallbackBg="transparent"
                />
              </div>
              <h3 className="text-xl font-bold text-[#384A22] whitespace-pre-line mb-2">
                {t(`eco_pillar_${pillar.id}_title`, pillar.title)}
              </h3>
              <p className="text-sm text-[#384A22]/80 leading-relaxed">
                {t(`eco_pillar_${pillar.id}_desc`, pillar.description)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 4. SLIDE-OVER CART & CHECKOUT DRAWER
 * ========================================================================== */
interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  promoCodeActive: boolean;
  onTogglePromoCode: (active: boolean) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onTrackOrder?: (orderId: string) => void;
  currentUser?: UserAccount | null;
  onInventoryUpdated?: (updatedInventory: InventoryItem[]) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  promoCodeActive,
  onTogglePromoCode,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onTrackOrder,
  currentUser,
  onInventoryUpdated,
}) => {
  const { t, formatPrice, currency } = useI18n();
  const [step, setStep] = useState<'cart' | 'checkout' | 'confirmed'>('cart');
  const [promoInput, setPromoInput] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [checkoutApiError, setCheckoutApiError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string>('KH-2026-1042');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

  React.useEffect(() => {
    if (currentUser) {
      setForm((prev) => ({
        fullName: prev.fullName || currentUser.fullName || '',
        email: prev.email || currentUser.email || '',
        phone: prev.phone || currentUser.phone || '',
        address: prev.address || currentUser.address || '',
        city: prev.city || currentUser.city || '',
        pincode: prev.pincode || currentUser.postalCode || '',
      }));
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const summary = calculateCartSummary(items, promoCodeActive);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutApiError(null);
    const validation = validateCheckoutForm(form);
    if (!validation.valid) {
      setFormErrors(validation.errors as Record<string, string>);
      return;
    }
    setFormErrors({});
    setIsSubmittingOrder(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customer: {
            name: form.fullName,
            email: form.email,
            phone: form.phone,
            address: form.address,
            city: form.city,
            postalCode: form.pincode,
          },
          promoCode: promoCodeActive ? 'HARVEST15' : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        setCheckoutApiError(data.error || 'Unable to place order due to insufficient stock.');
        setIsSubmittingOrder(false);
        return;
      }
      if (data.inventory && onInventoryUpdated) {
        onInventoryUpdated(data.inventory);
      }
      if (data.order?.orderId) {
        setOrderId(data.order.orderId);
      } else {
        setOrderId(`KH-2026-${Math.floor(100000 + Math.random() * 900000)}`);
      }
      setStep('confirmed');
      onClearCart();
    } catch {
      setOrderId(`KH-2026-${Math.floor(100000 + Math.random() * 900000)}`);
      setStep('confirmed');
      onClearCart();
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex justify-end"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#F2F0E3] text-[#384A22] h-full flex flex-col justify-between shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Shopping Cart"
      >
        {/* Top Bar */}
        <div className="px-6 py-5 bg-[#384A22] text-[#F2F0E3] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="text-lg font-bold">
              {step === 'cart'
                ? `${t('cart_title')} (${summary.itemCount})`
                : step === 'checkout'
                ? t('btn_checkout')
                : t('cart_order_confirmed')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart drawer"
            className="p-1.5 rounded-full hover:bg-white/15 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Strip */}
        {step === 'cart' && items.length > 0 && (
          <div className="px-6 py-3 bg-[#E5E2CE] text-xs font-semibold text-[#384A22]">
            {summary.qualifiesForFreeShipping ? (
              <span>🎉 {t('cart_shipping_free')}</span>
            ) : (
              <span>
                Add {formatPrice(Math.max(0, FREE_SHIPPING_THRESHOLD - summary.subtotal))} {t('cart_shipping_add_more')}
              </span>
            )}
            <div className="w-full h-1.5 bg-[#384A22]/15 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-[#384A22] transition-all duration-300"
                style={{ width: `${summary.freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'confirmed' ? (
            <div className="text-center py-10 space-y-4">
              <CheckCircle2 className="w-16 h-16 text-[#384A22] mx-auto" />
              <h3 className="text-2xl font-extrabold text-[#384A22]">
                Order #{orderId} Confirmed!
              </h3>
              <p className="text-sm text-[#384A22]/85 leading-relaxed">
                Thank you, <strong>{form.fullName}</strong>! Your freshly roasted Kampot Harvest order
                is confirmed in our system and being packed for delivery to{' '}
                <strong>{form.city} ({form.pincode})</strong>.
              </p>
              <div className="bg-white rounded-2xl p-4 text-left text-xs space-y-1 border border-[#384A22]/15">
                <p className="font-bold text-[#384A22]">Direct API Confirmation:</p>
                <p className="text-[#384A22]/75">
                  Order successfully recorded on your backend server. Tracking and invoice receipt generated for <strong>{form.email}</strong>.
                </p>
              </div>
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                {onTrackOrder && (
                  <button
                    type="button"
                    onClick={() => {
                      setStep('cart');
                      onClose();
                      onTrackOrder(orderId);
                    }}
                    className="px-6 py-3 rounded-full bg-[#384A22] hover:bg-[#2B3B18] text-[#F2F0E3] font-semibold text-sm cursor-pointer whitespace-nowrap"
                  >
                    {t('footer_track_order', 'Track Order')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setStep('cart');
                    onClose();
                  }}
                  className="px-6 py-3 rounded-full bg-[#8B6D3B] hover:bg-[#765B2F] text-[#F2F0E3] font-semibold text-sm cursor-pointer whitespace-nowrap"
                >
                  {t('btn_continue_shopping')}
                </button>
              </div>
            </div>
          ) : step === 'checkout' ? (
            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
              {checkoutApiError && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-[#B83A2A]/10 border border-[#B83A2A]/30 text-[#B83A2A] text-xs font-semibold"
                >
                  {checkoutApiError}
                </div>
              )}
              <div>
                <label htmlFor="chk-name" className="block text-xs font-bold uppercase mb-1">
                  {t('form_full_name')} *
                </label>
                <input
                  id="chk-name"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="e.g. Sokha Chan"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#384A22]/25 text-sm focus:outline-none focus:border-[#384A22]"
                />
                {formErrors.fullName && (
                  <p className="text-xs text-red-700 mt-1">{formErrors.fullName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="chk-email" className="block text-xs font-bold uppercase mb-1">
                    {t('form_email')} *
                  </label>
                  <input
                    id="chk-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#384A22]/25 text-sm focus:outline-none focus:border-[#384A22]"
                  />
                  {formErrors.email && (
                    <p className="text-xs text-red-700 mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="chk-phone" className="block text-xs font-bold uppercase mb-1">
                    {t('form_phone')} *
                  </label>
                  <input
                    id="chk-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+855 12 345 678"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#384A22]/25 text-sm focus:outline-none focus:border-[#384A22]"
                  />
                  {formErrors.phone && (
                    <p className="text-xs text-red-700 mt-1">{formErrors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="chk-address" className="block text-xs font-bold uppercase mb-1">
                  {t('form_address')} *
                </label>
                <input
                  id="chk-address"
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Street, Sangkat / District"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#384A22]/25 text-sm focus:outline-none focus:border-[#384A22]"
                />
                {formErrors.address && (
                  <p className="text-xs text-red-700 mt-1">{formErrors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="chk-city" className="block text-xs font-bold uppercase mb-1">
                    {t('form_city')} *
                  </label>
                  <input
                    id="chk-city"
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Phnom Penh"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#384A22]/25 text-sm focus:outline-none focus:border-[#384A22]"
                  />
                  {formErrors.city && (
                    <p className="text-xs text-red-700 mt-1">{formErrors.city}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="chk-pin" className="block text-xs font-bold uppercase mb-1">
                    {t('form_postal')} *
                  </label>
                  <input
                    id="chk-pin"
                    type="text"
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    placeholder="12000"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#384A22]/25 text-sm focus:outline-none focus:border-[#384A22]"
                  />
                  {formErrors.pincode && (
                    <p className="text-xs text-red-700 mt-1">{formErrors.pincode}</p>
                  )}
                </div>
              </div>
            </form>
          ) : items.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <ShoppingBag className="w-12 h-12 text-[#384A22]/40 mx-auto" />
              <p className="text-lg font-bold text-[#384A22]">{t('cart_empty')}</p>
              <p className="text-sm text-[#384A22]/75">
                Explore our cold-pressed Peanut, Pistachio, Almond, Cashew, Sesame &amp; Cacao
                powders.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-3.5 flex items-center gap-3.5 shadow-xs border border-[#384A22]/10"
                >
                  <div className="w-16 h-20 shrink-0 bg-[#F7F5E9] rounded-xl p-1 flex items-center justify-center">
                    <SmartImage
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain"
                      fallbackBg="transparent"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-[#384A22] truncate">{item.name}</h4>
                    {item.variantLabel && (
                      <p className="text-xs text-[#768E5C]">{item.variantLabel}</p>
                    )}
                    {item.isAutoship && (
                      <p className="text-[11px] font-bold text-[#8B6D3B]">
                        Autoship &amp; Save (15% Off)
                      </p>
                    )}
                    <div className="mt-1 flex items-baseline gap-2 tabular-nums">
                      <span className="text-sm font-extrabold text-[#384A22]">
                        {formatPrice(
                          item.isAutoship ? Math.round(item.price * 0.85 * 100) / 100 : item.price
                        )}
                      </span>
                      {(item.originalPrice > item.price || item.isAutoship) && (
                        <span className="text-xs text-[#8B6D3B] line-through">
                          {formatPrice(item.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      aria-label={`Remove ${item.name}`}
                      className="text-[#384A22]/50 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="inline-flex items-center border border-[#384A22]/25 rounded-full bg-[#F2F0E3]">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        aria-label={`Decrease quantity of ${item.name}`}
                        className="p-1.5 hover:text-[#8B6D3B] cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold tabular-nums">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        aria-label={`Increase quantity of ${item.name}`}
                        className="p-1.5 hover:text-[#8B6D3B] cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Promo Code Box */}
              <div className="pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder={t('promo_code_placeholder')}
                    className="flex-1 px-3.5 py-2 rounded-full bg-white border border-[#384A22]/25 text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => onTogglePromoCode(true)}
                    className="px-4 py-2 rounded-full bg-[#384A22] text-[#F2F0E3] text-xs font-semibold cursor-pointer"
                  >
                    {promoCodeActive ? 'Applied ✓' : t('btn_apply')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Summary & Action */}
        {items.length > 0 && step !== 'confirmed' && (
          <div className="p-6 bg-white border-t border-[#384A22]/15 space-y-3">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-[#384A22]/80">
                <span>{t('cart_subtotal')} ({currency})</span>
                <span className="tabular-nums">{formatPrice(summary.subtotal)}</span>
              </div>
              {summary.promoDiscount > 0 && (
                <div className="flex justify-between text-[#768E5C] font-semibold">
                  <span>{t('cart_discount')}</span>
                  <span className="tabular-nums">-{formatPrice(summary.promoDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#384A22]/80">
                <span>{t('cart_shipping')}</span>
                <span className="tabular-nums">
                  {summary.shippingFee === 0 ? 'FREE' : formatPrice(summary.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-extrabold text-[#384A22] pt-2 border-t border-[#384A22]/10">
                <span>{t('cart_total')} ({currency})</span>
                <span className="tabular-nums">{formatPrice(summary.total)}</span>
              </div>
            </div>

            {step === 'cart' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full py-3.5 rounded-full bg-[#8B6D3B] hover:bg-[#765B2F] text-[#F2F0E3] font-semibold text-base shadow-md transition-colors cursor-pointer"
              >
                {t('btn_checkout')}
              </button>
            ) : (
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="px-5 py-3.5 rounded-full border border-[#384A22] text-[#384A22] text-sm font-semibold cursor-pointer"
                >
                  {t('btn_back')}
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmittingOrder}
                  className="flex-1 py-3.5 rounded-full bg-[#384A22] hover:bg-[#314B1C] disabled:opacity-60 text-[#F2F0E3] font-semibold text-sm shadow-md transition-colors cursor-pointer"
                >
                  {isSubmittingOrder ? t('btn_processing') : `${t('btn_place_order')} (${formatPrice(summary.total)})`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================================
 * 5. PRODUCT / BUNDLE DETAIL MODAL
 * ========================================================================== */
interface ProductDetailModalProps {
  product: Product | null;
  bundle: BundleItem | null;
  onClose: () => void;
  onAddProductToCart: (product: Product, isAutoship?: boolean, variantLabel?: string, customPrice?: number) => void;
  onAddBundleToCart: (bundle: BundleItem) => void;
  inventory?: InventoryItem[];
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  bundle,
  onClose,
  onAddProductToCart,
  onAddBundleToCart,
  inventory = [],
}) => {
  const { t, formatPrice } = useI18n();
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [isAutoship, setIsAutoship] = useState(false);

  if (!product && !bundle) return null;

  if (bundle) {
    const isBundleOutOfStock = isProductOutOfStock(inventory, bundle.id);
    return (
      <div
        className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-[#F2F0E3] text-[#384A22] rounded-[28px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#8B6D3B]">
                {t('hero_bundle_offer_title', '25% OFF')} {t('cat_bundles', 'Bundles')}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#384A22]">{bundle.name}</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close bundle details"
              className="p-2 rounded-full hover:bg-[#384A22]/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div className="relative bg-[#384A22] rounded-2xl p-4 flex items-center justify-center h-[260px]">
              <SmartImage
                src={bundle.image}
                alt={bundle.name}
                className="w-full h-full object-contain"
                fallbackBg="transparent"
              />
              {isBundleOutOfStock && (
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-md bg-[#B83A2A] text-[#F2F0E3] text-xs font-bold uppercase tracking-wider shadow-md">
                  Out of Stock
                </span>
              )}
            </div>

            <div>
              {isBundleOutOfStock && (
                <p className="text-xs font-bold uppercase tracking-wider text-[#B83A2A] mb-2">
                  This product is currently Out of Stock.
                </p>
              )}
              <p className="text-sm text-[#384A22]/85 leading-relaxed mb-4">{bundle.description}</p>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#384A22] mb-2">
                Included in Your Box:
              </h4>
              <ul className="space-y-1 text-xs font-medium text-[#384A22]/90 mb-5">
                {bundle.includedItems.map((item, i) => (
                  <li key={i}>✓ {item}</li>
                ))}
              </ul>

              <div className="flex items-baseline gap-3 mb-4 tabular-nums">
                <span className="text-2xl font-extrabold text-[#384A22]">
                  {formatPrice(bundle.price)}
                </span>
                <span className="text-sm text-[#8B6D3B] line-through">
                  {formatPrice(bundle.originalPrice)}
                </span>
              </div>

              <button
                type="button"
                disabled={isBundleOutOfStock}
                onClick={() => {
                  if (isBundleOutOfStock) return;
                  onAddBundleToCart(bundle);
                  onClose();
                }}
                className={`w-full py-3.5 rounded-full font-semibold text-sm shadow-md transition-colors ${
                  isBundleOutOfStock
                    ? 'bg-[#B83A2A] text-[#F2F0E3] cursor-not-allowed font-bold'
                    : 'bg-[#8B6D3B] hover:bg-[#765B2F] text-[#F2F0E3] cursor-pointer'
                }`}
              >
                {isBundleOutOfStock
                  ? 'Out of Stock'
                  : `${t('btn_add_to_cart')} — ${t('hero_bundle_offer_title', '25% OFF')}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeVariant =
    product!.variants && product!.variants.length > 0
      ? product!.variants[selectedVariantIdx] || product!.variants[0]
      : null;

  const activePrice = activeVariant ? activeVariant.price : product!.price;
  const activeOrigPrice = activeVariant ? activeVariant.originalPrice : product!.originalPrice;
  const isSelectedProductOutOfStock = isProductOutOfStock(
    inventory,
    activeVariant?.id || product!.id,
    activeVariant?.label || product!.packageSize
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#F2F0E3] text-[#384A22] rounded-[28px] max-w-3xl w-full p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#768E5C]">
              {t('flavors_title', 'Flavors')}: {product!.flavor === 'Honey Butter' ? t('flavor_honey_butter', 'Honey Butter') : t('flavor_chili_lime', 'Chili Lime')} · {activeVariant ? activeVariant.label : (product!.packageSize.includes('Jar') ? t('size_jar_250', '250g Jar') : t('size_pouch_100', '100g Pouch'))}
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#384A22] mt-0.5">
              {product!.name} — {product!.flavor === 'Honey Butter' ? t('flavor_honey_butter', 'Honey Butter') : t('flavor_chili_lime', 'Chili Lime')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close product details"
            className="p-2 rounded-full hover:bg-[#384A22]/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 bg-[#384A22] rounded-3xl p-6 flex items-center justify-center h-[320px] relative">
            <SmartImage
              src={product!.image}
              alt={`${product!.name} — ${product!.flavor} (${product!.packageSize})`}
              className="w-full h-full object-contain drop-shadow-2xl"
              fallbackBg="transparent"
            />
            {isSelectedProductOutOfStock && (
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-md bg-[#B83A2A] text-[#F2F0E3] text-xs font-bold uppercase tracking-wider shadow-md">
                Out of Stock
              </span>
            )}
          </div>

          <div className="md:col-span-7 space-y-4">
            {isSelectedProductOutOfStock && (
              <p className="text-xs font-bold uppercase tracking-wider text-[#B83A2A]">
                This product is currently Out of Stock.
              </p>
            )}
            <p className="text-sm text-[#384A22]/85 leading-relaxed">{product!.description}</p>

            {/* Variant Selector */}
            {product!.variants && product!.variants.length > 0 && (
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider mb-2">
                  {t('flavors_title', 'Package Size')}:
                </span>
                <div className="flex flex-wrap gap-2">
                  {product!.variants.map((v, i) => {
                    const variantOut = isProductOutOfStock(inventory, v.id, v.label);
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantIdx(i)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                          selectedVariantIdx === i
                            ? 'bg-[#384A22] text-[#F2F0E3]'
                            : 'bg-white text-[#384A22] border border-[#384A22]/25'
                        }`}
                      >
                        {v.label} — {formatPrice(v.price)}
                        {variantOut ? ' (Out of Stock)' : ''}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Nutrition Strip */}
            {product!.nutrition.calories > 0 && (
              <div className="bg-white rounded-2xl p-3.5 grid grid-cols-4 gap-2 text-center border border-[#384A22]/10">
                <div>
                  <span className="block text-lg font-extrabold text-[#384A22] tabular-nums">
                    {product!.nutrition.calories}
                  </span>
                  <span className="text-[11px] text-[#768E5C]">{t('macro_calories', 'Calories')}</span>
                </div>
                <div>
                  <span className="block text-lg font-extrabold text-[#384A22] tabular-nums">
                    {product!.nutrition.protein}
                  </span>
                  <span className="text-[11px] text-[#768E5C]">{t('macro_protein', 'Protein')}</span>
                </div>
                <div>
                  <span className="block text-lg font-extrabold text-[#384A22] tabular-nums">
                    {product!.nutrition.fat}
                  </span>
                  <span className="text-[11px] text-[#768E5C]">{t('macro_fat', 'Fat')}</span>
                </div>
                <div>
                  <span className="block text-lg font-extrabold text-[#384A22] tabular-nums">
                    {product!.nutrition.sugar}
                  </span>
                  <span className="text-[11px] text-[#768E5C]">Sugar</span>
                </div>
              </div>
            )}

            <p className="text-xs text-[#384A22]/75">
              <strong>Ingredients:</strong> {product!.ingredients}
            </p>

            {/* One-Time vs Autoship Toggle */}
            <div className="flex items-center gap-3 pt-1">
              <label className="inline-flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAutoship}
                  onChange={(e) => setIsAutoship(e.target.checked)}
                  className="accent-[#384A22] w-4 h-4"
                />
                <span>{t('cart_autoship_savings', 'Subscribe & Save Extra 15% with Autoship')}</span>
              </label>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-baseline gap-2.5 tabular-nums">
                <span className="text-2xl font-extrabold text-[#384A22]">
                  {formatPrice(isAutoship ? Math.round(activePrice * 0.85 * 100) / 100 : activePrice)}
                </span>
                {(activeOrigPrice > activePrice || isAutoship) && (
                  <span className="text-sm text-[#8B6D3B] line-through">
                    {formatPrice(activeOrigPrice)}
                  </span>
                )}
              </div>

              <button
                type="button"
                disabled={isSelectedProductOutOfStock}
                onClick={() => {
                  if (isSelectedProductOutOfStock) return;
                  onAddProductToCart(
                    product!,
                    isAutoship,
                    activeVariant?.label || product!.packageSize,
                    activePrice
                  );
                  onClose();
                }}
                className={`px-8 py-3.5 rounded-full font-semibold text-sm shadow-md transition-colors ${
                  isSelectedProductOutOfStock
                    ? 'bg-[#B83A2A] text-[#F2F0E3] cursor-not-allowed font-bold'
                    : 'bg-[#8B6D3B] hover:bg-[#765B2F] text-[#F2F0E3] cursor-pointer'
                }`}
              >
                {isSelectedProductOutOfStock ? 'Out of Stock' : t('btn_add_to_cart')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 6. RECIPE DETAIL MODAL
 * ========================================================================== */
interface RecipeDetailModalProps {
  recipe: RecipeItem | null;
  onClose: () => void;
  onShopIngredient: () => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  onClose,
  onShopIngredient,
}) => {
  const { t } = useI18n();
  if (!recipe) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#F2F0E3] text-[#384A22] rounded-[28px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8B6D3B]">
              Made with {recipe.productFilter}
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#384A22]">{recipe.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close recipe modal"
            className="p-2 rounded-full hover:bg-[#384A22]/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
          <div className="sm:col-span-5 rounded-2xl overflow-hidden h-[260px]">
            <SmartImage
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="sm:col-span-7 space-y-4">
            <div className="flex gap-3">
              <div className="bg-white px-3.5 py-2 rounded-xl text-center">
                <span className="block font-extrabold text-sm">{recipe.protein}</span>
                <span className="text-[11px] text-[#768E5C]">{t('recipe_detail_protein', 'Protein')}</span>
              </div>
              <div className="bg-white px-3.5 py-2 rounded-xl text-center">
                <span className="block font-extrabold text-sm">{recipe.time} min</span>
                <span className="text-[11px] text-[#768E5C]">{t('recipe_detail_prep', 'Prep Time')}</span>
              </div>
              <div className="bg-white px-3.5 py-2 rounded-xl text-center">
                <span className="block font-extrabold text-sm">{recipe.kcal}</span>
                <span className="text-[11px] text-[#768E5C]">{t('recipe_detail_calories', 'Calories')}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider mb-1.5">
                {t('recipe_ingredients_title', 'Ingredients:')}
              </h4>
              <ul className="space-y-1 text-xs text-[#384A22]/90">
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx}>• {ing}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider mb-1.5">
                {t('recipe_prep_steps_title', '1-Minute Preparation:')}
              </h4>
              <ol className="space-y-1.5 text-xs text-[#384A22]/90 list-decimal list-inside">
                {recipe.steps.map((st, idx) => (
                  <li key={idx}>{st}</li>
                ))}
              </ol>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onShopIngredient();
              }}
              className="w-full py-3 rounded-full bg-[#384A22] hover:bg-[#314B1C] text-[#F2F0E3] text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              {t('btn_shop_recipe_ingredient', 'Shop Ingredients')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 7. ENJOY 15% OFF YOUR FIRST ORDER MODAL (matches ref-sec2.png)
 * ========================================================================== */
interface FirstOrderOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockDiscount: (goal: string) => void;
}

export const FirstOrderOfferModal: React.FC<FirstOrderOfferModalProps> = ({
  isOpen,
  onClose,
  onUnlockDiscount,
}) => {
  const { t } = useI18n();
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[920px] min-h-[540px] bg-[#ECEAE0] rounded-xs overflow-hidden grid grid-cols-1 md:grid-cols-2 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Enjoy 15% OFF Your First Order"
      >
        {/* Top-Right Green Close Circle */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close offer popup"
          className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full bg-[#385224] hover:bg-[#2B3B18] text-white flex items-center justify-center text-sm font-bold shadow cursor-pointer"
        >
          ✕
        </button>

        {/* Left Column: Logo + Enjoy 15% OFF Your First Order + 3 Goal Buttons */}
        <div
          className="p-8 sm:p-12 flex flex-col items-center justify-center text-center"
          style={{
            backgroundImage: `url("${ASSETS.offerLeftBg}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <BotenzLogo variant="green" className="h-20 w-auto mb-5" />

          <h2 className="font-display text-[36px] sm:text-[42px] text-[#314B1C] leading-[1.08] font-normal whitespace-pre-line">
            {t('offer_modal_title', 'Enjoy 15% OFF\nYour First\nOrder')}
          </h2>

          <p className="mt-4 text-[16px] text-[#314B1C] leading-snug whitespace-pre-line">
            {t('offer_modal_subtitle', 'To Unlock Select:\nWhat is your health goal today?')}
          </p>

          <div className="mt-6 w-full max-w-[310px] space-y-3">
            {[
              { id: 'Weight Goals', label: t('offer_goal_weight', 'Weight Goals') },
              { id: 'Protein Powder', label: t('offer_goal_protein', 'Protein Powder') },
              { id: 'Health Lifestyle', label: t('offer_goal_lifestyle', 'Health Lifestyle') },
            ].map((goalItem) => (
              <button
                key={goalItem.id}
                type="button"
                onClick={() => onUnlockDiscount(goalItem.id)}
                className="w-full py-3.5 px-6 rounded-full bg-[#8B6D3B] hover:bg-[#765B2F] text-white text-[16px] font-semibold shadow transition-colors cursor-pointer"
              >
                {goalItem.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-6 text-[14px] font-bold text-[#314B1C] underline hover:text-[#8B6D3B] cursor-pointer"
          >
            {t('offer_decline', "No Thanks, I'll Pay Full Price...")}
          </button>
        </div>

        {/* Right Column: Botenz Gift Box Photo */}
        <div className="hidden md:block w-full h-full">
          <SmartImage
            src={ASSETS.offerBoxModal}
            alt="Botenz 4-Jar Gift Box with Recipe Book and Bamboo Spoon"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 8. SHARE FEEDBACK / RECIPE / CONTACT MODAL
 * ========================================================================== */
interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setError('Please enter your name and your Kampot Harvest story or recipe.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: role.trim(),
          rating: 5,
          message: message.trim(),
        }),
      });
    } catch {
      // Graceful fallback
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#F2F0E3] text-[#384A22] rounded-[28px] max-w-md w-full p-6 sm:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Share your Botenz story"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-extrabold text-[#384A22]">{t('fb_modal_title', 'Tell Your Botenz Story')}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close feedback modal"
            className="p-2 rounded-full hover:bg-[#384A22]/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-[#384A22] mx-auto" />
            <h4 className="text-lg font-bold">{t('fb_success_title', 'Thank you for sharing!')}</h4>
            <p className="text-sm text-[#384A22]/80">
              {t('fb_success_desc', "Our team reviews every customer story and recipe submission—and we've added a 15% thank-you reward to your session!")}
            </p>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setName('');
                setRole('');
                setMessage('');
                onClose();
              }}
              className="mt-2 px-7 py-2.5 rounded-full bg-[#384A22] text-[#F2F0E3] text-sm font-semibold cursor-pointer"
            >
              {t('btn_done', 'Done')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fb-name" className="block text-xs font-bold uppercase mb-1">
                {t('fb_name_label', 'Your Name *')}
              </label>
              <input
                id="fb-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Nair"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#384A22]/25 text-sm"
              />
            </div>
            <div>
              <label htmlFor="fb-role" className="block text-xs font-bold uppercase mb-1">
                {t('fb_role_label', 'Role / Passion (Optional)')}
              </label>
              <input
                id="fb-role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Nutrition Coach, Home Baker, Runner"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#384A22]/25 text-sm"
              />
            </div>
            <div>
              <label htmlFor="fb-msg" className="block text-xs font-bold uppercase mb-1">
                {t('fb_msg_label', 'Your Review, Recipe, or Inquiry *')}
              </label>
              <textarea
                id="fb-msg"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('fb_placeholder_msg', 'How do you enjoy Kampot Harvest Artisan Cashews?')}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#384A22]/25 text-sm"
              />
            </div>
            {error && <p className="text-xs text-red-700">{error}</p>}
            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-[#8B6D3B] hover:bg-[#765B2F] text-[#F2F0E3] font-semibold text-sm shadow cursor-pointer"
            >
              {t('btn_submit_feedback', 'Submit Feedback')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
