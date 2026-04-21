import { useEffect, useMemo, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
  getAllProducts,
  clearProductsList,
} from "../features/products/productSlice";

// ── Constants ────────────────────────────────────────────────
const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const DEFAULT_SORT = "newest";
const PAGE_LIMIT = 12;
const EMPTY_ARRAY = [];

// ── Pure helpers (defined once, never recreated) ─────────────
const normalizeStr = (v) =>
  String(v?.label ?? v?.name ?? v ?? "")
    .toUpperCase()
    .trim();

const parseList = (raw) =>
  raw
    ? raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : EMPTY_ARRAY;

const readList = (params, key) => parseList(params.get(key));

const writeList = (params, key, arr) => {
  if (arr.length) params.set(key, arr.join(","));
  else params.delete(key);
};

const toggle = (arr, val) =>
  arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

const sizeSorter = (a, b) => {
  const ai = SIZE_ORDER.indexOf(a);
  const bi = SIZE_ORDER.indexOf(b);
  return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
};

// ═════════════════════════════════════════════════════════════
// ─── HOOK ────────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════
export function useProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const abortRef = useRef(null);

  // ── Scalar params (strings = stable by value) ─────────────
  const genderParam = searchParams.get("gender");
  const queryParam = searchParams.get("q");
  const newArrivalParam = searchParams.get("newArrival");
  const categoryParam = searchParams.get("category");
  const subCategoryParam = searchParams.get("subCategory");
  const sortParam = searchParams.get("sort") || DEFAULT_SORT;

  // ── List params as RAW STRINGS (stable deps) ─────────────
  // Using raw strings instead of .join(",") hack in deps
  const catsRaw = searchParams.get("cats") || "";
  const sizesRaw = searchParams.get("sizes") || "";
  const colorsRaw = searchParams.get("colors") || "";

  // ── Parsed arrays (memoized by raw string) ───────────────
  const selectedCats = useMemo(() => parseList(catsRaw), [catsRaw]);
  const selectedSizes = useMemo(() => parseList(sizesRaw), [sizesRaw]);
  const selectedColors = useMemo(() => parseList(colorsRaw), [colorsRaw]);

  // ── Redux state ──────────────────────────────────────────
  const { products, isLoading, isFetchingMore, meta, isError, message } =
    useSelector((s) => s.products);

  // ── Fetch with clean deps ────────────────────────────────
  const fetchProducts = useCallback(
    (page = 1) => {
      // Cancel any in-flight request
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      const filters = {
        page,
        limit: PAGE_LIMIT,
        signal: abortRef.current.signal,
      };

      // Only attach non-default values
      if (genderParam) filters.gender = genderParam;
      if (queryParam) filters.q = queryParam;
      if (newArrivalParam) filters.newArrival = newArrivalParam;
      if (categoryParam) filters.category = categoryParam;
      if (subCategoryParam) filters.subCategory = subCategoryParam;
      if (sortParam !== DEFAULT_SORT) filters.sort = sortParam;

      // Use raw strings directly — no .join() needed
      if (catsRaw) filters.cats = catsRaw;
      if (sizesRaw) filters.sizes = sizesRaw;
      if (colorsRaw) filters.colors = colorsRaw;

      dispatch(getAllProducts(filters));
    },
    [
      dispatch,
      genderParam,
      queryParam,
      newArrivalParam,
      categoryParam,
      subCategoryParam,
      sortParam,
      catsRaw, // ← stable string, not array
      sizesRaw,
      colorsRaw,
    ],
  );

  // ── Auto-fetch on filter change ──────────────────────────
  useEffect(() => {
    dispatch(clearProductsList());
    fetchProducts(1);

    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchProducts, dispatch]);

  // ── Derived data ─────────────────────────────────────────
  const allProducts = useMemo(
    () => (Array.isArray(products) ? products : EMPTY_ARRAY),
    [products],
  );

  const filterOptions = useMemo(() => {
    const cats = new Set();
    const sizeSet = new Set();
    const colorSet = new Set();

    for (let i = 0; i < allProducts.length; i++) {
      const p = allProducts[i];
      if (p.category) cats.add(p.category);

      if (p.sizes) {
        for (let j = 0; j < p.sizes.length; j++) {
          sizeSet.add(normalizeStr(p.sizes[j]));
        }
      }

      if (p.colors) {
        for (let j = 0; j < p.colors.length; j++) {
          const v = normalizeStr(p.colors[j]);
          if (v) colorSet.add(v);
        }
      }
    }

    return {
      uniqueCats: [...cats].sort(),
      uniqueSizes: [...sizeSet].sort(sizeSorter),
      uniqueColors: [...colorSet].sort(),
    };
  }, [allProducts]);

  // ── Toggle factory (reads LATEST state from prev) ────────
  // FIX: Original had stale closure bug — `current` was
  // captured at render time. Rapid clicks would lose state.
  // Now reads from `prev` URLSearchParams inside the updater.
  const makeToggler = useCallback(
    (key) => (val) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        const current = readList(next, key); // ← always fresh
        writeList(next, key, toggle(current, val));
        return next;
      });
    },
    [setSearchParams],
  );

  // ── Stable toggle functions (only recreate if makeToggler changes) ──
  const toggleCat = useMemo(() => makeToggler("cats"), [makeToggler]);
  const toggleSize = useMemo(() => makeToggler("sizes"), [makeToggler]);
  const toggleColor = useMemo(() => makeToggler("colors"), [makeToggler]);

  // ── Clear actions ────────────────────────────────────────
  const handleClearFilters = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("cats");
      next.delete("sizes");
      next.delete("colors");
      return next;
    });
  }, [setSearchParams]);

  const handleClearSearch = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("q");
      next.delete("newArrival");
      return next;
    });
  }, [setSearchParams]);

  // ── Stable return objects ────────────────────────────────
  // Memoized so consumers using these as props/deps
  // don't trigger unnecessary re-renders
  const state = useMemo(
    () => ({ isLoading, isFetchingMore, isError, message, meta, allProducts }),
    [isLoading, isFetchingMore, isError, message, meta, allProducts],
  );

  const params = useMemo(
    () => ({
      genderParam,
      queryParam,
      newArrivalParam,
      categoryParam,
      subCategoryParam,
      sortParam,
      selectedCats,
      selectedSizes,
      selectedColors,
    }),
    [
      genderParam,
      queryParam,
      newArrivalParam,
      categoryParam,
      subCategoryParam,
      sortParam,
      selectedCats,
      selectedSizes,
      selectedColors,
    ],
  );

  const actions = useMemo(
    () => ({
      fetchProducts,
      setSearchParams,
      toggleCat,
      toggleSize,
      toggleColor,
      handleClearFilters,
      handleClearSearch,
    }),
    [
      fetchProducts,
      setSearchParams,
      toggleCat,
      toggleSize,
      toggleColor,
      handleClearFilters,
      handleClearSearch,
    ],
  );

  return { state, params, options: filterOptions, actions };
}
