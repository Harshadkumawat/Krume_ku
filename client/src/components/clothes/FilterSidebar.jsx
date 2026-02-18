import React from "react";
import { Check } from "lucide-react";

export default function FilterSidebar({
  uniqueCats,
  uniqueSizes,
  uniqueColors,
  selectedCats,
  toggleCat,
  selectedSizes,
  toggleSize,
  selectedColors,
  toggleColor,
  onClear,
}) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Categories */}
      <div>
        <h4 className="font-black text-xs text-black uppercase tracking-widest mb-4 border-b border-black pb-2">
          Collection
        </h4>
        <div className="space-y-2">
          {uniqueCats.map((c) => (
            <div
              key={c}
              onClick={() => toggleCat(c)}
              className="flex items-center justify-between cursor-pointer group py-1"
            >
              <span
                className={`text-xs font-bold uppercase transition-colors ${selectedCats.includes(c) ? "text-black" : "text-gray-400 group-hover:text-black"}`}
              >
                {c}
              </span>
              {selectedCats.includes(c) && <Check size={12} />}
            </div>
          ))}
        </div>
      </div>

      {/* Colors */}
      {uniqueColors.length > 0 && (
        <div>
          <h4 className="font-black text-xs text-black uppercase tracking-widest mb-4 border-b border-black pb-2">
            Colors
          </h4>
          <div className="flex flex-wrap gap-2">
            {uniqueColors.map((c) => (
              <button
                key={c}
                onClick={() => toggleColor(c)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase border transition-all rounded-sm ${selectedColors.includes(c) ? "bg-black text-white border-black" : "bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sizes */}
      <div>
        <h4 className="font-black text-xs text-black uppercase tracking-widest mb-4 border-b border-black pb-2">
          Fit / Size
        </h4>
        <div className="flex flex-wrap gap-2">
          {uniqueSizes.map((s) => (
            <button
              key={s}
              onClick={() => toggleSize(s)}
              className={`w-10 h-10 text-xs font-mono font-bold border transition-all ${selectedSizes.includes(s) ? "bg-black text-white border-black" : "bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {(selectedSizes.length > 0 ||
        selectedColors.length > 0 ||
        selectedCats.length > 0) && (
        <button
          onClick={onClear}
          className="w-full text-[10px] font-bold uppercase text-red-500 underline text-left mt-2"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}
