import React, { useState } from 'react';
import { ASSETS, BUNDLES, BundleItem, HERO_FEATURES, HERO_STATS } from '../data/botenzData';
import { SmartImage } from './SmartImage';
import { ActivePage } from './Navbar';
import { useI18n } from '../utils/i18nContext';
import { InventoryItem, isProductOutOfStock } from '../utils/storeLogic';
import { ArrowRight } from 'lucide-react';

interface HeroAndBundleProps {
  onNavigate: (page: ActivePage, categoryFilter?: string) => void;
  onAddBundleToCart: (bundle: BundleItem) => void;
  onSelectBundleDetail: (bundle: BundleItem) => void;
  onClaimOffer: () => void;
  inventory?: InventoryItem[];
}

const FeatureIcon: React.FC<{ type: 'peanut' | 'cold' | 'nosugar' | 'natural' | 'protein' }> = ({
  type,
}) => {
  switch (type) {
    case 'peanut':
      return (
        <svg viewBox="0 0 36 36" className="w-8 h-8 text-[#8B6D3B]" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M22.5 8.5c2.8 2.8 2.5 6.8.5 8.8-1.2 1.2-1.2 2.2 0 3.4 2 2 2.3 6-.5 8.8-2.8 2.8-6.8 2.5-8.8.5-2-2-1.7-6 .3-8 1.2-1.2 1.2-2.2 0-3.4-2-2-2.3-6 .5-8.8 2.8-2.8 6.2-3.1 8-1.3z" />
          <circle cx="19" cy="13" r="1" fill="currentColor" />
          <circle cx="16" cy="23" r="1" fill="currentColor" />
        </svg>
      );
    case 'cold':
      return (
        <svg viewBox="0 0 36 36" className="w-8 h-8 text-[#8B6D3B]" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M14 7v14.5a5 5 0 1 0 6 0V7a3 3 0 1 0-6 0z" />
          <circle cx="17" cy="25" r="2" fill="currentColor" />
          <path d="M26 10v8M22 14h8M23.5 11.5l5 5M28.5 11.5l-5 5" />
        </svg>
      );
    case 'nosugar':
      return (
        <svg viewBox="0 0 36 36" className="w-8 h-8 text-[#8B6D3B]" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="18" cy="18" r="12" />
          <path d="M10 10l16 16" />
          <rect x="13" y="15" width="5" height="5" rx="1" />
          <rect x="18" y="13" width="5" height="5" rx="1" />
        </svg>
      );
    case 'natural':
      return (
        <svg viewBox="0 0 36 36" className="w-8 h-8 text-[#8B6D3B]" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M18 28V16" />
          <path d="M18 20c-5 0-9-4-9-9 5 0 9 4 9 9z" />
          <path d="M18 17c5 0 9-4 9-9-5 0-9 4-9 9z" />
        </svg>
      );
    case 'protein':
      return (
        <svg viewBox="0 0 36 36" className="w-8 h-8 text-[#8B6D3B]" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M11 22c0-4 3-7 7-7 1.5 0 3 .5 4 1.5l2-4.5c.5-1 1.8-1.5 2.8-1s1.4 1.8.9 2.8l-3.2 7.2c-1 2.5-3.5 4-6.5 4H13a2 2 0 0 1-2-3z" />
          <path d="M14 15l-2-4c-.4-.8 0-1.8.8-2.2.8-.4 1.8 0 2.2.8l2 4" />
        </svg>
      );
  }
};

