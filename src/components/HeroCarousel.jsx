import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    badge: 'HYBRID SEEDS & CROPS',
    headline: 'Everything Your Farm Needs. From Seed to Harvest.',
    subhead: 'Certified high-germination hybrid seeds for maximum crop yield.',
    categoryId: '1',
    ctaText: 'Shop Seeds & Crops',
    imageSrc: '/hero/hero-wheat.jpg',
    imageAlt: 'Golden wheat harvest field with Indian farmers',
  },
  {
    id: 2,
    badge: 'SOIL NUTRITION & VITALITY',
    headline: 'Boost Soil Vitality & Maximize Crop Harvests.',
    subhead: 'Bio-organic fertilizers and nutrients formulated for resilient roots.',
    categoryId: '2',
    ctaText: 'Shop Fertilizers & Soil',
    imageSrc: '/hero/hero-soil.jpg',
    imageAlt: 'Fertile vegetable farm with Indian farmer and rich soil',
  },
  {
    id: 3,
    badge: 'PLANT DEFENSE & PROTECTION',
    headline: 'Defend Your Crops Against Pests & Blight.',
    subhead: 'Eco-friendly bio-pesticides and targeted plant protection solutions.',
    categoryId: '3',
    ctaText: 'Shop Crop Protection',
    imageSrc: '/hero/hero-crop-defense.jpg',
    imageAlt: 'Dew-covered healthy crops and farmland',
  },
  {
    id: 4,
    badge: 'PRECISION FARM MACHINERY',
    headline: 'Save Water & Labor with Smart Farm Equipment.',
    subhead: 'Heavy-duty sprayers, drip irrigation kits, and durable field tools.',
    categoryId: '4',
    ctaText: 'Shop Farm Equipment',
    imageSrc: '/hero/hero-equipment.jpg',
    imageAlt: 'Modern red tractor sprayer in field',
  },
];

export const HeroCarousel = ({ onSelectCategory }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Auto-slide every 6 seconds unless user hovers
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % SLIDES.length);
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev + 1) % SLIDES.length);
  };

  const currentSlide = SLIDES[currentIdx];

  const handleCardClick = () => {
    if (onSelectCategory && currentSlide.categoryId) {
      onSelectCategory(currentSlide.categoryId);
    }
  };

  return (
    <div className="w-full">
      {/* Full-Container Responsive Card Hero Banner */}
      <div
        onClick={handleCardClick}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="group relative w-full min-h-[340px] sm:min-h-[400px] md:h-[460px] rounded-3xl overflow-hidden cursor-pointer shadow-lg shadow-slate-900/10 border border-stone-200/80 transition-all select-none flex flex-col justify-between"
        title="Click to view related products"
      >
        {/* Full Container Background Image */}
        <img
          src={currentSlide.imageSrc}
          alt={currentSlide.imageAlt}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Sophisticated Dark Gradient Overlay (high contrast for text) */}
        <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-950/20" />

        {/* Subtle Radial Glow */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

        {/* Content Container (clean, minimal, focused on headline & image) */}
        <div className="relative z-10 h-full p-5 sm:p-10 md:p-14 flex flex-col justify-between max-w-2xl text-white">
          {/* Top Category Badge (No Emojis) */}
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-[11px] sm:text-xs font-bold tracking-wider uppercase">
              {currentSlide.badge}
            </span>
          </div>

          {/* Center / Lower Content: Headline & 1-line Subtext */}
          <div className="space-y-2 sm:space-y-3 my-auto py-3 sm:py-0">
            <h1 className="text-xl sm:text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight drop-shadow-xs">
              {currentSlide.headline}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-200/90 max-w-lg leading-relaxed line-clamp-2 sm:line-clamp-none">
              {currentSlide.subhead}
            </p>

            <div className="pt-1.5 sm:pt-2">
              <span className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-white hover:bg-emerald-50 shadow-md transition-all group-hover:bg-emerald-400 group-hover:shadow-lg">
                <span>{currentSlide.ctaText}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </div>

          {/* Bottom Bar: Slide Navigation Pills & Next/Prev Controls */}
          <div className="flex items-center justify-between pt-3 sm:pt-4">
            {/* Slide Indicators */}
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              {SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setCurrentIdx(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentIdx === idx ? 'w-7 sm:w-8 bg-emerald-400' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Prev & Next Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={handlePrev}
                title="Previous slide"
                className="p-1.5 sm:p-2 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white transition cursor-pointer backdrop-blur-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                title="Next slide"
                className="p-1.5 sm:p-2 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white transition cursor-pointer backdrop-blur-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
