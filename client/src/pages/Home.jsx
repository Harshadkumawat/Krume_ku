import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Zap,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Scissors,
  Crown,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { getHomeData } from "../features/products/productSlice";
import ProductCard from "../components/clothes/ProductCard";
import PageTransition from "../components/PageTransition";
import SEO from "../components/SEO";
import { ClothesSkeleton } from "../components/Skeletons";

// ── Animation Variants ────────────────────────────────────
const layoutTransition = { type: "spring", stiffness: 45, damping: 14 };

const fadeInUp = {
  initial: { opacity: 0, y: 30, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
};

const fadeInUpDelayed = (delay = 0) => ({
  initial: { opacity: 0, y: 24, filter: "blur(4px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, margin: "-8%" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay },
});

// ✅ FIX 3: Styles OUTSIDE component
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
    <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-200 group-hover:bg-red-600 group-hover:text-white transition-all duration-300 group-hover:-translate-y-2 shadow-sm">
      {icon}
    </div>
    <h4 className="text-[11px] font-black uppercase mt-4 text-zinc-900">
      {title}
    </h4>
    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide mt-1">
      {desc}
    </p>
  </div>
);

// ── Home Component ────────────────────────────────────────
const Home = () => {
  const dispatch = useDispatch();
  const { homePageData, isLoading } = useSelector((state) => state.products);
  // ✅ FIX 1: console.log REMOVED

  const [isExpanded, setIsExpanded] = useState(false);
  const sliderRef = useRef(null);
  const snapTimeoutRef = useRef(null);
  const initTimeoutRef = useRef(null);

  useEffect(() => {
    dispatch(getHomeData());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
      if (initTimeoutRef.current) clearTimeout(initTimeoutRef.current);
    };
  }, []);

  // ✅ FIX 2: Use ACTUAL backend fields
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

  // ✅ FIX 2: "Complete Collection" uses real data
  const collectionProducts = useMemo(() => {
    // Combine hotDeals + premiumCollection, deduplicate, limit to 8
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
  }, [loopedFeatured, isExpanded]);

  const handleExpandToggle = () => {
    if (isExpanded) {
      sliderRef.current
        ?.closest("section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIsExpanded((prev) => !prev);
  };

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: direction === "left" ? -350 : 350,
        behavior: "smooth",
      });
    }
  };

  const heroImage =
    "https://res.cloudinary.com/dftticvtc/image/upload/f_auto,q_auto:eco,w_1920,c_fill,g_auto/Krumeku_jokpig.png";

  return (
    <PageTransition>
      <SEO
        title="Home"
        description="Premium Custom Embroidery & Apparel Brand."
      />

      {/* ✅ FIX 3: Style outside component */}
      <style dangerouslySetInnerHTML={{ __html: PAGE_STYLES }} />

      <div className="bg-white min-h-screen text-zinc-900 overflow-x-hidden pt-[70px] md:pt-[90px]">
        {/* 1. HERO */}
        <header className="relative w-full h-[85vh] flex items-center bg-black overflow-hidden group">
          <div className="absolute inset-0 bg-black">
            <img
              src={heroImage}
              alt="Custom embroidery apparel by Krumeku"
              className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-[7000ms] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
          </div>

          <div className="relative z-10 max-w-[1500px] mx-auto px-6 w-full">
            <motion.div
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={fadeInUp.transition}
              className="max-w-[650px]"
            >
              <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                <Scissors size={12} /> Made in Indore, India
              </p>
              <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-black text-white leading-[0.85] tracking-tight italic mb-8">
                CUSTOM
                <br />
                <span className="text-transparent stroke-text">THREADS</span>
              </h1>
              <Link
                to="/products"
                className="relative overflow-hidden group px-12 py-5 bg-white text-black text-[11px] font-black uppercase tracking-[0.2em] inline-flex items-center gap-3"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Explore The Craft{" "}
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </span>
                <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </Link>
            </motion.div>
          </div>
        </header>

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

        {/* 3. SIGNATURE / FEATURED PIECES */}
        {!isLoading && loopedFeatured.length > 0 && (
          <section className="py-24 bg-black text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />

            <div className="max-w-[1600px] mx-auto relative z-10 px-4 md:px-8">
              <motion.div
                layout
                transition={layoutTransition}
                className={`flex ${
                  isExpanded
                    ? "flex-col items-center"
                    : "flex-col lg:flex-row items-center gap-8 lg:gap-12"
                }`}
              >
                <motion.div
                  layout
                  transition={layoutTransition}
                  className={`flex flex-col shrink-0 ${
                    isExpanded
                      ? "w-full items-center text-center mb-4"
                      : "w-full lg:w-[35%] items-start text-left mb-6 lg:mb-0"
                  }`}
                >
                  <motion.div layout transition={layoutTransition}>
                    <Crown
                      className="text-yellow-500 mb-4 w-8 h-8"
                      aria-hidden="true"
                    />
                  </motion.div>
                  <motion.h2
                    layout
                    transition={layoutTransition}
                    className="text-5xl md:text-6xl font-black uppercase italic mb-4 leading-none"
                  >
                    Signature{" "}
                    <br className={isExpanded ? "hidden" : "hidden lg:block"} />
                    <span className="text-transparent stroke-text">Pieces</span>
                  </motion.h2>
                  <motion.p
                    layout
                    transition={layoutTransition}
                    className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] leading-relaxed max-w-[300px] mb-8"
                  >
                    Swipe left and right endlessly to explore the designs that
                    define our aesthetic.
                  </motion.p>
                  <motion.button
                    layout
                    transition={layoutTransition}
                    onClick={handleExpandToggle}
                    className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-colors outline-none shadow-xl"
                  >
                    {isExpanded ? (
                      <>
                        <X size={16} /> Collapse Gallery
                      </>
                    ) : (
                      <>
                        Expand Gallery <ArrowRight size={16} />
                      </>
                    )}
                  </motion.button>
                </motion.div>

                <motion.div
                  layout
                  transition={layoutTransition}
                  className={`relative group/slider ${isExpanded ? "w-full" : "w-full lg:w-[65%]"}`}
                >
                  <button
                    onClick={() => scrollSlider("left")}
                    aria-label="Scroll left"
                    className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full hidden md:flex items-center justify-center opacity-0 group-hover/slider:opacity-100 hover:bg-white hover:text-black transition-all shadow-2xl ${
                      isExpanded ? "ml-4" : "-ml-6"
                    }`}
                  >
                    <ChevronLeft size={24} />
                  </button>

                  <div
                    ref={sliderRef}
                    onScroll={handleInfiniteScroll}
                    className="flex items-center overflow-x-auto no-scrollbar snap-x snap-mandatory gap-4 md:gap-6 py-4"
                  >
                    {loopedFeatured.map((product) => (
                      <motion.div
                        layout="position"
                        transition={layoutTransition}
                        key={product.uniqueKey}
                        className={`shrink-0 snap-center ${
                          isExpanded
                            ? "w-[240px] md:w-[300px]"
                            : "w-[200px] md:w-[240px]"
                        }`}
                      >
                        <div className="bg-white rounded-xl overflow-hidden p-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:scale-[1.02] transition-transform duration-300">
                          <ProductCard product={product} />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <button
                    onClick={() => scrollSlider("right")}
                    aria-label="Scroll right"
                    className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full hidden md:flex items-center justify-center opacity-0 group-hover/slider:opacity-100 hover:bg-white hover:text-black transition-all shadow-2xl ${
                      isExpanded ? "mr-4" : "-mr-4"
                    }`}
                  >
                    <ChevronRight size={24} />
                  </button>
                </motion.div>
              </motion.div>
            </div>
          </section>
        )}

        {/* 4. NEW ARRIVALS */}
        <section className="py-24 max-w-[1600px] mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <motion.div {...fadeInUpDelayed(0)}>
              <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <Sparkles size={11} /> Fresh Off The Machine
              </p>
              <h2 className="text-5xl font-black uppercase italic leading-none">
                New <span className="stroke-text-black">Arrivals</span>
              </h2>
            </motion.div>
            <Link
              to="/products?newArrival=true"
              className="text-[10px] font-black uppercase border-b border-black pb-1 hover:text-red-600 transition-colors"
            >
              View All
            </Link>
          </div>

          {isLoading ? (
            <ClothesSkeleton />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-16">
              {newArrivals.slice(0, 4).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </section>

        {/* 5. COMPLETE COLLECTION — ✅ FIX 2: Uses real data */}
        {collectionProducts.length > 0 && (
          <section className="py-28 bg-zinc-50 border-y border-zinc-200">
            <div className="max-w-[1600px] mx-auto px-6">
              <motion.div className="text-center mb-20" {...fadeInUpDelayed(0)}>
                <Star className="mx-auto text-red-600 mb-4 animate-pulse w-6 h-6" />
                <h2 className="text-5xl md:text-6xl font-black uppercase italic mb-4">
                  THE <span className="stroke-text-black">COMPLETE</span>{" "}
                  COLLECTION
                </h2>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">
                  Premium designs crafted with threadwork
                </p>
              </motion.div>

              {isLoading ? (
                <ClothesSkeleton />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 md:gap-x-8 gap-y-16">
                  {collectionProducts.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>
              )}

              <div className="mt-16 flex justify-center">
                <Link
                  to="/products"
                  className="px-10 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-colors"
                >
                  View Archive
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* 6. TRUST SIGNALS */}
        <section className="py-20 bg-white">
          <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
            <TrustItem
              icon={<Scissors size={22} />}
              title="In-House Embroidery"
              desc="Precision Crafted"
            />
            <TrustItem
              icon={<ShieldCheck size={22} />}
              title="Heavy Fabrics"
              desc="Export Quality"
            />
            <TrustItem
              icon={<Truck size={22} />}
              title="Fast Delivery"
              desc="Pan India Shipping"
            />
            <TrustItem
              icon={<RotateCcw size={22} />}
              title="Easy Returns"
              desc="7 Day Exchange"
            />
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default Home;