export const HeroAndBundleSection: React.FC<HeroAndBundleProps> = ({
  onNavigate,
  onAddBundleToCart,
  onSelectBundleDetail,
  onClaimOffer,
  inventory = [],
}) => {
  const { t, formatPrice } = useI18n();
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [bundleOrder, setBundleOrder] = useState<number[]>([0, 1, 2]);

  const rotateBundles = (dir: 'prev' | 'next') => {
    setBundleOrder((prev) => {
      if (dir === 'next') {
        return [prev[1], prev[2], prev[0]];
      }
      return [prev[2], prev[0], prev[1]];
    });
  };

  const activeFeature = HERO_FEATURES.find((f) => f.id === selectedFeatureId);

  return (
    <section className="relative w-full overflow-hidden">
      {/* PART 1: HERO WITH KAMPOT HARVEST CO. 4-PRODUCT DISPLAY & COLOR-MATCHED KBACH PATTERN */}
      <div className="relative w-full min-h-[780px] lg:min-h-[840px] flex flex-col items-center justify-between pt-6 lg:pt-8 kbach-bg-cream">
        {/* Soft warm radial lighting so typography and products pop against the color-matched Kbach Khmer pattern */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background:
              'radial-gradient(circle at 50% 42%, rgba(247, 245, 233, 0.78) 0%, rgba(242, 240, 227, 0.35) 58%, rgba(212, 198, 168, 0.22) 100%)',
          }}
        />

        {/* Hero Center Headline + Go to Shop CTA */}
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto mt-2">
          <h1 className="font-display tracking-tight leading-[1.08] text-[38px] sm:text-[48px] lg:text-[55px]">
            <span className="block text-[#768E5C] font-normal">{t('hero_title_1')}</span>
            <span className="block text-[#384A22] font-normal">{t('hero_title_2')}</span>
          </h1>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => onNavigate('shop', 'powders')}
              className="inline-flex items-center justify-center px-14 py-3.5 rounded-full bg-[#8B6D3B] hover:bg-[#765B2F] text-[#F2F0E3] text-[18px] font-medium shadow-md transition-all cursor-pointer min-w-[230px]"
            >
              {t('btn_go_shop')}
            </button>
          </div>
        </div>

        {/* Center Hero Showcase: User's 4 Kampot Harvest Co. Products on Artisan Countertop Pedestal */}
        <div className="relative z-10 w-full max-w-[1100px] mx-auto px-4 my-4 sm:my-6 flex flex-col items-center">
          {/* "See More" Button on the right side of the products */}
          <div className="self-end mb-2.5 sm:mb-3 xl:mb-0 xl:absolute xl:right-0 2xl:-right-6 xl:top-1/2 xl:-translate-y-1/2 z-30">
            <button
              type="button"
              onClick={() => onNavigate('shop', 'powders')}
              data-testid="hero-see-more-right-btn"
              aria-label="See more products"
              className="group inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-[#384A22] hover:bg-[#2B3B18] text-[#F2F0E3] shadow-lg hover:shadow-2xl border border-[#F2F0E3]/25 transition-all duration-300 hover:scale-105 cursor-pointer backdrop-blur-xs"
            >
              <span className="text-xs sm:text-[14px] font-bold tracking-tight whitespace-nowrap">
                {t('btn_see_more', 'See More')}
              </span>
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#8B6D3B] text-[#F2F0E3] flex items-center justify-center shrink-0 shadow-xs group-hover:bg-[#765B2F] transition-colors">
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>
          </div>

          <div className="relative w-full grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 items-end justify-items-center px-2 sm:px-8 pt-2 pb-4">
            {[
              {
                id: 'honey-butter-100g-pouch',
                src: '/assets/aistudio/product-honey-butter-pouch-100g.png',
                alt: 'Artisan Roasted Cashews — Honey Butter (100g Pouch)',
                label: 'Honey Butter · 100g Pouch',
              },
              {
                id: 'chili-lime-100g-pouch',
                src: '/assets/aistudio/product-chili-lime-pouch-100g.png',
                alt: 'Artisan Roasted Cashews — Chili Lime (100g Pouch)',
                label: 'Chili Lime · 100g Pouch',
              },
              {
                id: 'honey-butter-250g-jar',
                src: '/assets/aistudio/product-honey-butter-jar-250g.png',
                alt: 'Artisan Roasted Cashews — Honey Butter (250g Jar)',
                label: 'Honey Butter · 250g Jar',
              },
              {
                id: 'chilli-lime-250g-jar',
                src: '/assets/aistudio/product-chilli-lime-jar-250g.png',
                alt: 'Artisan Roasted Cashews — Chili Lime (250g Jar)',
                label: 'Chili Lime · 250g Jar',
              },
            ].map((item, idx) => {
              const outOfStock = isProductOutOfStock(inventory, item.id);
              return (
                <div
                  key={idx}
                  onClick={() => onNavigate('shop', 'powders')}
                  className="group relative flex flex-col items-center cursor-pointer transition-transform duration-300 hover:-translate-y-2"
                >
                  <div className="relative w-[155px] sm:w-[205px] lg:w-[230px] h-[200px] sm:h-[265px] lg:h-[295px] flex items-end justify-center">
                    <SmartImage
                      src={item.src}
                      alt={item.alt}
                      className={`w-full h-full object-contain drop-shadow-[0_18px_24px_rgba(45,68,28,0.28)] ${
                        outOfStock ? 'opacity-80' : ''
                      }`}
                      fallbackBg="transparent"
                    />
                    {outOfStock && (
                      <span
                        data-testid={`hero-out-of-stock-label-${item.id}`}
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-md bg-[#B83A2A] text-[#F2F0E3] text-[11px] font-bold uppercase tracking-wider whitespace-nowrap shadow-md"
                      >
                        {t('badge_out_of_stock', 'Out of Stock')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Warm Teak Countertop Ledge beneath the 4 products */}
          <div className="w-[94%] max-w-[980px] h-3.5 rounded-full bg-gradient-to-r from-[#8B6D3B]/35 via-[#8B6D3B]/70 to-[#8B6D3B]/35 shadow-md -mt-2" />
        </div>

        {/* 5 Overlapping Organic Green Stat Blobs + Cream Feature Card */}
        <div className="relative z-20 w-full max-w-[850px] mx-auto px-4">
          {/* Top 5 Green Organic Blobs */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-4 px-1 sm:px-6 -mb-9 relative z-20">
            {HERO_STATS.map((stat, idx) => {
              const statTopKey = `hero_stat_${idx + 1}_top`;
              const statBottomKey = `hero_stat_${idx + 1}_bottom`;
              return (
                <div
                  key={idx}
                  className="blob-badge bg-[#2D471E] text-[#F2F0E3] h-[72px] sm:h-[94px] flex flex-col items-center justify-center text-center shadow-md px-1 sm:px-2"
                >
                  <span className="text-[12px] min-[380px]:text-[15px] sm:text-[25px] font-medium leading-tight tracking-tight">
                    {t(statTopKey, stat.top)}
                  </span>
                  <span className="text-[9px] min-[380px]:text-[11px] sm:text-[15px] font-light text-[#D5DEC8] leading-tight mt-0.5">
                    {t(statBottomKey, stat.bottom)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Cream Rounded Feature Card with Vertical Hairline Dividers */}
          <div className="bg-[#F2F0E3] rounded-t-[20px] border border-[#8B6D3B]/30 pt-12 pb-6 px-2 sm:px-4 shadow-lg">
            <div className="grid grid-cols-5 divide-x divide-[#8B6D3B]/35">
              {HERO_FEATURES.map((feat) => {
                const isSelected = selectedFeatureId === feat.id;
                const featKeyMap: Record<string, string> = {
                  'real-nuts': 'real_nuts',
                  'cold-pressed': 'slow_roasted',
                  'no-sugar': 'no_sugar',
                  'no-flavoring': 'no_flavoring',
                  'double-protein': 'double_protein',
                };
                const suffix = featKeyMap[feat.id] || 'real_nuts';
                const title = t(`hero_feat_${suffix}_title`, feat.title);
                return (
                  <button
                    key={feat.id}
                    type="button"
                    onClick={() =>
                      setSelectedFeatureId(isSelected ? null : feat.id)
                    }
                    className={`flex flex-col items-center justify-start text-center px-1.5 sm:px-3 py-1 transition-colors cursor-pointer group ${
                      isSelected ? 'bg-[#8B6D3B]/10 rounded-lg' : ''
                    }`}
                  >
                    <div className="mb-2 group-hover:scale-110 transition-transform">
                      <FeatureIcon type={feat.iconType} />
                    </div>
                    <h3 className="text-[9px] min-[380px]:text-[11px] sm:text-[15px] font-extrabold text-[#384A22] leading-[1.2] whitespace-pre-line break-words">
                      {title}
                    </h3>
                  </button>
                );
              })}
            </div>

            {/* Interactive Feature Drawer when any of the 5 feature icons is clicked */}
            {activeFeature && (
              <div className="mt-4 pt-4 border-t border-[#8B6D3B]/25 px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-left animate-fadeIn">
                <div>
                  <h2 className="text-[18px] font-extrabold text-[#384A22]">
                    {(() => {
                      const featKeyMap: Record<string, string> = {
                        'real-nuts': 'real_nuts',
                        'cold-pressed': 'slow_roasted',
                        'no-sugar': 'no_sugar',
                        'no-flavoring': 'no_flavoring',
                        'double-protein': 'double_protein',
                      };
                      const suffix = featKeyMap[activeFeature.id] || 'real_nuts';
                      return t(`hero_feat_${suffix}_headline`, activeFeature.headline);
                    })()}
                  </h2>
                  <p className="text-[13.5px] text-[#384A22]/85 mt-0.5 max-w-xl">
                    {(() => {
                      const featKeyMap: Record<string, string> = {
                        'real-nuts': 'real_nuts',
                        'cold-pressed': 'slow_roasted',
                        'no-sugar': 'no_sugar',
                        'no-flavoring': 'no_flavoring',
                        'double-protein': 'double_protein',
                      };
                      const suffix = featKeyMap[activeFeature.id] || 'real_nuts';
                      return t(`hero_feat_${suffix}_detail`, activeFeature.detail);
                    })()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFeatureId(null)}
                  className="text-xs font-bold text-[#8B6D3B] hover:underline shrink-0 cursor-pointer"
                >
                  {t('btn_close', 'Close')} ✕
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PART 2: 25% OFF BUNDLE OFFER SECTION ON DARK FOREST GREEN WITH COLOR-MATCHED KBACH PATTERN */}
      <div
        className="relative w-full bg-[#384A22] pt-12 pb-16 overflow-hidden"
        style={{
          backgroundImage: `url("/assets/aistudio/kbach-pattern-green.svg"), url("https://botenz.in/wp-content/uploads/2026/05/home-bottom-1.svg")`,
          backgroundRepeat: 'repeat, no-repeat',
          backgroundSize: '260px 260px, cover',
          backgroundPosition: 'center center, center top',
        }}
      >
        {/* Top Row: Left Spoon + Center 25% OFF + Right Spoon */}
        <div className="max-w-[1440px] mx-auto relative flex items-center justify-between min-h-[390px] px-4 lg:px-0">
          {/* Left Wooden Spoon with Roasted Cashew Nuts */}
          <div className="hidden md:block relative w-[340px] lg:w-[440px] xl:w-[480px] shrink-0 -ml-6 lg:-ml-12 select-none pointer-events-none group">
            <div className="transition-transform duration-700 ease-out transform -rotate-[7deg] -translate-y-1 hover:rotate-[-5deg] drop-shadow-[0_18px_32px_rgba(0,0,0,0.5)]">
              <SmartImage
                src={ASSETS.bundleLeftSpoon}
                alt="Artisan wooden spoon with golden roasted Honey Butter cashews"
                className="w-full h-auto object-contain"
                fallbackBg="transparent"
              />
            </div>
          </div>

          {/* Center 25% OFF Offer Block */}
          <div className="flex-1 text-center z-10 px-4 max-w-xl mx-auto">
            <h2 className="text-[44px] min-[360px]:text-[56px] sm:text-[96px] lg:text-[115px] font-extrabold text-[#F2F0E3] leading-none tracking-tight break-words max-w-full">
              {t('hero_bundle_offer_title')}
            </h2>
            <p className="text-[20px] sm:text-[26px] font-bold text-[#F2F0E3] mt-1">
              {t('hero_bundle_offer_sub')}
            </p>

            <div className="mt-5">
              <button
                type="button"
                onClick={onClaimOffer}
                className="inline-flex items-center justify-center px-12 py-3 rounded-full bg-[#8B6D3B] hover:bg-[#765B2F] text-[#F2F0E3] text-[17px] font-medium transition-all shadow-md cursor-pointer min-w-[195px]"
              >
                {t('btn_claim_offer')}
              </button>
            </div>

            <p className="mt-6 text-[14px] sm:text-[16px] font-semibold text-[#F2F0E3]/95 leading-snug max-w-[490px] mx-auto">
              {t('hero_bundle_offer_desc')}
            </p>
          </div>

          {/* Right Wooden Spoon with Roasted Cashew Nuts */}
          <div className="hidden md:block relative w-[340px] lg:w-[440px] xl:w-[480px] shrink-0 -mr-6 lg:-mr-12 select-none pointer-events-none group">
            <div className="transition-transform duration-700 ease-out transform rotate-[7deg] -translate-y-1 hover:rotate-[5deg] drop-shadow-[0_18px_32px_rgba(0,0,0,0.5)]">
              <SmartImage
                src={ASSETS.bundleRightSpoon}
                alt="Artisan wooden spoon with zesty Chili Lime roasted cashews"
                className="w-full h-auto object-contain"
                fallbackBg="transparent"
              />
            </div>
          </div>
        </div>

        {/* Bottom Cream Wave Backdrop behind the 3 Bundle Cards */}
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-14 mt-4">
          {/* Mobile Rotation Controls */}
          <div className="md:hidden flex items-center justify-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => rotateBundles('prev')}
              aria-label="Previous bundle"
              className="w-9 h-9 rounded-full bg-[#8B6D3B] hover:bg-[#765B2F] text-[#F2F0E3] flex items-center justify-center shadow-md transition-colors cursor-pointer text-sm"
            >
              ←
            </button>
            <span className="text-xs font-semibold text-[#F2F0E3]/80 uppercase tracking-wider">
              {t('cat_bundles', 'Bundles')}
            </span>
            <button
              type="button"
              onClick={() => rotateBundles('next')}
              aria-label="Next bundle"
              className="w-9 h-9 rounded-full bg-[#8B6D3B] hover:bg-[#765B2F] text-[#F2F0E3] flex items-center justify-center shadow-md transition-colors cursor-pointer text-sm"
            >
              →
            </button>
          </div>

          {/* Desktop Previous / Next Carousel Arrows */}
          <button
            type="button"
            onClick={() => rotateBundles('prev')}
            aria-label="Previous bundle"
            className="hidden md:flex absolute left-3 lg:left-8 bottom-[105px] z-30 w-8 h-8 rounded-full bg-[#8B6D3B] hover:bg-[#765B2F] text-[#F2F0E3] items-center justify-center shadow-md transition-colors cursor-pointer"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => rotateBundles('next')}
            aria-label="Next bundle"
            className="hidden md:flex absolute right-3 lg:right-8 bottom-[105px] z-30 w-8 h-8 rounded-full bg-[#8B6D3B] hover:bg-[#765B2F] text-[#F2F0E3] items-center justify-center shadow-md transition-colors cursor-pointer"
          >
            →
          </button>

          {/* 3-Column Bundle Showcase matching clean-sec-1.png */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 items-end">
            {bundleOrder.map((bundleIndex) => {
              const bundle = BUNDLES[bundleIndex];
              const isOutOfStock = isProductOutOfStock(inventory, bundle.id);
              return (
                <div
                  key={bundle.id}
                  data-testid={`bundle-card-${bundle.id}`}
                  className="flex flex-col items-center group"
                >
                  {/* Floating Bundle Product Photo */}
                  <div
                    onClick={() => onSelectBundleDetail(bundle)}
                    className="relative z-10 w-full max-w-[410px] h-[300px] sm:h-[330px] flex items-end justify-center -mb-14 cursor-pointer group-hover:-translate-y-1.5 transition-transform duration-300"
                  >
                    <SmartImage
                      src={bundle.image}
                      alt={bundle.name}
                      className={`w-full h-full object-contain drop-shadow-xl ${
                        isOutOfStock ? 'opacity-75' : ''
                      }`}
                      fallbackBg="transparent"
                    />
                  </div>

                  {/* Dark Green Pedestal Card */}
                  <div className="w-full max-w-[375px] bg-[#2D441C] rounded-b-[22px] rounded-t-[12px] pt-16 pb-6 px-6 text-center text-[#F2F0E3] shadow-xl border border-[#F2F0E3]/10">
                    <h3 className="text-[19px] font-semibold text-[#F3F1E4] tracking-tight">
                      {bundle.id.includes('complete')
                        ? t('bundle_complete_4pack_name', bundle.name)
                        : bundle.id.includes('jars')
                        ? t('bundle_jars_duo_name', bundle.name)
                        : bundle.id.includes('pouches')
                        ? t('bundle_pouches_duo_name', bundle.name)
                        : bundle.name}
                    </h3>

                    {isOutOfStock && (
                      <p
                        data-testid={`bundle-out-of-stock-text-${bundle.id}`}
                        className="text-xs font-bold uppercase tracking-wider text-[#F2B8B5] mt-1"
                      >
                        {t('stock_product_out_of_stock', 'Product is Out of Stock')}
                      </p>
                    )}

                    <div className="mt-2 flex items-baseline justify-center gap-3 tabular-nums">
                      <span className="text-[24px] font-medium text-[#F2F0E3]">
                        {formatPrice(bundle.price)}
                      </span>
                      <span className="text-[14px] text-[#8B6D3B] line-through font-medium">
                        {formatPrice(bundle.originalPrice)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[13px] text-[#F2F0E3]/90 ml-1">
                        <svg className="w-4 h-4 text-[#EAB308] fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {bundle.rating}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        data-testid={`bundle-action-btn-${bundle.id}`}
                        onClick={() => {
                          if (!isOutOfStock) onAddBundleToCart(bundle);
                        }}
                        className={`flex-1 py-2.5 px-5 rounded-full text-[14px] font-medium transition-colors whitespace-nowrap ${
                          isOutOfStock
                            ? 'bg-[#B83A2A] text-[#F2F0E3] cursor-not-allowed font-bold'
                            : 'bg-[#8B6D3B] hover:bg-[#765B2F] text-[#F2F0E3] cursor-pointer'
                        }`}
                      >
                        {isOutOfStock ? t('badge_out_of_stock', 'Out of Stock') : t('btn_add_to_cart')}
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectBundleDetail(bundle)}
                        className="flex-1 py-2.5 px-5 rounded-full border border-[#F2F0E3]/45 hover:border-[#F2F0E3] text-[#F2F0E3] text-[14px] font-medium transition-colors cursor-pointer whitespace-nowrap"
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
