import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import {
  getAdminProducts,
  deleteProduct,
} from "../../features/admin/adminSlice";

const AllProducts = () => {
  const dispatch = useDispatch();
  const { products, isLoading } = useSelector((state) => state.admin);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    dispatch(getAdminProducts());
  }, [dispatch]);

  const handleDelete = (id) => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete this product?",
      )
    ) {
      dispatch(deleteProduct(id));
    }
  };

  // --- 🧠 Smart Filtering ---
  const filteredProducts = (products || []).filter((product) => {
    const matchesSearch = product.productName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // --- 📊 Real Stats ---
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

  if (isLoading)
    return (
      <div className="flex flex-col justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin w-10 h-10 text-black mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
          Loading Inventory...
        </p>
      </div>
    );

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 overflow-x-hidden">
      {/* --- 1. HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 bg-black p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] text-white shadow-2xl">
        <div>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic">
            Product <span className="text-blue-500">Inventory</span>
          </h2>
          <p className="text-gray-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] mt-1.5">
            Manage your store catalogue
          </p>
        </div>
        <Link
          to="/admin/product/new"
          className="w-full md:w-auto justify-center bg-white text-black px-6 py-4 md:py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-lg active:scale-95"
        >
          <Plus size={14} strokeWidth={3} /> Add New Product
        </Link>
      </div>

      {/* --- 2. STATS CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <StatCard
          icon={<Package size={20} />}
          title="Total Products"
          value={filteredProducts.length}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          title="Inventory Value"
          value={`₹${totalValue.toLocaleString("en-IN")}`}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          title="Low Stock Alerts"
          value={lowStockCount}
          color="text-orange-600"
          bg="bg-orange-50"
          alert={lowStockCount > 0}
        />
      </div>

      {/* --- 3. SEARCH & FILTERS --- */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 bg-white p-4 md:p-5 rounded-[1.2rem] md:rounded-[1.5rem] border border-gray-100 shadow-sm sticky top-20 md:top-24 z-20 backdrop-blur-md bg-white/90">
        <div className="relative flex-1 group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 md:py-4 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-black/5 outline-none font-bold text-xs md:text-[10px] md:font-black uppercase tracking-wider md:tracking-widest transition-all"
          />
        </div>
        <div className="relative">
          <Filter
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-auto pl-12 pr-10 py-3.5 md:py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black/5 outline-none font-bold text-xs md:text-[10px] md:font-black uppercase tracking-wider md:tracking-widest appearance-none cursor-pointer min-w-[180px]"
          >
            <option value="All">All Categories</option>
            <option value="T-Shirts">T-Shirts</option>
            <option value="Shirts">Shirts</option>
            <option value="Trousers">Trousers</option>
            <option value="Jacket">Jackets</option>
          </select>
        </div>
      </div>

      {/* --- 4. LISTING AREA --- */}
      {filteredProducts.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* 🖥️ DESKTOP VIEW: TABLE LAYOUT */}
          <div className="hidden md:block bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="p-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] italic">
                    Product Details
                  </th>
                  <th className="p-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] italic">
                    Price & Category
                  </th>
                  <th className="p-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] italic">
                    Size & Stock
                  </th>
                  <th className="p-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] italic text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.map((product) => (
                  <tr
                    key={product._id}
                    className="group hover:bg-gray-50/50 transition-all duration-300"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-inner flex-shrink-0">
                          <img
                            src={
                              product.images?.[0]?.url ||
                              "https://via.placeholder.com/150"
                            }
                            alt={product.productName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-black text-xs uppercase italic tracking-tight line-clamp-2">
                              {product.productName}
                            </p>
                            {product.isFeatured && (
                              <Star
                                size={12}
                                className="text-yellow-500 fill-yellow-500 flex-shrink-0"
                              />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-black px-2 py-0.5 bg-black text-white rounded uppercase tracking-tighter">
                              ID: {product._id.slice(-6)}
                            </span>
                            <span className="text-[9px] text-gray-400 font-bold uppercase">
                              {product.gender}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="font-black text-sm italic text-gray-900 mb-1">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </p>
                      <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 italic bg-blue-50 px-2 py-0.5 rounded-md">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-wrap gap-2 max-w-[200px]">
                        {(product.sizes || []).map((s, i) => (
                          <div
                            key={i}
                            className={`px-2 py-1 flex flex-col items-center min-w-[36px] border rounded-lg transition-all ${Number(s.stock) <= 5 ? "bg-red-50 border-red-200 text-red-600 shadow-sm animate-pulse" : "bg-white border-gray-100 text-gray-900"}`}
                          >
                            <span className="text-[8px] font-black uppercase">
                              {s.label}
                            </span>
                            <span className="text-[10px] font-bold opacity-60">
                              {s.stock}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <Link
                          to={`/admin/product/${product._id}`}
                          className="p-3 bg-gray-100 hover:bg-black hover:text-white rounded-xl transition-all shadow-sm"
                        >
                          <Edit size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 📱 MOBILE VIEW: CARD LAYOUT (No Left-Right Scroll) */}
          <div className="md:hidden flex flex-col gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white p-4 rounded-[1.5rem] border border-gray-100 shadow-sm flex flex-col gap-4"
              >
                {/* Product Info */}
                <div className="flex gap-4">
                  <div className="w-24 h-32 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0">
                    <img
                      src={
                        product.images?.[0]?.url ||
                        "https://via.placeholder.com/150"
                      }
                      alt={product.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-center flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[8px] font-black px-2 py-0.5 bg-black text-white rounded uppercase tracking-tighter">
                        ID: {product._id.slice(-6)}
                      </span>
                      {product.isFeatured && (
                        <Star
                          size={10}
                          className="text-yellow-500 fill-yellow-500 flex-shrink-0"
                        />
                      )}
                    </div>
                    <h3 className="font-black text-sm uppercase italic tracking-tight line-clamp-2 leading-tight">
                      {product.productName}
                    </h3>
                    <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">
                      {product.gender}
                    </p>
                    <p className="font-black text-lg italic text-gray-900 mt-2">
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </p>
                    <div className="mt-2">
                      <span className="text-[8px] font-black uppercase tracking-widest text-blue-500 italic bg-blue-50 px-2 py-1 rounded-md">
                        {product.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sizes & Stock */}
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    Sizes & Stock
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(product.sizes || []).map((s, i) => (
                      <div
                        key={i}
                        className={`px-2 py-1 flex flex-col items-center min-w-[32px] border rounded-lg transition-all ${Number(s.stock) <= 5 ? "bg-red-50 border-red-200 text-red-600 shadow-sm animate-pulse" : "bg-white border-gray-100 text-gray-900"}`}
                      >
                        <span className="text-[8px] font-black uppercase">
                          {s.label}
                        </span>
                        <span className="text-[9px] font-bold opacity-60">
                          {s.stock}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions (Full Width Buttons) */}
                <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                  <Link
                    to={`/admin/product/${product._id}`}
                    className="flex-1 flex justify-center items-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-black rounded-xl transition-all shadow-sm text-[10px] font-black uppercase tracking-widest"
                  >
                    <Edit size={14} /> Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="flex-1 flex justify-center items-center gap-2 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all shadow-sm text-[10px] font-black uppercase tracking-widest"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// --- SUB-COMPONENTS ---
const StatCard = ({ icon, title, value, color, bg, alert }) => (
  <div
    className={`p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4 md:gap-5 bg-white transition-all hover:shadow-xl hover:-translate-y-1 ${alert ? "ring-2 ring-red-500/20" : ""}`}
  >
    <div
      className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center ${bg} ${color} shadow-inner flex-shrink-0`}
    >
      {icon}
    </div>
    <div>
      <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-[0.1em] md:tracking-[0.2em] mb-1">
        {title}
      </p>
      <h3 className="text-xl md:text-2xl font-black italic text-gray-900 tracking-tighter truncate">
        {value}
      </h3>
    </div>
    <div className="ml-auto opacity-10 hidden sm:block">
      <ArrowUpRight size={32} className="md:w-10 md:h-10" />
    </div>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-20 md:py-32 flex flex-col items-center px-4">
    <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 md:mb-6">
      <Package size={32} className="text-gray-200 md:w-10 md:h-10" />
    </div>
    <h3 className="text-lg md:text-xl font-black uppercase italic tracking-tighter">
      No Products Found
    </h3>
    <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase mt-2 text-center max-w-xs">
      Your inventory is currently empty. Add your first product to get started.
    </p>
    <Link
      to="/admin/product/new"
      className="mt-6 md:mt-8 w-full sm:w-auto px-8 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:scale-105 transition-all shadow-lg active:scale-95"
    >
      Add First Product
    </Link>
  </div>
);

export default AllProducts;
