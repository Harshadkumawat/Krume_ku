import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowRight,
  Zap,
  Star,
  Flame,
  Truck,
  ShieldCheck,
  RotateCcw,
  BadgePercent,
} from "lucide-react";
import { getHomeData } from "../features/products/productSlice";
import ProductCard from "../components/clothes/ProductCard";
import PageTransition from "../components/PageTransition";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { homePageData, isLoading } = useSelector((state) => state.products);

  const { newArrivals, featuredProducts, hotDeals, premiumCollection } =
    homePageData || {};

  useEffect(() => {
    dispatch(getHomeData());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center flex-col">
        <div className="w-20 h-1 bg-gray-100 overflow-hidden rounded-full">
          <div className="h-full bg-black w-1/2 animate-shimmer"></div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-6 animate-pulse italic">
          KRUMEKU ARCHIVE LOADING...
        </p>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="bg-white min-h-screen text-gray-900 font-sans selection:bg-red-600 selection:text-white overflow-x-hidden">
        {/* --- 1. HERO SECTION --- */}
        <header className="relative w-full h-[80vh] md:h-[90vh] flex items-center bg-black overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1550995123-d3434199c158?q=80&w=2000&auto=format&fit=crop"
            alt="Hero"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-60 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

          <div className="relative z-10 max-w-[1600px] mx-auto px-6 w-full pt-20">
            <h1 className="text-5xl md:text-8xl lg:text-[10rem] font-black text-white leading-[0.9] tracking-tighter mb-8 italic">
              STREET <br />
              <span className="text-transparent stroke-text">CULTURE.</span>
            </h1>
            <Link
              to="/products"
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all duration-500 shadow-2xl active:scale-95"
            >
              Shop <ArrowRight size={16} />
            </Link>
          </div>
        </header>

        {/* --- 2. MOVING BANNER (Color: Red & Sharp Text) --- */}
        <div className="bg-red-600 text-white py-4 overflow-hidden border-y border-red-700 relative z-20">
          <div className="whitespace-nowrap animate-scroll flex gap-12 items-center will-change-transform">
            {[...Array(10)].map((_, i) => (
              <span
                key={i}
                className="marquee-text text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-6"
              >
                COD AVAILABLE{" "}
                <Zap
                  size={12}
                  className="text-yellow-400"
                  fill="currentColor"
                />
                FREE SHIPPING PAN INDIA{" "}
                <Star size={12} className="text-white" fill="currentColor" />
                7-DAY EASY RETURNS
              </span>
            ))}
          </div>
        </div>

        {/* --- 3. NEW ARRIVALS --- */}
        {newArrivals && newArrivals.length > 0 && (
          <section className="py-16 md:py-24 max-w-[1600px] mx-auto px-4 md:px-12">
            <div className="flex justify-between items-end mb-10 md:mb-16">
              <div>
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2">
                  Fresh From The Factory
                </p>
                <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter leading-none italic">
                  New{" "}
                  <span className="text-transparent stroke-text-black">
                    Arrivals
                  </span>
                </h2>
              </div>
              <Link
                to="/products?sort=newest"
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border-b-2 border-black pb-1 hover:text-red-600 transition-all"
              >
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-10 md:gap-y-16">
              {newArrivals.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* --- 4. TRUST SECTION --- */}
        <section className="bg-zinc-50 py-16 border-y border-zinc-100">
          <div className="max-w-[1600px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
            <TrustItem
              icon={<Truck size={24} />}
              title="Fast Delivery"
              desc="Free shipping Pan India"
            />
            <TrustItem
              icon={<RotateCcw size={24} />}
              title="Easy Returns"
              desc="7-day hassle free return"
            />
            <TrustItem
              icon={<ShieldCheck size={24} />}
              title="100% Authentic"
              desc="Genuine quality products"
            />
            <TrustItem
              icon={<BadgePercent size={24} />}
              title="Best Prices"
              desc="Direct from warehouse"
            />
          </div>
        </section>

        {/* --- 5. HOT DEALS --- */}
        {hotDeals && hotDeals.length > 0 && (
          <section className="py-20 max-w-[1600px] mx-auto px-4 md:px-12">
            <div className="flex items-center gap-3 mb-12">
              <Flame className="w-6 h-6 text-red-600 fill-red-600 animate-pulse" />
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic">
                Bestseller Steals
              </h2>
            </div>
            <div className="flex overflow-x-auto gap-4 md:gap-8 pb-10 no-scrollbar snap-x snap-mandatory">
              {hotDeals.map((product) => (
                <div
                  key={product._id}
                  className="min-w-[280px] md:min-w-[350px] snap-start bg-white p-3 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-xl transition-all"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- 6. PREMIUM CATEGORY --- */}
        {premiumCollection && premiumCollection.length > 0 && (
          <section className="bg-black text-white py-24">
            <div className="max-w-[1600px] mx-auto px-6">
              <div className="flex flex-col items-center mb-16 text-center">
                <h2 className="text-4xl md:text-7xl font-black uppercase italic mb-4">
                  Elite{" "}
                  <span className="text-transparent stroke-text">Series</span>
                </h2>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">
                  Limited Edition Archive
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {premiumCollection.map((product) => (
                  <div
                    key={product._id}
                    className="group cursor-pointer"
                    onClick={() =>
                      navigate(`/product/${product.slug || product._id}`)
                    }
                  >
                    <div className="relative w-full aspect-[3/4] bg-zinc-900 mb-6 overflow-hidden rounded-2xl border border-white/5">
                      <img
                        src={product.images?.[0]?.url}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110"
                        alt={product.productName}
                      />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest mb-1 italic group-hover:text-red-500">
                      {product.productName}
                    </h3>
                    <p className="text-lg font-black italic text-zinc-500">
                      ₹{product.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <style>{`
          .stroke-text { -webkit-text-stroke: 1.5px white; }
          .stroke-text-black { -webkit-text-stroke: 1.2px black; }
          
          /* 🔥 ULTRA SHARP ANIMATION FIX */
          @keyframes scroll { 
            0% { transform: translate3d(0, 0, 0); } 
            100% { transform: translate3d(-50%, 0, 0); } 
          }
          
          .animate-scroll { 
            animation: scroll 30s linear infinite; 
            width: fit-content;
            will-change: transform;
            /* Browser ko batata hai ki blur nahi karna */
            image-rendering: -webkit-optimize-contrast;
            transform: translateZ(0) scale(1.0);
            backface-visibility: hidden;
            perspective: 1000;
          }

          .marquee-text {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
            /* Pixel rounding fix */
            transform: translateZ(0);
          }

          @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
          .animate-shimmer { animation: shimmer 1.5s infinite linear; }
          @keyframes slow-zoom { 0% { transform: scale(1); } 100% { transform: scale(1.08); } }
          .animate-slow-zoom { animation: slow-zoom 20s infinite alternate ease-in-out; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>
    </PageTransition>
  );
};

const TrustItem = ({ icon, title, desc }) => (
  <div className="flex flex-col items-center text-center group">
    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 group-hover:bg-red-600 group-hover:text-white transition-all">
      {icon}
    </div>
    <h4 className="text-[10px] font-black uppercase tracking-widest mb-1">
      {title}
    </h4>
    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
      {desc}
    </p>
  </div>
);

export default Home;
