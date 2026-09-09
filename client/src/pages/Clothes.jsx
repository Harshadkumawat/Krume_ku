import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  X,
  ChevronDown,
  Scissors,
  Loader as Loader2,
  CircleAlert as AlertCircle,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import FilterSidebar from "../components/clothes/FilterSidebar";
import ProductCard from "../components/clothes/ProductCard";
import PageTransition from "../components/PageTransition";
import SEO from "../components/SEO";
import { ProductSkeleton } from "../components/Skeletons";
import Button from "../components/ui/Button";
import { useProductFilters } from "../hooks/useProductFilters";

// ── Constants ─────────────────────────────────────────────
const QUICK_TABS = [
  { label: "All", type: "all" },
  { label: "Embroidered", type: "subCategory", val: "Embroidered" },
  { label: "Printed", type: "subCategory", val: "Printed" },
  { label: "Men", type: "gender", val: "Men" },
  { label: "Women", type: "gender", val: "Women" },
];

const SKELETON_ITEMS = Array.from({ length: 6 }, (_, i) => i);

const SORT_OPTIONS = [
  { value: "newest", label: "Sort: Newest" },
  { value: "popular", label: "Sort: Popular" },
  { value: "price", label: "Price: Low–High" },
  { value: "-price", label: "Price: High–Low" },
];

// ── Helpers ───────────────────────────────────────────────
const getDisplayTitle = (params) => {
  if (params.queryParam) return `SEARCH: ${params.queryParam}`;
  if (params.newArrivalParam) return "FRESH DROPS";
  if (params.subCategoryParam === "Embroidered") return "EMBROIDERED FITS";
  if (params.subCategoryParam === "Printed") return "GRAPHIC PRINTS";
  if (params.genderParam && params.genderParam !== "All")
    return `${params.genderParam.toUpperCase()}'S COLLECTION`;
  return "SHOP ALL";
};

// ── Memoized Child Components ─────────────────────────────
const TabButton = memo(({ tab, isActive, onClick }) => (
  <motion.button
    onClick={onClick}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className={`py-4 px-1 text-[11px] font-black uppercase tracking-[0.3em] transition-colors relative outline-none group ${
      isActive ? "text-black" : "text-zinc-400 hover:text-zinc-700"
    }`}
  >
    {tab.label}
    {isActive && (
      <motion.span
        layoutId="underline"
        className="absolute bottom-0 left-0 right-0 h-[3px] bg-black rounded-full"
        transition={{ type: "spring", stiffness: 380, damping: 40 }}
      />
    )}
    {!isActive && (
      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-200 group-hover:bg-zinc-400 transition-colors" />
    )}
  </motion.button>
));

const ErrorBlock = memo(({ onRetry }) => (
  <div className="py-12 text-center border-2 border-dashed border-red-100 rounded-3xl mb-8 bg-red-50/50">
    <AlertCircle size={24} className="mx-auto mb-3 text-red-400" />
    <p className="text-[11px] font-black uppercase text-red-500 tracking-widest mb-4">
      Something went wrong.
    </p>
    <button
      onClick={onRetry}
      className="text-[10px] font-black uppercase border-b-2 border-red-500 pb-1 text-red-600 hover:text-red-800"
    >
      <RefreshCw size={12} className="inline mr-1" /> Retry
    </button>
  </div>
));

const EmptyState = memo(({ hasFilters, onClear }) => (
  <div className="py-20 mt-10 text-center border-2 border-dashed border-zinc-100 rounded-3xl">
    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-4">
      No matching threads found.
    </p>
    {hasFilters && (
      <button
        onClick={onClear}
        className="text-[10px] font-black uppercase border-b-2 border-black pb-1 hover:text-red-600"
      >
        Reset Filters
      </button>
    )}
  </div>
));

