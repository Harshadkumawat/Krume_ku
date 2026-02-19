import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchWishlist,
  removeFromWishlist,
} from "../features/wishlist/wishlistSlice";
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  HeartOff,
  Loader2,
} from "lucide-react";

const Wishlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { wishlistItems, isLoading } = useSelector((state) => state.wishlist);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchWishlist());
    } else {
      navigate("/login");
    }
    window.scrollTo(0, 0);
  }, [dispatch, user, navigate]);

  const handleRemove = (e, id) => {
    e.stopPropagation();
    if (window.confirm("Remove this piece from your archive?")) {
      dispatch(removeFromWishlist(id));
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-black mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
          Syncing Archive...
        </p>
      </div>
    );

  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center bg-white px-6 text-center">
        <div className="bg-zinc-50 p-8 rounded-full mb-8 shadow-inner">
          <HeartOff size={50} className="text-zinc-200" />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-4">
          Your Archive is Empty
        </h2>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-10 max-w-xs">
          Pieces you save will appear here. Start building your collection
          today.
        </p>
        <Link
          to="/products"
          className="group flex items-center gap-3 bg-black text-white px-10 py-5 uppercase text-[10px] font-black tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-2xl active:scale-95"
        >
          Start Shopping <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20 md:pt-32 pb-24 selection:bg-black selection:text-white overflow-x-hidden">
      <div className="max-w-[1600px] mx-auto px-4 md:px-12">
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 md:mb-20">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter italic leading-[0.8] text-black">
              SAVED <br />
              <span className="text-transparent stroke-text-black">
                ARCHIVE
              </span>
            </h1>
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-10 bg-black"></span>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                {wishlistItems.length} Pieces in collection
              </p>
            </div>
          </div>
          <Link
            to="/products"
            className="text-[10px] font-black uppercase tracking-[0.2em] border-b-2 border-black pb-1 hover:text-zinc-400 transition-all w-fit"
          >
            Continue Shopping
          </Link>
        </div>

        {/* --- GRID SECTION (Indian Style 2-Column Mobile) --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-10 gap-y-12 md:gap-y-20">
          {wishlistItems.map((item) => (
            <div
              key={item._id}
              className="group flex flex-col h-full relative cursor-pointer"
              onClick={() => navigate(`/product/${item.slug || item._id}`)}
            >
              {/* Image Container */}
              <div className="relative w-full aspect-[3/4] bg-zinc-50 overflow-hidden mb-5 rounded-2xl md:rounded-[2rem] border border-transparent group-hover:border-zinc-100 transition-all shadow-sm">
                <img
                  src={
                    item.images?.[0]?.url ||
                    item.images?.[0] ||
                    "https://via.placeholder.com/300"
                  }
                  alt={item.productName}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />

                {/* Remove Button (Always visible on Mobile, hover on Desktop) */}
                <button
                  onClick={(e) => handleRemove(e, item._id)}
                  className="absolute top-3 right-3 bg-white/90 backdrop-blur-md p-2.5 rounded-full text-zinc-400 hover:text-red-600 shadow-xl z-20 md:opacity-0 md:group-hover:opacity-100 transition-all active:scale-75"
                >
                  <Trash2 size={16} strokeWidth={2.5} />
                </button>

                {/* Sold Out Overlay */}
                {!item.inStock && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-4 py-2 rounded-full italic">
                      Sold Out
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex flex-col gap-2 px-1">
                <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-zinc-500 truncate italic">
                  {item.productName}
                </h3>
                <div className="flex justify-between items-center">
                  <span className="font-black text-base md:text-lg italic tracking-tighter">
                    ₹
                    {item.finalPriceWithTax?.toLocaleString("en-IN") ||
                      item.price}
                  </span>
                  {item.discountPercent > 0 && (
                    <span className="text-[9px] font-bold text-teal-600 uppercase italic">
                      {item.discountPercent}% OFF
                    </span>
                  )}
                </div>

                {/* Action Button */}
                <button className="mt-3 w-full py-3 bg-white border border-black text-[9px] font-black uppercase tracking-widest group-hover:bg-black group-hover:text-white transition-all duration-500 rounded-xl">
                  View Detail
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .stroke-text-black {
          -webkit-text-stroke: 1.2px black;
          color: transparent;
        }
        @media (max-width: 768px) {
          .stroke-text-black {
            -webkit-text-stroke: 1px black;
          }
        }
      `}</style>
    </div>
  );
};

export default Wishlist;
