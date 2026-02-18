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
  }, [dispatch, user, navigate]);

  const handleRemove = (e, id) => {
    e.stopPropagation();
    if (window.confirm("Remove from archive?")) {
      dispatch(removeFromWishlist(id));
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );

  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center bg-white px-4 text-center">
        <div className="bg-gray-50 p-6 rounded-full mb-6">
          <HeartOff size={48} className="text-gray-300" />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">
          Your Archive is Empty
        </h2>
        <Link
          to="/products"
          className="group flex items-center gap-2 bg-black text-white px-8 py-3 uppercase font-bold tracking-widest hover:bg-zinc-800 transition-all mt-4"
        >
          Start Curating <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20 md:pt-28 pb-20 selection:bg-black selection:text-white">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter italic leading-[0.8]">
              SAVED{" "}
              <span className="text-white stroke-text-black">ARCHIVE</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mt-4">
              {wishlistItems.length} curated pieces in your collection
            </p>
          </div>
          <Link
            to="/products"
            className="text-[10px] font-black uppercase tracking-widest border-b-2 border-black pb-1 hover:text-gray-500 transition-colors w-fit"
          >
            Continue Shopping
          </Link>
        </div>

        {/* --- GRID SECTION (Ab ye sahi container mein hai) --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12">
          {wishlistItems.map((item) => (
            <div
              key={item._id}
              className="group flex flex-col h-full relative cursor-pointer"
              onClick={() => navigate(`/product/${item.slug || item._id}`)}
            >
              <div className="relative w-full aspect-[3/4] bg-gray-50 overflow-hidden mb-4 border border-transparent group-hover:border-black transition-all">
                <img
                  src={
                    item.images?.[0]?.url ||
                    item.images?.[0] ||
                    "https://via.placeholder.com/300"
                  }
                  alt={item.productName}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <button
                  onClick={(e) => handleRemove(e, item._id)}
                  className="absolute top-2 right-2 bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:text-red-600 shadow-sm z-10"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-[11px] font-black uppercase tracking-wider truncate">
                  {item.productName}
                </h3>
                <div className="flex justify-between items-center">
                  <span className="font-black text-sm italic">
                    ₹
                    {item.finalPriceWithTax?.toLocaleString("en-IN") ||
                      item.price}
                  </span>
                  {!item.inStock && (
                    <span className="text-[9px] font-black text-red-600 uppercase bg-red-50 px-2 py-0.5">
                      Sold Out
                    </span>
                  )}
                </div>
                <button className="mt-3 w-full py-3 border border-black text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                  View Piece
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .stroke-text-black {
          -webkit-text-stroke: 1.5px black;
          color: transparent;
        }
      `}</style>
    </div>
  );
};

export default Wishlist;