const ProductGrid = memo(({ products, isLoading, isFetchingMore }) => {
  if (isLoading && !isFetchingMore) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-8 gap-y-10 md:gap-y-16">
        {SKELETON_ITEMS.map((i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-8 gap-y-10 md:gap-y-16">
      {products.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
});

// ═════════════════════════════════════════════════════════════
// ─── MAIN COMPONENT ─────────────────────────────────────────
// ═════════════════════════════════════════════════════════════
const Clothes = () => {
  const { state, params, options, actions } = useProductFilters();
  const [isMobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isMobileFilterOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileFilterOpen]);

  const activeFilterCount = useMemo(
    () =>
      params.selectedCats.length +
      params.selectedSizes.length +
      params.selectedColors.length,
    [params.selectedCats, params.selectedSizes, params.selectedColors],
  );

  const displayTitle = useMemo(() => getDisplayTitle(params), [params]);
  const totalPieces = state.meta?.total || state.allProducts.length;

  const activeTabType = useMemo(() => {
    if (params.genderParam) return `gender:${params.genderParam}`;
    if (params.subCategoryParam)
      return `subCategory:${params.subCategoryParam}`;
    if (params.categoryParam) return `category:${params.categoryParam}`;
    if (params.newArrivalParam) return "newArrival";
    return "all";
  }, [params]);

  const handleTabClick = useCallback(
    (tab) => {
      actions.setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        ["newArrival", "cats", "sizes", "colors"].forEach((k) =>
          next.delete(k),
        );
        if (tab.type === "all") {
          ["gender", "category", "subCategory"].forEach((k) => next.delete(k));
        } else {
          next.set(tab.type, tab.val);
          if (tab.type === "gender") {
            ["category", "subCategory"].forEach((k) => next.delete(k));
          } else {
            next.delete("gender");
          }
        }
        return next;
      });
    },
    [actions],
  );

  const handleSortChange = useCallback(
    (e) => {
      const val = e.target.value;
      actions.setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("sort", val);
        return next;
      });
    },
    [actions],
  );

  const filterProps = useMemo(
    () => ({
      ...options,
      selectedCats: params.selectedCats,
      selectedSizes: params.selectedSizes,
      selectedColors: params.selectedColors,
      toggleCat: actions.toggleCat,
      toggleSize: actions.toggleSize,
      toggleColor: actions.toggleColor,
      onClear: actions.handleClearFilters,
    }),
    [options, params, actions],
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-white via-white to-zinc-50 selection:bg-black selection:text-white relative overflow-hidden">
        <SEO
          title={`Buy ${displayTitle}`}
          description={`Discover ${displayTitle} from Krumeku.`}
        />

        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

        <nav className="bg-white/80 backdrop-blur-xl border-b-2 border-zinc-100 sticky top-0 z-40 overflow-x-auto no-scrollbar shadow-sm">
          <div className="max-w-[1600px] mx-auto px-4 md:px-12 flex gap-8 whitespace-nowrap min-w-max">
            {QUICK_TABS.map((tab, idx) => (
              <motion.div
                key={tab.label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <TabButton
                  tab={tab}
                  isActive={
                    tab.type === "all"
                      ? activeTabType === "all"
                      : activeTabType === `${tab.type}:${tab.val}`
                  }
                  onClick={() => handleTabClick(tab)}
                />
              </motion.div>
            ))}
          </div>
        </nav>

        <div className="py-8 md:py-12 bg-white/50 backdrop-blur-sm border-b-2 border-zinc-100">
          <div className="max-w-[1600px] mx-auto px-4 md:px-12 relative z-10">
            {(params.queryParam || params.newArrivalParam) && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 flex items-center gap-3 bg-red-50/50 border-l-4 border-red-600 pl-4 pr-4 py-3 rounded-r-lg"
              >
                <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-700">
                  {params.newArrivalParam
                    ? "NEW DROPS"
                    : `SEARCH: ${params.queryParam}`}
                </span>
                <button
                  onClick={actions.handleClearSearch}
                  className="ml-auto text-zinc-400 hover:text-black transition-colors"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2"
              >
                <div className="flex items-baseline gap-4 flex-wrap">
                  <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic leading-none">
                    {displayTitle}
                  </h1>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest hidden md:block">
                    / {totalPieces} PIECES
                  </span>
                </div>
                {params.subCategoryParam === "Embroidered" && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-[11px] md:text-xs font-bold text-red-600 uppercase tracking-widest flex items-center gap-2 mt-1"
                  >
                    <Scissors size={12} className="text-black" /> 100% IN-HOUSE
                    MACHINE EMBROIDERED
                  </motion.p>
                )}
                {activeFilterCount > 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="text-[10px] font-black text-red-600 uppercase tracking-widest mt-2 flex items-center gap-2"
                  >
                    <TrendingUp size={12} />
                    {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}{" "}
                    active ·{" "}
                    <button
                      onClick={actions.handleClearFilters}
                      className="underline hover:text-black transition-colors"
                    >
                      Clear
                    </button>
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full md:w-auto flex gap-2"
              >
                <div className="relative flex-1 md:flex-none">
                  <select
                    value={params.sortParam}
                    onChange={handleSortChange}
                    className="w-full md:min-w-[200px] bg-white text-black py-3 px-4 text-[9px] font-black uppercase tracking-widest border-2 border-zinc-200 hover:border-black rounded-lg appearance-none outline-none cursor-pointer transition-colors"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-4 md:px-12 pb-20 flex gap-12 relative z-10">
          <aside className="hidden lg:block w-64 shrink-0 sticky top-24 h-fit">
            <FilterSidebar {...filterProps} />
          </aside>

          <main className="flex-1 min-w-0">
            {state.isError && !state.isLoading && (
              <ErrorBlock onRetry={() => actions.fetchProducts(1)} />
            )}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ProductGrid
                products={state.allProducts}
                isLoading={state.isLoading}
                isFetchingMore={state.isFetchingMore}
              />
            </motion.div>
            {!state.isLoading &&
              !state.isError &&
              state.allProducts.length === 0 && (
                <EmptyState
                  hasFilters={activeFilterCount > 0}
                  onClear={actions.handleClearFilters}
                />
              )}
            {state.meta?.hasMore && state.allProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-20 text-center"
              >
                <Button
                  variant="outline"
                  className="px-12 py-4 uppercase tracking-[0.2em] font-black text-[11px] border-2 hover:bg-black hover:text-white transition-all"
                  disabled={state.isFetchingMore || state.isLoading}
                  onClick={() =>
                    actions.fetchProducts((state.meta?.page ?? 1) + 1)
                  }
                >
                  {state.isFetchingMore ? (
                    <Loader2 className="animate-spin w-4 h-4 mx-auto" />
                  ) : (
                    "Load More Premium Pieces"
                  )}
                </Button>
              </motion.div>
            )}
          </main>
        </div>

        {/* 📱 MOBILE FILTER TRIGGER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <Button
            variant="primary"
            className="rounded-full shadow-2xl px-8 py-4 font-black uppercase text-[10px]"
            icon={SlidersHorizontal}
            onClick={() => setMobileFilterOpen(true)}
          >
            Refine{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </Button>
        </motion.div>

        {/* 📱 MOBILE FILTER DRAWER */}
        {isMobileFilterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex justify-end"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileFilterOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative bg-white w-[85%] h-full p-8 overflow-y-auto rounded-l-2xl flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-zinc-100">
                <h2 className="text-xl font-black uppercase italic">Refine</h2>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <FilterSidebar {...filterProps} />
              </div>
              <div className="pt-6 border-t-2 border-zinc-100 mt-6 flex flex-col gap-3">
                <Button
                  variant="primary"
                  className="w-full h-14 font-black uppercase"
                  onClick={() => setMobileFilterOpen(false)}
                >
                  Show Results
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};

export default Clothes;
