import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, ChevronDown, Globe } from 'lucide-react';
import { ASSETS } from '../data/botenzData';
import { SmartImage } from './SmartImage';
import { useI18n, LANGUAGES, Language } from '../utils/i18nContext';

export type ActivePage =
  | 'home'
  | 'shop'
  | 'way'
  | 'autoship'
  | 'recipes'
  | 'rewards'
  | 'admin_inventory';

interface NavbarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage, categoryFilter?: string) => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenDiscountModal: () => void;
  currentUserName?: string | null;
  isAdmin?: boolean;
  onOpenAccountModal?: () => void;
}

export const BotenzLogo: React.FC<{ variant?: 'green' | 'white'; className?: string }> = ({
  variant = 'green',
  className = 'h-14 w-auto',
}) => {
  const [imgErr, setImgErr] = useState(false);
  const src = variant === 'green' ? ASSETS.logoGreen : ASSETS.logoWhite;

  if (!imgErr) {
    return (
      <img
        src={src}
        alt="Kampot Harvest Co. logo"
        onError={() => setImgErr(true)}
        className={`object-contain ${className}`}
      />
    );
  }

  const textColor = variant === 'green' ? '#384A22' : '#F2F0E3';
  const barColor = variant === 'green' ? '#8B6D3B' : '#F2F0E3';

  return (
    <div className="inline-flex flex-col items-start leading-none select-none">
      <div className="w-full h-[3px] mb-0.5" style={{ backgroundColor: barColor }} />
      <span
        className="text-2xl font-extrabold tracking-tight"
        style={{ color: textColor, fontFamily: 'Manrope, sans-serif' }}
      >
        KAMPOT HARVEST
      </span>
    </div>
  );
};

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  onNavigate,
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenDiscountModal,
  currentUserName,
  isAdmin = false,
  onOpenAccountModal,
}) => {
  const { language, setLanguage, t, formatPrice } = useI18n();
  const [openDropdown, setOpenDropdown] = useState<'shop' | 'way' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);
  const langMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleMouseEnter = (menu: 'shop' | 'way') => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setOpenDropdown(menu);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = window.setTimeout(() => {
      setOpenDropdown(null);
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) window.clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const handleNavClick = (page: ActivePage, categoryFilter?: string) => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
    setLangMenuOpen(false);
    onNavigate(page, categoryFilter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className="sticky top-0 z-40 w-full bg-[#F2F0E3]/95 backdrop-blur-sm transition-colors border-b border-[#384A22]/10"
      onMouseLeave={handleMouseLeave}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 h-[84px] flex items-center justify-between gap-4 lg:gap-8">
        {/* Zone 1: Brand Wordmark / Logo */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('home');
          }}
          className="shrink-0 focus:outline-none"
          aria-label="Home"
        >
          <BotenzLogo variant="green" className="h-[58px] sm:h-[66px] w-auto object-contain" />
        </a>

        {/* Zone 2: Primary Navigation Links */}
        <nav
          aria-label="Menu"
          className="hidden md:flex items-center gap-6 lg:gap-9 text-[15px] lg:text-[16px] font-normal text-[#384A22]"
        >
          {/* Shop item with Mega Menu */}
          <div
            className="relative py-6"
            onMouseEnter={() => handleMouseEnter('shop')}
          >
            <button
              type="button"
              onClick={() => handleNavClick('shop', 'powders')}
              aria-expanded={openDropdown === 'shop'}
              className={`whitespace-nowrap shrink-0 pb-1 transition-colors cursor-pointer ${
                activePage === 'shop' || openDropdown === 'shop'
                  ? 'border-b-[1.5px] border-[#384A22] font-semibold'
                  : 'hover:text-[#768E5C]'
              }`}
            >
              {t('nav_shop')}
            </button>
          </div>

          {/* The Kampot Way item with Mega Menu */}
          <div
            className="relative py-6"
            onMouseEnter={() => handleMouseEnter('way')}
          >
            <button
              type="button"
              onClick={() => handleNavClick('way')}
              aria-expanded={openDropdown === 'way'}
              className={`whitespace-nowrap shrink-0 pb-1 transition-colors cursor-pointer ${
                activePage === 'way' || openDropdown === 'way'
                  ? 'border-b-[1.5px] border-[#384A22] font-semibold'
                  : 'hover:text-[#768E5C]'
              }`}
            >
              {t('nav_way')}
            </button>
          </div>

          {/* Autoship & Save */}
          <button
            type="button"
            onClick={() => handleNavClick('autoship')}
            className={`whitespace-nowrap shrink-0 pb-1 transition-colors cursor-pointer ${
              activePage === 'autoship'
                ? 'border-b-[1.5px] border-[#384A22] font-semibold'
                : 'hover:text-[#768E5C]'
            }`}
          >
            {t('nav_autoship')}
          </button>

          {/* Recipes */}
          <button
            type="button"
            onClick={() => handleNavClick('recipes')}
            className={`whitespace-nowrap shrink-0 pb-1 transition-colors cursor-pointer ${
              activePage === 'recipes'
                ? 'border-b-[1.5px] border-[#384A22] font-semibold'
                : 'hover:text-[#768E5C]'
            }`}
          >
            {t('nav_recipes')}
          </button>

          {/* Admin Inventory Link (Only visible to authenticated Admins) */}
          {isAdmin && (
            <button
              type="button"
              data-testid="nav-admin-inventory-btn"
              onClick={() => handleNavClick('admin_inventory')}
              className={`whitespace-nowrap shrink-0 pb-1 font-bold text-[#8B6D3B] transition-colors cursor-pointer ${
                activePage === 'admin_inventory'
                  ? 'border-b-[1.5px] border-[#8B6D3B]'
                  : 'hover:text-[#384A22]'
              }`}
            >
              Inventory
            </button>
          )}
        </nav>

        {/* Zone 3: Functional Controls (Language, Currency) & Cart Action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Language Selector Dropdown (Desktop / Tablet) */}
          <div className="relative hidden sm:block" ref={langMenuRef}>
            <button
              type="button"
              id="lang-selector-btn"
              onClick={() => {
                setLangMenuOpen((prev) => !prev);
              }}
              aria-label={`Selected language: ${LANGUAGES[language].label}. Click to switch.`}
              aria-expanded={langMenuOpen}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#384A22]/10 hover:bg-[#384A22]/20 border border-[#384A22]/25 text-[#384A22] text-[13px] font-bold tracking-wide transition-all cursor-pointer select-none"
            >
              <span className="text-sm leading-none">{LANGUAGES[language].flag}</span>
              <span className="font-semibold">{language}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#384A22]/70 transition-transform duration-200 ${
                  langMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {langMenuOpen && (
              <div
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="lang-selector-btn"
                className="absolute right-0 top-full mt-2 w-44 bg-[#F2F0E3] rounded-2xl shadow-2xl border border-[#384A22]/20 py-2 z-50 backdrop-blur-md overflow-hidden"
              >
                <div className="px-3.5 py-1 text-[11px] font-bold text-[#8B6D3B] uppercase tracking-wider border-b border-[#384A22]/10 mb-1">
                  {t('lang_select_title')}
                </div>
                {(Object.keys(LANGUAGES) as Language[]).map((langKey) => {
                  const item = LANGUAGES[langKey];
                  const isSelected = language === langKey;
                  return (
                    <button
                      key={langKey}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setLanguage(langKey);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-left text-[13px] transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#384A22] text-[#F2F0E3] font-bold'
                          : 'text-[#384A22] hover:bg-[#384A22]/10 font-medium'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="text-base leading-none">{item.flag}</span>
                        <span>{item.nativeLabel}</span>
                      </span>
                      {isSelected && <span className="text-xs font-bold">✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Account / Sign In Button */}
          {onOpenAccountModal && (
            <button
              type="button"
              data-testid="nav-account-btn"
              onClick={onOpenAccountModal}
              aria-label={
                currentUserName
                  ? `Account (${currentUserName})`
                  : 'Sign In'
              }
              className="hidden sm:inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full border border-[#384A22]/30 text-[#384A22] hover:bg-[#384A22]/10 text-[13px] font-bold transition-colors cursor-pointer whitespace-nowrap h-[42px]"
            >
              {currentUserName ? (
                <>
                  <span
                    data-testid="nav-user-avatar"
                    className="w-7 h-7 rounded-full bg-[#384A22] text-[#F2F0E3] flex items-center justify-center overflow-hidden shrink-0 border border-[#384A22]/20"
                    title={`${currentUserName} (Default Profile Picture)`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4"
                      aria-hidden="true"
                    >
                      <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
                    </svg>
                  </span>
                  <span>{currentUserName.split(' ')[0]}</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          )}

          {/* Primary Cart Action */}
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Shopping Cart with ${cartCount} items, total ${formatPrice(cartTotal)}`}
            className="inline-flex items-center justify-center gap-2 px-3.5 sm:px-5 py-2 rounded-full border border-[#384A22] text-[#384A22] hover:bg-[#384A22] hover:text-[#F2F0E3] transition-colors cursor-pointer min-w-[105px] sm:min-w-[116px] h-[44px] sm:h-[48px]"
          >
            {/* Custom Basket Icon matching Botenz header */}
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="shrink-0"
              aria-hidden="true"
            >
              <path d="M5.5 10L8.5 4.5C8.8 4 9.5 3.8 10 4.1C10.5 4.4 10.7 5.1 10.4 5.6L8 10H16L13.6 5.6C13.3 5.1 13.5 4.4 14 4.1C14.5 3.8 15.2 4 15.5 4.5L18.5 10H21C21.6 10 22 10.4 22 11V12C22 12.5 21.6 12.9 21.1 13L19.6 19.4C19.3 20.4 18.4 21 17.4 21H6.6C5.6 21 4.7 20.4 4.4 19.4L2.9 13C2.4 12.9 2 12.5 2 12V11C2 10.4 2.4 10 3 10H5.5ZM9 15.5C9 14.7 8.3 14 7.5 14C6.7 14 6 14.7 6 15.5C6 16.3 6.7 17 7.5 17C8.3 17 9 16.3 9 15.5ZM13.5 15.5C13.5 14.7 12.8 14 12 14C11.2 14 10.5 14.7 10.5 15.5C10.5 16.3 11.2 17 12 17C12.8 17 13.5 16.3 13.5 15.5ZM18 15.5C18 14.7 17.3 14 16.5 14C15.7 14 15 14.7 15 15.5C15 16.3 15.7 17 16.5 17C17.3 17 18 16.3 18 15.5Z" />
            </svg>
            <span className="text-[14px] sm:text-[15px] font-semibold tabular-nums">
              {cartCount} · {formatPrice(cartTotal)}
            </span>
          </button>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden p-2.5 rounded-full border border-[#384A22] text-[#384A22] hover:bg-[#384A22] hover:text-[#F2F0E3] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mega Menu 1: SHOP (matches mega-menu-open.png) */}
      {openDropdown === 'shop' && (
        <div
          onMouseEnter={() => handleMouseEnter('shop')}
          onMouseLeave={handleMouseLeave}
          className="hidden md:block absolute left-1/2 -translate-x-1/2 top-[80px] w-[860px] bg-[#F2F0E3] rounded-2xl shadow-2xl border border-[#384A22]/10 p-6 z-50"
        >
          <div className="grid grid-cols-12 gap-4">
            {/* Left Links Column */}
            <div className="col-span-3 flex flex-col justify-between pr-2">
              <ul className="space-y-3 text-[16px] font-bold text-[#384A22]">
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavClick('shop', 'powders')}
                    className="text-left hover:text-[#8B6D3B] transition-colors leading-tight cursor-pointer"
                  >
                    {t('nav_new_arrivals')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavClick('shop', 'bundles')}
                    className="text-left hover:text-[#8B6D3B] transition-colors leading-tight cursor-pointer"
                  >
                    {t('nav_variety_packs')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavClick('way')}
                    className="text-left hover:text-[#8B6D3B] transition-colors leading-tight cursor-pointer"
                  >
                    {t('nav_way')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavClick('shop', 'accessories')}
                    className="text-left hover:text-[#8B6D3B] transition-colors leading-tight cursor-pointer"
                  >
                    {t('nav_gifts_extras')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavClick('rewards')}
                    className="text-left hover:text-[#8B6D3B] transition-colors leading-tight cursor-pointer"
                  >
                    {t('nav_rewards')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenDropdown(null);
                      onOpenDiscountModal();
                    }}
                    className="text-left hover:text-[#8B6D3B] transition-colors leading-tight cursor-pointer"
                  >
                    {t('nav_gift_reward')}
                  </button>
                </li>
              </ul>

              <button
                type="button"
                onClick={() => handleNavClick('shop', 'powders')}
                className="mt-4 w-[110px] py-2.5 rounded-full border-2 border-[#384A22] text-[#384A22] text-[13px] font-extrabold uppercase leading-tight hover:bg-[#384A22] hover:text-[#F2F0E3] transition-colors cursor-pointer"
              >
                {t('nav_shop_all')}
              </button>
            </div>

            {/* Center 2x2 Grid Cards */}
            <div className="col-span-6 grid grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => handleNavClick('shop', 'bundles')}
                className="bg-white rounded-xl overflow-hidden flex text-left hover:shadow-md transition-shadow group cursor-pointer h-[220px]"
              >
                <div className="w-[52%] h-full overflow-hidden">
                  <SmartImage
                    src={ASSETS.megaShopBundles}
                    alt="Botenz Bundles"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="w-[48%] p-3.5 flex flex-col justify-center">
                  <h3 className="text-[15px] font-extrabold text-[#384A22] leading-snug mb-1.5">
                    {t('cat_bundles')}
                  </h3>
                  <p className="text-[12px] text-[#666666] font-medium leading-relaxed">
                    {t('nav_bundles_discount')}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('shop', 'powders')}
                className="bg-white rounded-xl overflow-hidden flex text-left hover:shadow-md transition-shadow group cursor-pointer h-[220px]"
              >
                <div className="w-[52%] h-full overflow-hidden">
                  <SmartImage
                    src={ASSETS.megaShopSachets}
                    alt="Shake Sachets"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="w-[48%] p-3.5 flex flex-col justify-center">
                  <h3 className="text-[15px] font-extrabold text-[#384A22] leading-snug mb-1.5">
                    {t('cat_pouches')}
                  </h3>
                  <p className="text-[12px] text-[#666666] font-medium leading-relaxed">
                    {t('flavors_title')}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('shop', 'powders')}
                className="bg-white rounded-xl overflow-hidden flex text-left hover:shadow-md transition-shadow group cursor-pointer h-[220px]"
              >
                <div className="w-[52%] h-full overflow-hidden">
                  <SmartImage
                    src={ASSETS.megaShopPowders}
                    alt="All Artisan Cashews"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="w-[48%] p-3.5 flex flex-col justify-center">
                  <h3 className="text-[15px] font-extrabold text-[#384A22] leading-snug mb-1.5">
                    {t('cat_jars')}
                  </h3>
                  <p className="text-[12px] text-[#666666] font-medium leading-relaxed">
                    {t('cat_all')}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('shop', 'accessories')}
                className="bg-white rounded-xl overflow-hidden flex text-left hover:shadow-md transition-shadow group cursor-pointer h-[220px]"
              >
                <div className="w-[52%] h-full overflow-hidden">
                  <SmartImage
                    src={ASSETS.megaShopGifts}
                    alt="Gifts & Extras"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="w-[48%] p-3.5 flex flex-col justify-center">
                  <h3 className="text-[15px] font-extrabold text-[#384A22] leading-snug mb-1.5">
                    {t('nav_gifts_extras')}
                  </h3>
                  <p className="text-[12px] text-[#666666] font-medium leading-relaxed">
                    {t('nav_gifts_extras_desc')}
                  </p>
                </div>
              </button>
            </div>

            {/* Right Feature Card */}
            <div className="col-span-3">
              <button
                type="button"
                onClick={() => handleNavClick('shop', 'bundles')}
                className="w-full h-full bg-white rounded-xl overflow-hidden flex flex-col text-left hover:shadow-md transition-shadow group cursor-pointer"
              >
                <div className="h-[195px] w-full overflow-hidden">
                  <SmartImage
                    src={ASSETS.megaShopFullSet}
                    alt="Can't Choose? Get Them All"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-center">
                  <h3 className="text-[17px] font-extrabold text-[#384A22] leading-snug mb-2">
                    {t('nav_cant_choose')}
                  </h3>
                  <p className="text-[12px] font-bold text-[#555555] mb-1">
                    {t('cat_bundles')}
                  </p>
                  <p className="text-[12px] text-[#666666] leading-relaxed">
                    {t('nav_bundle_desc')}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mega Menu 2: THE BOTENZ WAY (matches mega-menu-way.png) */}
      {openDropdown === 'way' && (
        <div
          onMouseEnter={() => handleMouseEnter('way')}
          onMouseLeave={handleMouseLeave}
          className="hidden md:block absolute left-1/2 -translate-x-1/2 top-[80px] w-[760px] bg-[#F2F0E3] rounded-2xl shadow-2xl border border-[#384A22]/10 p-6 z-50"
        >
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8 grid grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => handleNavClick('way')}
                className="bg-white rounded-xl overflow-hidden flex text-left hover:shadow-md transition-shadow group cursor-pointer h-[195px]"
              >
                <div className="w-[45%] h-full overflow-hidden">
                  <SmartImage
                    src={ASSETS.megaWayAbout}
                    alt="About Us"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="w-[55%] p-3.5 flex flex-col justify-center">
                  <h3 className="text-[15px] font-extrabold text-[#384A22] mb-1.5">
                    {t('nav_about_us')}
                  </h3>
                  <p className="text-[12px] text-[#666666] font-medium leading-relaxed">
                    {t('nav_about_desc')}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('way')}
                className="bg-white rounded-xl overflow-hidden flex text-left hover:shadow-md transition-shadow group cursor-pointer h-[195px]"
              >
                <div className="w-[45%] h-full overflow-hidden">
                  <SmartImage
                    src={ASSETS.megaWayQuality}
                    alt="Product Quality"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="w-[55%] p-3.5 flex flex-col justify-center">
                  <h3 className="text-[15px] font-extrabold text-[#384A22] mb-1.5">
                    {t('nav_product_quality')}
                  </h3>
                  <p className="text-[12px] text-[#666666] font-medium leading-relaxed">
                    {t('nav_quality_desc')}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('way')}
                className="bg-white rounded-xl overflow-hidden flex text-left hover:shadow-md transition-shadow group cursor-pointer h-[195px]"
              >
                <div className="w-[45%] h-full overflow-hidden">
                  <SmartImage
                    src={ASSETS.megaWayGlass}
                    alt="Why Glass"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="w-[55%] p-3.5 flex flex-col justify-center">
                  <h3 className="text-[15px] font-extrabold text-[#384A22] mb-1.5">
                    {t('nav_why_glass')}
                  </h3>
                  <p className="text-[12px] text-[#666666] font-medium leading-relaxed">
                    {t('nav_glass_desc')}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('way')}
                className="bg-white rounded-xl overflow-hidden flex text-left hover:shadow-md transition-shadow group cursor-pointer h-[195px]"
              >
                <div className="w-[45%] h-full overflow-hidden">
                  <SmartImage
                    src={ASSETS.megaWayEco}
                    alt="Our Eco Events"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="w-[55%] p-3.5 flex flex-col justify-center">
                  <h3 className="text-[15px] font-extrabold text-[#384A22] mb-1.5">
                    {t('nav_eco_events')}
                  </h3>
                  <p className="text-[12px] text-[#666666] font-medium leading-relaxed">
                    {t('nav_eco_desc')}
                  </p>
                </div>
              </button>
            </div>

            <div className="col-span-4">
              <button
                type="button"
                onClick={() => handleNavClick('shop', 'bundles')}
                className="w-full h-full rounded-xl overflow-hidden flex flex-col bg-[#384A22] text-[#F2F0E3] group cursor-pointer"
              >
                <div className="flex-1 w-full overflow-hidden">
                  <SmartImage
                    src={ASSETS.megaShopFullSet}
                    alt="Shop Special Edition"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 flex items-center justify-between bg-[#384A22] text-white">
                  <span className="text-[13px] font-extrabold uppercase tracking-wide text-center flex-1 leading-tight">
                    {t('nav_shop_special')}
                  </span>
                  <span className="text-lg">→</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F2F0E3] border-t border-[#384A22]/15 px-5 py-5 space-y-4 shadow-2xl">
          {/* Mobile Language & Currency Switcher Panel */}
          <div className="bg-[#FAF8F2] rounded-2xl p-4 border border-[#384A22]/15 space-y-3.5">
            {/* Language Switcher */}
            <div>
              <div className="text-[11px] font-bold text-[#8B6D3B] uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>{t('lang_select_title')}</span>
                <span className="text-[11px] font-medium text-[#384A22]/70">{LANGUAGES[language].label}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(LANGUAGES) as Language[]).map((langKey) => {
                  const item = LANGUAGES[langKey];
                  const isSelected = language === langKey;
                  return (
                    <button
                      key={langKey}
                      type="button"
                      onClick={() => setLanguage(langKey)}
                      className={`py-2 px-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#384A22] text-[#F2F0E3] shadow-sm'
                          : 'bg-white text-[#384A22] border border-[#384A22]/20 hover:bg-[#384A22]/5'
                      }`}
                    >
                      <span className="text-sm leading-none">{item.flag}</span>
                      <span>{item.nativeLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => handleNavClick('shop', 'powders')}
              className="block w-full text-left py-2.5 text-base font-bold text-[#384A22] border-b border-[#384A22]/10"
            >
              {t('nav_shop_all')}
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('shop', 'bundles')}
              className="block w-full text-left py-2.5 text-base font-bold text-[#384A22] border-b border-[#384A22]/10"
            >
              {t('nav_bundles_discount')}
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('way')}
              className="block w-full text-left py-2.5 text-base font-bold text-[#384A22] border-b border-[#384A22]/10"
            >
              {t('nav_way')}
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('autoship')}
              className="block w-full text-left py-2.5 text-base font-bold text-[#384A22] border-b border-[#384A22]/10"
            >
              {t('nav_autoship')}
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('recipes')}
              className="block w-full text-left py-2.5 text-base font-bold text-[#384A22] border-b border-[#384A22]/10"
            >
              {t('nav_recipes')}
            </button>
            {onOpenAccountModal && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAccountModal();
                }}
                className="flex items-center gap-2.5 w-full text-left py-2.5 text-base font-bold text-[#8B6D3B]"
              >
                {currentUserName ? (
                  <>
                    <span className="w-7 h-7 rounded-full bg-[#384A22] text-[#F2F0E3] flex items-center justify-center shrink-0">
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4"
                        aria-hidden="true"
                      >
                        <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
                      </svg>
                    </span>
                    <span>{currentUserName}</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
