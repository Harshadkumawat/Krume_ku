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
import SEO from "../components/SEO"; // SEO Import

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { homePageData, isLoading } = useSelector((state) => state.products);

  const { newArrivals, featuredProducts, hotDeals, premiumCollection } =
    homePageData || {};

  useEffect(() => {
    dispatch(getHomeData());
  }, [dispatch]);

  // Cloudinary Helper for Elite Series
  const cldSrc = (img, width = 600) => {
    if (!img?.public_id) return img?.url || img;
    return `https://res.cloudinary.com/dftticvtc/image/upload/c_scale,w_${width},f_auto,q_auto/${img.public_id}`;
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center flex-col">
        <div className="w-24 h-1 bg-zinc-200 overflow-hidden rounded-full">
          <div className="h-full bg-black w-1/2 animate-shimmer"></div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-6 animate-pulse italic text-zinc-400">
          KRUMEKU ARCHIVE LOADING...
        </p>
      </div>
    );
  }

  return (
    <PageTransition>
      <SEO
        title="Home"
        description="India's Premium Streetwear Archive. Shop exclusive oversized tees and embroidered collection."
      />

      <div className="bg-white min-h-screen text-zinc-900 font-sans selection:bg-red-600 selection:text-white overflow-x-hidden">
        {/* --- 1. HERO SECTION --- */}
        <header className="relative w-full h-[85vh] flex items-center bg-black overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1550995123-d3434199c158?q=80&w=2000&auto=format&fit=crop"
            alt="Krumeku Streetwear Banner"
            loading="eager" // Hero image hamesha eager load honi chahiye
            className="absolute inset-0 w-full h-full object-cover object-center opacity-50 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

          <div className="relative z-10 max-w-[1600px] mx-auto px-6 w-full pt-20 flex flex-col items-start">
            <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black text-white leading-[0.85] tracking-tighter mb-8 italic drop-shadow-2xl">
              STREET <br />
              <span className="text-transparent stroke-text">CULTURE.</span>
            </h1>
            <Link
              to="/products"
              className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-black text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all duration-300 shadow-xl active:scale-95"
            >
              Explore Collection
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </header>

        {/* --- 2. MOVING BANNER --- */}
        <div className="bg-red-600 text-white py-2.5 overflow-hidden relative z-20 shadow-md">
          <div className="whitespace-nowrap animate-scroll flex gap-12 items-center will-change-transform">
            {[...Array(10)].map((_, i) => (
              <span
                key={i}
                className="marquee-text text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-6"
              >
                C.O.D AVAILABLE{" "}
                <Zap
                  size={10}
                  className="text-yellow-300"
                  fill="currentColor"
                />
                FREE SHIPPING PAN INDIA{" "}
                <Star size={10} className="text-white" fill="currentColor" />
                7-DAY EASY RETURNS
              </span>
            ))}
          </div>
        </div>

        {/* --- 3. FEATURED PICKS --- */}
        {featuredProducts?.length > 0 && (
          <section className="py-12 md:py-16 bg-zinc-50 border-b border-zinc-200">
            <div className="max-w-[1600px] mx-auto px-4 md:px-12">
              <div className="flex flex-col items-center mb-8 text-center">
                <Star className="w-5 h-5 text-red-600 fill-red-600 mb-3 animate-pulse" />
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none italic">
                  Featured{" "}
                  <span className="text-transparent stroke-text-black">
                    Picks
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-10">
                {featuredProducts.map((product) => (
                  <div key={product._id} className="relative group">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* --- 4. NEW ARRIVALS --- */}
        {newArrivals?.length > 0 && (
          <section className="py-12 md:py-16 max-w-[1600px] mx-auto px-4 md:px-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
              <div>
                <p className="text-[9px] font-black text-red-600 uppercase tracking-[0.2em] mb-1">
                  Fresh From The Factory
                </p>
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none italic">
                  New{" "}
                  <span className="text-transparent stroke-text-black">
                    Drops
                  </span>
                </h2>
              </div>
              <Link
                to="/products?newArrival=true"
                className="group flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] border-b border-black pb-0.5 hover:text-red-600 hover:border-red-600 transition-all"
              >
                View All{" "}
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-10">
              {newArrivals.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* --- 5. TRUST BADGES --- */}
        <section className="bg-zinc-50 py-10 border-y border-zinc-200">
          <div className="max-w-[1600px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
            <TrustItem
              icon={<Truck size={18} />}
              title="Fast Delivery"
              desc="Free shipping Pan India"
            />
            <TrustItem
              icon={<RotateCcw size={18} />}
              title="Easy Returns"
              desc="7-day hassle free return"
            />
            <TrustItem
              icon={<ShieldCheck size={18} />}
              title="100% Authentic"
              desc="Genuine premium quality"
            />
            <TrustItem
              icon={<BadgePercent size={18} />}
              title="Best Prices"
              desc="Direct from warehouse"
            />
          </div>
        </section>

        {/* --- 6. HOT DEALS --- */}
        {hotDeals?.length > 0 && (
          <section className="py-12 md:py-16 max-w-[1600px] mx-auto px-4 md:px-12 overflow-hidden">
            <div className="flex items-center gap-2 mb-8">
              <Flame className="w-5 h-5 text-red-600 fill-red-600 animate-pulse" />
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic">
                Bestseller Steals
              </h2>
            </div>
            <div className="flex overflow-x-auto gap-4 pb-6 no-scrollbar snap-x snap-mandatory">
              {hotDeals.map((product) => (
                <div
                  key={product._id}
                  className="min-w-[240px] md:min-w-[280px] snap-start"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- 7. ELITE SERIES --- */}
        {premiumCollection?.length > 0 && (
          <section className="bg-black text-white py-16 md:py-20">
            <div className="max-w-[1600px] mx-auto px-6">
              <div className="flex flex-col items-center mb-10 text-center">
                <h2 className="text-4xl md:text-5xl font-black uppercase italic mb-2 tracking-tighter">
                  Elite{" "}
                  <span className="text-transparent stroke-text">Series</span>
                </h2>
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">
                  Limited Edition Archive
                </p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {premiumCollection.map((product) => (
                  <div
                    key={product._id}
                    className="group cursor-pointer flex flex-col"
                    onClick={() =>
                      navigate(`/item/${product.slug || product._id}`)
                    }
                  >
                    <div className="relative w-full aspect-[3/4] bg-zinc-900 mb-3 overflow-hidden rounded-xl border border-white/10">
                      <img
                        src={cldSrc(product.images?.[0], 600)}
                        loading="lazy"
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                        alt={product.productName}
                      />
                    </div>
                    <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.1em] mb-1 italic text-zinc-300 group-hover:text-red-500 transition-colors">
                      {product.productName}
                    </h3>
                    <p className="text-sm md:text-base font-black italic text-zinc-500">
                      ₹{product.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* --- CSS --- */}
        <style>{`
          .stroke-text { -webkit-text-stroke: 1px white; }
          .stroke-text-black { -webkit-text-stroke: 1px #18181b; } 
          @keyframes scroll { 0% { transform: translate3d(0, 0, 0); } 100% { transform: translate3d(-50%, 0, 0); } }
          .animate-scroll { animation: scroll 30s linear infinite; width: fit-content; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>
    </PageTransition>
  );
};

const TrustItem = ({ icon, title, desc }) => (
  <div className="flex flex-col items-center text-center group cursor-default">
    <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-zinc-100 mb-3 group-hover:bg-red-600 group-hover:text-white group-hover:-translate-y-1 transition-all duration-300">
      {icon}
    </div>
    <h4 className="text-[9px] font-black uppercase tracking-[0.1em] mb-0.5 text-zinc-900">
      {title}
    </h4>
    <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tight">
      {desc}
    </p>
  </div>
);

export default Home;
