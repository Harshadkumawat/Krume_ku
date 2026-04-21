import React, { memo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatPrice } from "../../utils/formatters";
import { cldImage } from "../../utils/imageHelper";

const RelatedProducts = memo(({ products, currentCategory }) => {
  const navigate = useNavigate();

  if (!products || products.length === 0) return null;

  const handleCardClick = useCallback(
    (slugOrId) => {
      navigate(`/item/${slugOrId}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [navigate],
  );

  const getValidImage = (item) => {
    const firstImg = item?.images?.[0] || item?.images;
    if (!firstImg) return "/placeholder.png";

    const imgSrc =
      typeof firstImg === "object"
        ? firstImg.url || firstImg.secure_url
        : firstImg;

    if (typeof imgSrc === "string" && imgSrc.startsWith("http")) return imgSrc;

    return cldImage(imgSrc, 400);
  };

  return (
    <section className="mt-20 border-t border-zinc-100 pt-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic text-black">
            Related <span className="text-zinc-300">Archive</span>
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mt-1">
            More from {currentCategory}
          </p>
        </div>
        <Link
          to={`/products?category=${currentCategory}`}
          className="text-[10px] font-black uppercase tracking-widest border-b-2 border-black pb-1 hover:text-zinc-400 hover:border-zinc-400 transition-all outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {products.map((item) => (
          <div
            key={item._id}
            role="button"
            tabIndex={0}
            aria-label={`View details for ${item.productName}`}
            className="group cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-black rounded-2xl p-1 -m-1"
            onClick={() => handleCardClick(item.slug || item._id)}
            onKeyDown={(e) =>
              e.key === "Enter" && handleCardClick(item.slug || item._id)
            }
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-zinc-50 rounded-2xl mb-4 border border-zinc-100 shadow-sm">
              <img
                src={getValidImage(item)}
                alt={item.productName}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => {
                  e.target.src = "/placeholder.png";
                }}
              />
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-500 truncate mb-1 italic">
              {item.productName}
            </h3>
            <p className="text-sm font-black italic text-black">
              {formatPrice(item.finalPriceWithTax || item.price)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
});

RelatedProducts.displayName = "RelatedProducts";
export default RelatedProducts;
