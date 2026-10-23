import React, { useState } from 'react';
import { Navbar, ActivePage } from './components/Navbar';
import { HeroAndBundleSection } from './components/HeroAndBundleSection';
import { ComparisonAndProductsSection } from './components/ComparisonAndProductsSection';
import { InfluencerAndHowToEnjoySection } from './components/InfluencerAndHowToEnjoySection';
import { RecipesReviewsEcoSection } from './components/RecipesReviewsEcoSection';
import { FooterSection } from './components/FooterSection';
import {
  BotenzWayAndAutoshipView,
  CartDrawer,
  FeedbackModal,
  FirstOrderOfferModal,
  ProductDetailModal,
  RecipeDetailModal,
  RecipesPageView,
  ShopPageView,
} from './components/SubpagesAndModals';
import { BundleItem, Product, RecipeItem } from './data/botenzData';
import { CartItem, calculateCartSummary } from './utils/storeLogic';
import { useI18n } from './utils/i18nContext';

export default function App() {
  const { t } = useI18n();
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [shopCategory, setShopCategory] = useState<string>('powders');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [promoCodeActive, setPromoCodeActive] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<BundleItem | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeItem | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);
  const [isFirstOrderModalOpen, setIsFirstOrderModalOpen] = useState<boolean>(false);

  // Favorite recipes state
  const [favoriteRecipes, setFavoriteRecipes] = useState<string[]>([
    'pistachio-kunafa-toast',
  ]);

  // Subtle toast banner state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const handleNavigate = (page: ActivePage, categoryFilter?: string) => {
    setActivePage(page);
    if (categoryFilter) {
      setShopCategory(categoryFilter);
    }
  };

  const handleAddProductToCart = (
    product: Product,
    isAutoship: boolean = false,
    variantLabel?: string,
    customPrice?: number
  ) => {
    const resolvedSize = variantLabel || product.packageSize;
    const itemId = `${product.id}-${resolvedSize}-${isAutoship ? 'sub' : 'once'}`;
    const unitPrice = customPrice ?? product.price;

    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === itemId);
      if (existing) {
        return prev.map((i) =>
          i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          name: `${product.name} (${product.flavor})`,
          variantLabel: resolvedSize,
          price: unitPrice,
          originalPrice: unitPrice,
          quantity: 1,
          image: product.image,
          isAutoship,
        },
      ];
    });

    showToast(`Added ${product.name} — ${product.flavor} (${resolvedSize}) to your bag`);
  };

  const handleAddBundleToCart = (bundle: BundleItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === bundle.id);
      if (existing) {
        return prev.map((i) =>
          i.id === bundle.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: bundle.id,
          name: bundle.name,
          variantLabel: '25% OFF Bundle + Free Spoon & Recipe Book',
          price: bundle.price,
          originalPrice: bundle.originalPrice,
          quantity: 1,
          image: bundle.image,
        },
      ];
    });

    showToast(`Added ${bundle.name} (25% OFF) to your bag`);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleToggleFavorite = (recipeId: string) => {
    setFavoriteRecipes((prev) =>
      prev.includes(recipeId)
        ? prev.filter((id) => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  const summary = calculateCartSummary(cartItems, promoCodeActive);

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#F2F0E3] text-[#384A22] relative">
      {/* Skip to content link matching botenz.in */}
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#384A22] focus:text-[#F2F0E3] focus:rounded-lg"
      >
        Skip to content
      </a>

      {/* Sticky Header with Mega Menus */}
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        cartCount={summary.itemCount}
        cartTotal={summary.total}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenDiscountModal={() => setIsFirstOrderModalOpen(true)}
      />

      {/* Main Content Area */}
      <main id="content" className="flex-1">
        {activePage === 'home' && (
          <>
            <HeroAndBundleSection
              onNavigate={handleNavigate}
              onAddBundleToCart={handleAddBundleToCart}
              onSelectBundleDetail={(bundle) => {
                setSelectedProduct(null);
                setSelectedBundle(bundle);
              }}
              onClaimOffer={() => setIsFirstOrderModalOpen(true)}
            />

            <ComparisonAndProductsSection
              onNavigate={handleNavigate}
              onAddProductToCart={(product) => handleAddProductToCart(product)}
              onSelectProduct={(product) => {
                setSelectedBundle(null);
                setSelectedProduct(product);
              }}
            />

            <InfluencerAndHowToEnjoySection onNavigate={handleNavigate} />

            <RecipesReviewsEcoSection
              onNavigate={handleNavigate}
              onSelectRecipe={(recipe) => setSelectedRecipe(recipe)}
              onOpenFeedbackModal={() => setIsFeedbackModalOpen(true)}
            />
          </>
        )}

        {activePage === 'shop' && (
          <ShopPageView
            initialCategory={shopCategory}
            onAddProductToCart={(product) => handleAddProductToCart(product)}
            onAddBundleToCart={handleAddBundleToCart}
            onSelectProduct={(product) => {
              setSelectedBundle(null);
              setSelectedProduct(product);
            }}
            onSelectBundle={(bundle) => {
              setSelectedProduct(null);
              setSelectedBundle(bundle);
            }}
          />
        )}

        {activePage === 'recipes' && (
          <RecipesPageView
            favoriteIds={favoriteRecipes}
            onToggleFavorite={handleToggleFavorite}
            onSelectRecipe={(recipe) => setSelectedRecipe(recipe)}
            onOpenShareRecipeModal={() => setIsFeedbackModalOpen(true)}
          />
        )}

        {(activePage === 'way' ||
          activePage === 'autoship' ||
          activePage === 'rewards') && (
          <BotenzWayAndAutoshipView
            mode={activePage}
            onAddProductToCart={(product, isAutoship) =>
              handleAddProductToCart(product, isAutoship)
            }
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Artisan Product Showcase + Dark Green Wave Footer */}
      <FooterSection
        onNavigate={handleNavigate}
        onOpenFeedbackModal={() => setIsFeedbackModalOpen(true)}
        onSelectProduct={(product) => {
          setSelectedBundle(null);
          setSelectedProduct(product);
        }}
        onAddProductToCart={(product) => handleAddProductToCart(product)}
      />

      {/* Floating WhatsApp Support Button (Bottom Right, matching botenz.in) */}
      <button
        type="button"
        onClick={() => setIsFeedbackModalOpen(true)}
        aria-label="Chat with Botenz on WhatsApp"
        className="fixed bottom-5 right-5 z-30 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1EBE5B] text-white shadow-xl flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
      >
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.625.846 5.059 2.284 7.033l-1.492 5.451 5.605-1.469c1.908 1.132 4.132 1.785 6.512 1.785 6.627 0 12-5.373 12-12s-5.373-12-12.909-12.8z" />
        </svg>
      </button>

      {/* Non-intrusive Cart Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#384A22] text-[#F2F0E3] px-6 py-3 rounded-full shadow-2xl border border-[#F2F0E3]/20 flex items-center gap-3 text-sm font-medium">
          <span>✓ {toastMessage}</span>
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="underline text-[#9AB87A] font-bold cursor-pointer"
          >
            {t('cart_view_bag')}
          </button>
        </div>
      )}

      {/* Slide-Over Cart & Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        promoCodeActive={promoCodeActive}
        onTogglePromoCode={setPromoCodeActive}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCartItems([])}
      />

      {/* Product / Bundle Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        bundle={selectedBundle}
        onClose={() => {
          setSelectedProduct(null);
          setSelectedBundle(null);
        }}
        onAddProductToCart={handleAddProductToCart}
        onAddBundleToCart={handleAddBundleToCart}
      />

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        onShopIngredient={() => handleNavigate('shop', 'powders')}
      />

      {/* 15% OFF First Order Offer Modal (matches ref-sec2.png) */}
      <FirstOrderOfferModal
        isOpen={isFirstOrderModalOpen}
        onClose={() => setIsFirstOrderModalOpen(false)}
        onUnlockDiscount={(goal) => {
          setPromoCodeActive(true);
          setIsFirstOrderModalOpen(false);
          showToast(`15% OFF Unlocked for ${goal}! Applied automatically at checkout.`);
        }}
      />

      {/* Share Feedback / Story / Contact Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </div>
  );
}
