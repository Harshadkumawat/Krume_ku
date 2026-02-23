import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, ChevronDown, Search } from "lucide-react";

import { getAllProducts } from "../features/products/productSlice";
import FilterSidebar from "../components/clothes/FilterSidebar";
import ProductCard from "../components/clothes/ProductCard";
import PageTransition from "../components/PageTransition";

const ProductSkeleton = () => (
  <div className="flex flex-col gap-3 animate-pulse">
    <div className="aspect-[3/4] bg-gray-50 w-full rounded-xl md:rounded-2xl" />
    <div className="space-y-2 px-2">
      <div className="h-2 bg-gray-100 w-3/4 rounded-full" />
      <div className="h-2 bg-gray-100 w-1/4 rounded-full" />
    </div>
  </div>
);

const Clothes = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  const genderParam = searchParams.get("gender");
  const queryParam = searchParams.get("q");
  const newArrivalParam = searchParams.get("newArrival");
  const categoryParam = searchParams.get("category");

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
        newArrival: newArrivalParam || "",
        category: categoryParam || "",
      }),
    );
    setSelectedCats([]);
    setSelectedSizes([]);
    setSelectedColors([]);
  }, [dispatch, genderParam, queryParam, newArrivalParam, categoryParam]);

  const allProducts = useMemo(
    () => (Array.isArray(products) ? products : products?.data || []),
    [products],
  );

  const { uniqueCats, uniqueSizes, uniqueColors } = useMemo(() => {
    const cats = new Set(),
      sizeSet = new Set(),
      colorSet = new Set();
    const sizeOrder = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

    allProducts.forEach((p) => {
      if (p.category) cats.add(p.category);
      p.sizes?.forEach((s) =>
        sizeSet.add(
          String(s?.label || s)
            .toUpperCase()
            .trim(),
        ),
      );
      p.colors?.forEach((c) => {
        const colorVal = String(c?.name || c)
          .toUpperCase()
          .trim();
        if (colorVal) colorSet.add(colorVal);
      });
    });

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
    if (selectedSizes.length > 0) {
      data = data.filter((p) =>
        p.sizes?.some((s) =>
          selectedSizes.includes(
            String(s?.label || s)
              .toUpperCase()
              .trim(),
          ),
        ),
      );
    }
    if (selectedColors.length > 0) {
      data = data.filter((p) =>
        p.colors?.some((c) =>
          selectedColors.includes(
            String(c?.name || c)
              .toUpperCase()
              .trim(),
          ),
        ),
      );
    }

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
        {/* 🏷️ STICKY GENDER TABS */}
        <div className="bg-white border-b border-zinc-100 sticky top-0 z-40">
          <div className="max-w-[1600px] mx-auto px-4 md:px-12 flex gap-8">
            {["All", "Men", "Women"].map((g) => (
              <button
                key={g}
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  if (g === "All") params.delete("gender");
                  else params.set("gender", g);
                  params.delete("newArrival");
                  setSearchParams(params);
                }}
                className={`py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${
                  genderParam === g || (!genderParam && g === "All")
                    ? "text-black"
                    : "text-zinc-300"
                }`}
              >
                {g}
                {(genderParam === g || (!genderParam && g === "All")) && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-black"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 🏢 SLEEK MINIMAL HEADER */}
        <div className="py-6 md:py-10 bg-white">
          <div className="max-w-[1600px] mx-auto px-4 md:px-12">
            {(queryParam || newArrivalParam) && (
              <div className="mb-4 flex items-center gap-2 text-red-600 animate-in fade-in">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                <span className="text-[9px] font-black uppercase tracking-widest">
                  {newArrivalParam ? "NEW DROPS" : `SEARCH: ${queryParam}`}
                </span>
                <X
                  size={12}
                  className="cursor-pointer text-zinc-300 hover:text-black"
                  onClick={() => {
                    searchParams.delete("q");
                    searchParams.delete("newArrival");
                    setSearchParams(searchParams);
                  }}
                />
              </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-baseline gap-4">
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic leading-none">
                  {newArrivalParam
                    ? "NEW DROPS"
                    : queryParam
                      ? "RESULTS"
                      : categoryParam ||
                        genderParam ||
                        "ARCHIVE" 
                  }
                </h1>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest hidden md:block">
                  / {isLoading ? "..." : filteredProducts.length} PIECES
                </span>
              </div>

              <div className="w-full md:w-auto flex gap-2">
                <div className="md:hidden flex-1 bg-zinc-50 rounded-lg flex items-center justify-center text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                  {filteredProducts.length} ITEMS
                </div>
                <div className="relative flex-1 md:flex-none">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full md:min-w-[180px] bg-white text-black py-2.5 px-4 text-[9px] font-black uppercase tracking-widest appearance-none border border-zinc-200 rounded-lg outline-none"
                  >
                    <option value="newest">Sort: Newest</option>
                    <option value="low-high">Price: Low-High</option>
                    <option value="high-low">Price: High-Low</option>
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🛒 MAIN CONTENT */}
        <div className="max-w-[1600px] mx-auto px-4 md:px-12 pb-20 flex gap-12">
          <aside className="hidden lg:block w-64 shrink-0 sticky top-24 h-fit">
            <FilterSidebar {...filterProps} />
          </aside>

          <main className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-8 gap-y-10 md:gap-y-16">
              {isLoading
                ? [...Array(6)].map((_, i) => <ProductSkeleton key={i} />)
                : filteredProducts.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
            </div>

            {!isLoading && filteredProducts.length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-zinc-100 rounded-3xl">
                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-4">
                  No matching pieces
                </p>
                <button
                  onClick={filterProps.onClear}
                  className="text-[10px] font-black uppercase border-b-2 border-black pb-1"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </main>
        </div>

        {/* 📱 MOBILE FLOATING FILTER */}
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="bg-black text-white px-8 py-4 shadow-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest rounded-full active:scale-95 transition-all"
          >
            <SlidersHorizontal size={14} /> Refine
          </button>
        </div>

        {/* 📱 MOBILE DRAWER */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in"
              onClick={() => setMobileFilterOpen(false)}
            />
            <div className="relative bg-white w-[85%] h-full p-8 overflow-y-auto animate-in slide-in-from-right duration-300 rounded-l-3xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black uppercase italic">Refine</h3>
                <X size={20} onClick={() => setMobileFilterOpen(false)} />
              </div>
              <FilterSidebar {...filterProps} />
              <button
                onClick={() => {
                  filterProps.onClear();
                  setMobileFilterOpen(false);
                }}
                className="w-full mt-8 py-4 bg-black text-white text-[10px] font-black uppercase rounded-xl"
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
