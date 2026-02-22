import React from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ChevronDown } from "lucide-react";
import SmartImage from "../SmartImage";

export default function CartItem({
  item,
  handleQuantity,
  onRemove,
  handleSizeChange,
}) {
  if (!item?.product) return null;

  const { product, quantity, size, color, _id } = item;

  const basePrice = product.price || 0;
  const finalPrice =
    product.pricing?.finalPriceWithTax ||
    product.finalPriceWithTax ||
    basePrice;
  const discount = product.discountPercent || 0;

  const totalPrice = finalPrice * quantity;
  const totalBasePrice = basePrice * quantity;

  return (
    <div className="py-6 border-b border-zinc-200 flex gap-4 md:gap-6 transition-all hover:bg-zinc-50/50 group/item">
      {/* --- IMAGE SECTION --- */}
      <Link
        to={`/product/${product.slug || product._id}`}
        className="w-24 h-32 md:w-32 md:h-40 block overflow-hidden bg-zinc-100 rounded-lg shrink-0 border border-zinc-200"
      >
        <SmartImage
          src={product.images?.[0]}
          width={300}
          alt={product.productName}
          className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-105"
        />
      </Link>

      {/* --- DETAILS SECTION --- */}
      <div className="flex-1 flex flex-col">
        {/* TOP ROW: Info (Left) & Price (Right) */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          {/* TITLE & VARIANTS (LEFT SIDE) */}
          <div className="flex-1 space-y-2.5">
            <div>
              {product.category && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">
                  {product.category}
                </span>
              )}
              <h3 className="text-sm md:text-base font-bold text-zinc-900 leading-snug line-clamp-2">
                <Link
                  to={`/product/${product.slug || product._id}`}
                  className="hover:text-red-600 transition-colors"
                >
                  {product.productName || "Krumeku Product"}
                </Link>
              </h3>
            </div>

            <div className="flex flex-wrap gap-2.5 text-xs text-zinc-600">
              <div className="relative flex items-center bg-zinc-100/80 border border-zinc-200 px-2 py-1 rounded-md cursor-pointer group/size transition-colors hover:bg-zinc-200/60">
                <span className="font-medium">Size: </span>
                <select
                  value={size || ""}
                  onChange={(e) =>
                    handleSizeChange && handleSizeChange(_id, e.target.value)
                  }
                  className="appearance-none bg-transparent font-bold text-zinc-900 pl-1 pr-5 outline-none cursor-pointer w-full"
                >
                  <option value={size}>{size}</option>
                  {product.sizes?.map((s, i) => {
                    const sVal = typeof s === "object" ? s.label : s;
                    if (sVal !== size) {
                      return (
                        <option key={i} value={sVal}>
                          {sVal}
                        </option>
                      );
                    }
                    return null;
                  })}
                </select>
                <ChevronDown
                  size={12}
                  className="absolute right-1.5 pointer-events-none text-zinc-500 group-hover/size:text-zinc-900 transition-colors"
                />
              </div>

              {color && (
                <span className="bg-zinc-100/80 border border-zinc-200 px-2.5 py-1 rounded-md flex items-center gap-1">
                  <span className="font-medium">Color:</span>
                  <span className="font-bold text-zinc-900">{color}</span>
                </span>
              )}
            </div>
          </div>

          {/* PRICE BLOCK (RIGHT SIDE) */}
          <div className="flex flex-col items-start sm:items-end sm:text-right">
            <span className="text-base md:text-lg font-black text-zinc-900">
              ₹{totalPrice.toLocaleString("en-IN")}
            </span>
            {discount > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-zinc-400 line-through font-medium">
                  ₹{totalBasePrice.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                  {discount}% OFF
                </span>
              </div>
            )}
            <p className="text-[10px] font-medium text-zinc-500 mt-1">
              MRP incl. of all taxes
            </p>
          </div>
        </div>

        {/* PUSH CONTROLS TO BOTTOM */}
        <div className="flex-1"></div>

        {/* BOTTOM ROW: Controls */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-zinc-100">
          <div className="flex items-center border border-zinc-200 rounded-md bg-white overflow-hidden h-8 shadow-sm">
            <span className="text-[10px] font-bold uppercase text-zinc-500 px-2.5 bg-zinc-50 h-full flex items-center border-r border-zinc-200">
              Qty
            </span>
            <button
              onClick={() => handleQuantity(_id, quantity, "dec")}
              disabled={quantity <= 1}
              className="w-8 h-full flex items-center justify-center hover:bg-zinc-100 disabled:opacity-30 transition-colors text-zinc-700"
            >
              <Minus size={14} strokeWidth={2.5} />
            </button>
            <span className="w-7 text-center font-bold text-sm select-none text-zinc-900">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantity(_id, quantity, "inc")}
              className="w-8 h-full flex items-center justify-center hover:bg-zinc-100 transition-colors text-zinc-700"
            >
              <Plus size={14} strokeWidth={2.5} />
            </button>
          </div>

          <button
            onClick={() => onRemove(_id)}
            className="flex items-center gap-1.5 text-xs font-bold uppercase text-zinc-400 hover:text-red-500 transition-colors group/remove"
          >
            <Trash2
              size={16}
              className="group-hover/remove:scale-110 transition-transform"
            />
            <span>Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
}
