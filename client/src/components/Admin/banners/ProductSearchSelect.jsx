import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Check } from "lucide-react";
import api from "../../../utils/api";


/**
 * Debounced product search + select.
 * Props:
 *  - value: currently selected product object ({ _id, productName, images, slug }) or null
 *  - onChange: (product) => void
 */
const ProductSearchSelect = ({ value, onChange }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  const search = useCallback(async (q) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      // tumhare existing /api/products list endpoint pe search param bhej rahe hain
      const { data } = await api.get("/api/products", {
        params: { search: q, limit: 8 },
      });
      setResults(data.data || data.products || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 350);
    return () => clearTimeout(debounceRef.current);
  }, [query, search]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
        Linked Product *
      </label>

      {value ? (
        <div className="flex items-center justify-between gap-3 border-2 border-zinc-900 px-4 py-3 bg-zinc-50">
          <div className="flex items-center gap-3 min-w-0">
            {value.images?.[0]?.url && (
              <img
                src={value.images[0].url}
                alt={value.productName}
                className="w-10 h-10 object-cover rounded"
              />
            )}
            <span className="text-[12px] font-bold truncate">
              {value.productName}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setQuery("");
            }}
            className="shrink-0 text-zinc-500 hover:text-red-600"
            aria-label="Clear selected product"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search product by name..."
            className="w-full pl-11 pr-4 py-3 border-2 border-zinc-900 text-[12px] font-bold outline-none focus:border-red-600 transition-colors"
          />

          {isOpen && (query.trim() || loading) && (
            <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white border-2 border-zinc-900 shadow-2xl max-h-72 overflow-y-auto">
              {loading && (
                <p className="p-4 text-[11px] font-bold text-zinc-400 uppercase">
                  Searching...
                </p>
              )}
              {!loading && results.length === 0 && query.trim() && (
                <p className="p-4 text-[11px] font-bold text-zinc-400 uppercase">
                  No products found
                </p>
              )}
              {!loading &&
                results.map((p) => (
                  <button
                    type="button"
                    key={p._id}
                    onClick={() => {
                      onChange(p);
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-100 transition-colors text-left border-b border-zinc-100 last:border-0"
                  >
                    {p.images?.[0]?.url && (
                      <img
                        src={p.images[0].url}
                        alt={p.productName}
                        className="w-10 h-10 object-cover rounded shrink-0"
                      />
                    )}
                    <span className="text-[12px] font-bold truncate flex-1">
                      {p.productName}
                    </span>
                    {value?._id === p._id && (
                      <Check size={16} className="text-red-600 shrink-0" />
                    )}
                  </button>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSearchSelect;
