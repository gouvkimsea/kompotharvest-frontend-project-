import React from 'react';
import {
  ASSETS,
  CUSTOMER_REVIEWS,
  ECO_PILLARS,
  RECIPES,
  RecipeItem,
} from '../data/botenzData';
import { SmartImage } from './SmartImage';
import { KitchenIconsRow } from './ComparisonAndProductsSection';
import { ActivePage } from './Navbar';

interface RecipesReviewsEcoProps {
  onNavigate: (page: ActivePage) => void;
  onSelectRecipe: (recipe: RecipeItem) => void;
  onOpenFeedbackModal: () => void;
}

export const RecipesReviewsEcoSection: React.FC<RecipesReviewsEcoProps> = ({
  onNavigate,
  onSelectRecipe,
  onOpenFeedbackModal,
}) => {
  const homeRecipes = RECIPES.filter((r) => r.featuredOnHome);

  return (
    <section className="w-full bg-[#F2F0E3] overflow-hidden">
      {/* PART 1: HEALTHY WITH BOTENZ - RECIPES (matches clean-sec-6.png) */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-14 pt-12 pb-16">
        {/* Header with Left & Right Kitchen Icons */}
        <div className="flex items-center justify-between gap-4 mb-10">
          <div className="hidden lg:block">
            <KitchenIconsRow className="w-[345px]" />
          </div>

          <div className="text-center mx-auto">
            <h3 className="font-display text-[36px] sm:text-[46px] lg:text-[53px] leading-[1.08] tracking-tight">
              <span className="block font-normal text-[#384A22]">Healthy With</span>
              <span className="block font-normal text-[#768E5C]">Botenz - Recipes</span>
            </h3>
          </div>

          <div className="hidden lg:block">
            <KitchenIconsRow className="w-[345px]" />
          </div>
        </div>

        {/* 4 Recipe Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {homeRecipes.map((recipe) => (
            <div
              key={recipe.id}
              onClick={() => onSelectRecipe(recipe)}
              className="flex flex-col items-center group cursor-pointer"
            >
              {/* Rounded Food Photo Card with 3 Bottom-Edge Cream Blobs */}
              <div className="relative w-full h-[380px] sm:h-[405px] rounded-[24px] overflow-hidden shadow-md">
                <SmartImage
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* 3 Bottom Cream Nutrition Blobs */}
                <div className="absolute inset-x-4 bottom-2 flex items-end justify-between gap-2 z-10">
                  <div className="blob-badge bg-[#F2F0E3] text-[#314B1C] w-[78px] h-[58px] flex flex-col items-center justify-center text-center shadow">
                    <span className="text-[16px] font-medium leading-none tabular-nums">
                      {recipe.protein}
                    </span>
                    <span className="text-[12px] font-normal leading-none mt-1">protein</span>
                  </div>

                  <div className="blob-badge bg-[#F2F0E3] text-[#314B1C] w-[78px] h-[58px] flex flex-col items-center justify-center text-center shadow">
                    <span className="text-[16px] font-medium leading-none tabular-nums">
                      {recipe.time}
                    </span>
                    <span className="text-[12px] font-normal leading-none mt-1">
                      {recipe.timeUnit || 'minutes'}
                    </span>
                  </div>

                  <div className="blob-badge bg-[#F2F0E3] text-[#314B1C] w-[78px] h-[58px] flex flex-col items-center justify-center text-center shadow">
                    <span className="text-[16px] font-medium leading-none tabular-nums">
                      {recipe.kcal}
                    </span>
                    <span className="text-[12px] font-normal leading-none mt-1">
                      {recipe.kcalUnit || 'kcal'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recipe Title Below Card */}
              <p className="mt-4 text-[21px] sm:text-[23px] font-semibold text-[#384A22] group-hover:text-[#8B6D3B] transition-colors text-center">
                {recipe.title}
              </p>
            </div>
          ))}
        </div>

        {/* View more recipes > button */}
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => onNavigate('recipes')}
            className="inline-flex items-center justify-center gap-1.5 px-9 py-3.5 rounded-full bg-[#8B6D3B] hover:bg-[#765B2F] text-[#F2F0E3] text-[15px] font-medium shadow-md transition-colors cursor-pointer"
          >
            <span>View more recipes</span>
            <span>›</span>
          </button>
        </div>
      </div>

      {/* PART 2: CUSTOMER FEEDBACK SECTION ON DARK FOREST GREEN (matches clean-sec-7.png) */}
      <div
        className="relative w-full bg-[#384A22] pt-20 pb-20 px-4 sm:px-8 lg:px-14 bg-no-repeat bg-cover bg-center"
        style={{
          backgroundImage: `url("${ASSETS.productsWaveBg}")`,
        }}
      >
        <div className="max-w-[1360px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10">
            {/* Left Column: Customer feedback heading + 3 Star Reviews */}
            <div className="lg:col-span-5 text-[#F2F0E3]">
              <div className="flex items-end gap-5 mb-3">
                <h2 className="text-[44px] sm:text-[56px] lg:text-[62px] font-normal leading-[1.05] tracking-tight text-[#F0F0E3]">
                  Customer
                  <br />
                  feedback
                </h2>
                <SmartImage
                  src={ASSETS.feedbackChatIcon}
                  alt="Chat bubbles icon"
                  className="w-[95px] sm:w-[115px] h-auto object-contain mb-1"
                  fallbackBg="transparent"
                />
              </div>

              <h3 className="text-[22px] sm:text-[28px] font-extralight text-[#F0F0E3] mb-8">
                What do you think about Botenz?
              </h3>

              <div className="space-y-7 max-w-md">
                {CUSTOMER_REVIEWS.map((rev) => (
                  <div key={rev.id}>
                    <div className="flex items-center gap-3 mb-2">
                      <SmartImage
                        src={ASSETS.feedbackStarIcon}
                        alt="Star rating"
                        className="w-9 h-9 object-contain"
                        fallbackBg="transparent"
                      />
                      <span className="text-[36px] sm:text-[42px] font-light text-[#8FA85A] leading-none tabular-nums">
                        {rev.rating}
                      </span>
                    </div>
                    <p className="text-[13.5px] font-light text-[#F2F0E3]/90 leading-relaxed whitespace-pre-line">
                      {rev.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Organic Masked Photo Collage (Group-929.png.webp) */}
            <div className="lg:col-span-7 flex items-center justify-center">
              <div className="w-full max-w-[780px]">
                <SmartImage
                  src={ASSETS.feedbackCollage}
                  alt="Customer feedback section with photos of a cook, a fitness enthusiast, and a nutrition coach sharing positive Botenz reviews"
                  className="w-full h-auto object-contain"
                  fallbackBg="transparent"
                />
              </div>
            </div>
          </div>

          {/* Bottom Centered: Tell your story + Share your feedback pill button */}
          <div className="mt-10 flex flex-col items-center justify-center text-center">
            <h4 className="text-[20px] sm:text-[22px] font-extralight text-[#F2F0E3] mb-3">
              Tell your story
            </h4>
            <div className="flex items-center justify-center gap-3">
              <SmartImage
                src={ASSETS.feedbackSparkleLeft}
                alt="Decorative stars left"
                className="w-16 sm:w-20 h-auto object-contain"
                fallbackBg="transparent"
              />
              <button
                type="button"
                onClick={onOpenFeedbackModal}
                className="px-10 py-4 rounded-full bg-[#F2F0E3] hover:bg-white text-[#384A22] text-[22px] sm:text-[26px] font-normal shadow-lg transition-transform hover:scale-105 cursor-pointer"
              >
                Share your feedback
              </button>
              <SmartImage
                src={ASSETS.feedbackSparkleRight}
                alt="Decorative stars right"
                className="w-16 sm:w-20 h-auto object-contain"
                fallbackBg="transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* PART 3: 4 ECO-PILLARS SECTION ON CREAM BACKGROUND (matches clean-sec-8.png) */}
      <div className="max-w-[1380px] mx-auto px-6 lg:px-14 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-center">
          {ECO_PILLARS.map((pillar) => (
            <div key={pillar.id} className="flex flex-col items-center">
              <div className="w-[140px] h-[145px] flex items-center justify-center mb-6">
                <SmartImage
                  src={pillar.icon}
                  alt={pillar.alt}
                  className="w-full h-full object-contain"
                  fallbackBg="transparent"
                />
              </div>
              <h4 className="text-[26px] sm:text-[30px] font-normal text-[#384A22] leading-[1.12] whitespace-pre-line mb-4">
                {pillar.title}
              </h4>
              <p className="text-[14.5px] font-light text-[#384A22]/90 leading-relaxed max-w-[270px]">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
