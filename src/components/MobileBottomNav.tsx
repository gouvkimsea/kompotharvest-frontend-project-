import React from 'react';
import { Home, Store, Truck, ShoppingBag } from 'lucide-react';
import { ActivePage } from './Navbar';
import { useI18n } from '../utils/i18nContext';

export interface MobileBottomNavProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage, categoryFilter?: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAiSommelier?: () => void;
  onOpenTrackOrder: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activePage,
  onNavigate,
  cartCount,
  onOpenCart,
  onOpenTrackOrder,
}) => {
  const { t } = useI18n();

  const isHomeActive = activePage === 'home';
  const isShopActive = activePage === 'shop' || activePage === 'product_detail';

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F2]/95 backdrop-blur-md border-t border-[#384A22]/15 shadow-[0_-4px_24px_rgba(56,74,34,0.08)] xl:hidden select-none"
      style={{
        paddingBottom: 'max(0.35rem, env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto h-[62px] px-1">
        {/* 1. Home Button */}
        <button
          type="button"
          id="mobile-bottom-nav-home"
          onClick={() => {
            onNavigate('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          aria-label={t('bottom_nav_home', 'Home')}
          className={`flex-1 min-w-[48px] min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer ${
            isHomeActive
              ? 'text-[#384A22] font-extrabold'
              : 'text-[#384A22]/65 hover:text-[#384A22]'
          }`}
        >
          <div className="relative">
            <Home className={`w-5 h-5 transition-transform ${isHomeActive ? 'stroke-[2.6px] scale-105' : 'stroke-[1.8px]'}`} />
          </div>
          <span className="text-[10px] tracking-tight leading-tight">
            {t('bottom_nav_home', 'Home')}
          </span>
          {isHomeActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B6D3B] mt-0.5" />
          )}
        </button>

        {/* 2. Shop Button */}
        <button
          type="button"
          id="mobile-bottom-nav-shop"
          onClick={() => {
            onNavigate('shop');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          aria-label={t('bottom_nav_shop', 'Shop')}
          className={`flex-1 min-w-[48px] min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer ${
            isShopActive
              ? 'text-[#384A22] font-extrabold'
              : 'text-[#384A22]/65 hover:text-[#384A22]'
          }`}
        >
          <div className="relative">
            <Store className={`w-5 h-5 transition-transform ${isShopActive ? 'stroke-[2.6px] scale-105' : 'stroke-[1.8px]'}`} />
          </div>
          <span className="text-[10px] tracking-tight leading-tight">
            {t('bottom_nav_shop', 'Shop')}
          </span>
          {isShopActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B6D3B] mt-0.5" />
          )}
        </button>

        {/* 4. Track Order Button */}
        <button
          type="button"
          id="mobile-bottom-nav-track"
          onClick={onOpenTrackOrder}
          aria-label={t('bottom_nav_track', 'Track Order')}
          className="flex-1 min-w-[48px] min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl text-[#384A22]/65 hover:text-[#384A22] active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <div className="relative">
            <Truck className="w-5 h-5 stroke-[1.8px]" />
          </div>
          <span className="text-[10px] tracking-tight leading-tight">
            {t('bottom_nav_track', 'Track')}
          </span>
        </button>

        {/* 5. Cart Button with Counter Badge */}
        <button
          type="button"
          id="mobile-bottom-nav-cart"
          onClick={onOpenCart}
          aria-label={`${t('bottom_nav_cart', 'Cart')} (${cartCount})`}
          className="flex-1 min-w-[48px] min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl text-[#384A22]/65 hover:text-[#384A22] active:scale-95 transition-all duration-200 cursor-pointer relative"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 stroke-[1.8px]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[17px] h-[17px] px-1 bg-[#8B6D3B] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-xs animate-in zoom-in-50">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight leading-tight">
            {t('bottom_nav_cart', 'Cart')}
          </span>
        </button>
      </div>
    </nav>
  );
};
