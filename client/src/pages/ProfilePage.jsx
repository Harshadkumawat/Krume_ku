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
  MapPin,
  Heart,
  LogOut,
  Settings,
  Box,
  Loader2,
  ChevronRight,
  Trash2,
  AlertCircle,
} from "lucide-react";

// --- Cloudinary Helper (Clean) ---
const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dftticvtc";
const cldSrc = (img) => {
  if (!img) return "https://via.placeholder.com/150";
  if (img.public_id)
    return `https://res.cloudinary.com/${CLOUD}/image/upload/c_fill,w_300,q_auto,f_auto/${img.public_id}`;
  return img.secure_url || img.url || img;
};

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux States (Added isLoading)
  const { user, isLoading: authLoading } = useSelector((state) => state.auth);
  const { orders, isLoading: ordersLoading } = useSelector(
    (state) => state.order,
  );
  const { wishlistItems, isLoading: wishlistLoading } = useSelector(
    (state) => state.wishlist,
  );

  const [activeTab, setActiveTab] = useState("overview");

  // Logic for initial data fetch
  useEffect(() => {
    // Agar auth loading khatam ho gayi aur user nahi mila to hi redirect
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

  const handleCancel = (orderId) => {
    if (window.confirm("Bhai, pakka order cancel karna hai?")) {
      dispatch(cancelOrderUser(orderId));
    }
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
      Delivered: "bg-green-100 text-green-700",
      Shipped: "bg-blue-100 text-blue-700",
      Processing: "bg-orange-100 text-orange-700",
      Cancelled: "bg-red-100 text-red-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black text-white p-6 rounded-2xl shadow-xl">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">
                  Spent
                </p>
                <h3 className="text-3xl font-black">
                  ₹{totalSpent.toLocaleString("en-IN")}
                </h3>
              </div>
              <div className="bg-white border p-6 rounded-2xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Orders
                </p>
                <h3 className="text-3xl font-black">{totalOrders}</h3>
              </div>
              <div className="bg-white border p-6 rounded-2xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Wishlist
                </p>
                <h3 className="text-3xl font-black">{wishlistCount}</h3>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Package size={18} /> Recent Orders
              </h3>
              {ordersLoading ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : orders?.length > 0 ? (
                <div className="bg-white border rounded-2xl overflow-hidden">
                  {orders.slice(0, 3).map((order) => (
                    <div
                      key={order._id}
                      className="p-4 border-b last:border-0 flex items-center justify-between hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <Box size={20} className="text-gray-400" />
                        <div>
                          <p className="text-xs font-bold uppercase">
                            #{order._id.slice(-8)}
                          </p>
                          <p className="text-[10px] text-gray-400 font-bold">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full ${getStatusStyle(order.orderStatus)}`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No activity yet.</p>
              )}
            </div>
          </div>
        );

      case "orders":
        return (
          <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
            {orders?.map((order) => (
              <div
                key={order._id}
                className="bg-white border p-5 rounded-2xl flex flex-col md:flex-row justify-between gap-4"
              >
                <div className="flex gap-4">
                  <img
                    src={order.orderItems[0]?.image}
                    className="w-16 h-20 object-cover rounded-lg"
                    alt="product"
                  />
                  <div>
                    <p className="text-xs font-black uppercase">
                      Order #{order._id.slice(-12)}
                    </p>
                    <p className="text-[10px] text-gray-500 font-bold">
                      ₹{order.totalPrice}
                    </p>
                    <span
                      className={`inline-block mt-2 px-2 py-0.5 text-[10px] font-bold uppercase rounded ${getStatusStyle(order.orderStatus)}`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {order.orderStatus === "Processing" && (
                    <button
                      onClick={() => handleCancel(order._id)}
                      className="text-red-600 text-[10px] font-bold uppercase p-2 border border-red-100 rounded-lg hover:bg-red-50"
                    >
                      Cancel
                    </button>
                  )}
                  <Link
                    to={`/order/${order._id}`}
                    className="bg-black text-white text-[10px] font-bold uppercase px-4 py-2 rounded-lg"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        );

      case "wishlist":
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in">
            {wishlistItems?.map((item) => (
              <div
                key={item._id}
                className="bg-white border p-3 rounded-2xl relative group"
              >
                <img
                  src={cldSrc(item.images?.[0])}
                  className="w-full h-48 object-cover rounded-xl"
                  alt="wish"
                />
                <button
                  onClick={() => dispatch(removeFromWishlist(item._id))}
                  className="absolute top-5 right-5 p-2 bg-white/80 rounded-full text-red-500"
                >
                  <Trash2 size={14} />
                </button>
                <p className="mt-2 text-xs font-bold uppercase truncate">
                  {item.productName}
                </p>
                <p className="text-[10px] font-bold text-gray-500">
                  ₹{item.price}
                </p>
              </div>
            ))}
          </div>
        );

      case "settings":
        return (
          <div className="bg-white border p-8 rounded-2xl max-w-md">
            <h3 className="text-sm font-black uppercase mb-6">
              Profile Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400">
                  Full Name
                </label>
                <p className="p-3 bg-gray-50 rounded-xl font-bold text-sm">
                  {user.fullName}
                </p>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400">
                  Email
                </label>
                <p className="p-3 bg-gray-50 rounded-xl font-bold text-sm text-gray-400">
                  {user.email}
                </p>
              </div>
              <button
                onClick={() => alert("Profile update coming soon!")}
                className="w-full py-3 bg-black text-white text-xs font-bold uppercase rounded-xl"
              >
                Edit Profile
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-12 text-black">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-2xl font-black uppercase">
              {user.fullName?.[0]}
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">
                {user.fullName}
              </h1>
              <p className="text-gray-400 text-xs font-bold uppercase">
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 border rounded-xl text-xs font-bold uppercase hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 no-scrollbar">
            {[
              { id: "overview", label: "Overview", icon: User },
              { id: "orders", label: "Orders", icon: Package },
              { id: "wishlist", label: "Wishlist", icon: Heart },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id
                    ? "bg-black text-white shadow-lg"
                    : "text-gray-400 hover:text-black hover:bg-white"
                }`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </nav>
          <div className="lg:col-span-3">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}
