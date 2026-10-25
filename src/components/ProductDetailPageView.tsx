import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Heart,
  Share2,
  ShieldCheck,
  Truck,
  RefreshCw,
  Star,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  PackageCheck,
  Award,
  Leaf,
  ChevronRight,
  Flame,
} from 'lucide-react';
import {
  ASSETS,
  Product,
  BundleItem,
  PRODUCTS,
  BUNDLES,
} from '../data/botenzData';
import {
  InventoryItem,
  isProductOutOfStock,
  getSmartProductRecommendations,
  RecommendedCatalogItem,
} from '../utils/storeLogic';
import { SmartImage } from './SmartImage';
import { ActivePage } from './Navbar';
import { useI18n } from '../utils/i18nContext';

export interface ProductDetailPageViewProps {
  product: Product | null;
  bundle: BundleItem | null;
  onBack: () => void;
  onNavigate: (page: ActivePage, categoryFilter?: string) => void;
  onAddProductToCart: (
    product: Product,
    isAutoship?: boolean,
    variantLabel?: string,
    customPrice?: number,
    quantity?: number
  ) => void;
  onAddBundleToCart: (bundle: BundleItem, quantity?: number) => void;
  onSelectProduct: (product: Product) => void;
  onSelectBundle: (bundle: BundleItem) => void;
  recentlyViewedIds?: string[];
  inventory?: InventoryItem[];
}

