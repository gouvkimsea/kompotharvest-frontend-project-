import React, { useState } from 'react';
import { Play, X } from 'lucide-react';
import { ASSETS, INFLUENCERS, InfluencerItem } from '../data/botenzData';
import { SmartImage } from './SmartImage';
import { ActivePage } from './Navbar';
import { useI18n } from '../utils/i18nContext';

interface InfluencerAndHowToEnjoyProps {
  onNavigate: (page: ActivePage, categoryFilter?: string) => void;
}

export const InfluencerAndHowToEnjoySection: React.FC<InfluencerAndHowToEnjoyProps> = ({
  onNavigate,
}) => {
  const { t } = useI18n();
  const [activeInfluencer, setActiveInfluencer] = useState<InfluencerItem | null>(null);
  const [activeDot, setActiveDot] = useState(0);

  return (
    <section className="w-full bg-[#F2F0E3] pt-8 pb-6 overflow-hidden">
      {/* PART 1: WHAT INFLUENCER SAYS ABOUT US (matches clean-sec-4.png) */}
      <div className="max-w-[1440px] mx-auto relative">
        {/* Top Row: Left Pistachio Cluster + Center Heading + Right Pistachio Cluster */}
        <div className="relative flex items-center justify-between min-h-[300px] px-4">
          <div className="hidden md:block w-[320px] lg:w-[420px] shrink-0 -ml-4 select-none pointer-events-none">
            <SmartImage
              src={ASSETS.influencerPistachioSide}
              alt="Cascading roasted Kampot cashews"
              className="w-full h-auto object-contain drop-shadow-[0_14px_24px_rgba(30,42,16,0.14)]"
              fallbackBg="transparent"
            />
          </div>

          <div className="flex-1 text-center z-10 px-4 max-w-xl mx-auto">
            <h3 className="font-display text-[38px] sm:text-[48px] lg:text-[56px] leading-[1.05] tracking-tight">
              <span className="block font-normal text-[#384A22]">{t('influencer_title_1', 'What Influencer')}</span>
              <span className="block font-normal text-[#768E5C]">{t('influencer_title_2', 'Says About Us')}</span>
            </h3>
            <p className="mt-3 text-[17px] sm:text-[20px] font-light text-[#384A22]">
              {t('influencer_subtitle', 'Take a moment for those who trust us')}
            </p>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => onNavigate('shop', 'powders')}
                className="inline-flex items-center justify-center gap-1.5 px-7 py-2.5 rounded-full border border-[#384A22] text-[#384A22] hover:bg-[#384A22] hover:text-[#F2F0E3] text-[14px] font-medium transition-colors cursor-pointer"
              >
                <span>{t('btn_shop_now', 'Shop Now')}</span>
                <span>›</span>
              </button>
            </div>
          </div>

          <div className="hidden md:block w-[320px] lg:w-[420px] shrink-0 -mr-4 select-none pointer-events-none">
            <SmartImage
              src={ASSETS.influencerPistachioSide}
              alt="Cascading roasted Kampot cashews right"
              className="w-full h-auto object-contain scale-x-[-1] drop-shadow-[0_14px_24px_rgba(30,42,16,0.14)]"
              fallbackBg="transparent"
            />
          </div>
        </div>

        {/* 5 Vertical Rounded Influencer Video Cards */}
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {INFLUENCERS.map((inf, idx) => {
              const isDarkCard = idx === 0 || activeDot === idx;
              return (
                <div
                  key={inf.id}
                  onClick={() => {
                    setActiveDot(idx);
                    setActiveInfluencer(inf);
                  }}
                  className={`rounded-[24px] overflow-hidden flex flex-col justify-between transition-transform hover:-translate-y-1 cursor-pointer shadow-md ${
                    isDarkCard ? 'bg-[#384A22]' : 'bg-[#6F8457]'
                  }`}
                >
                  {/* Top Info Header */}
                  <div className="p-5 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="inline-flex items-center gap-1.5">
                        <svg
                          className={`w-4 h-4 fill-current ${
                            isDarkCard ? 'text-[#8FA85A]' : 'text-[#F2F0E3]'
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span
                          className={`text-[18px] font-medium tabular-nums ${
                            isDarkCard ? 'text-[#8FA85A]' : 'text-[#384A22]'
                          }`}
                        >
                          {inf.rating}
                        </span>
                      </div>

                      <span
                        className={`w-10 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          isDarkCard
                            ? 'bg-[#8B6D3B] text-[#F2F0E3]'
                            : 'bg-[#314B1C] text-[#F2F0E3]'
                        }`}
                      >
                        →
                      </span>
                    </div>

                    <h4 className="text-[28px] font-normal text-[#F2F0E3] leading-tight">
                      {inf.name}
                    </h4>
                    <p
                      className={`text-[14px] mt-0.5 ${
                        isDarkCard ? 'text-[#8FA85A]' : 'text-[#314B1C]'
                      }`}
                    >
                      {inf.role}
                    </p>
                  </div>

                  {/* Dark Video Embed Preview Box */}
                  <div className="bg-gradient-to-b from-[#0E0717] via-[#1C0B2B] to-[#0A0510] rounded-t-[20px] p-4 pt-5 h-[295px] flex flex-col justify-between relative group">
                    {/* Top YouTube / Shorts Badge */}
                    <div className="flex items-center gap-1.5">
                      {inf.platform === 'YouTube' ? (
                        <div className="inline-flex items-center gap-1">
                          <span className="bg-[#FF0000] text-white rounded px-1.5 py-1 flex items-center justify-center">
                            <Play className="w-2.5 h-2.5 fill-current" />
                          </span>
                          <span className="text-white font-bold text-[15px] tracking-tight">
                            YouTube
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5">
                          <span className="bg-[#FF0000] text-white rounded-full w-4 h-4 flex items-center justify-center">
                            <Play className="w-2.5 h-2.5 fill-current" />
                          </span>
                          <span className="text-white/90 text-xs font-semibold">Shorts</span>
                        </div>
                      )}
                    </div>

                    {/* Center Play Overlay on Hover */}
                    <div className="my-auto flex flex-col items-center justify-center text-center px-2">
                      <div className="w-12 h-12 rounded-full bg-white/15 group-hover:bg-[#8B6D3B] text-white flex items-center justify-center transition-colors mb-2 backdrop-blur-xs">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                      <p className="text-white/85 text-xs font-medium line-clamp-2">
                        “{inf.quote}”
                      </p>
                    </div>

                    {/* Bottom Video Caption & Watch Pill */}
                    <div>
                      <p className="text-white/90 text-[12px] font-semibold truncate">
                        {inf.videoTitle}
                      </p>
                      <p className="text-white/55 text-[11px] truncate mb-3">{inf.handle}</p>
                      <div className="w-full py-2.5 rounded-full bg-white text-[#1A1A1A] text-center text-[12px] font-semibold hover:bg-[#F2F0E3] transition-colors">
                        {t('btn_watch_review', 'Watch Review')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Carousel Dots */}
          <div className="flex items-center justify-center gap-2.5 mt-5">
            {INFLUENCERS.map((inf, idx) => (
              <button
                key={inf.id}
                type="button"
                onClick={() => setActiveDot(idx)}
                aria-label={`Select influencer ${inf.name}`}
                className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                  activeDot === idx ? 'bg-[#1A1A1A]' : 'bg-[#384A22]/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* PART 2: HOW TO ENJOY BOTENZ (matches clean-sec-5.png) */}
      <div
        className="relative w-full mt-8 pt-20 pb-24 px-4 sm:px-8 lg:px-16 bg-no-repeat bg-cover bg-center"
        style={{
          backgroundImage: `url("${ASSETS.productsWaveBg}")`,
          backgroundColor: '#384A22',
        }}
      >
        <div className="max-w-[1280px] mx-auto">
          {/* Header Row: How to Enjoy Botenz + See recips > */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h3 className="font-display text-[38px] sm:text-[48px] lg:text-[52px] font-normal text-[#F2F0E3] tracking-tight">
              {t('enjoy_title', 'How to Enjoy Botenz')}
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('shop')}
              className="self-start sm:self-auto inline-flex items-center justify-center gap-1.5 px-7 py-2.5 rounded-full border border-[#F2F0E3]/70 text-[#F2F0E3] hover:bg-[#F2F0E3] hover:text-[#384A22] text-[14px] font-medium transition-colors cursor-pointer"
            >
              <span>{t('btn_see_recipes', 'See recipes')}</span>
              <span>›</span>
            </button>
          </div>

          {/* Content Split: Left Spoons Mixing Diagram + Right 2x2 Usage Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10">
            {/* Left Mixing Graphic */}
            <div className="lg:col-span-6 flex flex-col items-center">
              <p className="text-[18px] sm:text-[20px] font-light text-[#F2F0E3] text-center leading-tight mb-4 whitespace-pre-line">
                {t('enjoy_combine_stir', 'Combine and stir\nuntil smooth')}
              </p>

              <div className="relative flex items-center justify-center gap-1 sm:gap-4 w-full max-w-[600px]">
                {/* Left Blob: 2 spoons botenz powder */}
                <div className="w-[120px] min-[360px]:w-[140px] sm:w-[290px] shrink-0">
                  <SmartImage
                    src={ASSETS.howToEnjoyTwoSpoons}
                    alt="2 spoons how to mix botenz"
                    className="w-full h-auto object-contain"
                    fallbackLabel="botenz powder (2 spoons)"
                  />
                </div>

                {/* Center Brown Plus Circle */}
                <div className="z-10 -mx-3 min-[360px]:-mx-5 sm:-mx-8 w-10 h-10 min-[360px]:w-14 min-[360px]:h-14 sm:w-24 sm:h-24 rounded-full bg-[#8B6D3B] text-[#F2F0E3] flex items-center justify-center text-xl min-[360px]:text-3xl sm:text-5xl font-light shadow-lg shrink-0">
                  +
                </div>

                {/* Right Blob: 1.5 spoons water or milk */}
                <div className="w-[120px] min-[360px]:w-[140px] sm:w-[290px] shrink-0">
                  <SmartImage
                    src={ASSETS.howToEnjoyWaterMilk}
                    alt="half a spoon half other spoon low calories"
                    className="w-full h-auto object-contain"
                    fallbackLabel="water or milk (1.5 spoons)"
                  />
                </div>
              </div>
            </div>

            {/* Right 2x2 Usage Icons Grid */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10 lg:pl-8">
              {/* 1. Spread it */}
              <div className="flex items-center gap-4">
                <div className="w-[82px] h-[82px] shrink-0 flex items-center justify-center">
                  <SmartImage
                    src={ASSETS.iconSpreadIt}
                    alt="spread it icon"
                    className="w-full h-full object-contain"
                    fallbackBg="#F2F0E3"
                  />
                </div>
                <div>
                  <h4 className="text-[24px] sm:text-[26px] font-medium text-[#F2F0E3] leading-tight">
                    {t('enjoy_spread', 'Spread it')}
                  </h4>
                  <p className="text-[15px] font-light text-[#8FA85A] mt-0.5">
                    {t('enjoy_spread_desc', 'On toast, cracker & fruit')}
                  </p>
                </div>
              </div>

              {/* 2. Blend it */}
              <div className="flex items-center gap-4">
                <div className="w-[82px] h-[82px] shrink-0 flex items-center justify-center">
                  <SmartImage
                    src={ASSETS.iconBlendIt}
                    alt="mix it"
                    className="w-full h-full object-contain"
                    fallbackBg="#F2F0E3"
                  />
                </div>
                <div>
                  <h4 className="text-[24px] sm:text-[26px] font-medium text-[#F2F0E3] leading-tight">
                    {t('enjoy_blend', 'Blend it')}
                  </h4>
                  <p className="text-[15px] font-light text-[#8FA85A] mt-0.5">
                    {t('enjoy_blend_desc', 'In smoothies & shakes')}
                  </p>
                </div>
              </div>

              {/* 3. Spoon it */}
              <div className="flex items-center gap-4">
                <div className="w-[82px] h-[82px] shrink-0 flex items-center justify-center">
                  <SmartImage
                    src={ASSETS.iconSpoonIt}
                    alt="spoon it icon"
                    className="w-full h-full object-contain"
                    fallbackBg="#F2F0E3"
                  />
                </div>
                <div>
                  <h4 className="text-[24px] sm:text-[26px] font-medium text-[#F2F0E3] leading-tight">
                    {t('enjoy_spoon', 'Spoon it')}
                  </h4>
                  <p className="text-[15px] font-light text-[#8FA85A] mt-0.5">
                    {t('enjoy_spoon_desc', 'Straight from the jar')}
                  </p>
                </div>
              </div>

              {/* 4. Cook/Bake */}
              <div className="flex items-center gap-4">
                <div className="w-[82px] h-[82px] shrink-0 flex items-center justify-center">
                  <SmartImage
                    src={ASSETS.iconCookBake}
                    alt="bake it icon"
                    className="w-full h-full object-contain"
                    fallbackBg="#F2F0E3"
                  />
                </div>
                <div>
                  <h4 className="text-[24px] sm:text-[26px] font-medium text-[#F2F0E3] leading-tight">
                    {t('enjoy_bake', 'Cook/Bake')}
                  </h4>
                  <p className="text-[15px] font-light text-[#8FA85A] mt-0.5">
                    {t('enjoy_bake_desc', 'In recipes and desserts')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Influencer Video Review Modal */}
      {activeInfluencer && (
        <div
          className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-4"
          onClick={() => setActiveInfluencer(null)}
        >
          <div
            className="bg-[#F2F0E3] text-[#384A22] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#384A22]/15"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#384A22]/15">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-[#8B6D3B]">
                  {activeInfluencer.platform} {t('creator_story', 'Creator Story')}
                </span>
                <h4 className="text-2xl font-extrabold text-[#384A22]">
                  {activeInfluencer.name} — {activeInfluencer.role}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveInfluencer(null)}
                aria-label="Close creator review"
                className="p-2 rounded-full hover:bg-[#384A22]/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-5 bg-[#314B1C] text-[#F2F0E3] rounded-2xl p-6 text-center">
              <div className="inline-flex items-center gap-1 text-[#EAB308] text-lg mb-2">
                ★★★★★ <span className="text-[#F2F0E3] font-bold ml-1">{activeInfluencer.rating}</span>
              </div>
              <h5 className="text-lg font-bold mb-2">{activeInfluencer.videoTitle}</h5>
              <p className="text-sm text-[#F2F0E3]/90 italic leading-relaxed">
                “{activeInfluencer.quote}”
              </p>
              <p className="text-xs text-[#9AB87A] mt-3">{activeInfluencer.handle}</p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveInfluencer(null);
                  onNavigate('shop', 'powders');
                }}
                className="px-6 py-2.5 rounded-full bg-[#8B6D3B] hover:bg-[#765B2F] text-[#F2F0E3] text-sm font-semibold cursor-pointer"
              >
                {t('shop_favorites', 'Shop Favorites')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
