import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { logout } from "../features/auth/authSlice";
import {
  Menu,
  X,
  User,
  LogOut,
  ShoppingBag,
  Search,
  Heart,
  ChevronRight,
  Package,
  UserCircle,
  ArrowRight,
  ShieldCheck, 
} from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profilePanel, setProfilePanel] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart || { cartItems: [] });
  const { wishlistItems } = useSelector(
    (state) => state.wishlist || { wishlistItems: [] },
  );

  const cartCount = cartItems?.length || 0;
  const wishlistCount = wishlistItems?.length || 0;

  // Search Debouncing
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const delayDebounceFn = setTimeout(() => {
        navigate(`/products?q=${searchQuery.trim()}`);
      }, 600);
      return () => clearTimeout(delayDebounceFn);
    }

    if (searchQuery.trim().length === 0 && location.search.includes("q=")) {
      navigate("/products");
    }
  }, [searchQuery]);

 
  useEffect(() => {
    setOpen(false);
    setProfilePanel(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setProfilePanel(false);
    toast.info("Logged out successfully.");
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${searchQuery.trim()}`);
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { name: "Men", path: "/products?gender=Men" },
    { name: "Women", path: "/products?gender=Women" },
    { name: "Collection", path: "/products" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 z-[100] transition-all duration-500 ease-in-out ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl py-2 shadow-sm border-b border-zinc-100"
            : "bg-white py-4 md:py-6"
        } ${
          user?.role === "admin"
            ? "md:left-64 w-full md:w-[calc(100%-16rem)]"
            : "left-0 w-full"
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-4 md:px-12 flex items-center justify-between">
          {/* Left Section: Menu & Admin Direct Link */}
          <div className="flex-1 flex items-center gap-4 md:gap-8">
            <button
              onClick={() => setOpen(true)}
              className="group flex items-center gap-3 outline-none"
            >
              <div className="flex flex-col gap-1.5">
                <span className="h-[2px] w-5 bg-black"></span>
                <span className="h-[2px] w-3 bg-black transition-all duration-300 group-hover:w-5"></span>
              </div>
              <span className="hidden lg:block text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-black transition-colors">
                Menu
              </span>
            </button>

            {/* 🔥 NEW: Direct Admin Link on Main Header */}
            {user?.role === "admin" && (
              <Link
                to="/admin/dashboard"
                className="hidden sm:flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-full border border-red-100 hover:bg-red-600 hover:text-white transition-all duration-300 group"
              >
                <ShieldCheck
                  size={14}
                  className="text-red-600 group-hover:text-white"
                />
                <span className="text-[9px] font-black uppercase tracking-tighter">
                  Admin Panel
                </span>
              </Link>
            )}

            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
          </div>

          {/* Center Section: Logo */}
          <div className="flex justify-center">
            <Link to="/" className="flex-shrink-0 relative z-10 group">
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-black uppercase italic leading-none group-hover:scale-105 transition-transform duration-300">
                KRUMEKU<span className="text-red-600">.</span>
              </h1>
            </Link>
          </div>

          {/* Right Section: Icons */}
          <div className="flex items-center justify-end gap-4 md:gap-6 flex-1">
            <Link to="/wishlist" className="relative group hidden md:block p-2">
              <Heart
                size={22}
                strokeWidth={1.5}
                className="group-hover:fill-black transition-all duration-300"
              />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white"></span>
              )}
            </Link>

            <Link to="/cart" className="relative group p-2">
              <ShoppingBag size={22} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 flex items-center justify-center bg-black text-white text-[9px] font-bold w-4 h-4 rounded-full border border-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setProfilePanel(true)}
              className="flex items-center gap-2 border border-zinc-200 hover:border-black rounded-full p-1 pr-3 transition-all duration-300 group"
            >
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-[12px] font-bold overflow-hidden">
                {user ? (
                  user.fullName?.charAt(0).toUpperCase()
                ) : (
                  <User size={16} />
                )}
              </div>
              <span className="hidden md:block text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-black transition-colors">
                {user ? "Account" : "Login"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* --- Rest of the code (Search Overlay, Drawers) remains exactly same as your input --- */}
      {/* ... (Yahan se niche aapka SearchOverlay, MobileDrawer aur ProfileDrawer wala code hai) ... */}

      {/* Search Overlay */}
      <div
        className={`fixed inset-x-0 top-0 z-[150] bg-white border-b-2 border-black transition-transform duration-500 ease-in-out ${
          searchOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <form
          onSubmit={handleSearchSubmit}
          className="max-w-[1400px] mx-auto px-6 py-8 flex items-center gap-4 md:gap-6"
        >
          <Search size={24} className="text-black" />
          <input
            type="text"
            placeholder="Search for products..."
            className="flex-1 bg-transparent text-xl md:text-4xl font-bold uppercase italic outline-none placeholder:text-zinc-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus={searchOpen}
          />
          <button
            type="button"
            onClick={() => {
              setSearchOpen(false);
              setSearchQuery("");
            }}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <X size={28} />
          </button>
        </form>
      </div>

      {/* Mobile Navigation Drawer */}
      <div
        className={`fixed inset-0 z-[200] transition-all duration-500 ${
          open ? "visible pointer-events-auto" : "invisible pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />

        <div
          className={`absolute left-0 top-0 h-full w-[85%] md:w-[450px] bg-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full p-6 md:p-10">
            <button
              onClick={() => setOpen(false)}
              className="self-start mb-10 p-2 hover:bg-zinc-100 rounded-full transition-colors"
            >
              <X size={28} />
            </button>

            <nav className="flex flex-col gap-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Menu
              </span>
              {navLinks.map((link, idx) => (
                <Link
                  key={idx}
                  to={link.path}
                  onClick={() => setOpen(false)}
                  className="group flex items-center justify-between border-b border-zinc-100 pb-4"
                >
                  <span className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-zinc-300 group-hover:text-black group-hover:pl-2 transition-all duration-500">
                    {link.name}
                  </span>
                  <ArrowRight
                    className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500"
                    size={24}
                  />
                </Link>
              ))}
            </nav>

            <div className="mt-auto space-y-6">
              <div className="flex gap-6 border-t border-zinc-100 pt-6">
                <Link
                  to="/wishlist"
                  onClick={() => setOpen(false)}
                  className="text-[11px] font-bold uppercase tracking-widest hover:text-red-600 transition-colors"
                >
                  Wishlist ({wishlistCount})
                </Link>
                <Link
                  to="/cart"
                  onClick={() => setOpen(false)}
                  className="text-[11px] font-bold uppercase tracking-widest hover:text-red-600 transition-colors"
                >
                  Cart ({cartCount})
                </Link>
              </div>
              <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide leading-relaxed">
                © 2025 KRUMEKU. <br /> Designed for the Modern Streetwear.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Drawer */}
      <div
        className={`fixed inset-0 z-[200] transition-all duration-500 ${
          profilePanel
            ? "visible pointer-events-auto"
            : "invisible pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${
            profilePanel ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setProfilePanel(false)}
        />

        <div
          className={`absolute right-0 top-0 h-full w-full md:w-[400px] bg-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            profilePanel ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-6 md:p-10 flex flex-col h-full">
            <button
              onClick={() => setProfilePanel(false)}
              className="self-end mb-10 p-2 hover:bg-zinc-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>

            {!user ? (
              <div className="flex-1 flex flex-col justify-center text-center">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-8">
                  Welcome
                  <br />
                  <span className="text-zinc-300">Guest</span>
                </h2>
                <div className="flex flex-col gap-4">
                  <Link
                    to="/login"
                    onClick={() => setProfilePanel(false)}
                    className="bg-black text-white py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setProfilePanel(false)}
                    className="border border-black py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                  >
                    Register
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="mb-10 flex items-center gap-4">
                  <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold italic shadow-md">
                    {user.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                      Hello,
                    </p>
                    <h2 className="text-lg font-black uppercase italic leading-none line-clamp-1">
                      {user.fullName}
                    </h2>
                    <p className="text-[11px] text-zinc-500 font-medium truncate max-w-[200px] mt-1">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  {[
                    { label: "My Orders", path: "/orders", icon: Package },
                    {
                      label: "Profile Settings",
                      path: "/profile",
                      icon: UserCircle,
                    },
                  ].map((item, i) => (
                    <Link
                      key={i}
                      to={item.path}
                      onClick={() => setProfilePanel(false)}
                      className="flex items-center justify-between py-5 border-b border-zinc-100 group hover:pl-2 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <item.icon
                          size={20}
                          strokeWidth={1.5}
                          className="text-zinc-400 group-hover:text-black transition-colors"
                        />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-black transition-colors">
                          {item.label}
                        </span>
                      </div>
                      <ChevronRight
                        size={16}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </Link>
                  ))}

                  {/* Admin Link in Drawer */}
                  {user.role === "admin" && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setProfilePanel(false)}
                      className="flex items-center justify-between py-5 border-b border-zinc-100 group hover:pl-2 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <Package size={20} className="text-red-600" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-red-600">
                          Admin Dashboard
                        </span>
                      </div>
                    </Link>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="mt-auto w-full flex items-center justify-center gap-3 py-4 bg-zinc-50 text-red-600 text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all duration-300 rounded-sm"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
