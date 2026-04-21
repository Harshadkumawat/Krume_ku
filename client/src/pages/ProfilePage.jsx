import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../features/auth/authSlice";
import { getMyOrders } from "../features/orders/orderSlice";
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
  MapPin,
  Trash2,
} from "lucide-react";
import SEO from "../components/SEO";
import OrdersTab from "../components/profile/OrdersTab";
import AddressesTab from "../components/profile/AddressesTab";

import { cldImage } from "../utils/imageHelper";
import { formatPrice, formatDate, formatId } from "../utils/formatters";
import StatusBadge from "../components/ui/StatusBadge";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isLoading: authLoading } = useSelector((state) => state.auth);
  const { orders, isLoading: ordersLoading } = useSelector(
    (state) => state.order,
  );
  const { wishlistItems } = useSelector((state) => state.wishlist);

  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
    if (user) {
      dispatch(getMyOrders());
      dispatch(fetchWishlist());
    }
  }, [user, authLoading, dispatch, navigate]);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate("/login");
  }, [dispatch, navigate]);

  const handleRemoveWishlist = useCallback(
    (e, id) => {
      e.stopPropagation();
      dispatch(removeFromWishlist(id));
    },
    [dispatch],
  );

  const handleTabChange = useCallback((id) => {
    setActiveTab(id);
  }, []);

  const handleCardClick = useCallback(
    (slugOrId) => {
      navigate(`/item/${slugOrId}`);
    },
    [navigate],
  );

  const totalSpent = useMemo(() => {
    return orders?.reduce((acc, o) => acc + o.totalPrice, 0) || 0;
  }, [orders]);

  if (authLoading || !user) {
    return (
      <div
        className="h-screen flex items-center justify-center bg-white"
        aria-busy="true"
        aria-live="polite"
      >
        <Loader2
          className="animate-spin text-black"
          size={40}
          aria-hidden="true"
        />
        <span className="sr-only">Loading profile...</span>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-black text-white p-6 md:p-8 rounded-[1.5rem] shadow-xl relative overflow-hidden">
                <div
                  className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"
                  aria-hidden="true"
                ></div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">
                  Total Spent
                </p>
                <h2 className="text-3xl md:text-4xl font-black italic relative z-10">
                  {formatPrice(totalSpent)}
                </h2>
              </div>
              <div className="bg-zinc-50 border border-zinc-100 p-6 md:p-8 rounded-[1.5rem]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">
                  Total Orders
                </p>
                <h2 className="text-3xl md:text-4xl font-black italic">
                  {orders?.length || 0}
                </h2>
              </div>
              <div className="bg-zinc-50 border border-zinc-100 p-6 md:p-8 rounded-[1.5rem]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">
                  Wishlist Items
                </p>
                <h2 className="text-3xl md:text-4xl font-black italic">
                  {wishlistItems?.length || 0}
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-zinc-800">
                  <Package size={16} aria-hidden="true" /> Recent Activity
                </h3>
                <button
                  type="button"
                  onClick={() => handleTabChange("orders")}
                  className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black outline-none focus-visible:ring-2 focus-visible:ring-black rounded px-1"
                >
                  View All
                </button>
              </div>
              {ordersLoading ? (
                <div className="py-10 flex justify-center" aria-live="polite">
                  <Loader2
                    className="animate-spin text-zinc-300"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Loading recent activity...</span>
                </div>
              ) : orders?.length > 0 ? (
                <div
                  className="bg-white border border-zinc-100 rounded-[1.5rem] overflow-hidden shadow-sm"
                  role="list"
                >
                  {orders.slice(0, 3).map((order) => (
                    <div
                      key={order._id}
                      role="listitem"
                      className="p-5 md:p-6 border-b border-zinc-50 flex justify-between items-center gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-400"
                          aria-hidden="true"
                        >
                          <Box size={20} />
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-widest text-zinc-800">
                            ID: {formatId(order._id)}
                          </p>
                          <p className="text-[9px] text-zinc-400 font-bold uppercase">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={order.orderStatus} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 bg-zinc-50 border border-zinc-100 rounded-[1.5rem] text-center text-[10px] font-black uppercase text-zinc-400">
                  No recent activity
                </div>
              )}
            </div>
          </div>
        );

      case "orders":
        return <OrdersTab orders={orders} />;

      case "addresses":
        return <AddressesTab savedAddresses={user?.addresses || []} />;

      case "wishlist":
        return (
          <div
            className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 animate-in fade-in duration-500"
            role="list"
          >
            {wishlistItems?.map((item) => (
              <div
                key={item._id}
                role="listitem"
                tabIndex={0}
                className="bg-white border border-zinc-100 p-3 md:p-4 rounded-2xl relative group cursor-pointer hover:shadow-xl transition-all outline-none focus-visible:ring-2 focus-visible:ring-black"
                onClick={() => handleCardClick(item.slug || item._id)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleCardClick(item.slug || item._id)
                }
              >
                <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden mb-3 bg-zinc-50">
                  <img
                    src={cldImage(item.images?.[0], 400)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt={item.productName || "Wishlist item"}
                    loading="lazy"
                    decoding="async"
                  />
                  <button
                    type="button"
                    onClick={(e) => handleRemoveWishlist(e, item._id)}
                    aria-label={`Remove ${item.productName || "item"} from wishlist`}
                    className="absolute top-2 right-2 p-2 bg-white/90 rounded-full text-zinc-400 hover:text-red-500 z-10 md:opacity-0 md:group-hover:opacity-100 outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
                <div className="px-1">
                  <p className="text-[10px] md:text-xs font-black uppercase truncate text-zinc-800 italic">
                    {item.productName}
                  </p>
                  <p className="text-sm font-black italic">
                    {formatPrice(item.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        );

      case "settings":
        return (
          <div className="bg-white border border-zinc-200 p-6 md:p-10 rounded-[1.5rem] max-w-xl animate-in fade-in">
            <h2 className="text-lg font-black uppercase italic mb-8 flex items-center gap-2 border-b border-zinc-100 pb-4">
              <Settings
                size={20}
                className="text-zinc-400"
                aria-hidden="true"
              />{" "}
              Account Configuration
            </h2>
            <form className="space-y-6" noValidate>
              <div>
                <label
                  htmlFor="settings-name"
                  className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2"
                >
                  Full Name
                </label>
                <input
                  id="settings-name"
                  type="text"
                  readOnly
                  value={user.fullName}
                  className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm text-zinc-800 uppercase outline-none cursor-default"
                />
              </div>
              <div>
                <label
                  htmlFor="settings-email"
                  className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2"
                >
                  Email Address
                </label>
                <input
                  id="settings-email"
                  type="email"
                  readOnly
                  value={user.email}
                  className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm text-zinc-500 outline-none cursor-default"
                />
              </div>
              <button
                type="button"
                className="w-full py-4 bg-black text-white text-[10px] font-black uppercase rounded-xl hover:bg-zinc-800 outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                Update Details
              </button>
            </form>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 md:pt-32 pb-20 selection:bg-black selection:text-white overflow-x-hidden relative">
      <SEO title="My Account" description="Manage your Krumeku account" />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-center bg-zinc-50 border border-zinc-100 p-6 md:p-8 rounded-[2rem] mb-10 gap-6">
          <div className="flex items-center gap-4 md:gap-6">
            <div
              className="w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] bg-black text-white flex items-center justify-center text-3xl font-black uppercase shadow-xl italic"
              aria-hidden="true"
            >
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
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-[10px] font-black uppercase w-full md:w-auto justify-center hover:bg-red-600 hover:text-white transition-all outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
          >
            <LogOut size={14} aria-hidden="true" /> Terminate Session
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <nav
            aria-label="Profile navigation"
            className="lg:col-span-3 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 no-scrollbar items-start"
          >
            {[
              { id: "overview", label: "Overview", icon: User },
              { id: "orders", label: "My Orders", icon: Package },
              { id: "addresses", label: "Address Book", icon: MapPin },
              { id: "wishlist", label: "Saved Archive", icon: Heart },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-3 px-5 lg:px-6 py-3.5 lg:py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap lg:w-full border outline-none focus-visible:ring-2 focus-visible:ring-black ${
                    isActive
                      ? "bg-black text-white border-black shadow-lg pl-6 lg:pl-8"
                      : "bg-white text-zinc-500 border-zinc-200 hover:border-black hover:text-black hover:bg-zinc-50"
                  }`}
                >
                  <tab.icon size={16} aria-hidden="true" /> {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Main Content Area */}
          <main
            className="lg:col-span-9 min-h-[50vh]"
            role="region"
            aria-live="polite"
          >
            {renderContent()}
          </main>
        </div>
      </div>
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
}
