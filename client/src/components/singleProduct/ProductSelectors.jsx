import React, { memo } from "react";
import { Minus, Plus } from "lucide-react";

const ProductSelectors = memo(
  ({
    colors = [],
    sizes = [],
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
    quantity,
    handleQuantity,
  }) => {
    return (
      <div className="space-y-8">
        {colors.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <p
                className="text-xs font-bold uppercase tracking-widest text-black"
                id="color-label"
              >
                Select Color
              </p>
              <span
                className="text-[10px] font-black uppercase text-zinc-400"
                aria-live="polite"
              >
                {selectedColor || "None Selected"}
              </span>
            </div>
            <div
              className="flex gap-3 flex-wrap"
              role="group"
              aria-labelledby="color-label"
            >
              {colors.map((color, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  aria-pressed={selectedColor === color}
                  className={`px-5 py-2.5 border rounded-md text-xs font-black uppercase transition-all outline-none focus-visible:ring-2 focus-visible:ring-black ${
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

        {sizes.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <p
                className="text-xs font-bold uppercase tracking-widest text-black"
                id="size-label"
              >
                Select Size
              </p>
              <button
                type="button"
                className="text-[10px] font-bold text-teal-600 hover:underline uppercase tracking-widest outline-none focus-visible:ring-2 focus-visible:ring-black rounded px-1"
              >
                Size Chart
              </button>
            </div>
            <div
              className="flex flex-wrap gap-2.5"
              role="group"
              aria-labelledby="size-label"
            >
              {sizes.map((s, idx) => {
                const isAvailable = s.stock > 0;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => setSelectedSize(s.label)}
                    aria-pressed={selectedSize === s.label}
                    aria-label={
                      !isAvailable
                        ? `Size ${s.label} - Out of stock`
                        : `Size ${s.label}`
                    }
                    className={`w-[3.25rem] h-[3.25rem] flex items-center justify-center border rounded-md text-xs font-black transition-all outline-none focus-visible:ring-2 focus-visible:ring-black ${
                      selectedSize === s.label
                        ? "border-black bg-black text-white shadow-md"
                        : isAvailable
                          ? "border-zinc-200 text-zinc-800 hover:border-black hover:bg-zinc-50"
                          : "border-zinc-100 text-zinc-300 bg-zinc-50 cursor-not-allowed relative overflow-hidden"
                    }`}
                  >
                    {s.label}
                    {!isAvailable && (
                      <span
                        className="absolute w-[150%] h-[1px] bg-zinc-200 rotate-45"
                        aria-hidden="true"
                      ></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-black mb-3">
            Quantity
          </p>
          <div className="flex items-center w-32 h-11 border border-zinc-200 rounded-md bg-zinc-50 overflow-hidden focus-within:ring-2 focus-within:ring-black transition-all">
            <button
              type="button"
              onClick={() => handleQuantity("dec")}
              aria-label="Decrease quantity"
              className="w-10 h-full flex items-center justify-center text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors outline-none"
            >
              <Minus size={14} aria-hidden="true" />
            </button>
            <div
              className="flex-1 h-full flex items-center justify-center text-xs font-black bg-white"
              aria-live="polite"
            >
              {quantity}
            </div>
            <button
              type="button"
              onClick={() => handleQuantity("inc")}
              aria-label="Increase quantity"
              className="w-10 h-full flex items-center justify-center text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors outline-none"
            >
              <Plus size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    );
  },
);

ProductSelectors.displayName = "ProductSelectors";
export default ProductSelectors;
