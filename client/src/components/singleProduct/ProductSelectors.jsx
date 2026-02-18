import React from "react";
import { Minus, Plus, Ruler, Check } from "lucide-react";

export default function ProductSelectors({
  colors,
  sizes,
  selectedColor,
  setSelectedColor,
  selectedSize,
  setSelectedSize,
  quantity,
  handleQuantity,
}) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
      {/* 🎨 Colors Section */}
      {colors?.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-baseline">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              Select Color
            </span>
            <span className="text-[10px] font-bold uppercase text-black bg-zinc-50 border border-zinc-100 px-3 py-1 rounded-full">
              {selectedColor || "None Selected"}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {colors.map((c, i) => {
              const isActive = selectedColor === c;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedColor(c)}
                  className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                    isActive
                      ? "ring-2 ring-black ring-offset-2 scale-110"
                      : "hover:scale-105"
                  }`}
                  title={c}
                >
                  <div
                    className="w-full h-full rounded-full border border-black/10 shadow-sm"
                    style={{ backgroundColor: c.toLowerCase() }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 📏 Sizes Section */}
      {sizes?.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              Select Size
            </span>
            <button className="text-[9px] font-bold uppercase text-zinc-400 hover:text-black flex items-center gap-1 transition-colors">
              <Ruler size={12} /> Size Chart
            </button>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {sizes.map((s, i) => {
              // Handle if size is an object or string
              const label = typeof s === "object" ? s.label : s;
              const isSelected = selectedSize === label;

              return (
                <button
                  key={i}
                  onClick={() => setSelectedSize(label)}
                  className={`h-12 flex items-center justify-center rounded-xl border-2 transition-all duration-200 relative ${
                    isSelected
                      ? "border-black bg-black text-white shadow-md"
                      : "border-zinc-100 text-zinc-500 hover:border-black hover:text-black"
                  }`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wide">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 🛒 Quantity Section */}
      <div className="space-y-4 pt-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
          Quantity
        </span>
        <div className="flex items-center gap-6">
          <div className="flex items-center bg-zinc-50 rounded-xl w-32 h-12 border border-zinc-200">
            <button
              onClick={() => handleQuantity("dec")}
              className="flex-1 flex items-center justify-center h-full text-black hover:bg-zinc-100 rounded-l-xl transition-colors disabled:opacity-30"
              disabled={quantity <= 1}
            >
              <Minus size={14} strokeWidth={3} />
            </button>
            <span className="flex-1 text-center font-bold text-sm">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantity("inc")}
              className="flex-1 flex items-center justify-center h-full text-black hover:bg-zinc-100 rounded-r-xl transition-colors disabled:opacity-30"
              disabled={quantity >= 10}
            >
              <Plus size={14} strokeWidth={3} />
            </button>
          </div>

          {/* Stock Status Label */}
          <div className="flex flex-col">
            <span className="text-[9px] font-bold uppercase text-teal-600 tracking-widest bg-teal-50 px-2 py-1 rounded">
              In Stock
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
