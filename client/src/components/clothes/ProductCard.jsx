import React, { useState, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Heart } from "lucide-react";
import { addToWishlist } from "../../features/wishlist/wishlistSlice";
import { cldImage } from "../../utils/imageHelper";
import { formatPrice } from "../../utils/formatters";

const ProductCard = memo(({ product, label, labelColor = "bg-black" }) => {
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

  const isAvailable = inStock === true || (countInStock || 0) > 0;
  const displayImage = cldImage(images?.[0], 500);
  const hoverImage = images?.[1] ? cldImage(images[1], 500) : displayImage;

  const handleWishlistClick = useCallback(
    (e) => {
      e.stopPropagation();
      dispatch(addToWishlist(_id));
    },
    [dispatch, _id],
  );

  // ✅ FIX: useCallback — memo actually works now
  const handleCardClick = useCallback(
    () => navigate(`/product/${slug || _id}`),
    [navigate, slug, _id],
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") handleCardClick();
    },
    [handleCardClick],
  );

  return (
    <div
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${productName}`}
      className="group cursor-pointer flex flex-col relative animate-in fade-in duration-700 h-full outline-none focus-visible:ring-2 focus-visible:ring-black rounded-sm"
    >
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-zinc-50 mb-4 border border-transparent group-hover:border-black transition-all duration-500 rounded-sm">
        {!isLoaded && (
          <div className="absolute inset-0 bg-zinc-100 animate-pulse z-20" />
        )}

        <img
          src={displayImage}
          alt={productName}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover absolute inset-0 z-0 transition-transform duration-700 ease-in-out group-hover:scale-110 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {images?.[1] && (
          <img
            src={hoverImage}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover absolute inset-0 z-10 opacity-0 transition-all duration-700 ease-in-out group-hover:opacity-100 group-hover:scale-105"
          />
        )}

        <div className="absolute top-3 left-3 z-30 flex flex-col gap-1.5">
          {label && (
            <span
              className={`${
                labelColor.startsWith("#") || labelColor.startsWith("rgb")
                  ? "bg-black"
                  : labelColor
              } text-white text-[8px] font-black px-2 py-1 uppercase tracking-[0.2em] shadow-xl`}
              style={
                labelColor.startsWith("#") || labelColor.startsWith("rgb")
                  ? { backgroundColor: labelColor }
                  : undefined
              }
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
          type="button"
          onClick={handleWishlistClick}
          aria-label={`Add ${productName} to wishlist`}
          className="absolute top-3 right-3 z-30 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all duration-300 hover:bg-black hover:text-white outline-none focus-visible:ring-2 focus-visible:ring-black"
        >
          <Heart size={16} strokeWidth={2} />
        </button>

        <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-md py-3 translate-y-full group-hover:translate-y-0 focus-within:translate-y-0 transition-transform duration-500 z-40 border-t border-black/10">
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
              {formatPrice(pricing?.finalPriceWithTax || price)}
            </span>
            {discountPercent > 0 && (
              <span className="text-[10px] text-zinc-300 line-through font-medium italic">
                {formatPrice(price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = "ProductCard";
export default ProductCard;
