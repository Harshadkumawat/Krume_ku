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
    if (window.confirm("Permanently delete this artifact?")) {
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

  // --- 📊 Real Stats (Production Logic Fixed) ---
  // Inventory Value = Sum of (Price * Total Stock of all sizes)
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
          Loading Archive...
        </p>
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* --- 1. HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-black p-8 rounded-[2rem] text-white shadow-2xl">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter italic">
            Inventory <span className="text-blue-500">Archive</span>
          </h2>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">
            Global Stock Control Unit
          </p>
        </div>
        <Link
          to="/admin/product/new"
          className="bg-white text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-lg active:scale-95"
        >
          <Plus size={14} strokeWidth={3} /> Register New Asset
        </Link>
      </div>

      {/* --- 2. STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<Package size={20} />}
          title="Active Units"
          value={filteredProducts.length}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          title="Net Asset Value"
          value={`₹${totalValue.toLocaleString("en-IN")}`}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          title="Critical Stock"
          value={lowStockCount}
          color="text-orange-600"
          bg="bg-orange-50"
          alert={lowStockCount > 0}
        />
      </div>

      {/* --- 3. SEARCH & FILTERS --- */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm sticky top-24 z-20 backdrop-blur-md bg-white/80">
        <div className="relative flex-1 group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="QUERY ARCHIVE BY NAME..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-black/5 outline-none font-black text-[10px] uppercase tracking-widest transition-all"
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
            className="pl-12 pr-10 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black/5 outline-none font-black text-[10px] uppercase tracking-widest appearance-none cursor-pointer min-w-[200px]"
          >
            <option value="All">All Classifications</option>
            <option value="T-Shirts">T-Shirts</option>
            <option value="Shirts">Shirts</option>
            <option value="Trousers">Trousers</option>
            <option value="Jacket">Jackets</option>
          </select>
        </div>
      </div>

      {/* --- 4. DATA TABLE --- */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        {filteredProducts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="p-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] italic">
                    Product Identity
                  </th>
                  <th className="p-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] italic">
                    Financials
                  </th>
                  <th className="p-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] italic">
                    Stock Matrix
                  </th>
                  <th className="p-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] italic text-right">
                    Operations
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.map((product) => {
                  const itemTotalStock =
                    product.sizes?.reduce(
                      (sum, s) => sum + (Number(s.stock) || 0),
                      0,
                    ) || 0;
                  return (
                    <tr
                      key={product._id}
                      className="group hover:bg-gray-50/50 transition-all duration-300"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-5">
                          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-inner">
                            <img
                              src={
                                product.images?.[0]?.url ||
                                "https://via.placeholder.com/150"
                              }
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-black text-xs uppercase italic tracking-tight">
                                {product.productName}
                              </p>
                              {product.isFeatured && (
                                <Star
                                  size={10}
                                  className="text-yellow-500 fill-yellow-500"
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
                        <p className="font-black text-sm italic text-gray-900">
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </p>
                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 italic bg-blue-50 px-2 py-0.5 rounded-md">
                          {product.category}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-wrap gap-2">
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---
const StatCard = ({ icon, title, value, color, bg, alert }) => (
  <div
    className={`p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 bg-white transition-all hover:shadow-xl hover:-translate-y-1 ${alert ? "ring-2 ring-red-500/20" : ""}`}
  >
    <div
      className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bg} ${color} shadow-inner`}
    >
      {icon}
    </div>
    <div>
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
        {title}
      </p>
      <h3 className="text-2xl font-black italic text-gray-900 tracking-tighter">
        {value}
      </h3>
    </div>
    <div className="ml-auto opacity-10">
      <ArrowUpRight size={40} />
    </div>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-32 flex flex-col items-center">
    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
      <Package className="text-gray-200" size={40} />
    </div>
    <h3 className="text-xl font-black uppercase italic tracking-tighter">
      Registry is Empty
    </h3>
    <p className="text-[10px] text-gray-400 font-bold uppercase mt-2">
      No items found in the current archive segment.
    </p>
    <Link
      to="/admin/product/new"
      className="mt-8 px-8 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:scale-105 transition-all"
    >
      Initiate First Entry
    </Link>
  </div>
);

export default AllProducts;
