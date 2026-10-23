import { ASSETS, PRODUCTS, Product } from '../data/botenzData';
import { SmartImage } from './SmartImage';
import { ActivePage, BotenzLogo } from './Navbar';

interface FooterSectionProps {
  onNavigate: (page: ActivePage, categoryFilter?: string) => void;
  onOpenFeedbackModal: () => void;
  onSelectProduct?: (product: Product) => void;
  onAddProductToCart?: (product: Product) => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  onNavigate,
  onOpenFeedbackModal,
  onSelectProduct,
  onAddProductToCart,
}) => {
  return (
    <footer className="w-full bg-[#F2F0E3] overflow-hidden">
      {/* PART 1: ARTISAN CASHEW COLLECTION SHOWCASE (Clean, spacious, uncrowded) */}
      <section className="w-full bg-[#F2F0E3] py-14 sm:py-20 px-4 sm:px-8 lg:px-14 border-t border-[#384A22]/10">
        <div className="max-w-[1380px] mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#8B6D3B] bg-[#E8E4D5] px-3.5 py-1 rounded-full inline-block">
              Kampot Harvest Co.
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#384A22] mt-3">
              Artisan Roasted Cashews
            </h2>
            <p className="text-sm sm:text-base text-[#384A22]/75 mt-3 leading-relaxed">
              Crafted in small batches with single-origin Cambodian cashews. Choose your favorite flavor in on-the-go resealable pouches or reusable glass jars.
            </p>
          </div>

          {/* 4 Spacious, Uncrowded Product Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {PRODUCTS.map((prod) => {
              const isHoneyButter = prod.flavor === 'Honey Butter';
              const isJar = prod.packageSize.includes('Jar');

              return (
                <div
                  key={prod.id}
                  onClick={() => {
                    if (onSelectProduct) {
                      onSelectProduct(prod);
                    } else {
                      onNavigate('shop', 'powders');
                    }
                  }}
                  className="group relative bg-[#FAF8F2] hover:bg-white rounded-[26px] p-6 border border-[#384A22]/12 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span
                      className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full text-white"
                      style={{
                        backgroundColor: isHoneyButter ? '#8B6D3B' : '#B83A2A',
                      }}
                    >
                      {prod.flavor}
                    </span>
                    <span className="text-xs font-semibold text-[#384A22]/80 bg-[#ECE8DB] px-3 py-1 rounded-full">
                      {prod.packageSize}
                    </span>
                  </div>

                  {/* Product Image with plenty of breathing room */}
                  <div className="w-full aspect-square flex items-center justify-center p-5 bg-[#F2EFE6] group-hover:bg-[#EBE7D8] rounded-2xl transition-colors duration-300 overflow-hidden mb-5">
                    <SmartImage
                      src={prod.image}
                      alt={`${prod.name} - ${prod.flavor}`}
                      className="max-h-[88%] max-w-[88%] object-contain drop-shadow-md group-hover:scale-108 transition-transform duration-300"
                      fallbackBg="transparent"
                    />
                  </div>

                  {/* Info & Price */}
                  <div className="text-center flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#384A22] group-hover:text-[#8B6D3B] transition-colors leading-snug">
                        {prod.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#384A22]/70 mt-1">
                        {prod.flavor} · {isJar ? 'Airtight Glass Jar' : 'Resealable Fresh Pouch'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#384A22]/10 flex items-center justify-center gap-2">
                      <span className="text-2xl font-bold text-[#384A22]">
                        ${prod.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-[#384A22]/60 uppercase tracking-wide">
                        USD
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onAddProductToCart) {
                          onAddProductToCart(prod);
                        } else if (onSelectProduct) {
                          onSelectProduct(prod);
                        } else {
                          onNavigate('shop', 'powders');
                        }
                      }}
                      className="w-full py-3 rounded-full bg-[#384A22] text-[#F2F0E3] font-medium text-sm group-hover:bg-[#8B6D3B] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>Add to Bag</span>
                      <span className="text-sm">·</span>
                      <span>${prod.price.toFixed(2)}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Clean, minimalist brand note below the cards */}
          <div className="mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-4 text-xs sm:text-sm text-[#384A22]/75">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#8B6D3B]" />
              100% Wildflower Honey & Pure Cultured Butter
            </span>
            <span className="hidden sm:inline text-[#384A22]/40">•</span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#B83A2A]" />
              Authentic Sun-Ripened Chili & Fresh Lime
            </span>
            <span className="hidden sm:inline text-[#384A22]/40">•</span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#384A22]" />
              Single-Origin Kampot Harvest
            </span>
          </div>
        </div>
      </section>

      {/* PART 2: DARK GREEN WAVE FOOTER WITH COLOR-MATCHED KBACH PATTERN */}
      <div
        className="relative w-full bg-[#384A22] text-[#F2F0E3] pt-20 pb-14 px-6 lg:px-14 -mt-6 z-10"
        style={{
          backgroundImage: `url("/assets/aistudio/kbach-pattern-green.svg"), url("${ASSETS.productsWaveBg}")`,
          backgroundRepeat: 'repeat, no-repeat',
          backgroundSize: '260px 260px, cover',
          backgroundPosition: 'center center, center top',
        }}
      >
        <div className="max-w-[1380px] mx-auto">
          {/* Top Row: Left White Logo + Tagline | Right White Pill CTA Banner */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-12 border-b border-[#F2F0E3]/40">
            <div>
              <BotenzLogo variant="white" className="h-[96px] w-auto object-contain mb-3" />
              <p className="text-[14px] text-[#8FA85A] font-normal max-w-[260px] leading-snug">
                The Pride of Kampot, Roasted to Perfection.
              </p>
            </div>

            {/* White Rounded CTA Box */}
            <div className="w-full lg:max-w-[660px] bg-white rounded-[22px] px-6 sm:px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
              <p className="text-[18px] sm:text-[20px] font-semibold text-[#6E8450] leading-snug max-w-[360px]">
                The Pride of Kampot, Roasted to Perfection. Taste the difference from the first bite.
              </p>
              <button
                type="button"
                onClick={() => {
                  onNavigate('shop', 'powders');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-9 py-3 rounded-full bg-[#6E8450] hover:bg-[#384A22] text-white text-[18px] font-normal transition-colors shrink-0 cursor-pointer"
              >
                Order Now
              </button>
            </div>
          </div>

          {/* Bottom Row: Left 4-Row Horizontal Link Directory | Right Social Icons */}
          <div className="pt-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-3 text-[15px] text-[#F2F0E3]">
              {/* Row 1: Info */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="text-[#9AB87A] font-normal w-14">Info:</span>
                <button
                  type="button"
                  onClick={onOpenFeedbackModal}
                  className="hover:text-[#9AB87A] transition-colors cursor-pointer"
                >
                  Contact
                </button>
                <button
                  type="button"
                  onClick={onOpenFeedbackModal}
                  className="hover:text-[#9AB87A] transition-colors cursor-pointer"
                >
                  Wholesale
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('rewards')}
                  className="hover:text-[#9AB87A] transition-colors cursor-pointer"
                >
                  Affiliate
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('autoship')}
                  className="hover:text-[#9AB87A] transition-colors cursor-pointer"
                >
                  Account
                </button>
              </div>

              {/* Row 2: About */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="text-[#9AB87A] font-normal w-14">About:</span>
                <button
                  type="button"
                  onClick={() => onNavigate('way')}
                  className="hover:text-[#9AB87A] transition-colors cursor-pointer"
                >
                  Our Way
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('way')}
                  className="hover:text-[#9AB87A] transition-colors cursor-pointer"
                >
                  Blogs
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('way')}
                  className="hover:text-[#9AB87A] transition-colors cursor-pointer"
                >
                  Faq
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('recipes')}
                  className="hover:text-[#9AB87A] transition-colors cursor-pointer"
                >
                  Recipes
                </button>
              </div>

              {/* Row 3: Shop */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="text-[#9AB87A] font-normal w-14">Shop:</span>
                <button
                  type="button"
                  onClick={() => onNavigate('shop', 'powders')}
                  className="hover:text-[#9AB87A] transition-colors cursor-pointer"
                >
                  Products
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('shop', 'powders')}
                  className="hover:text-[#9AB87A] transition-colors cursor-pointer"
                >
                  Jars
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('shop', 'bundles')}
                  className="hover:text-[#9AB87A] transition-colors cursor-pointer"
                >
                  Kits
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('shop', 'accessories')}
                  className="hover:text-[#9AB87A] transition-colors cursor-pointer"
                >
                  Gifts
                </button>
              </div>

              {/* Row 4: More */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="text-[#9AB87A] font-normal w-14">More:</span>
                <button
                  type="button"
                  onClick={() => onNavigate('way')}
                  className="hover:text-[#9AB87A] transition-colors cursor-pointer"
                >
                  Privacy
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('way')}
                  className="hover:text-[#9AB87A] transition-colors cursor-pointer"
                >
                  Terms
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('way')}
                  className="hover:text-[#9AB87A] transition-colors cursor-pointer"
                >
                  Labs
                </button>
              </div>
            </div>

            {/* Social Media Icons */}
            <div className="flex items-center gap-9 pb-2">
              <button
                type="button"
                onClick={onOpenFeedbackModal}
                aria-label="Instagram"
                className="text-white hover:text-[#9AB87A] transition-colors cursor-pointer"
              >
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={onOpenFeedbackModal}
                aria-label="Facebook"
                className="text-white hover:text-[#9AB87A] transition-colors cursor-pointer"
              >
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692h1.971v3z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={onOpenFeedbackModal}
                aria-label="Linkedin"
                className="text-white hover:text-[#9AB87A] transition-colors cursor-pointer"
              >
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
