import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Loader2,
  Trash2,
  Edit,
  Plus,
  Search,
  Filter,
  Package,
  AlertTriangle,
  TrendingUp,
  Star,
  ArrowUpRight,
  X,
} from "lucide-react";
import {
  getAdminProducts,
  deleteProduct,
} from "../../features/admin/adminSlice";

const CATEGORY_OPTIONS = [
  "T-Shirts",
  "Shirts",
  "Hoodies",
  "Trousers",
  "Kurta",
  "Jacket",
  "Sweater",
  "Jeans",
  "Ethnic Wear",
];

// ── Delete Confirmation Modal ──────────────────────────────────────────────────
const DeleteModal = ({ product, onConfirm, onCancel }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Icon + Close */}
        <div className="flex items-start justify-between mb-5">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <Trash2 size={20} className="text-red-600" />
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Text */}
        <h2 className="text-lg font-black uppercase italic tracking-tight mb-2">
          Delete product?
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-4">
          <span className="font-black text-gray-800">
            {product.productName}
          </span>{" "}
          will be permanently removed from your store. This action cannot be
          undone.
        </p>

        {/* Warning note */}
        <div className="flex gap-3 items-start bg-orange-50 border border-orange-100 rounded-xl p-3 mb-6">
          <AlertTriangle
            size={15}
            className="text-orange-500 flex-shrink-0 mt-0.5"
          />
          <p className="text-[11px] font-bold text-orange-700 leading-relaxed">
            Existing orders linked to this product will not be affected, but it
            will no longer appear in your store.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Trash2 size={13} strokeWidth={3} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const AllProducts = () => {
  const dispatch = useDispatch();
  const { products = [], isLoading } = useSelector((state) => state.admin);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Delete modal state — stores full product object so we can show name
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    dispatch(getAdminProducts());
  }, [dispatch]);

  // Opens modal with the selected product
  const handleDelete = useCallback((product) => {
    setDeleteTarget(product);
  }, []);

  // Confirmed — dispatch and close
  const confirmDelete = useCallback(() => {
    if (deleteTarget) {
      dispatch(deleteProduct(deleteTarget._id));
      setDeleteTarget(null);
    }
  }, [dispatch, deleteTarget]);

  // Cancelled — just close
  const cancelDelete = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return products.filter((product) => {
      const matchesSearch = product.productName.toLowerCase().includes(query);
      const matchesCategory =
        categoryFilter === "All" || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  const stats = useMemo(() => {
    const totalValue = filteredProducts.reduce((acc, curr) => {
      const totalStock =
        curr.sizes?.reduce((sum, s) => sum + (Number(s.stock) || 0), 0) || 0;
      return acc + Number(curr.price) * totalStock;
    }, 0);

    const lowStockCount = filteredProducts.filter((p) => {
      const totalStock =
        p.sizes?.reduce((sum, s) => sum + (Number(s.stock) || 0), 0) || 0;
      return totalStock <= 5;
    }).length;

    return { totalValue, lowStockCount };
  }, [filteredProducts]);

  if (isLoading && products.length === 0)
    return (
      <div
        className="flex flex-col justify-center items-center h-[60vh]"
        role="status"
      >
        <Loader2 className="animate-spin w-10 h-10 text-black mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
          Syncing Catalog...
        </p>
      </div>
    );

  return (
    <>
      {/* Delete Modal */}
      <DeleteModal
        product={deleteTarget}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 overflow-x-hidden">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 bg-black p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic">
              Product <span className="text-blue-500">Inventory</span>
            </h1>
            <p className="text-gray-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] mt-1.5 opacity-80">
              Control Center / {filteredProducts.length} Items Found
            </p>
          </div>
          <Link
            to="/admin/product/new"
            className="w-full md:w-auto justify-center bg-white text-black px-6 py-4 md:py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-blue-500 hover:text-white transition-all shadow-lg active:scale-95"
          >
            <Plus size={14} strokeWidth={3} /> Add New Entry
          </Link>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <StatCard
            icon={<Package size={20} />}
            title="Archive Size"
            value={filteredProducts.length}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <StatCard
            icon={<TrendingUp size={20} />}
            title="Stock Valuation"
            value={`₹${stats.totalValue.toLocaleString("en-IN")}`}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <StatCard
            icon={<AlertTriangle size={20} />}
            title="Critically Low"
            value={stats.lowStockCount}
            color="text-orange-600"
            bg="bg-orange-50"
            alert={stats.lowStockCount > 0}
          />
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 p-1 rounded-[1.5rem]">
          <div className="relative flex-1 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by product name..."
              aria-label="Search catalog"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-xl focus:border-black outline-none font-bold text-[10px] md:font-black uppercase tracking-widest transition-all shadow-sm"
            />
          </div>
          <div className="relative">
            <Filter
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <select
              aria-label="Filter by category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full md:w-auto pl-12 pr-10 py-4 bg-white border border-gray-100 rounded-xl focus:border-black outline-none font-bold text-[10px] md:font-black uppercase tracking-widest appearance-none cursor-pointer min-w-[200px] shadow-sm"
            >
              <option value="All">All Categories</option>
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product List */}
        <main>
          {filteredProducts.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left" role="grid">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="p-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] italic">
                        Artifact Info
                      </th>
                      <th className="p-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] italic">
                        Valuation
                      </th>
                      <th className="p-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] italic">
                        Stock Status
                      </th>
                      <th className="p-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] italic text-right">
                        Ops
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredProducts.map((product) => (
                      <ProductRow
                        key={product._id}
                        product={product}
                        onDelete={handleDelete}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden flex flex-col gap-4">
                {filteredProducts.map((product) => (
                  <ProductMobileCard
                    key={product._id}
                    product={product}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────────

const ProductRow = React.memo(({ product, onDelete }) => (
  <tr className="group hover:bg-gray-50/50 transition-all duration-300">
    <td className="p-6">
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 shadow-inner flex-shrink-0">
          <img
            src={product.images?.[0]?.url || "/placeholder.png"}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-black text-xs uppercase italic truncate max-w-[200px]">
              {product.productName}
            </p>
            {product.isFeatured && (
              <Star
                size={12}
                className="text-yellow-500 fill-yellow-500 flex-shrink-0"
              />
            )}
          </div>
          <span className="text-[8px] font-black px-2 py-0.5 bg-black text-white rounded tracking-tighter">
            ID: {product._id.slice(-6)}
          </span>
        </div>
      </div>
    </td>
    <td className="p-6">
      <p className="font-black text-sm italic text-gray-900 mb-1">
        ₹{Number(product.price).toLocaleString("en-IN")}
      </p>
      <span className="text-[9px] font-black uppercase text-blue-500 italic bg-blue-50 px-2 py-0.5 rounded-md">
        {product.category}
      </span>
    </td>
    <td className="p-6">
      <div className="flex flex-wrap gap-1.5">
        {(product.sizes || []).map((s, i) => (
          <div
            key={i}
            className={`px-2 py-1 flex flex-col items-center border rounded-md ${
              Number(s.stock) <= 5
                ? "bg-red-50 border-red-200 text-red-600 animate-pulse"
                : "bg-white text-gray-800"
            }`}
          >
            <span className="text-[7px] font-black">{s.label}</span>
            <span className="text-[9px] font-bold">{s.stock}</span>
          </div>
        ))}
      </div>
    </td>
    <td className="p-6 text-right">
      <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-all">
        <Link
          to={`/admin/product/${product._id}`}
          className="p-3 bg-gray-100 hover:bg-black hover:text-white rounded-xl transition-all"
          aria-label={`Edit ${product.productName}`}
        >
          <Edit size={14} />
        </Link>
        <button
          onClick={() => onDelete(product)}
          className="p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all"
          aria-label={`Delete ${product.productName}`}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </td>
  </tr>
));
ProductRow.displayName = "ProductRow";

const ProductMobileCard = React.memo(({ product, onDelete }) => (
  <div className="bg-white p-4 rounded-[1.5rem] border border-gray-100 shadow-sm space-y-4">
    <div className="flex gap-4">
      <img
        src={product.images?.[0]?.url || "/placeholder.png"}
        alt=""
        className="w-20 h-28 rounded-xl object-cover"
      />
      <div className="flex-1 min-w-0 py-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[8px] font-black px-2 py-0.5 bg-black text-white rounded uppercase">
            ID: {product._id.slice(-6)}
          </span>
          {product.isFeatured && (
            <Star size={10} className="text-yellow-500 fill-yellow-500" />
          )}
        </div>
        <h3 className="font-black text-sm uppercase italic leading-tight truncate">
          {product.productName}
        </h3>
        <p className="font-black text-lg italic mt-2">
          ₹{Number(product.price).toLocaleString("en-IN")}
        </p>
        <span className="inline-block mt-2 text-[8px] font-black uppercase text-blue-500 italic bg-blue-50 px-2 py-1 rounded-md">
          {product.category}
        </span>
      </div>
    </div>
    <div className="flex gap-2 border-t border-gray-50 pt-3">
      <Link
        to={`/admin/product/${product._id}`}
        className="flex-1 py-3 bg-gray-50 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
      >
        <Edit size={14} /> Edit
      </Link>
      <button
        onClick={() => onDelete(product)}
        className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
      >
        <Trash2 size={14} /> Delete
      </button>
    </div>
  </div>
));
ProductMobileCard.displayName = "ProductMobileCard";

const StatCard = ({ icon, title, value, color, bg, alert }) => (
  <div
    className={`p-6 rounded-[1.8rem] border border-gray-100 shadow-sm flex items-center gap-4 bg-white transition-all hover:shadow-xl ${
      alert ? "ring-2 ring-orange-500/20" : ""
    }`}
  >
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color} shadow-inner shrink-0`}
    >
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">
        {title}
      </p>
      <p className="text-xl font-black italic tracking-tighter truncate">
        {value}
      </p>
    </div>
    <div className="ml-auto opacity-5 hidden sm:block">
      <ArrowUpRight size={32} />
    </div>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-24 flex flex-col items-center">
    <Package size={64} className="text-gray-100 mb-4" />
    <h3 className="text-xl font-black uppercase italic">Inventory Empty</h3>
    <Link
      to="/admin/product/new"
      className="mt-6 px-8 py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-lg"
    >
      Deploy First Product
    </Link>
  </div>
);

export default AllProducts;
