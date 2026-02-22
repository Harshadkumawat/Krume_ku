import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Heart } from "lucide-react";
import { addToWishlist } from "../../features/wishlist/wishlistSlice";

const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dftticvtc";

const cldSrc = (img, width = 600) => {
  if (!img) return "https://placehold.co/600x800/png?text=No+Image";
  if (img.public_id) {
    return `https://res.cloudinary.com/${CLOUD}/image/upload/c_fill,g_auto,w_${width},q_auto:good,f_auto/${img.public_id}`;
  }
  return (
    img.secure_url || img.url || "https://placehold.co/600x800/png?text=Product"
  );
};

export default function ProductCard({
  product,
  label,
  labelColor = "bg-black",
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  if (!product) return null;

  const {
    _id,
    productName,
    category,
    price,
    discountPercent,
    pricing,
    inStock,
    countInStock,
    images,
    sizes,
    slug,
  } = product;

  // 🔥 AVAILABILITY LOGIC
  const isAvailable = inStock === true || (countInStock || 0) > 0;

  const displayImage = cldSrc(images?.[0], 500);

  const hoverImage = images?.[1] ? cldSrc(images[1], 500) : displayImage;

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    dispatch(addToWishlist(_id));
  };

  return (
    <div
      onClick={() => navigate(`/product/${slug || _id}`)}
      className="group cursor-pointer flex flex-col relative animate-in fade-in duration-700 h-full"
    >
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-zinc-50 mb-4 border border-transparent group-hover:border-black transition-all duration-500 rounded-sm">
        {!isLoaded && (
          <div className="absolute inset-0 bg-zinc-100 animate-pulse z-20" />
        )}

        <img
          src={displayImage}
          alt={productName}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover absolute inset-0 z-10 transition-all duration-700 ease-in-out group-hover:opacity-0 group-hover:scale-110 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        />

        <img
          src={hoverImage}
          alt={productName}
          loading="lazy"
          className="w-full h-full object-cover absolute inset-0 z-0 scale-100 transition-transform duration-1000 group-hover:scale-105"
        />

        {/* BADGES */}
        <div className="absolute top-3 left-3 z-30 flex flex-col gap-1.5">
          {label && (
            <span
              className={`${labelColor} text-white text-[8px] font-black px-2 py-1 uppercase tracking-[0.2em] shadow-xl`}
            >
              {label}
            </span>
          )}
          {!label && discountPercent > 0 && (
            <span className="bg-red-600 text-white text-[8px] font-black px-2 py-1 uppercase tracking-[0.2em] shadow-xl">
              -{discountPercent}% OFF
            </span>
          )}
          {category && (
            <span className="bg-white text-black text-[8px] font-black px-2 py-1 uppercase tracking-[0.2em] border border-black/5 shadow-sm">
              {category}
            </span>
          )}
        </div>

        <button
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 z-30 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black hover:text-white"
        >
          <Heart size={16} strokeWidth={2} />
        </button>

        <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-md py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-40 border-t border-black/10">
          <div className="flex justify-center items-center gap-3">
            {sizes?.length > 0 ? (
              sizes.slice(0, 5).map((s, i) => (
                <span
                  key={i}
                  className="text-[9px] font-black text-zinc-400 group-hover:text-black transition-colors uppercase"
                >
                  {typeof s === "object" ? s.label : s}
                </span>
              ))
            ) : (
              <span className="text-[9px] font-black uppercase tracking-widest">
                View Details
              </span>
            )}
          </div>
        </div>

        {/* SOLD OUT OVERLAY */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-white/80 z-40 flex items-center justify-center backdrop-blur-[2px]">
            <span className="bg-black text-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] italic">
              Sold Out
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 px-1">
        <h3 className="font-black text-[11px] uppercase tracking-tighter text-zinc-900 truncate group-hover:text-red-600 transition-colors duration-300">
          {productName}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-black italic tracking-tighter text-black">
              ₹ {(pricing?.finalPriceWithTax || price)?.toLocaleString("en-IN")}
            </span>

            {discountPercent > 0 && (
              <span className="text-[10px] text-zinc-300 line-through font-medium italic">
                ₹{price?.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
