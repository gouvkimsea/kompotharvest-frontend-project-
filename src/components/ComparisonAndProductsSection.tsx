import React, { useState } from 'react';
import { ASSETS, PRODUCTS, Product } from '../data/botenzData';
import { SmartImage } from './SmartImage';
import { ActivePage } from './Navbar';
import { useI18n } from '../utils/i18nContext';
import { InventoryItem, isProductOutOfStock } from '../utils/storeLogic';

interface ComparisonAndProductsProps {
  onNavigate: (page: ActivePage, categoryFilter?: string) => void;
  onAddProductToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  inventory?: InventoryItem[];
}

export const KitchenIconsRow: React.FC<{ className?: string }> = ({ className = 'w-[345px]' }) => {
  const [err, setErr] = useState(false);
  if (!err) {
    return (
      <img
        src={ASSETS.kitchenIconsStrip}
        alt="Kitchen icons: mixing bowl, oven, cookie, blender, toast"
        referrerPolicy="no-referrer"
        onError={() => setErr(true)}
        className={`h-auto object-contain select-none ${className}`}
      />
    );
  }
  return (
    <div className="flex items-center gap-5 text-[#8B6D3B]">
      <span className="text-2xl">🥣</span>
      <span className="text-2xl">🍪</span>
      <span className="text-2xl">🍞</span>
    </div>
  );
};

