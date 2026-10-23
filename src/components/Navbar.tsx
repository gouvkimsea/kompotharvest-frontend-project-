import React, { useState, useRef, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { ASSETS } from '../data/botenzData';
import { formatUSD, STORE_CURRENCY, CURRENCY_SYMBOL } from '../utils/storeLogic';
import { SmartImage } from './SmartImage';

export type ActivePage = 'home' | 'shop' | 'way' | 'autoship' | 'recipes' | 'rewards';

interface NavbarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage, categoryFilter?: string) => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenDiscountModal: () => void;
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
}) => {
  const [openDropdown, setOpenDropdown] = useState<'shop' | 'way' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);

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
    onNavigate(page, categoryFilter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className="sticky top-0 z-40 w-full bg-[#F2F0E3]/95 backdrop-blur-sm transition-colors"
      onMouseLeave={handleMouseLeave}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 h-[84px] flex items-center justify-between gap-8">
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
          <BotenzLogo variant="green" className="h-[66px] w-auto object-contain" />
        </a>

        {/* Zone 2: Primary Navigation Links */}
        <nav
          aria-label="Menu"
          className="hidden md:flex items-center gap-9 text-[16px] font-normal text-[#384A22]"
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
                  ? 'border-b-[1.5px] border-[#384A22] font-medium'
                  : 'hover:text-[#768E5C]'
              }`}
            >
              Shop
            </button>
          </div>

          {/* The Botenz Way item with Mega Menu */}
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
                  ? 'border-b-[1.5px] border-[#384A22] font-medium'
                  : 'hover:text-[#768E5C]'
              }`}
            >
              The Botenz Way
            </button>
          </div>

          {/* Autoship & Save */}
          <button
            type="button"
            onClick={() => handleNavClick('autoship')}
            className={`whitespace-nowrap shrink-0 pb-1 transition-colors cursor-pointer ${
              activePage === 'autoship'
                ? 'border-b-[1.5px] border-[#384A22] font-medium'
                : 'hover:text-[#768E5C]'
            }`}
          >
            Autoship &amp; Save
          </button>

          {/* Recipes */}
          <button
            type="button"
            onClick={() => handleNavClick('recipes')}
            className={`whitespace-nowrap shrink-0 pb-1 transition-colors cursor-pointer ${
              activePage === 'recipes'
                ? 'border-b-[1.5px] border-[#384A22] font-medium'
                : 'hover:text-[#768E5C]'
            }`}
          >
            Recipes
          </button>
        </nav>

        {/* Zone 3: Store Currency (USD $) & Primary Cart Action */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            data-testid="store-currency-badge"
            aria-label={`Store currency: ${STORE_CURRENCY} (${CURRENCY_SYMBOL})`}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#384A22]/10 border border-[#384A22]/25 text-[#384A22] text-[13px] font-bold tracking-wide select-none"
          >
            <span>{STORE_CURRENCY} ({CURRENCY_SYMBOL})</span>
          </div>

          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Shopping Cart with ${cartCount} items, total ${formatUSD(cartTotal)}`}
            className="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-full border border-[#384A22] text-[#384A22] hover:bg-[#384A22] hover:text-[#F2F0E3] transition-colors cursor-pointer min-w-[116px] h-[48px]"
          >
            {/* Custom Basket Icon matching Botenz header */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="shrink-0"
              aria-hidden="true"
            >
              <path d="M5.5 10L8.5 4.5C8.8 4 9.5 3.8 10 4.1C10.5 4.4 10.7 5.1 10.4 5.6L8 10H16L13.6 5.6C13.3 5.1 13.5 4.4 14 4.1C14.5 3.8 15.2 4 15.5 4.5L18.5 10H21C21.6 10 22 10.4 22 11V12C22 12.5 21.6 12.9 21.1 13L19.6 19.4C19.3 20.4 18.4 21 17.4 21H6.6C5.6 21 4.7 20.4 4.4 19.4L2.9 13C2.4 12.9 2 12.5 2 12V11C2 10.4 2.4 10 3 10H5.5ZM9 15.5C9 14.7 8.3 14 7.5 14C6.7 14 6 14.7 6 15.5C6 16.3 6.7 17 7.5 17C8.3 17 9 16.3 9 15.5ZM13.5 15.5C13.5 14.7 12.8 14 12 14C11.2 14 10.5 14.7 10.5 15.5C10.5 16.3 11.2 17 12 17C12.8 17 13.5 16.3 13.5 15.5ZM18 15.5C18 14.7 17.3 14 16.5 14C15.7 14 15 14.7 15 15.5C15 16.3 15.7 17 16.5 17C17.3 17 18 16.3 18 15.5Z" />
            </svg>
            <span className="text-[15px] font-semibold tabular-nums">
              {cartCount} · {formatUSD(cartTotal)}
            </span>
          </button>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden p-2.5 rounded-full border border-[#384A22] text-[#384A22] hover:bg-[#384A22] hover:text-[#F2F0E3] transition-colors"
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
                    New<br />Arrivals
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavClick('shop', 'bundles')}
                    className="text-left hover:text-[#8B6D3B] transition-colors leading-tight cursor-pointer"
                  >
                    Variety<br />Packs
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavClick('way')}
                    className="text-left hover:text-[#8B6D3B] transition-colors leading-tight cursor-pointer"
                  >
                    Find In<br />Store
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavClick('shop', 'accessories')}
                    className="text-left hover:text-[#8B6D3B] transition-colors leading-tight cursor-pointer"
                  >
                    Gift Cards
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavClick('rewards')}
                    className="text-left hover:text-[#8B6D3B] transition-colors leading-tight cursor-pointer"
                  >
                    Last<br />Chance<br />Savings
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
                    Gift $20,<br />Get $20
                  </button>
                </li>
              </ul>

              <button
                type="button"
                onClick={() => handleNavClick('shop', 'powders')}
                className="mt-4 w-[110px] py-2.5 rounded-full border-2 border-[#384A22] text-[#384A22] text-[13px] font-extrabold uppercase leading-tight hover:bg-[#384A22] hover:text-[#F2F0E3] transition-colors cursor-pointer"
              >
                SHOP<br />ALL
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
                    Botenz Bundles
                  </h3>
                  <p className="text-[12px] text-[#666666] font-medium leading-relaxed">
                    A few favorites, packed together
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
                    alt="Shake Saches"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="w-[48%] p-3.5 flex flex-col justify-center">
                  <h3 className="text-[15px] font-extrabold text-[#384A22] leading-snug mb-1.5">
                    Shake Saches
                  </h3>
                  <p className="text-[12px] text-[#666666] font-medium leading-relaxed">
                    Shake / Snack in any time
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
                    alt="All Nut Butter Powders"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="w-[48%] p-3.5 flex flex-col justify-center">
                  <h3 className="text-[15px] font-extrabold text-[#384A22] leading-snug mb-1.5">
                    All Nut Butter Powders
                  </h3>
                  <p className="text-[12px] text-[#666666] font-medium leading-relaxed">
                    Explore every flavor
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
                    Gifts &amp; Extras
                  </h3>
                  <p className="text-[12px] text-[#666666] font-medium leading-relaxed">
                    Small touches for everyday use
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
                    Can’t Choose? Get Them All
                  </h3>
                  <p className="text-[12px] font-bold text-[#555555] mb-1">
                    Full Botenz Bundle
                  </p>
                  <p className="text-[12px] text-[#666666] leading-relaxed">
                    All our jars, in one easy bundle for anyone who wants to try the full range.
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
                    About Us
                  </h3>
                  <p className="text-[12px] text-[#666666] font-medium leading-relaxed">
                    The Pride of Kampot, Roasted to Perfection.
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
                    alt="Product Quility"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="w-[55%] p-3.5 flex flex-col justify-center">
                  <h3 className="text-[15px] font-extrabold text-[#384A22] mb-1.5">
                    Product Quility
                  </h3>
                  <p className="text-[12px] text-[#666666] font-medium leading-relaxed">
                    Natural taste, planet-first!
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
                    Why Glass
                  </h3>
                  <p className="text-[12px] text-[#666666] font-medium leading-relaxed">
                    For health, taste, and planet care.
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
                    Our Eco Events
                  </h3>
                  <p className="text-[12px] text-[#666666] font-medium leading-relaxed">
                    Learning through environmental care
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
                    SHOP<br />SPECIAL<br />EDITION
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
        <div className="md:hidden bg-[#F2F0E3] border-t border-[#384A22]/15 px-6 py-5 space-y-3 shadow-xl">
          <button
            type="button"
            onClick={() => handleNavClick('shop', 'powders')}
            className="block w-full text-left py-2.5 text-lg font-bold text-[#384A22] border-b border-[#384A22]/10"
          >
            Shop All Products
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('shop', 'bundles')}
            className="block w-full text-left py-2.5 text-lg font-bold text-[#384A22] border-b border-[#384A22]/10"
          >
            Botenz Bundles (25% OFF)
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('way')}
            className="block w-full text-left py-2.5 text-lg font-bold text-[#384A22] border-b border-[#384A22]/10"
          >
            The Botenz Way
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('autoship')}
            className="block w-full text-left py-2.5 text-lg font-bold text-[#384A22] border-b border-[#384A22]/10"
          >
            Autoship &amp; Save
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('recipes')}
            className="block w-full text-left py-2.5 text-lg font-bold text-[#384A22]"
          >
            Recipes
          </button>
        </div>
      )}
    </header>
  );
};
