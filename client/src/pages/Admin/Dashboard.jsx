import React, {
  useEffect,
  useState,
  useMemo,
  useLayoutEffect,
  useRef,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchStats } from "../../features/admin/adminSlice";
import { getAllUsers } from "../../features/auth/authSlice";
import {
  Loader2,
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  Plus,
  Activity,
  ShieldCheck,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  YAxis,
  CartesianGrid,
} from "recharts";

const Dashboard = () => {
  const dispatch = useDispatch();
  const containerRef = useRef(null);

  const { stats, isLoading: statsLoading } = useSelector(
    (state) => state.admin,
  );
  const { allUsers } = useSelector((state) => state.auth);
  const [range, setRange] = useState("daily");

  useEffect(() => {
    dispatch(fetchStats(range));
    dispatch(getAllUsers());
  }, [dispatch, range]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      // Recharts triggers internal resize
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const graphData = useMemo(() => {
    if (!stats?.salesData?.length) return [];

    return stats.salesData.map((item) => {
      let label = item._id;
      if (range === "daily" && label) {
        label = new Date(label).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        });
      } else if (range === "monthly" && label) {
        const parts = label.split("-");
        if (parts.length > 1) {
          label = new Date(parts[0], parts[1] - 1).toLocaleString("en-IN", {
            month: "short",
          });
        }
      }
      return {
        name: label || "N/A",
        amount: item.revenue || 0,
      };
    });
  }, [stats, range]);

  if (statsLoading || !stats) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin w-10 h-10 text-black mb-4" />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
          Loading Dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FA] pb-10 overflow-x-hidden selection:bg-black selection:text-white">
      <div className="p-4 lg:p-8 space-y-8">
        {/* Header */}
        <div className="bg-black text-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase leading-none">
              ADMIN <span className="text-blue-500">PANEL.</span>
            </h1>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.4em] mt-3 italic opacity-80">
              Overview & Analytics
            </p>
          </div>
          <Link
            to="/admin/product/new"
            className="relative z-10 px-8 py-4 bg-white text-black rounded-2xl text-[10px] font-bold uppercase flex items-center gap-2 shadow-xl hover:bg-blue-500 hover:text-white transition-all active:scale-95"
          >
            <Plus size={14} strokeWidth={3} /> Add Product
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard
            title="Total Revenue"
            value={`₹${(stats.totalSales || 0).toLocaleString("en-IN")}`}
            icon={<DollarSign size={20} />}
            bgIcon="bg-emerald-500"
            trend="Current Earnings"
          />
          <GlassCard
            title="Total Orders"
            value={stats.totalOrders || 0}
            icon={<ShoppingBag size={20} />}
            bgIcon="bg-blue-600"
            trend={`${stats.pendingOrders || 0} Pending`}
          />
          <GlassCard
            title="Total Users"
            value={allUsers?.length || 0}
            icon={<Users size={20} />}
            bgIcon="bg-purple-600"
            trend="Registered"
          />
          <GlassCard
            title="Low Stock"
            value={stats.lowStockProducts?.length || 0}
            icon={<AlertCircle size={20} />}
            bgIcon="bg-orange-600"
            trend="Action Required"
          />
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Chart */}
          <div className="xl:col-span-2 bg-white rounded-[3.5rem] p-8 lg:p-12 shadow-sm border border-gray-100 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-12">
              <h3 className="text-[12px] font-bold uppercase tracking-widest text-gray-900 italic flex items-center gap-3">
                <Activity size={18} className="text-blue-600" /> Sales Report
              </h3>
              <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
                {["daily", "monthly"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${
                      range === r
                        ? "bg-white text-black shadow-md"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div
              ref={containerRef}
              className="w-full min-h-[400px] h-full flex-grow"
            >
              {graphData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minHeight={350}>
                  <AreaChart
                    data={graphData}
                    margin={{ left: -20, right: 10, top: 10 }}
                  >
                    <defs>
                      <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#2563eb"
                          stopOpacity={0.15}
                        />
                        <stop
                          offset="95%"
                          stopColor="#2563eb"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="4 4"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 10,
                        fontWeight: "700",
                        fill: "#94a3b8",
                      }}
                      dy={15}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 10,
                        fontWeight: "700",
                        fill: "#94a3b8",
                      }}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#2563eb"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorAmt)"
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center space-y-4 opacity-30">
                  <Activity size={40} />
                  <p className="text-[10px] font-bold uppercase tracking-widest">
                    No Sales Data Yet
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* User List Sidebar */}
          <div className="bg-white rounded-[3.5rem] p-8 lg:p-10 shadow-sm border border-gray-100 flex flex-col">
            <h3 className="text-[12px] font-bold uppercase tracking-widest mb-10 text-gray-900 italic flex items-center gap-3">
              <Users size={18} className="text-purple-600" /> Recent Users
            </h3>
            <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar pr-2">
              {allUsers?.slice(0, 10).map((u) => (
                <div
                  key={u._id}
                  className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100/80 rounded-[2rem] transition-all group border border-transparent hover:border-gray-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-xs shadow-lg group-hover:scale-105 transition-transform overflow-hidden border-2 border-transparent group-hover:border-blue-500">
                      {u.avatar ? (
                        <img
                          src={u.avatar}
                          className="w-full h-full object-cover"
                          alt="avatar"
                        />
                      ) : (
                        u.fullName?.charAt(0) || "U"
                      )}
                    </div>
                    <div className="max-w-[120px]">
                      <p className="text-[11px] font-bold uppercase truncate tracking-tight">
                        {u.fullName}
                      </p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                        {u.isGoogleUser ? "Google" : "Email"}
                      </p>
                    </div>
                  </div>
                  {u.isGoogleUser ? (
                    <ShieldCheck size={16} className="text-blue-500" />
                  ) : (
                    <ArrowUpRight size={14} className="text-gray-300" />
                  )}
                </div>
              ))}
            </div>
            <Link
              to="/admin/users"
              className="mt-10 py-5 text-center text-[10px] font-bold uppercase tracking-[0.2em] bg-black text-white rounded-[1.5rem] hover:bg-blue-600 transition-all shadow-xl active:scale-95"
            >
              View All Users
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components
const GlassCard = ({ title, value, icon, bgIcon, trend }) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
    <div
      className={`w-14 h-14 rounded-2xl ${bgIcon} text-white flex items-center justify-center mb-8 shadow-xl group-hover:rotate-12 transition-transform`}
    >
      {icon}
    </div>
    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">
      {title}
    </p>
    <h3 className="text-3xl font-black text-gray-900 italic tracking-tighter">
      {value}
    </h3>
    <div className="h-1.5 w-full bg-gray-100 mt-6 rounded-full overflow-hidden">
      <div className={`h-full ${bgIcon} w-3/4 animate-pulse`}></div>
    </div>
    <div className="mt-4 flex items-center gap-2">
      <TrendingUp size={12} className="text-emerald-500" />
      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
        {trend}
      </p>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-black/90 text-white p-5 rounded-[1.5rem] shadow-2xl border border-white/10 backdrop-blur-xl">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
          {label}
        </p>
        <p className="text-xl font-black italic text-blue-400">
          ₹{payload[0].value.toLocaleString("en-IN")}
        </p>
      </div>
    );
  }
  return null;
};

export default Dashboard;
