import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight, Zap, Star, Flame } from "lucide-react";
import { getHomeData } from "../features/products/productSlice";
import ProductCard from "../components/clothes/ProductCard";
import PageTransition from "../components/PageTransition";

// 🔥 IMPORTANT: Yahan upar wala component import kar rahe hain

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { homePageData, isLoading } = useSelector((state) => state.products);

  // Data destructure kar rahe hain
  const { newArrivals, featuredProducts, hotDeals, premiumCollection } =
    homePageData || {};

  useEffect(() => {
    dispatch(getHomeData());
  }, [dispatch]);

  // Loading Screen
  if (isLoading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center flex-col">
        <div className="w-20 h-1 bg-gray-200 overflow-hidden rounded-full">
          <div className="h-full bg-black w-1/2 animate-[shimmer_1s_infinite_linear]"></div>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest mt-4 animate-pulse">
          Loading Archive...
        </p>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="bg-white min-h-screen text-gray-900 font-sans selection:bg-black selection:text-white">
        {/* --- 1. HERO SECTION --- */}
        <header className="relative w-full h-[85vh] flex items-center bg-black overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1550995123-d3434199c158?q=80&w=2000&auto=format&fit=crop"
            alt="Hero"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />

          <div className="relative z-10 max-w-[1600px] mx-auto px-6 w-full pt-20">
            <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black text-white leading-[0.85] tracking-tighter mb-8">
              FUTURE <br />{" "}
              <span className="text-transparent stroke-text">ARCHIVE</span>
            </h1>
            <Link
              to="/products"
              className="inline-block px-10 py-4 bg-white text-black text-sm font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all duration-300"
            >
              Shop All
            </Link>
          </div>
        </header>

        {/* --- 2. MOVING BANNER (Marquee) --- */}
        <div className="bg-red-600 text-white py-3 overflow-hidden border-y-2 border-black">
          <div className="whitespace-nowrap animate-scroll flex gap-8">
            {[...Array(10)].map((_, i) => (
              <span
                key={i}
                className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-4"
              >
                KRUMEKU SEASON DROP <Zap size={12} fill="white" /> FREE SHIPPING{" "}
                <Star size={12} fill="white" /> LIMITED EDITION
              </span>
            ))}
          </div>
        </div>

        {/* --- 3. NEW ARRIVALS --- */}
        {newArrivals && newArrivals.length > 0 && (
          <section className="py-20 max-w-[1600px] mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-2">
                  New{" "}
                  <span className="text-stroke-black text-transparent">
                    Arrivals
                  </span>
                </h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Just landed this week
                </p>
              </div>
              <Link
                to="/products?sort=newest"
                className="hidden md:flex items-center gap-2 text-xs font-black uppercase tracking-widest border-b-2 border-black pb-1 hover:text-gray-600 transition-colors"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12">
              {newArrivals.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  label="New In"
                  labelColor="bg-blue-600"
                />
              ))}
            </div>
          </section>
        )}

        {/* --- 4. FEATURED / BEST SELLERS --- */}
        {featuredProducts && featuredProducts.length > 0 && (
          <section className="py-10 max-w-[1600px] mx-auto px-6 bg-gray-50 border-y border-gray-100">
            <div className="py-10">
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-12 text-center">
                Trending Now
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12">
                {featuredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* --- 5. HOT DEALS --- */}
        {hotDeals && hotDeals.length > 0 && (
          <section className="py-20 max-w-[1600px] mx-auto px-6">
            <div className="flex items-center gap-4 mb-10">
              <Flame className="w-8 h-8 text-red-600 fill-red-600 animate-pulse" />
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
                Steal Deals
              </h2>
            </div>
            <div className="flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x">
              {hotDeals.map((product) => (
                <div
                  key={product._id}
                  className="min-w-[280px] md:min-w-[320px] snap-start"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- 6. PREMIUM COLLECTION (Dark Mode Section) --- */}
        {premiumCollection && premiumCollection.length > 0 && (
          <section className="bg-black text-white py-24">
            <div className="max-w-[1600px] mx-auto px-6">
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-16 text-center">
                Premium Archive
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                {premiumCollection.map((product) => (
                  <div
                    key={product._id}
                    className="group cursor-pointer"
                    onClick={() =>
                      navigate(`/product/${product.slug || product._id}`)
                    }
                  >
                    <div className="relative w-full aspect-[4/5] bg-zinc-900 mb-6 overflow-hidden">
                      <img
                        src={product.images?.[0]?.url}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 scale-100 group-hover:scale-105"
                        alt={product.productName}
                      />
                    </div>
                    <h3 className="text-lg font-bold uppercase tracking-wide mb-1">
                      {product.productName}
                    </h3>
                    <p className="text-xl font-mono font-medium text-gray-400 group-hover:text-white transition-colors">
                      ₹{product.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CSS Styles (Inline for scoped styles) */}
        <style>{`
        .stroke-text { -webkit-text-stroke: 1px white; }
        .text-stroke-black { -webkit-text-stroke: 1px black; }
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
        .animate-scroll { animation: scroll 20s linear infinite; }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      </div>
    </PageTransition>
  );
};

export default Home;
