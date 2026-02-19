import React, { memo, useState } from "react";
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
  RotateCcw,
  Menu, // 🔥 Mobile ke liye hamburger icon
  X, // 🔥 Mobile ke liye close icon
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 🔥 Mobile Sidebar State
  const [isOpen, setIsOpen] = useState(false);

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
      name: "Returns",
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
    <>
      {/* 📱 FLOATING MOBILE HAMBURGER BUTTON (Bottom Right) */}
      {/* z-[100] ensures ye hamesha sabse upar rahega */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-[100] p-4 bg-black text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-white/10 active:scale-95 transition-all flex items-center justify-center"
      >
        <Menu size={24} />
      </button>

      {/* 📱 MOBILE OVERLAY (Dark background when sidebar is open) */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 🖥️ MAIN SIDEBAR */}
      <div
        className={`w-64 bg-black min-h-screen text-white flex flex-col fixed left-0 top-0 bottom-0 z-[100] shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-zinc-900 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic">
              Krumeku<span className="text-blue-500">.</span>
            </h1>
            <p className="text-[9px] text-gray-500 uppercase font-black tracking-[0.3em] mt-1 opacity-70">
              Admin Panel
            </p>
          </div>
          {/* Close button for Mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-zinc-400 hover:text-white transition-colors bg-zinc-900 p-2 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 mt-2 overflow-y-auto scrollbar-hide">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)} // 🔥 Auto-close on mobile after clicking a link
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-black text-[10px] uppercase tracking-widest ${
                isActive(item.path)
                  ? "bg-white text-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] md:translate-x-2"
                  : "text-zinc-500 hover:bg-zinc-800 hover:text-white"
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
            className="flex items-center gap-3 px-4 py-3.5 w-full text-left text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest active:scale-95"
          >
            <LogOut size={20} />
            <span>LogOut Session</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default memo(Sidebar);
