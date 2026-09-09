import React, { memo } from "react";
import { Check, X, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const FilterSidebar = memo(
  ({
    uniqueCats = [],
    uniqueSizes = [],
    uniqueColors = [],
    selectedCats = [],
    toggleCat,
    selectedSizes = [],
    toggleSize,
    selectedColors = [],
    toggleColor,
    onClear,
  }) => {
    // Agar koi bhi data nahi hai (Mobile pe aksar initial load pe hota hai)
    const hasData =
      uniqueCats.length > 0 ||
      uniqueSizes.length > 0 ||
      uniqueColors.length > 0;

    if (!hasData) {
      return (
        <div className="py-10 text-center">
          <p className="text-[10px] font-black uppercase text-zinc-300 tracking-widest italic">
            Analyzing Inventory...
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* ── Collection / Category ── */}
        {uniqueCats.length > 0 && (
          <div>
            <h3 className="font-black text-[10px] text-black uppercase tracking-[0.2em] mb-4 border-b border-black/5 pb-2">
              Collection
            </h3>
            <div className="space-y-1">
              {uniqueCats.map((c) => {
                const isSelected = selectedCats.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCat(c)}
                    className="w-full flex items-center justify-between group py-2 outline-none transition-all"
                  >
                    <span
                      className={`text-[11px] font-bold uppercase tracking-tight transition-colors ${
                        isSelected
                          ? "text-black"
                          : "text-zinc-400 group-hover:text-zinc-800"
                      }`}
                    >
                      {c}
                    </span>
                    {isSelected ? (
                      <Check size={14} className="text-black" />
                    ) : (
                      <div className="w-1 h-1 rounded-full bg-zinc-100 group-hover:bg-zinc-300 transition-colors" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Colors ── */}
        {uniqueColors.length > 0 && (
          <div>
            <h3 className="font-black text-[10px] text-black uppercase tracking-[0.2em] mb-4 border-b border-black/5 pb-2">
              Colors
            </h3>
            <div className="flex flex-wrap gap-2">
              {uniqueColors.map((c) => {
                const isSelected = selectedColors.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleColor(c)}
                    className={`px-3 py-2 text-[9px] font-black uppercase border transition-all ${
                      isSelected
                        ? "bg-black text-white border-black shadow-lg"
                        : "bg-white text-zinc-400 border-zinc-100 hover:border-black hover:text-black"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Fit / Size ── */}
        {uniqueSizes.length > 0 && (
          <div>
            <h3 className="font-black text-[10px] text-black uppercase tracking-[0.2em] mb-4 border-b border-black/5 pb-2">
              Fit / Size
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {uniqueSizes.map((s) => {
                const isSelected = selectedSizes.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSize(s)}
                    className={`aspect-square flex items-center justify-center text-[10px] font-black border transition-all ${
                      isSelected
                        ? "bg-black text-white border-black shadow-inner"
                        : "bg-white text-zinc-400 border-zinc-100 hover:border-black hover:text-black"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Reset Button ── */}
        {(selectedSizes.length > 0 ||
          selectedColors.length > 0 ||
          selectedCats.length > 0) && (
          <button
            type="button"
            onClick={onClear}
            className="w-full py-4 border border-red-100 bg-red-50/30 text-red-500 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-red-50 transition-colors flex items-center justify-center gap-2 rounded-xl"
          >
            <X size={12} /> Reset Protocol
          </button>
        )}
      </div>
    );
  },
);

FilterSidebar.displayName = "FilterSidebar";
export default FilterSidebar;
