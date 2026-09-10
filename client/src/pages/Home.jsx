import React, { useEffect, useMemo, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Zap,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Scissors,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Redux Actions
import { getHomeData } from "../features/products/productSlice";
import { fetchActiveBanners } from "../features/banners/bannerSlice";

// Components
import ProductCard from "../components/clothes/ProductCard";
import PageTransition from "../components/PageTransition";
import SEO from "../components/SEO";
import {
  ClothesSkeleton,
  SignatureSliderSkeleton,
} from "../components/Skeletons";
import HeroBanner from "../components/home/HeroBanner";

const PAGE_STYLES = `
  .stroke-text{-webkit-text-stroke:1px white;color:transparent}
  .stroke-text-black{-webkit-text-stroke:1.5px #18181b;color:transparent}
  .no-scrollbar::-webkit-scrollbar{display:none}
  .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
  @keyframes scroll{0%{transform:translate3d(0,0,0)}100%{transform:translate3d(-50%,0,0)}}
  .animate-scroll{animation:scroll 20s linear infinite}
`;

// ── TrustItem Component ───────────────────────────────────
const TrustItem = ({ icon, title, desc }) => (
  <div className="flex flex-col items-center text-center group cursor-default">
    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white to-zinc-50 flex items-center justify-center border-2 border-zinc-200 group-hover:border-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
      {icon}
    </div>
    <h4 className="text-[11px] font-black uppercase mt-4 text-zinc-900 group-hover:text-red-600 transition-colors">
      {title}
    </h4>
    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide mt-2">
      {desc}
    </p>
  </div>
);

// ── Home Component ────────────────────────────────────────
const Home = () => {
  const dispatch = useDispatch();
  const { homePageData, isLoading } = useSelector((state) => state.products);

  const { activeBanners } = useSelector((state) => state.banners);

  const sliderRef = useRef(null);
  const snapTimeoutRef = useRef(null);
  const initTimeoutRef = useRef(null);

  useEffect(() => {
    dispatch(getHomeData());
    dispatch(fetchActiveBanners());
  }, [dispatch]);

  // Cleanup timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
      if (initTimeoutRef.current) clearTimeout(initTimeoutRef.current);
    };
  }, []);

  const { newArrivals, featuredProducts, hotDeals, premiumCollection } =
    useMemo(() => {
      if (!homePageData)
        return {
          newArrivals: [],
          featuredProducts: [],
          hotDeals: [],
          premiumCollection: [],
        };
      return {
        newArrivals: homePageData.newArrivals || [],
        featuredProducts: homePageData.featuredProducts || [],
        hotDeals: homePageData.hotDeals || [],
        premiumCollection: homePageData.premiumCollection || [],
      };
    }, [homePageData]);

  const collectionProducts = useMemo(() => {
    const combined = [...hotDeals, ...premiumCollection];
    const seen = new Set();
    return combined
      .filter((p) => {
        if (seen.has(p._id)) return false;
        seen.add(p._id);
        return true;
      })
      .slice(0, 8);
  }, [hotDeals, premiumCollection]);

  const loopedFeatured = useMemo(() => {
    if (!featuredProducts || featuredProducts.length === 0) return [];
    return Array(4)
      .fill(featuredProducts)
      .flat()
      .map((item, index) => ({
        ...item,
        uniqueKey: item._id ? `${item._id}-${index}` : `fallback-${index}`,
      }));
  }, [featuredProducts]);

  const handleInfiniteScroll = useCallback(() => {
    if (!sliderRef.current) return;
    const el = sliderRef.current;
    const threshold = el.clientWidth;

    if (el.scrollLeft <= threshold) {
      el.style.scrollSnapType = "none";
      el.scrollLeft = el.scrollWidth / 2;
      if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
      snapTimeoutRef.current = setTimeout(() => {
        if (sliderRef.current)
          sliderRef.current.style.scrollSnapType = "x mandatory";
      }, 50);
    } else if (el.scrollLeft + el.clientWidth >= el.scrollWidth - threshold) {
      el.style.scrollSnapType = "none";
      el.scrollLeft = el.scrollWidth / 2 - el.clientWidth;
      if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
      snapTimeoutRef.current = setTimeout(() => {
        if (sliderRef.current)
          sliderRef.current.style.scrollSnapType = "x mandatory";
      }, 50);
    }
  }, []);

  useEffect(() => {
    if (sliderRef.current && loopedFeatured.length > 0) {
      if (initTimeoutRef.current) clearTimeout(initTimeoutRef.current);
      initTimeoutRef.current = setTimeout(() => {
        if (sliderRef.current) {
          sliderRef.current.scrollLeft =
            sliderRef.current.scrollWidth / 2 -
            sliderRef.current.clientWidth / 2;
        }
      }, 100);
    }
  }, [loopedFeatured]);

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: direction === "left" ? -350 : 350,
        behavior: "smooth",
      });
    }
  };

  const showFeaturedSection = isLoading || loopedFeatured.length > 0;
  const showCollectionSection = isLoading || collectionProducts.length > 0;

  return (
    <PageTransition>
      <SEO
        title="Home"
        description="Premium Custom Embroidery & Apparel Brand."
      />

      <style dangerouslySetInnerHTML={{ __html: PAGE_STYLES }} />

      {/* 🔥 FIX: hardcoded pt-[70px] md:pt-[90px] hata kar navbar ki
          real measured height (Navbar.jsx me set hoti hai --navbar-height
          CSS var ke through) use kar rahe hain — isse navbar aur hero
          banner ke beech ka gap khatam ho jata hai, kisi bhi screen size
          ya scroll state pe. */}
      <div
        className="bg-white min-h-screen text-zinc-900 overflow-x-hidden"
        style={{ paddingTop: "var(--navbar-height, 64px)" }}
      >
        {/* 1. HERO COMPONENT IMPORTED */}
        <HeroBanner activeBanners={activeBanners} />

        {/* 2. MARQUEE */}
        <div className="bg-red-600 text-white py-3 overflow-hidden flex w-full">
          <div className="animate-scroll flex whitespace-nowrap">
            {[...Array(20)].map((_, i) => (
              <span
                key={i}
                className="text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-6 px-6"
              >
                PREMIUM EMBROIDERY <Star size={10} fill="white" /> C.O.D
                AVAILABLE <Zap size={10} fill="yellow" /> FREE DELIVERY PAN
                INDIA
              </span>
            ))}
          </div>
        </div>

        {/* 3. SIGNATURE PIECES */}
        {showFeaturedSection && (
          <section className="py-20 max-w-[1600px] mx-auto px-6 relative">
            <h2 className="text-center text-2xl md:text-3xl font-black uppercase tracking-wide text-zinc-900 mb-10">
              Signature Pieces
            </h2>

            {isLoading ? (
              <SignatureSliderSkeleton />
            ) : (
              <div className="relative group/slider">
                <button
                  onClick={() => scrollSlider("left")}
                  aria-label="Scroll left"
                  className="absolute -left-4 md:-left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-10 md:h-10 bg-white text-zinc-900 rounded-full border border-zinc-200 shadow-md flex items-center justify-center hover:bg-zinc-900 hover:text-white transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>

                <div
                  ref={sliderRef}
                  onScroll={handleInfiniteScroll}
                  className="flex items-stretch overflow-x-auto no-scrollbar snap-x snap-mandatory gap-4 md:gap-6 py-2"
                >
                  {loopedFeatured.map((product) => (
                    <div
                      key={product.uniqueKey}
                      className="shrink-0 snap-start w-[45%] sm:w-[30%] md:w-[23%]"
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => scrollSlider("right")}
                  aria-label="Scroll right"
                  className="absolute -right-4 md:-right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-10 md:h-10 bg-white text-zinc-900 rounded-full border border-zinc-200 shadow-md flex items-center justify-center hover:bg-zinc-900 hover:text-white transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </section>
        )}

        {/* 4. NEW ARRIVALS */}
        <section className="py-28 max-w-[1600px] mx-auto px-6 relative">
          <div className="absolute top-0 right-1/3 w-80 h-80 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex justify-between items-end mb-16 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em]">
                  Fresh Off The Machine
                </p>
              </div>
              <h2 className="text-5xl font-black uppercase italic leading-none">
                New <span className="stroke-text-black">Arrivals</span>
              </h2>
            </div>
            <div>
              <Link
                to="/products?newArrival=true"
                className="text-[10px] font-black uppercase border-b-2 border-black pb-1 hover:text-red-600 hover:border-red-600 transition-colors"
              >
                View All →
              </Link>
            </div>
          </div>

          {isLoading ? (
            <ClothesSkeleton
              count={4}
              className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-16 relative z-10"
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-16 relative z-10">
              {newArrivals.slice(0, 4).map((p) => (
                <div key={p._id}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 5. COMPLETE COLLECTION */}
        {showCollectionSection && (
          <section className="py-32 bg-gradient-to-b from-zinc-50 via-white to-zinc-50 border-y-2 border-zinc-200 relative">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-3 mix-blend-overlay pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/8 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-[1600px] mx-auto px-6 relative z-10">
              <div className="text-center mb-20">
                <div className="inline-flex items-center justify-center mb-6">
                  <div className="relative">
                    <Star className="text-red-600 animate-pulse w-7 h-7" />
                    <Star
                      className="text-red-600/40 absolute inset-0 w-7 h-7 animate-spin"
                      style={{ animationDuration: "4s" }}
                    />
                  </div>
                </div>
                <h2 className="text-5xl md:text-6xl font-black uppercase italic mb-4">
                  THE <span className="stroke-text-black">COMPLETE</span>{" "}
                  COLLECTION
                </h2>
                <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-[0.3em]">
                  Premium designs crafted with precision threadwork
                </p>
              </div>

              {isLoading ? (
                <ClothesSkeleton className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 md:gap-x-8 gap-y-16" />
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 md:gap-x-8 gap-y-16">
                    {collectionProducts.map((p) => (
                      <div key={p._id}>
                        <ProductCard product={p} />
                      </div>
                    ))}
                  </div>

                  <div className="mt-20 flex justify-center">
                    <Link
                      to="/products"
                      className="px-12 py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-colors duration-300 shadow-lg hover:shadow-red-600/50"
                    >
                      View Complete Archive
                    </Link>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* 6. TRUST SIGNALS */}
        <section className="py-28 bg-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-2 mix-blend-overlay pointer-events-none" />
          <div className="max-w-[1400px] mx-auto px-6 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              <TrustItem
                icon={<Scissors size={24} className="text-black" />}
                title="In-House Embroidery"
                desc="Precision Crafted"
              />
              <TrustItem
                icon={<ShieldCheck size={24} className="text-black" />}
                title="Heavy Fabrics"
                desc="Export Quality"
              />
              <TrustItem
                icon={<Truck size={24} className="text-black" />}
                title="Fast Delivery"
                desc="Pan India Shipping"
              />
              <TrustItem
                icon={<RotateCcw size={24} className="text-black" />}
                title="Easy Returns"
                desc="7 Day Exchange"
              />
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default Home;
