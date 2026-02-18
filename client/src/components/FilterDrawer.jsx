import React, { useState, useEffect } from "react";
import { X, ChevronDown, Check, RotateCcw } from "lucide-react";

const FilterDrawer = ({ isOpen, onClose, onApply, activeFilters }) => {
  const [filters, setFilters] = useState(activeFilters);
  const [expandedSection, setExpandedSection] = useState("sort");

  useEffect(() => {
    setFilters(activeFilters);
  }, [activeFilters]);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleSizeToggle = (size) => {
    setFilters((prev) => {
      const newSizes = prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size];
      return { ...prev, sizes: newSizes };
    });
  };

  const activeCount =
    (filters.sort !== "newest" ? 1 : 0) +
    (filters.priceRange !== "all" ? 1 : 0) +
    filters.sizes.length;

  const clearAll = () => {
    const reset = { sort: "newest", priceRange: "all", sizes: [] };
    setFilters(reset);
  };

  return (
    <>
      {/* Backdrop with Blur */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[400px] bg-white z-[110] transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-2xl flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black uppercase tracking-tighter italic">
              Refine <span className="text-gray-400">Selection</span>
            </h2>
            {activeCount > 0 && (
              <span className="bg-black text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                {activeCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-50 rounded-full transition-all active:scale-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          {/* Section: Sort */}
          <section>
            <button
              onClick={() => toggleSection("sort")}
              className="flex justify-between items-center w-full group"
            >
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-black transition-colors">
                Ordering Protocol
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-500 ${expandedSection === "sort" ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`mt-6 space-y-4 overflow-hidden transition-all duration-500 ${expandedSection === "sort" ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
            >
              {[
                { label: "Latest Drop", value: "newest" },
                { label: "Price: Low to High", value: "low-high" },
                { label: "Price: High to Low", value: "high-low" },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center justify-between cursor-pointer group"
                >
                  <span
                    className={`text-xs font-bold uppercase italic tracking-wider transition-all ${filters.sort === option.value ? "translate-x-2 text-black" : "text-gray-400 group-hover:text-gray-600"}`}
                  >
                    {option.label}
                  </span>
                  <input
                    type="radio"
                    name="sort"
                    value={option.value}
                    checked={filters.sort === option.value}
                    onChange={() =>
                      setFilters({ ...filters, sort: option.value })
                    }
                    className="w-4 h-4 accent-black cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </section>

          {/* Section: Size Matrix */}
          <section>
            <button
              onClick={() => toggleSection("size")}
              className="flex justify-between items-center w-full group"
            >
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-black transition-colors">
                Size Matrix
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-500 ${expandedSection === "size" ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`mt-6 grid grid-cols-4 gap-2 overflow-hidden transition-all duration-500 ${expandedSection === "size" ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
            >
              {["XS", "S", "M", "L", "XL", "XXL"].map((size) => {
                const isActive = filters.sizes.includes(size);
                return (
                  <button
                    key={size}
                    onClick={() => handleSizeToggle(size)}
                    className={`h-12 text-[10px] font-black border transition-all duration-300 ${
                      isActive
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-400 border-gray-100 hover:border-black hover:text-black"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section: Price Range */}
          <section>
            <button
              onClick={() => toggleSection("price")}
              className="flex justify-between items-center w-full group"
            >
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-black transition-colors">
                Price Range
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-500 ${expandedSection === "price" ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`mt-6 space-y-4 overflow-hidden transition-all duration-500 ${expandedSection === "price" ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}
            >
              {[
                { label: "All Archives", value: "all" },
                { label: "Under ₹999", value: "under-999" },
                { label: "₹1,000 - ₹2,499", value: "1000-2499" },
                { label: "Above ₹2,500", value: "above-2500" },
              ].map((range) => (
                <label
                  key={range.value}
                  className="flex items-center gap-4 cursor-pointer group"
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${filters.priceRange === range.value ? "border-black" : "border-gray-200"}`}
                  >
                    {filters.priceRange === range.value && (
                      <div className="w-1.5 h-1.5 bg-black rounded-full" />
                    )}
                  </div>
                  <input
                    type="radio"
                    name="price"
                    value={range.value}
                    checked={filters.priceRange === range.value}
                    onChange={() =>
                      setFilters({ ...filters, priceRange: range.value })
                    }
                    className="hidden"
                  />
                  <span
                    className={`text-xs font-bold uppercase italic tracking-wider ${filters.priceRange === range.value ? "text-black" : "text-gray-400"}`}
                  >
                    {range.label}
                  </span>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Action Footer */}
        <div className="p-8 border-t border-gray-50 bg-white grid grid-cols-2 gap-4">
          <button
            onClick={clearAll}
            className="flex items-center justify-center gap-2 py-4 border border-gray-100 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
          <button
            onClick={() => {
              onApply(filters);
              onClose();
            }}
            className="py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all active:scale-95 shadow-xl shadow-zinc-200"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterDrawer;
