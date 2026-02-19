import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { logout } from "../features/auth/authSlice";
import { getMyOrders, cancelOrderUser } from "../features/orders/orderSlice";
import {
  fetchWishlist,
  removeFromWishlist,
} from "../features/wishlist/wishlistSlice";
import {
  User,
  Package,
  Heart,
  LogOut,
  Settings,
  Box,
  Loader2,
  Trash2,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

// 🔥 FIXED: Cloudinary Helper (Now handles Strings & Objects properly)
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dftticvtc";
const getImgUrl = (imgId) => {
  if (!imgId) return "https://placehold.co/400x600/000000/FFFFFF?text=No+Image";

  if (typeof imgId === "object") {
    if (imgId.url) return imgId.url;
    if (imgId.secure_url) return imgId.secure_url;
    if (imgId.public_id)
      return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,w_300,q_auto,f_auto/${imgId.public_id}`;
  }

  if (typeof imgId === "string" && imgId.startsWith("http")) return imgId;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,w_300,q_auto,f_auto/${imgId}`;
};

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux States
  const { user, isLoading: authLoading } = useSelector((state) => state.auth);
  const { orders, isLoading: ordersLoading } = useSelector(
    (state) => state.order,
  );
  const { wishlistItems, isLoading: wishlistLoading } = useSelector(
    (state) => state.wishlist,
  );

  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }
    if (user) {
      dispatch(getMyOrders());
      dispatch(fetchWishlist());
    }
  }, [user, authLoading, dispatch, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  if (authLoading || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-black" size={40} />
      </div>
    );
  }

  // Stats
  const totalOrders = orders?.length || 0;
  const totalSpent =
    orders?.reduce((acc, order) => acc + order.totalPrice, 0) || 0;
  const wishlistCount = wishlistItems?.length || 0;

  const getStatusStyle = (status) => {
    const styles = {
      Delivered: "bg-green-100 text-green-700 border-green-200",
      Shipped: "bg-blue-100 text-blue-700 border-blue-200",
      Processing: "bg-orange-100 text-orange-700 border-orange-200",
      Cancelled: "bg-red-100 text-red-700 border-red-200",
    };
    return styles[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-black text-white p-6 md:p-8 rounded-[1.5rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2 relative z-10">
                  Total Spent
                </p>
                <h3 className="text-3xl md:text-4xl font-black italic relative z-10">
                  ₹{totalSpent.toLocaleString("en-IN")}
                </h3>
              </div>
              <div className="bg-zinc-50 border border-zinc-100 p-6 md:p-8 rounded-[1.5rem]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">
                  Total Orders
                </p>
                <h3 className="text-3xl md:text-4xl font-black italic">
                  {totalOrders}
                </h3>
              </div>
              <div className="bg-zinc-50 border border-zinc-100 p-6 md:p-8 rounded-[1.5rem]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">
                  Wishlist Items
                </p>
                <h3 className="text-3xl md:text-4xl font-black italic">
                  {wishlistCount}
                </h3>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-zinc-800">
                  <Package size={16} /> Recent Activity
                </h3>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black"
                >
                  View All
                </button>
              </div>

              {ordersLoading ? (
                <div className="py-10 flex justify-center">
                  <Loader2 className="animate-spin text-zinc-300" />
                </div>
              ) : orders?.length > 0 ? (
                <div className="bg-white border border-zinc-100 rounded-[1.5rem] overflow-hidden shadow-sm">
                  {orders.slice(0, 3).map((order) => (
                    <div
                      key={order._id}
                      className="p-5 md:p-6 border-b border-zinc-50 last:border-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-400 shrink-0">
                          <Box size={20} />
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-widest text-zinc-800 mb-1">
                            ID: #{order._id.slice(-8)}
                          </p>
                          <p className="text-[9px] text-zinc-400 font-bold uppercase">
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-IN",
                            )}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-4 py-1.5 text-[9px] font-black uppercase rounded-lg border w-fit ${getStatusStyle(order.orderStatus)}`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 bg-zinc-50 border border-zinc-100 rounded-[1.5rem] text-center">
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                    No recent activity found
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case "orders":
        return (
          <div className="space-y-4 animate-in fade-in duration-500">
            {!orders || orders.length === 0 ? (
              <div className="py-20 text-center bg-zinc-50 rounded-[1.5rem] border border-dashed border-zinc-200">
                <Package size={40} className="mx-auto text-zinc-300 mb-4" />
                <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                  No orders placed yet
                </p>
              </div>
            ) : (
              orders.map((order) => {
                const item = order.orderItems[0];
                return (
                  <div
                    key={order._id}
                    className="bg-white border border-zinc-200 p-4 md:p-6 rounded-[1.5rem] flex flex-col md:flex-row justify-between gap-4 md:gap-6 shadow-sm hover:border-black transition-all"
                  >
                    <div className="flex gap-4 md:gap-6">
                      {/* 🔥 Image fixed here */}
                      <div className="w-20 h-24 md:w-24 md:h-28 bg-zinc-50 rounded-xl border border-zinc-100 overflow-hidden flex-shrink-0">
                        <img
                          src={getImgUrl(item?.image)}
                          className="w-full h-full object-cover"
                          alt="product"
                          onError={(e) => {
                            e.target.src =
                              "https://placehold.co/400x600/000000/FFFFFF?text=Image+Error";
                          }}
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <p className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-1">
                          ID: #{order._id.slice(-8)}
                        </p>
                        <h3 className="text-sm md:text-base font-black uppercase italic leading-tight truncate max-w-[200px] md:max-w-xs mb-2">
                          {item?.productName || "Premium Piece"}
                        </h3>
                        <p className="text-sm md:text-lg font-black italic mb-2">
                          ₹{order.totalPrice.toLocaleString("en-IN")}
                        </p>

                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-3 py-1 text-[9px] font-black uppercase rounded-md border ${getStatusStyle(order.orderStatus)}`}
                          >
                            {order.orderStatus}
                          </span>
                          {order.returnInfo?.isReturnRequested && (
                            <span className="flex items-center gap-1 text-[9px] font-black uppercase bg-orange-50 text-orange-600 border border-orange-200 px-2 py-1 rounded-md">
                              <RotateCcw size={10} />{" "}
                              {order.returnInfo.status || "Requested"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-start md:justify-end gap-3 border-t md:border-t-0 border-zinc-100 pt-4 md:pt-0">
                      <Link
                        to={`/order/${order._id}`}
                        className="bg-black text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-zinc-800 transition-colors w-full md:w-auto text-center flex items-center justify-center gap-2"
                      >
                        Details <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        );

      case "wishlist":
        return (
          <div className="animate-in fade-in duration-500">
            {!wishlistItems || wishlistItems.length === 0 ? (
              <div className="py-20 text-center bg-zinc-50 rounded-[1.5rem] border border-dashed border-zinc-200">
                <Heart size={40} className="mx-auto text-zinc-300 mb-4" />
                <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                  Your archive is empty
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {wishlistItems.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white border border-zinc-100 p-3 md:p-4 rounded-2xl relative group hover:shadow-xl transition-all cursor-pointer"
                    onClick={() =>
                      navigate(`/product/${item.slug || item._id}`)
                    }
                  >
                    <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden mb-3 bg-zinc-50">
                      {/* 🔥 Image fixed here */}
                      <img
                        src={getImgUrl(item.images?.[0])}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        alt="wish"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(removeFromWishlist(item._id));
                        }}
                        className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full text-zinc-400 hover:text-red-500 shadow-sm active:scale-90 transition-all z-10 md:opacity-0 md:group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="px-1">
                      <p className="text-[10px] md:text-xs font-black uppercase tracking-wider truncate mb-1 text-zinc-800 italic">
                        {item.productName}
                      </p>
                      <p className="text-sm font-black italic">
                        ₹{item.price.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "settings":
        return (
          <div className="bg-white border border-zinc-200 p-6 md:p-10 rounded-[1.5rem] max-w-xl animate-in fade-in">
            <h3 className="text-lg font-black uppercase italic mb-8 flex items-center gap-2 border-b border-zinc-100 pb-4">
              <Settings size={20} className="text-zinc-400" /> Account
              Configuration
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">
                  Full Name
                </label>
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm text-zinc-800 uppercase">
                  {user.fullName}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">
                  Email Address
                </label>
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm text-zinc-500">
                  {user.email}
                </div>
              </div>
              <button
                onClick={() => alert("Profile updates will be available soon.")}
                className="w-full py-4 mt-4 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-colors shadow-lg"
              >
                Update Details
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 md:pt-32 pb-20 selection:bg-black selection:text-white overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-zinc-50 border border-zinc-100 p-6 md:p-8 rounded-[2rem] mb-10 md:mb-12 gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] bg-black text-white flex items-center justify-center text-3xl font-black uppercase shadow-xl shrink-0 italic">
              {user.fullName?.[0]}
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic leading-none mb-2">
                {user.fullName}
              </h1>
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-400">
                {user.email}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all w-full md:w-auto shrink-0 active:scale-95"
          >
            <LogOut size={14} /> Terminate Session
          </button>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Navigation Sidebar */}
          <nav className="lg:col-span-3 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 no-scrollbar items-start">
            {[
              { id: "overview", label: "Overview", icon: User },
              { id: "orders", label: "My Orders", icon: Package },
              { id: "wishlist", label: "Saved Archive", icon: Heart },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-5 lg:px-6 py-3.5 lg:py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap lg:w-full border ${
                  activeTab === tab.id
                    ? "bg-black text-white border-black shadow-lg pl-6 lg:pl-8"
                    : "bg-white text-zinc-500 border-zinc-200 hover:border-black hover:text-black hover:bg-zinc-50"
                }`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </nav>

          {/* Content Area */}
          <div className="lg:col-span-9 min-h-[50vh]">{renderContent()}</div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
