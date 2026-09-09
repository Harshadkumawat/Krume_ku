import React, { useState, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Heart, Star, Zap, Eye } from "lucide-react";
import { addToWishlist } from "../../features/wishlist/wishlistSlice";
import { cldImage } from "../../utils/imageHelper";
import { formatPrice } from "../../utils/formatters";

const ProductCard = memo(({ product, label, labelColor = "bg-black" }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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

  const viewerCount = Math.floor(Math.random() * 45) + 5;
  const rating = (Math.random() * 1 + 4.2).toFixed(1);
  const reviewCount = Math.floor(Math.random() * 120) + 20;

  const handleWishlistClick = useCallback(
    (e) => {
      e.stopPropagation();
      dispatch(addToWishlist(_id));
    },
    [dispatch, _id],
  );

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
      className="group cursor-pointer flex flex-col relative animate-in fade-in duration-700 h-full outline-none focus-visible:ring-2 focus-visible:ring-black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-gradient-to-br from-zinc-50 to-zinc-100 mb-4 border-2 border-zinc-200 group-hover:border-zinc-900 transition-all duration-500 shadow-sm group-hover:shadow-xl rounded-lg">
        {!isLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 to-zinc-300 animate-pulse z-20" />
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
            className="w-full h-full object-cover absolute inset-0 z-10 opacity-0 transition-all duration-700 ease-in-out group-hover:opacity-100 group-hover:scale-110"
          />
        )}

        <div className="absolute top-4 left-4 z-30 flex flex-col gap-2">
          {label && (
            <span
              className={`${
                labelColor.startsWith("#") || labelColor.startsWith("rgb")
                  ? "bg-black"
                  : labelColor
              } text-white text-[8px] font-black px-3 py-1.5 uppercase tracking-[0.3em] shadow-lg backdrop-blur-sm bg-opacity-90 rounded-full`}
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
            <div className="flex items-center gap-1.5 bg-red-600 text-white text-[8px] font-black px-3 py-1.5 uppercase tracking-[0.3em] shadow-lg backdrop-blur-sm rounded-full">
              <Zap size={11} fill="white" />
              <span>-{discountPercent}%</span>
            </div>
          )}
          {category && (
            <span className="bg-white/90 text-black text-[8px] font-black px-3 py-1.5 uppercase tracking-[0.3em] border-2 border-black/20 shadow-md backdrop-blur-sm rounded-full">
              {category}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={`Add ${productName} to wishlist`}
          className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all duration-300 hover:bg-black hover:text-white outline-none focus-visible:ring-2 focus-visible:ring-black shadow-lg border-2 border-white"
        >
          <Heart size={18} strokeWidth={2} />
        </button>

        {isHovered && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent py-6 z-40 backdrop-blur-sm">
            <div className="flex justify-center items-center gap-4 px-3">
              {sizes?.length > 0 ? (
                sizes.slice(0, 4).map((s, i) => (
                  <span
                    key={i}
                    className="text-[9px] font-black text-white group-hover:text-yellow-300 transition-colors uppercase bg-white/10 px-2 py-1 rounded-full border border-white/20"
                  >
                    {typeof s === "object" ? s.label : s}
                  </span>
                ))
              ) : (
                <span className="text-[9px] font-black uppercase tracking-widest text-white">
                  View Details
                </span>
              )}
            </div>
          </div>
        )}

        {isHovered && isAvailable && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-35 flex items-center justify-center">
            <div className="text-center">
              <Eye
                size={28}
                className="text-white/70 mx-auto mb-2 animate-pulse"
              />
              <span className="text-[9px] font-black text-white uppercase tracking-widest opacity-80">
                {viewerCount} viewing now
              </span>
            </div>
          </div>
        )}

        {!isAvailable && (
          <div className="absolute inset-0 bg-white/85 z-40 flex items-center justify-center backdrop-blur-sm rounded-lg">
            <span className="bg-black text-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] italic rounded-lg shadow-lg">
              Sold Out
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 px-1">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={11}
                className={`transition-colors ${
                  i < Math.round(rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-zinc-300"
                }`}
              />
            ))}
          </div>
          <span className="text-[8px] font-bold text-zinc-600">
            ({reviewCount})
          </span>
        </div>

        <h3 className="font-black text-[11px] uppercase tracking-tighter text-zinc-900 truncate group-hover:text-red-600 transition-colors duration-300 line-clamp-2">
          {productName}
        </h3>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-black italic tracking-tighter text-black">
              {formatPrice(pricing?.finalPriceWithTax || price)}
            </span>
            {discountPercent > 0 && (
              <span className="text-[10px] text-zinc-400 line-through font-medium italic">
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
