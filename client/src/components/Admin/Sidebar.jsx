import React, { memo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout, reset } from "../../features/auth/authSlice";
import {
  LayoutDashboard,
  ShoppingBag,
  PlusCircle,
  Package,
  LogOut,
  TicketPercent,
  Users,
  RotateCcw, // 🔥 Added Return Icon
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      dispatch(logout());
      dispatch(reset());
      navigate("/login");
    }
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "All Products",
      path: "/admin/products",
      icon: <ShoppingBag size={20} />,
    },
    {
      name: "Add Product",
      path: "/admin/product/new",
      icon: <PlusCircle size={20} />,
    },
    {
      name: "Orders",
      path: "/admin/orders",
      icon: <Package size={20} />,
    },
    {
      name: "Returns", // 🔥 New Menu Item
      path: "/admin/returns",
      icon: <RotateCcw size={20} />,
    },
    {
      name: "Coupons",
      path: "/admin/coupon",
      icon: <TicketPercent size={20} />,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: <Users size={20} />,
    },
  ];

  return (
    <div className="w-64 bg-black min-h-screen text-white flex flex-col fixed left-0 top-0 bottom-0 z-50 shadow-2xl">
      {/* Header */}
      <div className="p-8 border-b border-zinc-900">
        <h1 className="text-2xl font-black tracking-tighter uppercase italic">
          Krumeku<span className="text-blue-500">.</span>
        </h1>
        <p className="text-[9px] text-gray-500 uppercase font-black tracking-[0.3em] mt-1 opacity-70">
          Admin Control Unit
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 mt-4 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-black text-[10px] uppercase tracking-widest ${
              isActive(item.path)
                ? "bg-white text-black shadow-xl shadow-white/5 translate-x-2"
                : "text-zinc-500 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-zinc-900">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3.5 w-full text-left text-red-500 hover:bg-red-500/10 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest"
        >
          <LogOut size={20} />
          <span>LogOut Session</span>
        </button>
      </div>
    </div>
  );
};

export default memo(Sidebar);
