import React from "react";
import { Link, useNavigate } from "react-router-dom";

const RelatedProducts = ({ products, currentCategory }) => {
  const navigate = useNavigate();

  if (!products || products.length === 0) return null;

  const getImageUrl = (item) => {
    if (!item.images) return "/placeholder.png";

    if (
      item.images &&
      typeof item.images === "object" &&
      !Array.isArray(item.images)
    ) {
      return item.images.url || "/placeholder.png";
    }

    if (Array.isArray(item.images) && item.images.length > 0) {
      const firstImg = item.images[0];
      return typeof firstImg === "string"
        ? firstImg
        : firstImg.url || firstImg.secure_url;
    }

    return "/placeholder.png";
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
          className="text-[10px] font-black uppercase tracking-widest border-b-2 border-black pb-1 hover:text-zinc-400 hover:border-zinc-400 transition-all"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {products.map((item) => (
          <div
            key={item._id}
            className="group cursor-pointer"
            onClick={() => {
              navigate(`/item/${item._id}`);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-zinc-50 rounded-2xl mb-4 border border-zinc-100 shadow-sm">
              <img
                src={getImageUrl(item)}
                alt={item.productName}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => {
                  e.target.src = "/placeholder.png";
                }}
              />
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-500 truncate mb-1 italic">
              {item.productName}
            </h3>
            <p className="text-sm font-black italic">
              ₹{item.finalPriceWithTax?.toLocaleString() || item.price}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;