export const ComparisonAndProductsSection: React.FC<ComparisonAndProductsProps> = ({
  onNavigate,
  onAddProductToCart,
  onSelectProduct,
  inventory = [],
}) => {
  const { t, formatPrice } = useI18n();
  const [carouselOffset, setCarouselOffset] = useState(0);

  // Show 4 products at a time on desktop, with option to cycle through all 6
  const visibleProducts = [
    PRODUCTS[carouselOffset % PRODUCTS.length],
    PRODUCTS[(carouselOffset + 1) % PRODUCTS.length],
    PRODUCTS[(carouselOffset + 2) % PRODUCTS.length],
    PRODUCTS[(carouselOffset + 3) % PRODUCTS.length],
  ];

  return (
    <section className="w-full bg-[#F2F0E3] pt-14 pb-8 overflow-hidden">
      {/* PART 1: WHAT MAKES US DIFFERENT (matches clean-sec-2.png) */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-14">
        {/* Header Row with Left & Right Kitchen Icons */}
        <div className="flex items-center justify-between gap-4 mb-10">
          <div className="hidden lg:block">
            <KitchenIconsRow className="w-[345px]" />
          </div>

          <div className="text-center mx-auto">
            <h3 className="font-display text-[40px] sm:text-[54px] lg:text-[63px] leading-[1.05] tracking-tight">
              <span className="block font-normal text-[#384A22]">{t('compare_title_1')}</span>
              <span className="block font-normal text-[#768E5C]">{t('compare_title_2')}</span>
            </h3>
          </div>

          <div className="hidden lg:block">
            <KitchenIconsRow className="w-[345px]" />
          </div>
        </div>

        {/* Comparison Framed Box */}
        <div className="relative max-w-[860px] mx-auto border-[2px] border-[#8B6D3B] rounded-[28px] px-6 sm:px-10 py-10">
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-6">
            {/* Left: Kampot Harvest Co. Honey Butter Cashews 250g Jar with Checkmark Badge */}
            <div className="md:col-span-4 flex flex-col items-center relative">
              <div className="mb-2 flex flex-col items-center md:-ml-12">
                <span className="text-[18px] font-extrabold text-[#384A22] tracking-tight">
                  {t('brand_name', 'Kampot Harvest')}
                </span>
                <span className="mt-1 w-8 h-8 rounded-full bg-[#384A22] text-[#F2F0E3] flex items-center justify-center shadow">
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 10.5 8.2 14.5 16 6" />
                  </svg>
                </span>
              </div>
              <div className="relative w-[220px] sm:w-[265px] md:-ml-12">
                <SmartImage
                  src={ASSETS.compareBotenzJar}
                  alt="Kampot Harvest Co. Honey Butter Cashews 250g Jar"
                  className="w-full h-auto object-contain drop-shadow-xl"
                  fallbackBg="transparent"
                />
              </div>
            </div>

            {/* Center: 3 Stacked Macro Blobs (58 vs 185 kcal, 1.7g vs 15g Fat, 7g vs 6g Protein) */}
            <div className="md:col-span-4 flex flex-col items-center">
              <div className="grid grid-cols-2 gap-6 sm:gap-8 w-full max-w-[310px]">
                {/* Column Headers */}
                <div className="text-center">
                  <p className="text-[16px] sm:text-[17px] font-bold text-[#384A22] leading-tight whitespace-pre-line">
                    {t('compare_col_kampot')}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[16px] sm:text-[17px] font-bold text-[#8B6D3B] leading-tight whitespace-pre-line">
                    {t('compare_col_others')}
                  </p>
                </div>

                {/* Row 1: Calories */}
                <div className="blob-card-1 bg-[#314B1C] text-[#F2F0E3] w-[124px] h-[116px] mx-auto flex flex-col items-center justify-center text-center shadow-sm">
                  <span className="text-[38px] font-medium leading-none tabular-nums">58</span>
                  <span className="text-[14px] text-[#9AB87A] font-medium mt-1">{t('macro_calories')}</span>
                </div>
                <div className="blob-card-2 bg-[#8B6D3B] text-[#F2F0E3] w-[124px] h-[116px] mx-auto flex flex-col items-center justify-center text-center shadow-sm">
                  <span className="text-[38px] font-medium leading-none tabular-nums">185</span>
                  <span className="text-[14px] text-[#F2F0E3]/85 font-medium mt-1">{t('macro_calories')}</span>
                </div>

                {/* Row 2: Fat */}
                <div className="blob-card-2 bg-[#314B1C] text-[#F2F0E3] w-[124px] h-[116px] mx-auto flex flex-col items-center justify-center text-center shadow-sm">
                  <span className="text-[36px] font-medium leading-none tabular-nums">1.7g</span>
                  <span className="text-[14px] text-[#9AB87A] font-medium mt-1">{t('macro_fat')}</span>
                </div>
                <div className="blob-card-1 bg-[#8B6D3B] text-[#F2F0E3] w-[124px] h-[116px] mx-auto flex flex-col items-center justify-center text-center shadow-sm">
                  <span className="text-[36px] font-medium leading-none tabular-nums">15g</span>
                  <span className="text-[14px] text-[#F2F0E3]/85 font-medium mt-1">{t('macro_fat')}</span>
                </div>

                {/* Row 3: Protein */}
                <div className="blob-card-1 bg-[#314B1C] text-[#F2F0E3] w-[124px] h-[116px] mx-auto flex flex-col items-center justify-center text-center shadow-sm">
                  <span className="text-[38px] font-medium leading-none tabular-nums">7g</span>
                  <span className="text-[14px] text-[#9AB87A] font-medium mt-1">{t('macro_protein')}</span>
                </div>
                <div className="blob-card-2 bg-[#8B6D3B] text-[#F2F0E3] w-[124px] h-[116px] mx-auto flex flex-col items-center justify-center text-center shadow-sm">
                  <span className="text-[38px] font-medium leading-none tabular-nums">6g</span>
                  <span className="text-[14px] text-[#F2F0E3]/85 font-medium mt-1">{t('macro_protein')}</span>
                </div>
              </div>
            </div>

            {/* Right: Competitor Cashew Jar with "Others" & X Badge */}
            <div className="md:col-span-4 flex flex-col items-center relative">
              <div className="mb-2 flex flex-col items-center md:-mr-12">
                <span className="text-[18px] font-extrabold text-[#8B6D3B] tracking-tight">
                  {t('compare_others_badge')}
                </span>
                <span className="mt-1 w-8 h-8 rounded-full bg-[#8B6D3B] text-[#F2F0E3] flex items-center justify-center shadow">
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5.5" y1="5.5" x2="14.5" y2="14.5" />
                    <line x1="14.5" y1="5.5" x2="5.5" y2="14.5" />
                  </svg>
                </span>
              </div>
              <div className="relative w-[210px] sm:w-[250px] md:-mr-12">
                <SmartImage
                  src={ASSETS.compareOtherJar}
                  alt="Regular Fried Cashew Jar"
                  className="w-full h-auto object-contain drop-shadow-xl"
                  fallbackBg="transparent"
                />
              </div>
            </div>
          </div>

          {/* Bottom Overlapping CTA Button */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-6">
            <button
              type="button"
              onClick={() => onNavigate('shop', 'powders')}
              className="px-6 min-[380px]:px-10 py-3.5 rounded-full bg-[#8B6D3B] hover:bg-[#765B2F] text-[#F2F0E3] text-[15px] sm:text-[16px] font-medium shadow-md transition-colors whitespace-nowrap cursor-pointer max-w-[88vw] text-center"
            >
              {t('btn_explore_products')}
            </button>
          </div>
        </div>
      </div>

      {/* PART 2: 4-COLUMN PRODUCT SHOWCASE ON ORGANIC TORN GREEN WAVE WITH COLOR-MATCHED KBACH PATTERN */}
      <div className="relative w-full mt-24 pt-10 pb-20">
        {/* Torn-edge Dark Green Wave Backdrop in the middle/bottom */}
        <div
          className="absolute inset-x-0 bottom-0 top-[145px] z-0"
          style={{
            backgroundImage: `url("/assets/aistudio/kbach-pattern-green.svg"), url("${ASSETS.productsWaveBg}")`,
            backgroundRepeat: 'repeat, no-repeat',
            backgroundSize: '260px 260px, cover',
            backgroundPosition: 'center center, center center',
          }}
        />

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-8">
          {/* Carousel Rotation Controls for the 4 Kampot Harvest Co. Products */}
          <div className="flex justify-end items-center gap-2 mb-3 pr-2">
            <span className="text-xs font-semibold text-[#384A22]/75 mr-1">
              {t('compare_showing_all')}
            </span>
            <button
              type="button"
              onClick={() =>
                setCarouselOffset((prev) => (prev - 1 + PRODUCTS.length) % PRODUCTS.length)
              }
              aria-label="Previous flavor"
              className="w-9 h-9 sm:w-8 sm:h-8 rounded-full border border-[#384A22]/30 text-[#384A22] hover:bg-[#384A22] hover:text-[#F2F0E3] flex items-center justify-center transition-colors cursor-pointer text-base sm:text-sm"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setCarouselOffset((prev) => (prev + 1) % PRODUCTS.length)}
              aria-label="Next flavor"
              className="w-9 h-9 sm:w-8 sm:h-8 rounded-full border border-[#384A22]/30 text-[#384A22] hover:bg-[#384A22] hover:text-[#F2F0E3] flex items-center justify-center transition-colors cursor-pointer text-base sm:text-sm"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleProducts.map((product) => {
              const isOutOfStock = isProductOutOfStock(inventory, product.id);
              return (
                <div
                  key={product.id}
                  data-testid={`showcase-product-card-${product.id}`}
                  className="flex flex-col items-center group"
                >
                  {/* Floating Glass Jar + -10% Dark Green Blob Tag */}
                  <div
                    onClick={() => onSelectProduct(product)}
                    className="relative w-[240px] h-[305px] flex items-center justify-center -mb-6 z-10 cursor-pointer group-hover:-translate-y-1.5 transition-transform duration-300"
                  >
                    {product.discountBadge && (
                      <div className="absolute top-2 left-2 z-20 blob-badge bg-[#2D471E] text-[#F2F0E3] w-[52px] h-[46px] flex items-center justify-center text-[14px] font-medium shadow-md">
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
                        data-testid={`product-bottom-out-of-stock-${product.id}`}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-md bg-[#B83A2A] text-[#F2F0E3] text-[11px] font-bold uppercase tracking-wider whitespace-nowrap shadow-md"
                      >
                        {t('badge_out_of_stock', 'Out of Stock')}
                      </span>
                    )}
                  </div>

                  {/* Cream Rounded Bottom Info Box */}
                  <div className="w-full bg-[#F2F0E3] rounded-[24px] pt-8 pb-5 px-5 text-center shadow-lg border border-[#384A22]/10">
                    <h4
                      onClick={() => onSelectProduct(product)}
                      className="text-[17px] font-bold text-[#384A22] hover:text-[#8B6D3B] transition-colors cursor-pointer truncate"
                    >
                      {product.name.includes('Chili') ? t('product_chili_lime_name', product.name) : t('product_honey_butter_name', product.name)}
                    </h4>
                    <p className="text-[13.5px] font-semibold text-[#768E5C] mt-0.5">
                      {product.flavor === 'Honey Butter' ? t('flavor_honey_butter', 'Honey Butter') : t('flavor_chili_lime', 'Chili Lime')} · {product.packageSize.includes('Jar') ? t('size_jar_250', '250g Jar') : t('size_pouch_100', '100g Pouch')}
                    </p>

                    {isOutOfStock && (
                      <p
                        data-testid={`product-out-of-stock-statement-${product.id}`}
                        className="text-xs font-bold uppercase tracking-wider text-[#B83A2A] mt-1"
                      >
                        {t('stock_product_out_of_stock', 'Product is Out of Stock')}
                      </p>
                    )}

                    <div className="mt-1.5 flex items-baseline justify-center gap-2.5 tabular-nums">
                      <span className="text-[22px] font-semibold text-[#384A22]">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-[13px] text-[#8B6D3B] line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[12.5px] text-[#384A22] ml-1">
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
                        data-testid={`showcase-action-btn-${product.id}`}
                        onClick={() => {
                          if (!isOutOfStock) onAddProductToCart(product);
                        }}
                        className={`flex-[1.3] py-3.5 px-4 rounded-full text-[13.5px] font-medium transition-colors whitespace-nowrap ${
                          isOutOfStock
                            ? 'bg-[#B83A2A] text-[#F2F0E3] cursor-not-allowed font-bold'
                            : 'bg-[#8B6D3B] hover:bg-[#765B2F] text-[#F2F0E3] cursor-pointer'
                        }`}
                      >
                        {isOutOfStock ? t('badge_out_of_stock', 'Out of Stock') : t('btn_add_to_cart')}
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectProduct(product)}
                        className="flex-1 min-h-[44px] py-2.5 px-3.5 rounded-full border border-[#8B6D3B] text-[#384A22] hover:bg-[#8B6D3B]/10 text-[13.5px] font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center"
                      >
                        {t('btn_learn_more')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
