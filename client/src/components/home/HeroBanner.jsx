import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

// Auto-advance interval for the hero carousel (ms)
const HERO_AUTOPLAY_INTERVAL = 5000;

// fallback static image — jab tak admin ne koi banner add nahi kiya ho
const FALLBACK_HERO_IMAGE =
  "https://res.cloudinary.com/dftticvtc/image/upload/f_auto,q_auto:eco,w_1920,c_fill,g_auto/Krumeku_jokpig.png";

const HeroBanner = ({ activeBanners }) => {
  const heroSlides = useMemo(() => {
    if (activeBanners && activeBanners.length > 0) return activeBanners;
    return [
      {
        _id: "fallback",
        image: FALLBACK_HERO_IMAGE,
        title: "CUSTOM",
        subtitle: "THREADS",
        ctaText: "Explore The Craft",
        product: null,
      },
    ];
  }, [activeBanners]);

  const [heroIndex, setHeroIndex] = useState(0);
  const heroTimerRef = useRef(null);

  useEffect(() => {
    setHeroIndex(0);
  }, [heroSlides.length]);

  const restartHeroAutoplay = useCallback(() => {
    if (heroTimerRef.current) clearInterval(heroTimerRef.current);
    if (heroSlides.length <= 1) return;
    heroTimerRef.current = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, HERO_AUTOPLAY_INTERVAL);
  }, [heroSlides.length]);

  useEffect(() => {
    restartHeroAutoplay();
    return () => {
      if (heroTimerRef.current) clearInterval(heroTimerRef.current);
    };
  }, [restartHeroAutoplay]);

  const goToHeroSlide = useCallback(
    (index) => {
      setHeroIndex(index);
      restartHeroAutoplay();
    },
    [restartHeroAutoplay],
  );

  const goToPrevHeroSlide = useCallback(() => {
    setHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    restartHeroAutoplay();
  }, [heroSlides.length, restartHeroAutoplay]);

  const goToNextHeroSlide = useCallback(() => {
    setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    restartHeroAutoplay();
  }, [heroSlides.length, restartHeroAutoplay]);

  const activeBanner = heroSlides[heroIndex] || heroSlides[0];
  const heroImage = activeBanner?.image || FALLBACK_HERO_IMAGE;

  const heroLink = activeBanner?.product?.slug
    ? `/product/${activeBanner.product.slug}`
    : activeBanner?.product?._id
      ? `/product/${activeBanner.product._id}`
      : "/products";

  const heroTitleLine = activeBanner?.title || "CUSTOM";
  const heroSubtitleLine = activeBanner?.subtitle || "THREADS";
  const heroCtaText = activeBanner?.ctaText || "Explore The Craft";

  return (
    <header className="relative w-full bg-black overflow-hidden group">
      <div className="relative w-full">
        <div key={activeBanner?._id || heroIndex} className="w-full">
          <Link
            to={heroLink}
            className="block w-full"
            aria-label="Go to featured product"
          >
            {/* 🔥 FIX YAHAN HAI: h-auto hatakar h-[60vh] md:h-[85vh] aur object-cover add kiya */}
            <img
              src={heroImage}
              alt={
                activeBanner?.title || "Custom embroidery apparel by Krumeku"
              }
              className="w-full h-[60vh] md:h-[85vh] object-cover object-center block"
            />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
          </Link>
        </div>

        <div className="absolute inset-0 flex items-center z-10">
          <div className="max-w-[1500px] mx-auto px-6 w-full pointer-events-none">
            <div key={activeBanner?._id || heroIndex} className="max-w-[650px]">
              <p className="text-[10px] text-red-400 font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                Made in Indore, India
              </p>
              <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-black text-white leading-[0.85] tracking-tight italic mb-8 drop-shadow-2xl">
                {heroTitleLine}
                <br />
                <span className="text-transparent stroke-text">
                  {heroSubtitleLine}
                </span>
              </h1>
              <p className="text-[13px] text-white/80 font-light tracking-widest mb-8 max-w-[500px]">
                Precision embroidered apparel crafted with premium fabrics. Each
                piece tells your story.
              </p>
              <div className="pointer-events-auto">
                <Link
                  to={heroLink}
                  className="relative overflow-hidden group px-12 py-5 bg-white text-black text-[11px] font-black uppercase tracking-[0.2em] inline-flex items-center gap-3 shadow-2xl hover:shadow-red-600/50"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {heroCtaText}{" "}
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </span>
                  <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Manual prev/next arrows */}
        {heroSlides.length > 1 && (
          <>
            <button
              onClick={goToPrevHeroSlide}
              aria-label="Previous banner"
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 md:w-12 md:h-12 bg-white/15 backdrop-blur-xl border border-white/30 text-white rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-colors"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={goToNextHeroSlide}
              aria-label="Next banner"
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 md:w-12 md:h-12 bg-white/15 backdrop-blur-xl border border-white/30 text-white rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-colors"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {heroSlides.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {heroSlides.map((slide, i) => (
              <button
                key={slide._id || i}
                onClick={() => goToHeroSlide(i)}
                aria-label={`Show banner ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === heroIndex
                    ? "w-8 bg-white"
                    : "w-4 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default HeroBanner;
