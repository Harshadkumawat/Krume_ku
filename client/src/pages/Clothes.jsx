import React, { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, Tag, ChevronDown, Search } from "lucide-react";

import { getAllProducts } from "../features/products/productSlice";
import FilterSidebar from "../components/clothes/FilterSidebar";
import ProductCard from "../components/clothes/ProductCard";
import PageTransition from "../components/PageTransition";

// Skeleton Component
const ProductSkeleton = () => (
  <div className="flex flex-col gap-3 animate-pulse">
    <div className="aspect-[3/4] bg-gray-100 w-full rounded-2xl md:rounded-[2rem]" />
    <div className="space-y-2 px-2">
      <div className="h-2.5 bg-gray-100 w-3/4 rounded-full" />
      <div className="h-2.5 bg-gray-100 w-1/4 rounded-full" />
    </div>
  </div>
);

const Clothes = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  const genderParam = searchParams.get("gender");
  const queryParam = searchParams.get("q");

  const { products, isLoading, isError, message } = useSelector(
    (s) => s.products,
  );

  const [selectedCats, setSelectedCats] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [isMobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    dispatch(
      getAllProducts({
        gender: genderParam || "",
        q: queryParam || "",
      }),
    );
    setSelectedCats([]);
    setSelectedSizes([]);
    setSelectedColors([]);
  }, [dispatch, genderParam, queryParam]);

  const allProducts = useMemo(
    () => (Array.isArray(products) ? products : products?.data || []),
    [products],
  );

  const { uniqueCats, uniqueSizes, uniqueColors } = useMemo(() => {
    const cats = new Set(),
      sizeSet = new Set(),
      colorSet = new Set();

    allProducts.forEach((p) => {
      if (p.category) cats.add(p.category);

      p.sizes?.forEach((s) =>
        sizeSet.add(
          String(s?.label || s)
            .toUpperCase()
            .trim(),
        ),
      );

      // 🔥 COLOR DUPLICATE FIX: Sabhi colors ko uppercase karke add karega
      p.colors?.forEach((c) => {
        const colorVal = String(c?.name || c)
          .toUpperCase()
          .trim();
        if (colorVal) colorSet.add(colorVal);
      });
    });

    const sizeOrder = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];
    return {
      uniqueCats: Array.from(cats).sort(),
      uniqueSizes: Array.from(sizeSet).sort(
        (a, b) => (sizeOrder.indexOf(a) || 99) - (sizeOrder.indexOf(b) || 99),
      ),
      uniqueColors: Array.from(colorSet).sort(),
    };
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    let data = [...allProducts];
    if (selectedCats.length > 0)
      data = data.filter((p) => selectedCats.includes(p.category));

    if (selectedSizes.length > 0)
      data = data.filter((p) =>
        p.sizes?.some((s) =>
          selectedSizes.includes(
            String(s?.label || s)
              .toUpperCase()
              .trim(),
          ),
        ),
      );

    // 🔥 COLOR FILTER FIX: Search karte waqt bhi case match karwayega
    if (selectedColors.length > 0)
      data = data.filter((p) =>
        p.colors?.some((c) =>
          selectedColors.includes(
            String(c?.name || c)
              .toUpperCase()
              .trim(),
          ),
        ),
      );

    if (sortBy === "low-high") data.sort((a, b) => a.price - b.price);
    else if (sortBy === "high-low") data.sort((a, b) => b.price - a.price);
    else data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return data;
  }, [allProducts, selectedCats, selectedSizes, selectedColors, sortBy]);

  const filterProps = {
    uniqueCats,
    uniqueSizes,
    uniqueColors,
    selectedCats,
    selectedSizes,
    selectedColors,
    toggleCat: (c) =>
      setSelectedCats((p) =>
        p.includes(c) ? p.filter((x) => x !== c) : [...p, c],
      ),
    toggleSize: (s) =>
      setSelectedSizes((p) =>
        p.includes(s) ? p.filter((x) => x !== s) : [...p, s],
      ),
    toggleColor: (c) =>
      setSelectedColors((p) =>
        p.includes(c) ? p.filter((x) => x !== c) : [...p, c],
      ),
    onClear: () => {
      setSelectedCats([]);
      setSelectedSizes([]);
      setSelectedColors([]);
      setSearchParams({});
    },
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-white selection:bg-black selection:text-white">
        {/* 🏷️ Gender Tabs (Sticky on Mobile) */}
        <div className="bg-gray-50 border-b border-gray-100 sticky top-0 z-40 overflow-x-auto no-scrollbar">
          <div className="max-w-[1600px] mx-auto px-4 md:px-12 flex gap-6 md:gap-10">
            {["All", "Men", "Women"].map((g) => (
              <button
                key={g}
                onClick={() => {
                  if (g === "All") searchParams.delete("gender");
                  else searchParams.set("gender", g);
                  setSearchParams(searchParams);
                }}
                className={`py-4 md:py-6 text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] transition-all relative shrink-0 ${
                  genderParam === g || (!genderParam && g === "All")
                    ? "text-black"
                    : "text-gray-300"
                }`}
              >
                {g}
                {(genderParam === g || (!genderParam && g === "All")) && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] md:h-[3px] bg-black"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 🏢 Header Section */}
        <div className="py-8 md:py-16 border-b border-gray-100 bg-white">
          <div className="max-w-[1600px] mx-auto px-4 md:px-12">
            {queryParam && (
              <div className="mb-6 flex items-center gap-3 text-indigo-600 animate-in fade-in">
                <Search size={14} />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                  Results for: "{queryParam}"
                </span>
                <button
                  onClick={() => {
                    searchParams.delete("q");
                    setSearchParams(searchParams);
                  }}
                  className="text-gray-400 hover:text-black"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8">
              <div className="space-y-2">
                <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter italic leading-[0.85] md:leading-[0.8]">
                  {queryParam ? "SEARCH" : genderParam || "SHOP"}
                  <br />
                  <span className="text-gray-200 text-3xl md:text-6xl uppercase">
                    {queryParam ? "FOUND" : "COLLECTION"}
                  </span>
                </h1>
                <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-2">
                  {isLoading
                    ? "Synchronizing..."
                    : `${filteredProducts.length} Pieces Available`}
                </p>
              </div>

              {/* Sorting Tool */}
              <div className="w-full md:w-auto">
                <div className="relative group">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full md:min-w-[200px] bg-black text-white py-3.5 px-6 text-[10px] font-black uppercase tracking-widest appearance-none outline-none cursor-pointer rounded-lg md:rounded-none"
                  >
                    <option value="newest">New Arrivals</option>
                    <option value="low-high">Price: Low to High</option>
                    <option value="high-low">Price: High to Low</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-white pointer-events-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🛒 Main Content Area */}
        <div className="max-w-[1600px] mx-auto px-4 md:px-12 py-10 md:py-16 flex flex-col lg:flex-row gap-10 md:gap-16">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-32 h-fit">
            <div className="border-l-2 border-black pl-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-gray-400">
                Refine Search
              </h3>
              <FilterSidebar {...filterProps} />
            </div>
          </aside>

          <main className="flex-1">
            {isError && (
              <div className="p-6 md:p-10 border-2 border-black mb-12 flex items-center justify-between bg-red-50">
                <span className="text-[10px] font-black uppercase tracking-widest text-red-600">
                  {message}
                </span>
                <button
                  onClick={() => window.location.reload()}
                  className="underline font-black text-[10px] uppercase"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Product Grid - 2 cols on mobile, 3 on large */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-8 gap-y-12 md:gap-y-20">
              {isLoading
                ? [...Array(8)].map((_, i) => <ProductSkeleton key={i} />)
                : filteredProducts.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
            </div>

            {/* Empty State */}
            {!isLoading && filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 md:py-40 border-2 border-dashed border-gray-100 rounded-3xl md:rounded-[2.5rem] px-6 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <Search size={24} className="text-gray-200" />
                </div>
                <h3 className="text-xl font-black uppercase italic mb-2">
                  Zero Results Found
                </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8 max-w-[250px]">
                  No items match your current selection.
                </p>
                <button
                  onClick={filterProps.onClear}
                  className="bg-black text-white px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-zinc-800 transition-all shadow-xl active:scale-95"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </main>
        </div>

        {/* 📱 Mobile Filter Trigger (Bottom Floating) */}
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[50] w-[90%] max-w-xs">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="w-full bg-black text-white py-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-full active:scale-95 transition-all"
          >
            <SlidersHorizontal size={14} /> Filter & Sort
          </button>
        </div>

        {/* 📱 Mobile Filter Drawer */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
              onClick={() => setMobileFilterOpen(false)}
            />
            <div className="relative bg-white w-[85%] max-w-[400px] h-full p-8 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300 rounded-l-[2rem]">
              <div className="flex justify-between items-center mb-10 border-b border-gray-50 pb-6">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-black">
                  Refine
                </h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-2 bg-gray-50 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <FilterSidebar {...filterProps} />

              {/* Mobile Clear Button inside drawer */}
              <button
                onClick={() => {
                  filterProps.onClear();
                  setMobileFilterOpen(false);
                }}
                className="w-full mt-10 py-4 border-2 border-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black hover:text-white transition-all"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Clothes;
