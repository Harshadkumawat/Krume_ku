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
  "https://res.cloudinary.com/dftticvtc/image/upload/Krumeku_jokpig.png";

// ── Cloudinary responsive srcSet helper ─────────────────────
// 🔥 FIX: pehle hero image (fallback ho ya admin-uploaded banner) apni
// poori original size download hoti thi (1920px ya 1536px) chahe
// mobile ho ya desktop — Lighthouse ne 234KB+ waste flag kiya tha.
// Ye helper Cloudinary URL se koi bhi baked-in transform hata ke, kai
// widths ka srcSet banata hai — browser khud decide karega ki uski
// screen ke hisaab se kaunsi size download karni hai.
const CLOUDINARY_UPLOAD_MARKER = "/upload/";
const HERO_WIDTHS = [480, 768, 1080, 1440, 1920];

const getCloudinaryBasePath = (url) => {
  if (!url || !url.includes(CLOUDINARY_UPLOAD_MARKER)) return null;
  const [prefix, afterUpload] = url.split(CLOUDINARY_UPLOAD_MARKER);
  // Public-id path shuru hota hai version segment (v12345/...) se agar
  // wo maujood hai, warna kisi bhi pehle se lagi transformation ke
  // baad wale hisse se.
  const versionMatch = afterUpload.match(/v\d+\/.*/);
  const publicPath = versionMatch
    ? versionMatch[0]
    : afterUpload.replace(/^[^/]+\//, "");
  return { prefix, publicPath };
};

const buildHeroSrcSet = (url) => {
  const base = getCloudinaryBasePath(url);
  if (!base) return undefined;
  // f_auto,q_auto:eco,w_<width> — sirf width diya hai, koi crop mode
  // (c_fill/c_crop) nahi — is se image apne aap original aspect ratio
  // maintain karte hue proportionally scale hoti hai, kabhi crop nahi hoti.
  return HERO_WIDTHS.map(
    (w) =>
      `${base.prefix}${CLOUDINARY_UPLOAD_MARKER}f_auto,q_auto:eco,w_${w}/${base.publicPath} ${w}w`,
  ).join(", ");
};

const buildHeroFallbackSrc = (url) => {
  const base = getCloudinaryBasePath(url);
  if (!base) return url;
  return `${base.prefix}${CLOUDINARY_UPLOAD_MARKER}f_auto,q_auto:eco,w_1080/${base.publicPath}`;
};

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
    <header className="relative w-full bg-black group">
      <div className="relative w-full">
        <div key={activeBanner?._id || heroIndex} className="w-full">
          <Link
            to={heroLink}
            className="block w-full"
            aria-label="Go to featured product"
          >
            {/* Natural aspect ratio — width scales with screen, height follows
                the image's own ratio, so it NEVER gets cropped on any device.
                srcSet browser ko sahi size choose karne deta hai (mobile pe
                480w, desktop pe 1920w) — poori 1920px image mobile pe
                download nahi hogi. */}
            <img
              src={buildHeroFallbackSrc(heroImage)}
              srcSet={buildHeroSrcSet(heroImage)}
              sizes="100vw"
              alt={
                activeBanner?.title || "Custom embroidery apparel by Krumeku"
              }
              className="w-full h-auto block"
            />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
          </Link>
        </div>

        <div className="absolute inset-0 flex items-center z-10">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 w-full pointer-events-none">
            <div
              key={activeBanner?._id || heroIndex}
              className="max-w-full sm:max-w-[500px] md:max-w-[650px]"
            >
              <p className="text-[8px] sm:text-[10px] text-red-400 font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] mb-3 sm:mb-6 flex items-center gap-2 sm:gap-3">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-400 rounded-full animate-pulse shrink-0" />
                Made in Indore, India
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-[9rem] font-black text-white leading-[0.9] sm:leading-[0.85] tracking-tight italic mb-4 sm:mb-6 md:mb-8 drop-shadow-2xl break-words">
                {heroTitleLine}
                <br />
                <span className="text-transparent stroke-text">
                  {heroSubtitleLine}
                </span>
              </h1>
              <p className="hidden sm:block text-[12px] md:text-[13px] text-white/80 font-light tracking-widest mb-6 md:mb-8 max-w-[500px]">
                Precision embroidered apparel crafted with premium fabrics. Each
                piece tells your story.
              </p>
              <div className="pointer-events-auto">
                <Link
                  to={heroLink}
                  className="relative overflow-hidden group px-6 py-3 sm:px-8 sm:py-4 md:px-12 md:py-5 bg-white text-black text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] inline-flex items-center gap-2 sm:gap-3 shadow-2xl hover:shadow-red-600/50"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {heroCtaText}{" "}
                    <ArrowRight
                      size={14}
                      className="sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform"
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
              className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-white/15 backdrop-blur-xl border border-white/30 text-white rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-colors"
            >
              <ChevronLeft size={18} className="sm:w-[22px] sm:h-[22px]" />
            </button>
            <button
              onClick={goToNextHeroSlide}
              aria-label="Next banner"
              className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-white/15 backdrop-blur-xl border border-white/30 text-white rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-colors"
            >
              <ChevronRight size={18} className="sm:w-[22px] sm:h-[22px]" />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {heroSlides.length > 1 && (
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2">
            {heroSlides.map((slide, i) => (
              <button
                key={slide._id || i}
                onClick={() => goToHeroSlide(i)}
                aria-label={`Show banner ${i + 1}`}
                className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
                  i === heroIndex
                    ? "w-6 sm:w-8 bg-white"
                    : "w-3 sm:w-4 bg-white/40 hover:bg-white/70"
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