export const ProductDetailPageView: React.FC<ProductDetailPageViewProps> = ({
  product,
  bundle,
  onBack,
  onNavigate,
  onAddProductToCart,
  onAddBundleToCart,
  onSelectProduct,
  onSelectBundle,
  recentlyViewedIds = [],
  inventory = [],
}) => {
  const { t, formatPrice } = useI18n();
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [isAutoship, setIsAutoship] = useState(false);
  const [autoshipFreq, setAutoshipFreq] = useState<'30' | '45' | '60'>('30');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'tasting' | 'nutrition' | 'craft'>('tasting');
  const [activeRecTab, setActiveRecTab] = useState<'related' | 'you_may_like' | 'bought_together'>('related');
  const [isFavorited, setIsFavorited] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Scroll to top whenever product or bundle changes
  useEffect(() => {
    setSelectedVariantIdx(0);
    setIsAutoship(false);
    setQuantity(1);
    setActiveTab('tasting');
    setActiveRecTab('related');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product?.id, bundle?.id]);

  if (!product && !bundle) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 bg-[#F2F0E3] text-[#384A22]">
        <p className="text-xl font-bold mb-4">No product selected</p>
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 rounded-full bg-[#384A22] text-[#F2F0E3] font-medium"
        >
          {t('detail_back_to_shop', 'Back to Shop')}
        </button>
      </div>
    );
  }

  // Active Variant & Pricing Calculations
  const activeVariant =
    product && product.variants && product.variants.length > 0
      ? product.variants[selectedVariantIdx] || product.variants[0]
      : null;

  const targetRecommendationId = bundle
    ? bundle.id
    : activeVariant?.id || product!.id;
  const targetVariantLabel = bundle
    ? undefined
    : activeVariant?.label || product!.packageSize;

  const recommendations = getSmartProductRecommendations(
    targetRecommendationId,
    inventory,
    {
      variantLabel: targetVariantLabel,
      recentlyViewedIds,
      maxResults: 3,
    }
  );

  const displayedRecommendations =
    activeRecTab === 'related'
      ? recommendations.relatedProducts
      : activeRecTab === 'you_may_like'
      ? recommendations.youMayAlsoLike
      : recommendations.frequentlyBoughtTogether;

  const handleShare = () => {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2200);
    }
  };

  const handleQuantityDelta = (delta: number, maxStock = 99) => {
    setQuantity((prev) => Math.max(1, Math.min(maxStock, prev + delta)));
  };

  /* --------------------------------------------------------------------------
   * 1. BUNDLE DETAIL FULL PAGE VIEW
   * ------------------------------------------------------------------------ */
  if (bundle) {
    const isBundleOutOfStock = isProductOutOfStock(inventory, bundle.id);
    const bundleInventoryItem = inventory.find((i) => i.id === bundle.id);
    const currentStock = bundleInventoryItem ? bundleInventoryItem.stockQuantity : 25;
    const bundlePrice = bundle.price;
    const bundleOrigPrice = bundle.originalPrice;
    const localizedBundleName =
      bundle.id === 'bundle-complete-4pack'
        ? t('bundle_complete_4pack_name', bundle.name)
        : bundle.id === 'bundle-jars-duo'
        ? t('bundle_jars_duo_name', bundle.name)
        : bundle.id === 'bundle-pouches-duo'
        ? t('bundle_pouches_duo_name', bundle.name)
        : bundle.name;

    const localizedBundleDesc =
      bundle.id.includes('complete')
        ? t('bundle_complete_4pack_desc', bundle.description)
        : bundle.id.includes('jars') || bundle.id.includes('nut-lovers')
        ? t('bundle_jars_duo_desc', bundle.description)
        : bundle.id.includes('pouches') || bundle.id.includes('best-seller')
        ? t('bundle_pouches_duo_desc', bundle.description)
        : bundle.description;

    return (
      <div className="w-full bg-[#F2F0E3] text-[#384A22] min-h-screen pb-36 xl:pb-24">
        {/* Breadcrumb & Navigation Bar */}
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-14 pt-8 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#384A22]/15 pb-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-[#384A22] border border-[#384A22]/20 font-bold transition-all hover:scale-105 cursor-pointer shadow-sm mr-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('detail_back_to_shop', 'Back to Shop')}</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="hover:text-[#8B6D3B] transition-colors cursor-pointer"
              >
                {t('detail_breadcrumb_home', 'Home')}
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-[#384A22]/40" />
              <button
                type="button"
                onClick={() => onNavigate('shop', 'bundles')}
                className="hover:text-[#8B6D3B] transition-colors cursor-pointer"
              >
                {t('cat_bundles', 'Bundles')}
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-[#384A22]/40" />
              <span className="font-bold text-[#384A22] truncate max-w-[200px] sm:max-w-md">
                {localizedBundleName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFavorited((prev) => !prev)}
                aria-label="Add to wishlist"
                className={`p-2.5 rounded-full border transition-all cursor-pointer ${
                  isFavorited
                    ? 'bg-[#B83A2A] text-white border-[#B83A2A]'
                    : 'bg-white/80 hover:bg-white text-[#384A22] border-[#384A22]/20'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share bundle"
                className="relative inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/80 hover:bg-white text-[#384A22] border border-[#384A22]/20 text-xs font-bold transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copySuccess ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Product Hero Showcase */}
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-14 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-start">
            {/* Left Column: Big Visual Presentation Stage */}
            <div className="lg:col-span-6">
              <div
                className="relative w-full rounded-[36px] bg-[#384A22] p-8 sm:p-14 flex items-center justify-center min-h-[420px] sm:min-h-[500px] shadow-2xl overflow-hidden group"
                style={{
                  backgroundImage: `url("${ASSETS.productsWaveBg}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <SmartImage
                  src={bundle.image}
                  alt={localizedBundleName}
                  className="w-full h-full max-h-[420px] object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                  fallbackBg="transparent"
                />

                {/* Badges */}
                <div className="absolute top-5 left-5 flex flex-col gap-2">
                  <span className="px-3.5 py-1.5 rounded-full bg-[#8B6D3B] text-[#F2F0E3] text-xs font-extrabold uppercase tracking-wider shadow-md">
                    {t('hero_bundle_offer_title', '25% OFF')} {t('cat_bundles', 'Bundle')}
                  </span>
                  <span className="px-3.5 py-1.5 rounded-full bg-[#F2F0E3]/95 text-[#384A22] text-xs font-extrabold uppercase tracking-wider shadow-md">
                    {t('hero_batch_badge', '★ Kampot Harvest Original ★')}
                  </span>
                </div>

                {isBundleOutOfStock && (
                  <span className="absolute bottom-5 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full bg-[#B83A2A] text-[#F2F0E3] text-sm font-bold uppercase tracking-wider shadow-xl">
                    {t('badge_out_of_stock', 'Out of Stock')}
                  </span>
                )}
              </div>

              {/* Trust Pillars under Image */}
              <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                <div className="bg-white/80 rounded-2xl p-3 border border-[#384A22]/10 shadow-sm">
                  <Leaf className="w-5 h-5 mx-auto text-[#768E5C] mb-1" />
                  <span className="text-[11px] font-bold text-[#384A22] block leading-tight">100% Organic</span>
                  <span className="text-[10px] text-[#384A22]/65">Kampot Direct</span>
                </div>
                <div className="bg-white/80 rounded-2xl p-3 border border-[#384A22]/10 shadow-sm">
                  <Flame className="w-5 h-5 mx-auto text-[#8B6D3B] mb-1" />
                  <span className="text-[11px] font-bold text-[#384A22] block leading-tight">Artisan Roasted</span>
                  <span className="text-[10px] text-[#384A22]/65">Small Batches</span>
                </div>
                <div className="bg-white/80 rounded-2xl p-3 border border-[#384A22]/10 shadow-sm">
                  <Truck className="w-5 h-5 mx-auto text-[#384A22] mb-1" />
                  <span className="text-[11px] font-bold text-[#384A22] block leading-tight">Free Delivery</span>
                  <span className="text-[10px] text-[#384A22]/65">Orders $50+</span>
                </div>
              </div>
            </div>

            {/* Right Column: Information & Purchase Console */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#8B6D3B] block mb-1">
                  {t('cat_bundles', 'Artisan Gift Bundles')} · Kampot Origin
                </span>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#384A22] tracking-tight leading-tight mb-3">
                  {localizedBundleName}
                </h1>

                {/* Rating & Review Counter */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex items-center text-[#8B6D3B]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current text-[#8B6D3B]" />
                    ))}
                  </div>
                  <span className="text-sm font-extrabold text-[#384A22]">
                    4.96 <span className="text-[#384A22]/60 font-medium">(168 customer reviews)</span>
                  </span>
                  <span className="hidden sm:inline-block text-xs font-bold text-[#768E5C] bg-[#768E5C]/15 px-2 py-0.5 rounded-md">
                    ✓ Verified Organic Harvest
                  </span>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 pb-4 mb-5 border-b border-[#384A22]/15 tabular-nums flex-wrap">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#384A22]">
                    {formatPrice(bundlePrice)}
                  </span>
                  {bundleOrigPrice > bundlePrice && (
                    <span className="text-lg sm:text-xl text-[#8B6D3B] line-through font-semibold">
                      {formatPrice(bundleOrigPrice)}
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full bg-[#8B6D3B] text-[#F2F0E3] text-xs font-extrabold uppercase tracking-wider">
                    {t('hero_bundle_offer_title', '25% OFF')}
                  </span>
                </div>

                {/* Stock Status Indicator */}
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isBundleOutOfStock
                        ? 'bg-[#B83A2A]'
                        : currentStock < 10
                        ? 'bg-amber-500 animate-pulse'
                        : 'bg-emerald-600'
                    }`}
                  />
                  <span
                    className={`text-sm font-bold ${
                      isBundleOutOfStock
                        ? 'text-[#B83A2A]'
                        : currentStock < 10
                        ? 'text-amber-700'
                        : 'text-[#384A22]'
                    }`}
                  >
                    {isBundleOutOfStock
                      ? t('stock_currently_out_of_stock', 'This product is currently Out of Stock.')
                      : currentStock < 10
                      ? t('stock_only_left', 'Only {count} left in stock — order soon!').replace('{count}', String(currentStock))
                      : t('detail_in_stock', 'In Stock — Freshly batch roasted and ready to ship')}
                  </span>
                </div>

                <p className="text-base text-[#384A22]/85 leading-relaxed mb-6 font-normal">
                  {localizedBundleDesc}
                </p>

                {/* Included in Your Box Presentation */}
                <div className="bg-white rounded-2xl p-5 border border-[#384A22]/15 shadow-sm mb-6">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#384A22] mb-3 flex items-center gap-2">
                    <PackageCheck className="w-4 h-4 text-[#8B6D3B]" />
                    <span>{t('bundle_included_box', 'Included in Your Artisan Box:')}</span>
                  </h3>
                  <ul className="space-y-2 text-sm text-[#384A22]/90">
                    {bundle.includedItems.map((item, i) => {
                      const isHoney = item.includes('Honey Butter');
                      const isJar = item.includes('250g Jar');
                      const localizedItemName = isHoney
                        ? t('product_honey_butter_name', 'Honey Butter Cashews')
                        : t('product_chili_lime_name', 'Chili Lime Cashews');
                      const localizedItemSize = isJar
                        ? t('size_jar_250', '250g Jar')
                        : t('size_pouch_100', '100g Pouch');
                      const unitPrice = formatPrice(isJar ? 20 : 10);

                      return (
                        <li key={i} className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#384A22] text-[#F2F0E3] flex items-center justify-center text-[11px] font-bold shrink-0">
                              ✓
                            </span>
                            <span className="font-bold text-[#384A22]">{localizedItemName}</span>
                            <span className="text-[#384A22]/70">({localizedItemSize})</span>
                          </div>
                          <span className="font-bold text-[#8B6D3B] tabular-nums">{unitPrice}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Quantity & Add to Cart Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-[#384A22]/25 rounded-full bg-white px-2 py-1 shadow-sm">
                      <button
                        type="button"
                        onClick={() => handleQuantityDelta(-1)}
                        disabled={quantity <= 1 || isBundleOutOfStock}
                        aria-label="Decrease quantity"
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#384A22]/10 transition-colors disabled:opacity-40 cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-extrabold text-base text-[#384A22] tabular-nums">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityDelta(1, currentStock)}
                        disabled={quantity >= currentStock || isBundleOutOfStock}
                        aria-label="Increase quantity"
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#384A22]/10 transition-colors disabled:opacity-40 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={isBundleOutOfStock}
                      onClick={() => {
                        if (!isBundleOutOfStock) {
                          onAddBundleToCart(bundle, quantity);
                        }
                      }}
                      className={`flex-1 py-4 px-8 rounded-full text-base font-extrabold transition-all duration-200 shadow-lg flex items-center justify-center gap-3 cursor-pointer ${
                        isBundleOutOfStock
                          ? 'bg-[#B83A2A] text-[#F2F0E3] cursor-not-allowed'
                          : 'bg-[#8B6D3B] hover:bg-[#765B2F] text-[#F2F0E3] hover:shadow-xl hover:-translate-y-0.5'
                      }`}
                    >
                      <ShoppingBag className="w-5 h-5" />
                      <span>
                        {isBundleOutOfStock
                          ? t('badge_out_of_stock', 'Out of Stock')
                          : `${t('btn_add_to_cart')} — ${formatPrice(bundlePrice * quantity)}`}
                      </span>
                    </button>
                  </div>

                  {/* Value Assurance Badges */}
                  <div className="rounded-2xl bg-white/70 p-4 border border-[#384A22]/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#384A22]/85">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#768E5C] shrink-0" />
                      <span>{t('detail_ship_notice', 'Free glass-safe climate shipping on orders over $50')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#8B6D3B] shrink-0" />
                      <span>{t('detail_guarantee', '100% Freshness & Terroir Guarantee')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Recommendations Section */}
        {renderSmartRecommendations()}

        {/* Sticky Mobile One-Thumb Action Bar for Bundles */}
        <div
          id="mobile-sticky-action-bar-bundle"
          className="fixed bottom-[62px] left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#384A22]/15 px-4 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] xl:hidden flex items-center justify-between gap-3"
        >
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8B6D3B] truncate">
              {localizedBundleName}
            </span>
            <div className="flex items-baseline gap-1.5 tabular-nums">
              <span className="text-lg font-extrabold text-[#384A22]">
                {formatPrice(bundlePrice * quantity)}
              </span>
              {bundleOrigPrice > bundlePrice && (
                <span className="text-xs text-[#8B6D3B] line-through">
                  {formatPrice(bundleOrigPrice * quantity)}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            id="mobile-sticky-add-bundle"
            disabled={isBundleOutOfStock}
            onClick={() => {
              if (!isBundleOutOfStock) {
                onAddBundleToCart(bundle, quantity);
              }
            }}
            className={`min-h-[46px] px-6 py-2.5 rounded-full text-sm font-extrabold shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 shrink-0 ${
              isBundleOutOfStock
                ? 'bg-[#B83A2A] text-[#F2F0E3] cursor-not-allowed'
                : 'bg-[#8B6D3B] hover:bg-[#765B2F] text-[#F2F0E3]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              {isBundleOutOfStock ? t('badge_out_of_stock', 'Out of Stock') : t('btn_add_to_cart', 'Add to Cart')}
            </span>
          </button>
        </div>
      </div>
    );
  }

  /* --------------------------------------------------------------------------
   * 2. SINGLE PRODUCT FULL PAGE VIEW
   * ------------------------------------------------------------------------ */
  const activePrice = activeVariant ? activeVariant.price : product!.price;
  const activeOrigPrice = activeVariant ? activeVariant.originalPrice : product!.originalPrice;
  const isSelectedProductOutOfStock = isProductOutOfStock(
    inventory,
    activeVariant?.id || product!.id,
    activeVariant?.label || product!.packageSize
  );

  const matchedInvItem = inventory.find(
    (i) => i.id === (activeVariant?.id || product!.id)
  );
  const currentStock = matchedInvItem ? matchedInvItem.stockQuantity : 20;

  const localizedProductName = product!.name.includes('Chili')
    ? t('product_chili_lime_name', product!.name)
    : t('product_honey_butter_name', product!.name);

  const localizedFlavor =
    product!.flavor === 'Honey Butter'
      ? t('flavor_honey_butter', 'Honey Butter')
      : t('flavor_chili_lime', 'Chili Lime');

  const localizedDesc = product!.name.includes('Chili')
    ? t('product_chili_lime_desc', product!.description)
    : t('product_honey_butter_desc', product!.description);

  const computedUnitPrice = isAutoship
    ? Math.round(activePrice * 0.85 * 100) / 100
    : activePrice;

  return (
    <div className="w-full bg-[#F2F0E3] text-[#384A22] min-h-screen pb-36 xl:pb-24">
      {/* Breadcrumb & Navigation Bar */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-14 pt-8 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#384A22]/15 pb-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-[#384A22] border border-[#384A22]/20 font-bold transition-all hover:scale-105 cursor-pointer shadow-sm mr-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('detail_back_to_shop', 'Back to Shop')}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="hover:text-[#8B6D3B] transition-colors cursor-pointer"
            >
              {t('detail_breadcrumb_home', 'Home')}
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-[#384A22]/40" />
            <button
              type="button"
              onClick={() => onNavigate('shop', 'powders')}
              className="hover:text-[#8B6D3B] transition-colors cursor-pointer"
            >
              {t('detail_breadcrumb_shop', 'Shop')}
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-[#384A22]/40" />
            <span className="font-bold text-[#384A22] truncate max-w-[200px] sm:max-w-md">
              {localizedProductName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFavorited((prev) => !prev)}
              aria-label="Add to wishlist"
              className={`p-2.5 rounded-full border transition-all cursor-pointer ${
                isFavorited
                  ? 'bg-[#B83A2A] text-white border-[#B83A2A]'
                  : 'bg-white/80 hover:bg-white text-[#384A22] border-[#384A22]/20'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share product"
              className="relative inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/80 hover:bg-white text-[#384A22] border border-[#384A22]/20 text-xs font-bold transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copySuccess ? 'Link Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Product Hero Showcase */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-14 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-start">
          {/* Left Column: Big Visual Presentation Stage */}
          <div className="lg:col-span-6">
            <div
              className="relative w-full rounded-[36px] bg-[#384A22] p-8 sm:p-14 flex items-center justify-center min-h-[440px] sm:min-h-[520px] shadow-2xl overflow-hidden group"
              style={{
                backgroundImage: `url("${ASSETS.productsWaveBg}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <SmartImage
                src={product!.image}
                alt={`${localizedProductName} — ${localizedFlavor}`}
                className="w-full h-full max-h-[420px] object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                fallbackBg="transparent"
              />

              {/* Badges */}
              <div className="absolute top-5 left-5 flex flex-col gap-2">
                <span className="px-3.5 py-1.5 rounded-full bg-[#8B6D3B] text-[#F2F0E3] text-xs font-extrabold uppercase tracking-wider shadow-md">
                  ★ Kampot GI Certified ★
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-[#F2F0E3]/95 text-[#384A22] text-xs font-extrabold uppercase tracking-wider shadow-md">
                  Grade W180 Jumbo Nut
                </span>
              </div>

              {isSelectedProductOutOfStock && (
                <span className="absolute bottom-5 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full bg-[#B83A2A] text-[#F2F0E3] text-sm font-bold uppercase tracking-wider shadow-xl">
                  {t('badge_out_of_stock', 'Out of Stock')}
                </span>
              )}
            </div>

            {/* Trust Pillars under Image */}
            <div className="grid grid-cols-3 gap-3 mt-4 text-center">
              <div className="bg-white/80 rounded-2xl p-3 border border-[#384A22]/10 shadow-sm">
                <Leaf className="w-5 h-5 mx-auto text-[#768E5C] mb-1" />
                <span className="text-[11px] font-bold text-[#384A22] block leading-tight">100% Organic</span>
                <span className="text-[10px] text-[#384A22]/65">Pesticide-Free</span>
              </div>
              <div className="bg-white/80 rounded-2xl p-3 border border-[#384A22]/10 shadow-sm">
                <Flame className="w-5 h-5 mx-auto text-[#8B6D3B] mb-1" />
                <span className="text-[11px] font-bold text-[#384A22] block leading-tight">Artisan Roasted</span>
                <span className="text-[10px] text-[#384A22]/65">Zero Palm Oil</span>
              </div>
              <div className="bg-white/80 rounded-2xl p-3 border border-[#384A22]/10 shadow-sm">
                <Truck className="w-5 h-5 mx-auto text-[#384A22] mb-1" />
                <span className="text-[11px] font-bold text-[#384A22] block leading-tight">Glass-Safe Ship</span>
                <span className="text-[10px] text-[#384A22]/65">Eco Cushioning</span>
              </div>
            </div>
          </div>

          {/* Right Column: Information & Purchase Console */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#768E5C] block mb-1">
                {t('flavors_title', 'Flavors')}: {localizedFlavor} · {activeVariant ? activeVariant.label : product!.packageSize}
              </span>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#384A22] tracking-tight leading-tight mb-3">
                {localizedProductName}
              </h1>

              {/* Rating & Review Counter */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center text-[#8B6D3B]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current text-[#8B6D3B]" />
                  ))}
                </div>
                <span className="text-sm font-extrabold text-[#384A22]">
                  4.95 <span className="text-[#384A22]/60 font-medium">(142 verified reviews)</span>
                </span>
                <span className="hidden sm:inline-block text-xs font-bold text-[#768E5C] bg-[#768E5C]/15 px-2 py-0.5 rounded-md">
                  ✓ 100% Kampot Direct Trade
                </span>
              </div>

              {/* Price Display */}
              <div className="flex items-baseline gap-3 pb-4 mb-5 border-b border-[#384A22]/15 tabular-nums flex-wrap">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#384A22]">
                  {formatPrice(computedUnitPrice)}
                </span>
                {(activeOrigPrice > activePrice || isAutoship) && (
                  <span className="text-lg sm:text-xl text-[#8B6D3B] line-through font-semibold">
                    {formatPrice(activeOrigPrice)}
                  </span>
                )}
                {isAutoship && (
                  <span className="px-3 py-1 rounded-full bg-[#384A22] text-[#F2F0E3] text-xs font-extrabold uppercase tracking-wider">
                    {t('cart_autoship_savings', 'Autoship 15% OFF')}
                  </span>
                )}
              </div>

              {/* Stock Status Indicator */}
              <div className="flex items-center gap-2 mb-5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isSelectedProductOutOfStock
                      ? 'bg-[#B83A2A]'
                      : currentStock < 10
                      ? 'bg-amber-500 animate-pulse'
                      : 'bg-emerald-600'
                  }`}
                />
                <span
                  className={`text-sm font-bold ${
                    isSelectedProductOutOfStock
                      ? 'text-[#B83A2A]'
                      : currentStock < 10
                      ? 'text-amber-700'
                      : 'text-[#384A22]'
                  }`}
                >
                  {isSelectedProductOutOfStock
                    ? t('stock_currently_out_of_stock', 'This product is currently Out of Stock.')
                    : currentStock < 10
                    ? t('stock_only_left', 'Only {count} left in stock — order soon!').replace('{count}', String(currentStock))
                    : t('detail_in_stock', 'In Stock — Freshly batch roasted and ready to ship')}
                </span>
              </div>

              {/* Out of Stock Alternatives Callout */}
              {isSelectedProductOutOfStock && renderOutOfStockAlternativesCallout()}

              <p className="text-base text-[#384A22]/85 leading-relaxed mb-6 font-normal">
                {localizedDesc}
              </p>

              {/* Package Size Variant Selector */}
              {product!.variants && product!.variants.length > 0 && (
                <div className="mb-6">
                  <span className="block text-xs font-extrabold uppercase tracking-wider text-[#384A22] mb-3">
                    {t('package_size_label', 'Package Size')}:
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {product!.variants.map((v, i) => {
                      const variantOut = isProductOutOfStock(inventory, v.id, v.label);
                      const isSelected = selectedVariantIdx === i;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariantIdx(i)}
                          className={`px-5 py-3 rounded-2xl text-sm font-extrabold transition-all cursor-pointer border flex items-center gap-2 ${
                            isSelected
                              ? 'bg-[#384A22] text-[#F2F0E3] border-[#384A22] shadow-md scale-[1.02]'
                              : 'bg-white text-[#384A22] border-[#384A22]/20 hover:border-[#384A22]'
                          }`}
                        >
                          <span>{v.label}</span>
                          <span className="opacity-80">·</span>
                          <span className="tabular-nums">{formatPrice(v.price)}</span>
                          {variantOut && (
                            <span className="text-[10px] uppercase font-bold text-[#B83A2A] bg-white/90 px-1.5 py-0.5 rounded ml-1">
                              {t('badge_out_of_stock', 'Out')}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Purchase Options Selector: One-Time vs Autoship 15% OFF */}
              <div className="mb-6 space-y-3">
                <div
                  onClick={() => setIsAutoship(false)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    !isAutoship
                      ? 'bg-white border-[#384A22] shadow-md ring-1 ring-[#384A22]'
                      : 'bg-white/60 border-[#384A22]/20 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        !isAutoship ? 'border-[#384A22] bg-[#384A22]' : 'border-[#384A22]/40'
                      }`}
                    >
                      {!isAutoship && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-[#384A22]">
                        {t('detail_one_time', 'One-Time Purchase')}
                      </span>
                      <p className="text-xs text-[#384A22]/70">Standard single order delivery</p>
                    </div>
                  </div>
                  <span className="text-base font-extrabold text-[#384A22] tabular-nums">
                    {formatPrice(activePrice)}
                  </span>
                </div>

                <div
                  onClick={() => setIsAutoship(true)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isAutoship
                      ? 'bg-white border-[#8B6D3B] shadow-md ring-1 ring-[#8B6D3B]'
                      : 'bg-white/60 border-[#384A22]/20 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isAutoship ? 'border-[#8B6D3B] bg-[#8B6D3B]' : 'border-[#384A22]/40'
                        }`}
                      >
                        {isAutoship && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[#384A22]">
                            {t('detail_subscribe_save', 'Subscribe & Save 15% (Autoship)')}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-[#8B6D3B] text-[#F2F0E3] text-[10px] font-extrabold uppercase">
                            Popular
                          </span>
                        </div>
                        <p className="text-xs text-[#384A22]/70">
                          Fresh batch roasted before each delivery. Pause or cancel anytime.
                        </p>
                      </div>
                    </div>
                    <span className="text-base font-extrabold text-[#8B6D3B] tabular-nums">
                      {formatPrice(computedUnitPrice)}
                    </span>
                  </div>

                  {/* Autoship Frequency Dropdown */}
                  {isAutoship && (
                    <div className="mt-3 pt-3 border-t border-[#384A22]/10 flex items-center justify-between gap-3 text-xs">
                      <span className="font-bold text-[#384A22]">{t('autoship_step_2', 'Delivery Frequency')}:</span>
                      <select
                        value={autoshipFreq}
                        onChange={(e) => setAutoshipFreq(e.target.value as '30' | '45' | '60')}
                        className="bg-[#F2F0E3] border border-[#384A22]/20 rounded-xl px-3 py-1.5 font-bold text-[#384A22] cursor-pointer"
                      >
                        <option value="30">{t('autoship_freq_30', 'Every 30 Days (Most Popular)')}</option>
                        <option value="45">{t('autoship_freq_45', 'Every 45 Days')}</option>
                        <option value="60">{t('autoship_freq_60', 'Every 60 Days')}</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity Stepper & Add to Cart CTA */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-[#384A22]/25 rounded-full bg-white px-2 py-1 shadow-sm">
                    <button
                      type="button"
                      onClick={() => handleQuantityDelta(-1)}
                      disabled={quantity <= 1 || isSelectedProductOutOfStock}
                      aria-label="Decrease quantity"
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#384A22]/10 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-extrabold text-base text-[#384A22] tabular-nums">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityDelta(1, currentStock)}
                      disabled={quantity >= currentStock || isSelectedProductOutOfStock}
                      aria-label="Increase quantity"
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#384A22]/10 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={isSelectedProductOutOfStock}
                    onClick={() => {
                      if (!isSelectedProductOutOfStock) {
                        onAddProductToCart(
                          product!,
                          isAutoship,
                          activeVariant?.label || product!.packageSize,
                          computedUnitPrice,
                          quantity
                        );
                      }
                    }}
                    className={`flex-1 py-4 px-8 rounded-full text-base font-extrabold transition-all duration-200 shadow-lg flex items-center justify-center gap-3 cursor-pointer ${
                      isSelectedProductOutOfStock
                        ? 'bg-[#B83A2A] text-[#F2F0E3] cursor-not-allowed'
                        : 'bg-[#8B6D3B] hover:bg-[#765B2F] text-[#F2F0E3] hover:shadow-xl hover:-translate-y-0.5'
                    }`}
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>
                      {isSelectedProductOutOfStock
                        ? t('badge_out_of_stock', 'Out of Stock')
                        : `${t('btn_add_to_cart')} — ${formatPrice(computedUnitPrice * quantity)}`}
                    </span>
                  </button>
                </div>

                {/* Value Assurance Badges */}
                <div className="rounded-2xl bg-white/70 p-4 border border-[#384A22]/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#384A22]/85">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#768E5C] shrink-0" />
                    <span>{t('detail_ship_notice', 'Free glass-safe climate shipping on orders over $50')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#8B6D3B] shrink-0" />
                    <span>{t('detail_guarantee', '100% Freshness & Terroir Guarantee')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details & Nutrition Deep Dive Tabs */}
        <div className="mt-16 bg-white rounded-[32px] p-6 sm:p-10 shadow-md border border-[#384A22]/10">
          <div className="flex flex-wrap items-center gap-3 border-b border-[#384A22]/15 pb-4 mb-8">
            <button
              type="button"
              onClick={() => setActiveTab('tasting')}
              className={`px-5 py-2.5 rounded-full text-sm font-extrabold transition-all cursor-pointer ${
                activeTab === 'tasting'
                  ? 'bg-[#384A22] text-[#F2F0E3] shadow-sm'
                  : 'text-[#384A22]/70 hover:text-[#384A22]'
              }`}
            >
              {t('detail_tab_tasting', 'Tasting Notes & Terroir')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('nutrition')}
              className={`px-5 py-2.5 rounded-full text-sm font-extrabold transition-all cursor-pointer ${
                activeTab === 'nutrition'
                  ? 'bg-[#384A22] text-[#F2F0E3] shadow-sm'
                  : 'text-[#384A22]/70 hover:text-[#384A22]'
              }`}
            >
              {t('detail_tab_nutrition', 'Nutrition & Ingredients')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('craft')}
              className={`px-5 py-2.5 rounded-full text-sm font-extrabold transition-all cursor-pointer ${
                activeTab === 'craft'
                  ? 'bg-[#384A22] text-[#F2F0E3] shadow-sm'
                  : 'text-[#384A22]/70 hover:text-[#384A22]'
              }`}
            >
              {t('detail_tab_craft', 'Artisan Roasting Craft')}
            </button>
          </div>

          {activeTab === 'tasting' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-extrabold text-[#384A22] mb-3">
                  {product!.flavor === 'Honey Butter'
                    ? 'Golden Wild Honey & Churned Dairy Butter'
                    : 'Zesty Cambodian Kaffir Lime & Wild Chilies'}
                </h3>
                <p className="text-base text-[#384A22]/85 leading-relaxed mb-4">
                  {product!.flavor === 'Honey Butter'
                    ? 'Crafted with sustainably gathered wild forest honey and real rich dairy butter. Each cashew is roasted until it achieves a crisp, golden caramelized crust that balances delicate natural sweetness with savory roasted richness.'
                    : 'Infused with fragrant Cambodian kaffir limes, sun-dried chili peppers, and sea salt harvested from the Kampot coastline. Delivers a vibrant, zesty crunch followed by a gentle, warming pepper finish that delights the palate.'}
                </p>
                <div className="bg-[#F2F0E3] rounded-2xl p-4 text-xs font-medium text-[#384A22]/90 space-y-1.5">
                  <p><strong>Ideal Pairings:</strong> Green tea, cold brews, artisanal cheeses, charcuterie, or directly from the pouch on a mountain trail.</p>
                  <p><strong>Texture:</strong> Crispy snap with a melt-in-mouth creamy cashew core.</p>
                </div>
              </div>
              <div className="bg-[#384A22] rounded-2xl p-6 text-[#F2F0E3] flex flex-col justify-center">
                <span className="text-xs uppercase font-extrabold tracking-widest text-[#9AB87A] mb-2">
                  The Kampot Distinction
                </span>
                <p className="text-xl font-bold leading-snug mb-3">
                  Why Kampot Harvest cashews stand in a league of their own.
                </p>
                <p className="text-sm text-[#F2F0E3]/85 leading-relaxed">
                  Grown on small family orchards in Kampot province, our cashew trees thrive in nutrient-dense red mineral soil fed by seasonal tropical rains and cooling breezes from the Gulf of Thailand. Hand-sorted to guarantee only Grade W180 jumbo whole kernels.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'nutrition' && (
            <div className="space-y-6">
              {product!.nutrition.calories > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-[#F2F0E3] rounded-2xl p-4 text-center">
                    <span className="text-xs font-bold uppercase text-[#768E5C] block mb-1">
                      {t('macro_calories', 'Calories')}
                    </span>
                    <span className="text-3xl font-extrabold text-[#384A22] tabular-nums">
                      {product!.nutrition.calories}
                    </span>
                    <span className="text-xs text-[#384A22]/70 block mt-1">kcal per 30g serving</span>
                  </div>
                  <div className="bg-[#F2F0E3] rounded-2xl p-4 text-center">
                    <span className="text-xs font-bold uppercase text-[#768E5C] block mb-1">
                      {t('macro_protein', 'Protein')}
                    </span>
                    <span className="text-3xl font-extrabold text-[#384A22] tabular-nums">
                      {product!.nutrition.protein}
                    </span>
                    <span className="text-xs text-[#384A22]/70 block mt-1">clean plant protein</span>
                  </div>
                  <div className="bg-[#F2F0E3] rounded-2xl p-4 text-center">
                    <span className="text-xs font-bold uppercase text-[#768E5C] block mb-1">
                      {t('macro_fat', 'Healthy Fats')}
                    </span>
                    <span className="text-3xl font-extrabold text-[#384A22] tabular-nums">
                      {product!.nutrition.fat}
                    </span>
                    <span className="text-xs text-[#384A22]/70 block mt-1">heart-healthy monos</span>
                  </div>
                  <div className="bg-[#F2F0E3] rounded-2xl p-4 text-center">
                    <span className="text-xs font-bold uppercase text-[#768E5C] block mb-1">
                      {t('macro_sugar', 'Natural Sugar')}
                    </span>
                    <span className="text-3xl font-extrabold text-[#384A22] tabular-nums">
                      {product!.nutrition.sugar}
                    </span>
                    <span className="text-xs text-[#384A22]/70 block mt-1">unrefined wild honey</span>
                  </div>
                </div>
              )}

              <div className="p-5 rounded-2xl bg-[#F2F0E3] border border-[#384A22]/10">
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-[#384A22] mb-2">
                  {t('ingredients_label', 'Ingredients')}:
                </h4>
                <p className="text-sm text-[#384A22]/90 leading-relaxed font-medium">
                  {product!.ingredients}
                </p>
                <p className="text-xs text-[#384A22]/70 mt-2">
                  * Contains tree nuts (cashews) and milk (in honey butter glaze). Non-GMO, gluten-free, and crafted in a dedicated peanut-free facility.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'craft' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#F2F0E3] rounded-2xl p-5 border border-[#384A22]/10">
                <span className="w-8 h-8 rounded-full bg-[#384A22] text-[#F2F0E3] font-extrabold flex items-center justify-center text-sm mb-3">
                  1
                </span>
                <h4 className="text-base font-extrabold text-[#384A22] mb-1.5">Direct Farm Harvest</h4>
                <p className="text-xs text-[#384A22]/80 leading-relaxed">
                  Harvested at peak ripeness from certified organic orchards in Kampot. Farmers are paid fair wages directly, protecting the agricultural ecosystem.
                </p>
              </div>

              <div className="bg-[#F2F0E3] rounded-2xl p-5 border border-[#384A22]/10">
                <span className="w-8 h-8 rounded-full bg-[#8B6D3B] text-[#F2F0E3] font-extrabold flex items-center justify-center text-sm mb-3">
                  2
                </span>
                <h4 className="text-base font-extrabold text-[#384A22] mb-1.5">Gentle Batch Roasting</h4>
                <p className="text-xs text-[#384A22]/80 leading-relaxed">
                  Never deep-fried in inflammatory seed oils. Slow roasted in small artisan drums under precision temperature curves to preserve natural essential fatty acids.
                </p>
              </div>

              <div className="bg-[#F2F0E3] rounded-2xl p-5 border border-[#384A22]/10">
                <span className="w-8 h-8 rounded-full bg-[#768E5C] text-[#F2F0E3] font-extrabold flex items-center justify-center text-sm mb-3">
                  3
                </span>
                <h4 className="text-base font-extrabold text-[#384A22] mb-1.5">Zero-Plastic Sealing</h4>
                <p className="text-xs text-[#384A22]/80 leading-relaxed">
                  Hermetically packed inside reusable recyclable glass jars or nitrogen-flushed recyclable pouches to lock in peak roast crunch and aroma.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Smart Recommendations Section */}
      {renderSmartRecommendations()}

      {/* Sticky Mobile One-Thumb Action Bar for Single Products */}
      <div
        id="mobile-sticky-action-bar-product"
        className="fixed bottom-[62px] left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#384A22]/15 px-4 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] xl:hidden flex items-center justify-between gap-3"
      >
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#768E5C] truncate">
            {activeVariant?.label || product!.packageSize}
          </span>
          <div className="flex items-baseline gap-1.5 tabular-nums">
            <span className="text-lg font-extrabold text-[#384A22]">
              {formatPrice(computedUnitPrice * quantity)}
            </span>
            {activeOrigPrice > computedUnitPrice && (
              <span className="text-xs text-[#8B6D3B] line-through">
                {formatPrice(activeOrigPrice * quantity)}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          id="mobile-sticky-add-product"
          disabled={isSelectedProductOutOfStock}
          onClick={() => {
            if (!isSelectedProductOutOfStock) {
              onAddProductToCart(
                product!,
                isAutoship,
                activeVariant?.label || product!.packageSize,
                computedUnitPrice,
                quantity
              );
            }
          }}
          className={`min-h-[46px] px-6 py-2.5 rounded-full text-sm font-extrabold shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 shrink-0 ${
            isSelectedProductOutOfStock
              ? 'bg-[#B83A2A] text-[#F2F0E3] cursor-not-allowed'
              : 'bg-[#8B6D3B] hover:bg-[#765B2F] text-[#F2F0E3]'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>
            {isSelectedProductOutOfStock
              ? t('badge_out_of_stock', 'Out of Stock')
              : t('btn_add_to_cart', 'Add to Cart')}
          </span>
        </button>
      </div>
    </div>
  );

  /* --------------------------------------------------------------------------
   * Helper: Out of stock alternatives banner
   * ------------------------------------------------------------------------ */
  function renderOutOfStockAlternativesCallout() {
    if (!recommendations.targetOutOfStock || recommendations.alternativesForUnavailable.length === 0) {
      return null;
    }
    const topAlt = recommendations.alternativesForUnavailable[0];
    return (
      <div
        data-testid="out-of-stock-alternatives-banner"
        className="mb-5 p-4 rounded-2xl bg-white border border-[#8B6D3B]/40 shadow-sm"
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#384A22]">
            {t('rec_available_alt', 'Available Alternative — In Stock Now')}
          </span>
          <span className="text-xs font-bold text-[#768E5C]">
            {topAlt.stockQuantity} {t('rec_in_stock', 'in stock')}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-14 h-14 rounded-xl bg-[#384A22] p-1.5 shrink-0 flex items-center justify-center">
              <SmartImage
                src={topAlt.image}
                alt={topAlt.name}
                className="w-full h-full object-contain"
                fallbackBg="transparent"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-[#384A22] truncate">{topAlt.name}</p>
              <p className="text-xs text-[#384A22]/75 truncate">
                {topAlt.reasonDescription} · <strong className="text-[#384A22]">{formatPrice(topAlt.price)}</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (topAlt.itemType === 'bundle' && topAlt.bundleRef) {
                  onSelectBundle(topAlt.bundleRef);
                } else if (topAlt.itemType === 'product' && topAlt.productRef) {
                  onSelectProduct(topAlt.productRef);
                }
              }}
              className="px-4 py-2 rounded-full border border-[#384A22] text-[#384A22] hover:bg-[#384A22] hover:text-[#F2F0E3] text-xs font-bold transition-colors cursor-pointer"
            >
              {t('rec_view_option', 'View Option')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* --------------------------------------------------------------------------
   * Helper: Smart Recommendations Section
   * ------------------------------------------------------------------------ */
  function renderSmartRecommendations() {
    if (recommendations.relatedProducts.length === 0) return null;

    return (
      <div
        data-testid="smart-recommendations-section"
        className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-14 mt-16"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#8B6D3B]">
              {recommendations.targetOutOfStock ? 'Recommended Replacements' : 'Pair & Discover'}
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#384A22] mt-1">
              {recommendations.targetOutOfStock
                ? t('rec_available_alternatives', 'Available Alternatives & Related Products')
                : activeRecTab === 'related'
                ? t('rec_related', 'Related Products')
                : activeRecTab === 'you_may_like'
                ? t('rec_you_may_like', 'You May Also Like')
                : t('rec_bought_together', 'Frequently Bought Together')}
            </h3>
          </div>

          <div className="inline-flex items-center bg-white rounded-full p-1 border border-[#384A22]/15 self-start sm:self-auto shadow-sm">
            {[
              { id: 'related', label: t('rec_related', 'Related Products') },
              { id: 'you_may_like', label: t('rec_you_may_like', 'You May Also Like') },
              { id: 'bought_together', label: t('rec_bought_together', 'Bought Together') },
            ].map((tab) => {
              const isTabActive = activeRecTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveRecTab(tab.id as 'related' | 'you_may_like' | 'bought_together')
                  }
                  className={`px-4 py-2 rounded-full text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
                    isTabActive
                      ? 'bg-[#384A22] text-[#F2F0E3] shadow-sm'
                      : 'text-[#384A22]/70 hover:text-[#384A22]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedRecommendations.map((rec) => (
            <div
              key={rec.id}
              data-testid={`recommendation-card-${rec.id}`}
              className="group bg-white rounded-3xl p-5 border border-[#384A22]/12 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div
                  onClick={() => {
                    if (rec.itemType === 'bundle' && rec.bundleRef) {
                      onSelectBundle(rec.bundleRef);
                    } else if (rec.itemType === 'product' && rec.productRef) {
                      onSelectProduct(rec.productRef);
                    }
                  }}
                  className="relative bg-[#384A22] rounded-2xl p-4 h-48 flex items-center justify-center mb-4 overflow-hidden cursor-pointer"
                >
                  <SmartImage
                    src={rec.image}
                    alt={rec.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    fallbackBg="transparent"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#F2F0E3] text-[#384A22] text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                    {rec.reasonTag}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 text-xs font-bold uppercase tracking-wider text-[#768E5C] mb-1.5">
                  <span className="truncate">{rec.category}</span>
                  <span className="text-[#8B6D3B] shrink-0">
                    ★ {rec.rating.toFixed(2)} ({rec.reviewCount})
                  </span>
                </div>

                <h4
                  onClick={() => {
                    if (rec.itemType === 'bundle' && rec.bundleRef) {
                      onSelectBundle(rec.bundleRef);
                    } else if (rec.itemType === 'product' && rec.productRef) {
                      onSelectProduct(rec.productRef);
                    }
                  }}
                  className="text-base font-extrabold text-[#384A22] leading-snug line-clamp-2 min-h-[2.8rem] cursor-pointer hover:text-[#8B6D3B] transition-colors"
                >
                  {rec.name}
                </h4>
                <p className="text-xs text-[#384A22]/70 mt-1 line-clamp-2">
                  {rec.reasonDescription}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#384A22]/10">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-baseline gap-2 tabular-nums flex-wrap">
                    <span className="text-lg font-extrabold text-[#384A22]">
                      {formatPrice(rec.price)}
                    </span>
                    {rec.originalPrice > rec.price && (
                      <span className="text-xs text-[#8B6D3B] line-through">
                        {formatPrice(rec.originalPrice)}
                      </span>
                    )}
                    {rec.discountPercent > 0 && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8B6D3B]">
                        (-{rec.discountPercent}%)
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      !rec.inStock || rec.stockQuantity < 10
                        ? 'text-[#B83A2A]'
                        : 'text-[#768E5C]'
                    }`}
                  >
                    {rec.inStock
                      ? rec.stockQuantity < 10
                        ? t('stock_only_left', 'Only {count} left').replace('{count}', String(rec.stockQuantity))
                        : t('rec_in_stock', 'In stock')
                      : t('badge_out_of_stock', 'Out of Stock')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (rec.itemType === 'bundle' && rec.bundleRef) {
                        onSelectBundle(rec.bundleRef);
                      } else if (rec.itemType === 'product' && rec.productRef) {
                        onSelectProduct(rec.productRef);
                      }
                    }}
                    className="flex-1 py-2.5 px-3 rounded-full border border-[#384A22]/30 text-[#384A22] hover:bg-[#384A22] hover:text-[#F2F0E3] text-xs font-bold transition-colors cursor-pointer text-center"
                  >
                    {t('btn_learn_more', 'Learn more')}
                  </button>
                  <button
                    type="button"
                    disabled={!rec.inStock}
                    onClick={() => {
                      if (!rec.inStock) return;
                      if (rec.itemType === 'bundle' && rec.bundleRef) {
                        onAddBundleToCart(rec.bundleRef);
                      } else if (rec.itemType === 'product' && rec.productRef) {
                        onAddProductToCart(rec.productRef, false, rec.packageSize, rec.price);
                      }
                    }}
                    className={`flex-1 py-2.5 px-3 rounded-full text-xs font-bold transition-colors text-center ${
                      rec.inStock
                        ? 'bg-[#8B6D3B] hover:bg-[#765B2F] text-[#F2F0E3] cursor-pointer'
                        : 'bg-[#B83A2A] text-[#F2F0E3] cursor-not-allowed'
                    }`}
                  >
                    {rec.inStock ? t('btn_add_to_cart', 'Add to Cart') : t('badge_out_of_stock', 'Out of Stock')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
};
