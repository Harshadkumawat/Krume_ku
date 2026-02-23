import React from "react";
import { Minus, Plus } from "lucide-react";

export default function ProductSelectors({
  colors = [],
  sizes = [],
  selectedColor,
  setSelectedColor,
  selectedSize,
  setSelectedSize,
  quantity,
  handleQuantity,
}) {
  return (
    <div className="space-y-8">
      {/* COLORS */}
      {colors.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-black">
              Select Color
            </p>
            <span className="text-[10px] font-black uppercase text-zinc-400">
              {selectedColor || "None Selected"}
            </span>
          </div>
          <div className="flex gap-3 flex-wrap">
            {colors.map((color, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedColor(color)}
                className={`px-5 py-2.5 border rounded-md text-xs font-black uppercase transition-all ${
                  selectedColor === color
                    ? "border-black bg-black text-white shadow-md"
                    : "border-zinc-200 text-zinc-600 hover:border-black hover:bg-zinc-50"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SIZES */}
      {sizes.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-black">
              Select Size
            </p>
            <button className="text-[10px] font-bold text-teal-600 hover:underline uppercase tracking-widest">
              Size Chart
            </button>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {sizes.map((s, idx) => {
              const isAvailable = s.stock > 0;
              return (
                <button
                  key={idx}
                  disabled={!isAvailable}
                  onClick={() => setSelectedSize(s.label)}
                  className={`w-[3.25rem] h-[3.25rem] flex items-center justify-center border rounded-md text-xs font-black transition-all ${
                    selectedSize === s.label
                      ? "border-black bg-black text-white shadow-md"
                      : isAvailable
                        ? "border-zinc-200 text-zinc-800 hover:border-black hover:bg-zinc-50"
                        : "border-zinc-100 text-zinc-300 bg-zinc-50 cursor-not-allowed relative overflow-hidden"
                  }`}
                >
                  {s.label}
                  {!isAvailable && (
                    <span className="absolute w-[150%] h-[1px] bg-zinc-200 rotate-45"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* QUANTITY */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-black mb-3">
          Quantity
        </p>
        <div className="flex items-center w-32 h-11 border border-zinc-200 rounded-md bg-zinc-50 overflow-hidden">
          <button
            onClick={() => handleQuantity("dec")}
            className="w-10 h-full flex items-center justify-center text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors"
          >
            <Minus size={14} />
          </button>
          <div className="flex-1 h-full flex items-center justify-center text-xs font-black bg-white">
            {quantity}
          </div>
          <button
            onClick={() => handleQuantity("inc")}
            className="w-10 h-full flex items-center justify-center text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
