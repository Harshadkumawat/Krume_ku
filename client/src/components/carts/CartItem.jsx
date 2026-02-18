import React from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import SmartImage from "../SmartImage";

export default function CartItem({ item, handleQuantity, onRemove }) {
  // 🛡️ Safety: Agar product data corrupt hai to crash na ho
  if (!item?.product) return null;

  const { product, quantity, size, color, _id } = item;
  const price = product.price || 0;
  const totalPrice = price * quantity;

  return (
    <div className="group py-8 border-b border-gray-100 flex gap-6 md:gap-10 transition-all hover:bg-gray-50/30">
      {/* --- IMAGE SECTION --- */}
      <Link
        to={`/product/${product.slug || product._id}`}
        className="w-24 h-32 md:w-32 md:h-44 block overflow-hidden bg-gray-100 rounded-md shrink-0 border border-gray-200"
      >
        <SmartImage
          src={product.images?.[0]}
          width={300}
          alt={product.productName}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </Link>

      {/* --- DETAILS SECTION --- */}
      <div className="flex-1 flex flex-col justify-between py-1">
        <div className="space-y-2">
          <div className="flex justify-between items-start gap-4">
            {/* Product Name */}
            <h3 className="text-base md:text-lg font-black uppercase tracking-tight leading-tight">
              <Link
                to={`/product/${product.slug || product._id}`}
                className="hover:text-red-600 transition-colors line-clamp-2"
              >
                {product.productName || "Product Name"}
              </Link>
            </h3>

            {/* Price Info */}
            <div className="text-right shrink-0">
              <p className="text-base md:text-lg font-black italic text-black">
                ₹{totalPrice.toLocaleString()}
              </p>
              <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider block mt-1">
                ₹{price.toLocaleString()} / item
              </span>
            </div>
          </div>

          {/* Product Attributes */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-[10px] font-black uppercase bg-gray-100 px-2 py-1 rounded-sm text-gray-600 tracking-wider">
              Size: {size || "N/A"}
            </span>
            <span className="text-[10px] font-black uppercase bg-gray-100 px-2 py-1 rounded-sm text-gray-600 tracking-wider">
              Color: {color || "N/A"}
            </span>
          </div>
        </div>

        {/* --- CONTROLS SECTION --- */}
        <div className="flex justify-between items-end mt-4">
          {/* Quantity Selector */}
          <div className="flex items-center border border-black bg-white h-8">
            <button
              onClick={() => handleQuantity(_id, quantity, "dec")}
              disabled={quantity <= 1}
              className="w-8 h-full flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              <Minus size={12} strokeWidth={3} />
            </button>

            <span className="w-8 text-center font-black text-xs select-none">
              {quantity}
            </span>

            <button
              onClick={() => handleQuantity(_id, quantity, "inc")}
              className="w-8 h-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <Plus size={12} strokeWidth={3} />
            </button>
          </div>

          {/* Remove Action */}
          <button
            onClick={() => onRemove(_id)}
            className="flex items-center gap-1 text-[10px] font-black uppercase text-gray-400 hover:text-red-600 transition-colors group/remove"
          >
            <Trash2 size={14} className="group-hover/remove:animate-bounce" />
            <span className="underline underline-offset-4 decoration-2">
              Remove
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
