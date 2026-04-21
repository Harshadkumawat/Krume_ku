import React, { useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchWishlist,
  removeFromWishlist,
} from "../features/wishlist/wishlistSlice";
import { Trash2, ArrowRight, HeartOff, Scissors } from "lucide-react";
import SEO from "../components/SEO";
import { ClothesSkeleton } from "../components/Skeletons";
import Button from "../components/ui/Button";
import { cldImage } from "../utils/imageHelper";
import { formatPrice } from "../utils/formatters";

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

  const handleRemove = useCallback(
    (e, id) => {
      e.stopPropagation();
      if (window.confirm("Remove this piece from your archive?")) {
        dispatch(removeFromWishlist(id));
      }
    },
    [dispatch],
  );

  const handleCardClick = useCallback(
    (slugOrId) => {
      navigate(`/item/${slugOrId}`);
    },
    [navigate],
  );

  if (isLoading)
    return (
      <div className="min-h-screen bg-white pt-20 md:pt-32 pb-24">
        <SEO title="Syncing Archive" />
        <div className="max-w-[1600px] mx-auto px-4 md:px-12">
          <h1 className="text-5xl md:text-8xl lg:text-5xl font-black uppercase tracking-tighter italic leading-[0.8] text-zinc-100 mb-12">
            SAVED <br /> ARCHIVE
          </h1>
          <ClothesSkeleton />
        </div>
      </div>
    );

  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center bg-white px-6 text-center">
        <SEO
          title="Empty Archive"
          description="Your Krumeku wishlist is empty. Start adding premium embroidered pieces to your collection."
        />
        <div
          className="bg-zinc-50 p-8 rounded-full mb-8 shadow-inner"
          aria-hidden="true"
        >
          <HeartOff size={50} className="text-zinc-200" />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-4">
          Your Archive is Empty
        </h2>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-10 max-w-xs">
          Time to curate your premium threadwork collection. Save your favorite
          pieces here.
        </p>

        <Button
          variant="primary"
          size="xl"
          onClick={() => navigate("/products")}
          aria-label="Explore collection"
        >
          Explore Collection{" "}
          <ArrowRight size={16} className="ml-2" aria-hidden="true" />
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20 md:pt-32 pb-24 selection:bg-black selection:text-white overflow-x-hidden">
      <SEO
        title="Saved Archive"
        description={`View your personal collection of ${wishlistItems.length} saved premium embroidered and printed pieces at Krumeku.`}
      />

      <div className="max-w-[1600px] mx-auto px-4 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 md:mb-20">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-8xl lg:text-5xl font-black uppercase tracking-tighter italic leading-[0.8] text-black">
              SAVED <br />
              <span className="text-transparent stroke-text-black">
                ARCHIVE
              </span>
            </h1>
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-10 bg-black" aria-hidden="true"></span>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                {wishlistItems.length} Pieces in collection
              </p>
            </div>
          </div>
          <Link
            to="/products"
            className="text-[10px] font-black uppercase tracking-[0.2em] border-b-2 border-black pb-1 hover:text-zinc-400 transition-all w-fit outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
          >
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-10 gap-y-12 md:gap-y-20 animate-in fade-in duration-500">
          {wishlistItems.map((item) => (
            <div
              key={item._id}
              role="button"
              tabIndex={0}
              aria-label={`View details for ${item.productName}`}
              className="group flex flex-col h-full relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-black rounded-[2rem] p-1"
              onClick={() => handleCardClick(item.slug || item._id)}
              onKeyDown={(e) =>
                e.key === "Enter" && handleCardClick(item.slug || item._id)
              }
            >
              <div className="relative w-full aspect-[3/4] bg-zinc-50 overflow-hidden mb-5 rounded-2xl md:rounded-[2rem] border border-transparent group-hover:border-zinc-100 transition-all shadow-sm">
                {item.category === "Embroidery" && (
                  <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm text-white text-[8px] font-black px-2 py-1 uppercase tracking-widest rounded-sm z-20 flex items-center gap-1">
                    <Scissors size={10} aria-hidden="true" /> In-House
                  </div>
                )}

                <img
                  src={cldImage(item.images?.[0], 400)}
                  alt={item.productName}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />

                <button
                  onClick={(e) => handleRemove(e, item._id)}
                  aria-label={`Remove ${item.productName} from archive`}
                  className="absolute top-3 right-3 bg-white/90 backdrop-blur-md p-2.5 rounded-full text-zinc-400 hover:text-red-600 shadow-xl z-20 md:opacity-0 md:group-hover:opacity-100 transition-all active:scale-75 outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:opacity-100"
                >
                  <Trash2 size={16} strokeWidth={2.5} aria-hidden="true" />
                </button>

                {!item.inStock && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-4 py-2 rounded-full italic">
                      Sold Out
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 px-1">
                <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-zinc-500 truncate italic">
                  {item.productName}
                </h3>
                <div className="flex justify-between items-center">
                  <span className="font-black text-base md:text-lg italic tracking-tighter">
                    {formatPrice(item.finalPriceWithTax || item.price)}
                  </span>
                  {item.discountPercent > 0 && (
                    <span className="text-[9px] font-bold text-teal-600 uppercase italic">
                      {item.discountPercent}% OFF
                    </span>
                  )}
                </div>

                <Button
                  variant="outline"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="mt-3 w-full group-hover:bg-black group-hover:text-white pointer-events-none"
                >
                  View Detail
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .stroke-text-black { -webkit-text-stroke: 1.2px black; color: transparent; }
        @media (max-width: 768px) { .stroke-text-black { -webkit-text-stroke: 1px black; } }
      `}</style>
    </div>
  );
};

export default Wishlist;
