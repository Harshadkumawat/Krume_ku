import React, { memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ChevronDown } from "lucide-react";
import { cldImage } from "../../utils/imageHelper";
import { formatPrice } from "../../utils/formatters";

const CART_ITEM_STYLES = `
  .cart-item-img{transition:transform 0.6s cubic-bezier(0.33,1,0.68,1)}
  .cart-item-wrap:hover .cart-item-img{transform:scale(1.06)}
  .qty-btn{position:relative;overflow:hidden;transition:background 0.15s,color 0.15s}
  .qty-btn::after{content:'';position:absolute;inset:0;background:black;transform:scaleY(0);transform-origin:bottom;transition:transform 0.18s cubic-bezier(0.33,1,0.68,1);z-index:0}
  .qty-btn:not(:disabled):hover::after{transform:scaleY(1)}
  .qty-btn:not(:disabled):hover svg{color:white;position:relative;z-index:1}
  .qty-btn svg{position:relative;z-index:1;transition:color 0.15s}
  .remove-btn{position:relative;transition:color 0.2s}
  .remove-btn::before{content:'';position:absolute;bottom:0;left:0;right:0;height:1.5px;background:#ef4444;transform:scaleX(0);transform-origin:left;transition:transform 0.25s cubic-bezier(0.33,1,0.68,1)}
  .remove-btn:hover::before{transform:scaleX(1)}
  .remove-btn:hover{color:#ef4444}
  .size-select-wrap{transition:border-color 0.15s,background 0.15s}
  .size-select-wrap:hover{background:#f4f4f5;border-color:#000}
  .size-select-wrap:focus-within{outline:2px solid black;outline-offset:1px}
  .discount-badge{background:black;color:white;font-size:9px;font-weight:900;letter-spacing:0.08em;padding:2px 6px;clip-path:polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)}
`;

if (
  typeof document !== "undefined" &&
  !document.getElementById("cart-item-styles")
) {
  const styleEl = document.createElement("style");
  styleEl.id = "cart-item-styles";
  styleEl.textContent = CART_ITEM_STYLES;
  document.head.appendChild(styleEl);
}

const CartItem = memo(
  ({ item, handleQuantity, onRemove, handleSizeChange }) => {
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
    const productLink = `/item/${product.slug || product._id}`;

    const onDec = () => {
      if (quantity > 1) handleQuantity(_id, "dec");
    };
    const onInc = () => handleQuantity(_id, "inc");

    return (
      <div className="cart-item-wrap py-5 flex gap-4 md:gap-6 group">
        {/* IMAGE */}
        <Link
          to={productLink}
          aria-label={`View ${product.productName}`}
          className="shrink-0 w-[90px] h-[118px] md:w-[110px] md:h-[145px] rounded-none overflow-hidden border border-zinc-200 bg-zinc-100 block focus-visible:outline-2 focus-visible:outline-black"
        >
          <img
            src={cldImage(product.images?.[0], 300)}
            alt={product.productName || "Cart item"}
            loading="lazy"
            decoding="async"
            className="cart-item-img w-full h-full object-cover"
            onError={(e) => {
              e.target.src =
                "https://placehold.co/400x600/000000/FFFFFF?text=×";
            }}
          />
        </Link>

        {/* CONTENT */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {product.category && (
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 block mb-1">
                  {product.category}
                </span>
              )}
              <h3 className="text-sm md:text-[15px] font-black uppercase tracking-tight leading-tight line-clamp-2 text-zinc-900">
                <Link
                  to={productLink}
                  className="hover:text-red-600 transition-colors focus-visible:outline-2 focus-visible:outline-black rounded"
                >
                  {product.productName || "Krumeku Product"}
                </Link>
              </h3>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-base md:text-lg font-black text-zinc-900 tabular-nums">
                {formatPrice(totalPrice)}
              </p>
              {discount > 0 && (
                <div className="flex items-center justify-end gap-1.5 mt-1">
                  <span className="text-xs text-zinc-400 line-through tabular-nums">
                    {/* {formatPrice(totalBasePrice)} */}
                  </span>
                  <span className="discount-badge">{discount}% OFF</span>
                </div>
              )}
              <p className="text-[9px] font-medium text-zinc-400 mt-1 uppercase tracking-wider">
                incl. taxes
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <div className="size-select-wrap relative flex items-center border border-zinc-200 px-2 py-1 rounded-sm bg-zinc-50 cursor-pointer">
              <label htmlFor={`size-${_id}`} className="sr-only">
                Select Size
              </label>
              <span
                className="text-[10px] font-black uppercase text-zinc-500 mr-1"
                aria-hidden="true"
              >
                Size
              </span>
              <select
                id={`size-${_id}`}
                value={size || ""}
                onChange={(e) => handleSizeChange?.(_id, e.target.value)}
                className="appearance-none bg-transparent text-[11px] font-black text-zinc-900 pr-4 outline-none cursor-pointer"
              >
                <option value={size}>{size}</option>
                {product.sizes?.map((s, i) => {
                  const sVal = typeof s === "object" ? s.label : s;
                  if (sVal !== size)
                    return (
                      <option key={i} value={sVal}>
                        {sVal}
                      </option>
                    );
                  return null;
                })}
              </select>
              <ChevronDown
                size={10}
                aria-hidden="true"
                className="absolute right-1.5 pointer-events-none text-zinc-500"
              />
            </div>

            {color && (
              <span className="border border-zinc-200 px-2.5 py-1 rounded-sm bg-zinc-50 text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                {color}
              </span>
            )}
          </div>

          <div className="flex-1" />

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100">
            <div className="flex items-center border border-zinc-200 overflow-hidden rounded-sm h-8">
              <span
                className="text-[9px] font-black uppercase tracking-widest text-zinc-400 px-2 bg-zinc-50 h-full flex items-center border-r border-zinc-200"
                aria-hidden="true"
              >
                QTY
              </span>
              <button
                type="button"
                onClick={onDec}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="qty-btn w-8 h-full flex items-center justify-center border-r border-zinc-200 text-zinc-600 outline-none focus-visible:bg-zinc-200 disabled:opacity-25 disabled:cursor-not-allowed disabled:pointer-events-none"
              >
                <Minus size={13} strokeWidth={2.5} aria-hidden="true" />
              </button>
              <span
                className="w-8 text-center font-black text-sm select-none text-zinc-900 tabular-nums"
                aria-live="polite"
                aria-label={`Quantity: ${quantity}`}
              >
                {quantity}
              </span>
              <button
                type="button"
                onClick={onInc}
                aria-label="Increase quantity"
                className="qty-btn w-8 h-full flex items-center justify-center border-l border-zinc-200 text-zinc-600 outline-none focus-visible:bg-zinc-200"
              >
                <Plus size={13} strokeWidth={2.5} aria-hidden="true" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => onRemove(_id)}
              aria-label={`Remove ${product.productName || "item"}`}
              className="remove-btn flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 pb-0.5 outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded px-1"
            >
              <Trash2 size={13} aria-hidden="true" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      </div>
    );
  },
);

CartItem.displayName = "CartItem";
export default CartItem;
