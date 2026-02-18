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
  <div className="flex flex-col gap-4 animate-pulse">
    <div className="aspect-[3/4] bg-gray-100 w-full rounded-[2rem]" />
    <div className="space-y-3 px-4">
      <div className="h-3 bg-gray-100 w-3/4 rounded-full" />
      <div className="h-3 bg-gray-100 w-1/4 rounded-full" />
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
      p.colors?.forEach((c) => colorSet.add(c?.name || c));
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
    if (selectedColors.length > 0)
      data = data.filter((p) =>
        p.colors?.some((c) => selectedColors.includes(c?.name || c)),
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
        <div className="bg-gray-50 border-b border-gray-100 overflow-x-auto no-scrollbar">
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex gap-10">
            {["All", "Men", "Women"].map((g) => (
              <button
                key={g}
                onClick={() => {
                  if (g === "All") searchParams.delete("gender");
                  else searchParams.set("gender", g);
                  setSearchParams(searchParams);
                }}
                className={`py-6 text-[11px] font-black uppercase tracking-[0.4em] transition-all relative shrink-0 ${
                  genderParam === g || (!genderParam && g === "All")
                    ? "text-black"
                    : "text-gray-300 hover:text-black"
                }`}
              >
                {g}
                {(genderParam === g || (!genderParam && g === "All")) && (
                  <span className="absolute bottom-0 left-0 w-full h-[3px] bg-black"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="py-12 border-b border-gray-100 bg-white">
          <div className="max-w-[1600px] mx-auto px-6 md:px-12">
            {queryParam && (
              <div className="mb-6 flex items-center gap-3 text-indigo-600 animate-in fade-in slide-in-from-left duration-500">
                <Search size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  Results for: "{queryParam}"
                </span>
                <button
                  onClick={() => {
                    searchParams.delete("q");
                    setSearchParams(searchParams);
                  }}
                  className="ml-2 text-gray-400 hover:text-black"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
              <div className="space-y-2">
                <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-[0.8]">
                  {queryParam ? "SEARCH" : genderParam || "Archive"}
                  <br />
                  <span className="text-gray-200 text-4xl md:text-6xl uppercase">
                    {queryParam ? "FOUND" : "COLLECTION"}
                  </span>
                </h1>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {isLoading
                    ? "Synchronizing..."
                    : `Cataloging ${filteredProducts.length} Pieces`}
                </p>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:min-w-[240px]">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-black text-white py-4 px-6 text-[10px] font-black uppercase tracking-widest appearance-none outline-none cursor-pointer"
                  >
                    <option value="newest">Latest Drop</option>
                    <option value="low-high">Price: ASC</option>
                    <option value="high-low">Price: DESC</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-16 flex flex-col lg:flex-row gap-16">
          <aside className="hidden lg:block w-64 shrink-0 sticky top-32 h-fit">
            <div className="border-l-2 border-black pl-8">
              <FilterSidebar {...filterProps} />
            </div>
          </aside>

          <main className="flex-1">
            {isError && (
              <div className="p-10 border-2 border-black mb-12 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-red-600">
                  {message}
                </span>
                <button
                  onClick={() => window.location.reload()}
                  className="underline font-black text-xs uppercase"
                >
                  Retry
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20">
              {isLoading
                ? [...Array(8)].map((_, i) => <ProductSkeleton key={i} />)
                : filteredProducts.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
            </div>

            {!isLoading && filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-gray-200 rounded-[2rem]">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <Search size={30} className="text-gray-200" />
                </div>
                <h3 className="text-xl font-black uppercase italic mb-2">
                  Zero Artifacts Found
                </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8 text-center px-6">
                  No matches found for your criteria.
                </p>
                <button
                  onClick={filterProps.onClear}
                  className="bg-black text-white px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-xl"
                >
                  Reset Database
                </button>
              </div>
            )}
          </main>
        </div>

        <div className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="w-full bg-black text-white py-5 shadow-2xl flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] italic"
          >
            <SlidersHorizontal size={14} /> Refine Selection
          </button>
        </div>

        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in"
              onClick={() => setMobileFilterOpen(false)}
            />
            <div className="relative bg-white w-full md:w-[450px] h-full p-10 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-500">
              <div className="flex justify-between items-center mb-16">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none text-black">
                  Filter
                </h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={28} />
                </button>
              </div>
              <FilterSidebar {...filterProps} />
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Clothes;
