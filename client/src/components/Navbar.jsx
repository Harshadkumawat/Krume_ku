import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  memo,
} from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { logout } from "../features/auth/authSlice";
import {
  X,
  User,
  LogOut,
  ShoppingBag,
  Search,
  Heart,
  ChevronRight,
  Package,
  CircleUser as UserCircle,
  ArrowRight,
  ShieldCheck,
  Scissors,
  Sparkles,
} from "lucide-react";
import Button from "./ui/Button";

// ─── Reusable Overlay ────────────────────────────────────────
const Overlay = memo(({ visible, onClick }) => (
  <div
    className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-500 ${
      visible ? "opacity-100" : "opacity-0"
    }`}
    onClick={onClick}
    aria-hidden="true"
  />
));
Overlay.displayName = "Overlay";

// ─── Hamburger Icon ──────────────────────────────────────────
const HamburgerIcon = memo(({ onClick, open }) => (
  <button
    type="button"
    aria-label="Open main menu"
    aria-expanded={open}
    onClick={onClick}
    className="group flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-black rounded p-1"
  >
    <div className="flex flex-col gap-1.5" aria-hidden="true">
      <span className="h-[2px] w-5 bg-black" />
      <span className="h-[2px] w-3 bg-black transition-all duration-300 group-hover:w-5" />
    </div>
    <span className="hidden lg:block text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-black transition-colors mt-0.5">
      Menu
    </span>
  </button>
));
HamburgerIcon.displayName = "HamburgerIcon";

// ─── Admin Badge ─────────────────────────────────────────────
const AdminBadge = memo(() => (
  <Link
    to="/admin/dashboard"
    className="hidden sm:flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-full border border-red-100 hover:bg-red-600 hover:text-white transition-all duration-300 group outline-none focus-visible:ring-2 focus-visible:ring-red-600"
  >
    <ShieldCheck
      size={14}
      className="text-red-600 group-hover:text-white"
      aria-hidden="true"
    />
    <span className="text-[9px] font-black uppercase tracking-tighter">
      Admin
    </span>
  </Link>
));
AdminBadge.displayName = "AdminBadge";

// ─── Logo ────────────────────────────────────────────────────
const Logo = memo(() => (
  <Link
    to="/"
    aria-label="Krumeku Homepage"
    className="flex items-center justify-center group gap-2 md:gap-3 transition-transform duration-300 hover:scale-[1.02] outline-none focus-visible:ring-2 focus-visible:ring-black rounded p-1"
  >
    <div className="relative w-7 h-7 md:w-10 md:h-10 flex items-center justify-center overflow-hidden">
      <img
        src="https://res.cloudinary.com/dftticvtc/image/upload/v1772809985/logo_et7xbt.png"
        alt="Krumeku Logo"
        className="w-full h-full object-contain group-hover:rotate-6 transition-transform duration-500"
        loading="eager"
        width={40}
        height={40}
      />
    </div>
    <h1 className="text-xl md:text-3xl font-black tracking-tighter text-black uppercase italic leading-none flex items-center">
      KRUMEKU
      <span className="text-red-600" aria-hidden="true">
        .
      </span>
    </h1>
  </Link>
));
Logo.displayName = "Logo";

// ─── Nav Link Item (Side Menu) ───────────────────────────────
const NavLinkItem = memo(({ link, onClick }) => (
  <Link
    to={link.path}
    onClick={onClick}
    className="group flex items-center justify-between border-b border-zinc-100 pb-4 outline-none focus-visible:ring-2 focus-visible:ring-black rounded"
  >
    <span className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-zinc-300 group-hover:text-black group-hover:pl-2 transition-all duration-500">
      {link.name}
    </span>
    <ArrowRight
      className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500"
      size={24}
      aria-hidden="true"
    />
  </Link>
));
NavLinkItem.displayName = "NavLinkItem";

// ─── Profile Nav Item ────────────────────────────────────────
const ProfileNavItem = memo(({ item, onClick }) => (
  <Link
    to={item.path}
    onClick={onClick}
    className="flex items-center justify-between py-5 border-b border-zinc-100 group hover:pl-2 transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-black rounded px-1"
  >
    <div className="flex items-center gap-4">
      <item.icon
        size={20}
        strokeWidth={1.5}
        className="text-zinc-400 group-hover:text-black transition-colors"
        aria-hidden="true"
      />
      <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-black transition-colors">
        {item.label}
      </span>
    </div>
    <ChevronRight
      size={16}
      className="opacity-0 group-hover:opacity-100 transition-opacity"
      aria-hidden="true"
    />
  </Link>
));
ProfileNavItem.displayName = "ProfileNavItem";

// ─── Search Overlay ──────────────────────────────────────────
const SearchOverlay = memo(
  ({ searchOpen, searchQuery, setSearchQuery, onSubmit, onClose }) => (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search overlay"
      className={`fixed inset-x-0 top-0 z-[150] bg-white border-b-2 border-black transition-transform duration-500 ease-in-out ${
        searchOpen ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <form
        onSubmit={onSubmit}
        className="max-w-[1400px] mx-auto px-6 py-4 md:py-6 flex items-center gap-4 md:gap-6"
        role="search"
      >
        <Search
          size={22}
          className="text-black flex-shrink-0"
          aria-hidden="true"
        />
        <input
          type="text"
          aria-label="Search for products"
          placeholder="Search for products..."
          className="flex-1 bg-transparent text-lg md:text-3xl font-bold uppercase italic outline-none placeholder:text-zinc-300"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus={searchOpen}
        />
        <button
          type="button"
          aria-label="Close search"
          onClick={onClose}
          className="p-2 hover:bg-zinc-100 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-black flex-shrink-0"
        >
          <X size={24} aria-hidden="true" />
        </button>
      </form>
    </div>
  ),
);
SearchOverlay.displayName = "SearchOverlay";

// ─── Side Menu ───────────────────────────────────────────────
const SideMenu = memo(
  ({ open, onClose, navLinks, wishlistCount, cartCount }) => (
    <div
      className={`fixed inset-0 z-[200] transition-all duration-500 ${
        open ? "visible pointer-events-auto" : "invisible pointer-events-none"
      }`}
    >
      <Overlay visible={open} onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Main Navigation Menu"
        className={`absolute left-0 top-0 h-full w-[85%] md:w-[450px] bg-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-6 md:p-10">
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="self-start mb-10 p-2 hover:bg-zinc-100 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <X size={24} aria-hidden="true" />
          </button>

          <nav aria-label="Primary" className="flex flex-col gap-6">
            <span
              className="text-[10px] font-bold uppercase tracking-widest text-zinc-400"
              aria-hidden="true"
            >
              Menu
            </span>
            {navLinks.map((link, idx) => (
              <NavLinkItem key={idx} link={link} onClick={onClose} />
            ))}
          </nav>

          <div className="mt-auto space-y-6">
            <div className="bg-zinc-50 p-4 rounded-xl flex items-center gap-3">
              <div
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-red-600"
                aria-hidden="true"
              >
                <Scissors size={18} />
              </div>
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-widest">
                  Made In-House
                </h4>
                <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                  Direct from our machines to you.
                </p>
              </div>
            </div>

            <div className="flex gap-6 border-t border-zinc-100 pt-6">
              <Link
                to="/wishlist"
                onClick={onClose}
                className="text-[11px] font-bold uppercase tracking-widest hover:text-red-600 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded px-1"
              >
                Wishlist ({wishlistCount})
              </Link>
              <Link
                to="/cart"
                onClick={onClose}
                className="text-[11px] font-bold uppercase tracking-widest hover:text-red-600 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded px-1"
              >
                Cart ({cartCount})
              </Link>
            </div>
            <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide leading-relaxed">
              © 2026 KRUMEKU. <br /> Built for the Modern Streetwear.
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
);
SideMenu.displayName = "SideMenu";

// ─── Profile Panel ───────────────────────────────────────────
const ProfilePanel = memo(
  ({ profilePanel, onClose, user, onLogout, navigate }) => {
    const profileNavItems = useMemo(
      () => [
        { label: "My Orders", path: "/orders", icon: Package },
        { label: "Profile Settings", path: "/profile", icon: UserCircle },
      ],
      [],
    );

    const handleNavigate = useCallback(
      (path) => {
        onClose();
        navigate(path);
      },
      [onClose, navigate],
    );

    return (
      <div
        className={`fixed inset-0 z-[200] transition-all duration-500 ${
          profilePanel
            ? "visible pointer-events-auto"
            : "invisible pointer-events-none"
        }`}
      >
        <Overlay visible={profilePanel} onClick={onClose} />

        <div
          role="dialog"
          aria-modal="true"
          aria-label="User Profile Menu"
          className={`absolute right-0 top-0 h-full w-full md:w-[400px] bg-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            profilePanel ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-6 md:p-10 flex flex-col h-full">
            <button
              type="button"
              aria-label="Close profile panel"
              onClick={onClose}
              className="self-end mb-10 p-2 hover:bg-zinc-100 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-black"
            >
              <X size={24} aria-hidden="true" />
            </button>

            {!user ? (
              <div className="flex-1 flex flex-col justify-center text-center">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-8">
                  Welcome <br /> <span className="text-zinc-300">Guest</span>
                </h2>
                <div className="flex flex-col gap-4">
                  <Button
                    onClick={() => handleNavigate("/login")}
                    variant="primary"
                    className="w-full h-14"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => handleNavigate("/register")}
                    variant="outline"
                    className="w-full h-14"
                  >
                    Register
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="mb-10 flex items-center gap-4">
                  <div
                    className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold italic shadow-md"
                    aria-hidden="true"
                  >
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

                <nav aria-label="User Account Navigation" className="space-y-1">
                  {profileNavItems.map((item, i) => (
                    <ProfileNavItem key={i} item={item} onClick={onClose} />
                  ))}

                  {user.role === "admin" && (
                    <Link
                      to="/admin/dashboard"
                      onClick={onClose}
                      className="flex items-center justify-between py-5 border-b border-zinc-100 group hover:pl-2 transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded px-1"
                    >
                      <div className="flex items-center gap-4">
                        <Package
                          size={20}
                          className="text-red-600"
                          aria-hidden="true"
                        />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-red-600">
                          Admin Dashboard
                        </span>
                      </div>
                    </Link>
                  )}
                </nav>

                <Button
                  variant="danger"
                  className="mt-auto w-full h-14 bg-red-50 text-red-600 border-none hover:bg-red-600 hover:text-white"
                  onClick={onLogout}
                  icon={LogOut}
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);
ProfilePanel.displayName = "ProfilePanel";

// ═════════════════════════════════════════════════════════════
// ─── MAIN NAVBAR ─────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profilePanel, setProfilePanel] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const headerRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // ── Selectors with stable references ─────────────────────
  const user = useSelector((state) => state.auth.user);
  const cartItems = useSelector((state) => state.cart?.cartItems);
  const wishlistItems = useSelector((state) => state.wishlist?.wishlistItems);

  const cartCount = cartItems?.length || 0;
  const wishlistCount = wishlistItems?.length || 0;
  const isAdmin = user?.role === "admin";

  // ── Nav Links
  const navLinks = useMemo(
    () => [
      // Schema enum: subCategory -> "Bleach Art"
      { name: "Bleach Art Series", path: "/products?subCategory=Bleach Art" },

      // Schema enum: subCategory -> "Embroidered"
      { name: "Embroidered Fits", path: "/products?subCategory=Embroidered" },

      // Schema enum: subCategory -> "Oversized"
      { name: "Oversized Tees", path: "/products?subCategory=Oversized" },

      // Schema enum: gender -> "Men" & "Women"
      { name: "Men's Collection", path: "/products?gender=Men" },
      { name: "Women's Collection", path: "/products?gender=Women" },

      { name: "Shop All", path: "/products" },
    ],
    [],
  );

  // ── Body scroll lock ─────────────────────────────────────
  useEffect(() => {
    const anyOpen = open || profilePanel || searchOpen;
    document.body.style.overflow = anyOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, profilePanel, searchOpen]);

  // ── Search debounce ──────────────────────────────────────
  const searchTimerRef = useRef(null);

  useEffect(() => {
    const query = searchQuery.trim();

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    if (query.length > 0) {
      searchTimerRef.current = setTimeout(() => {
        navigate(`/products?q=${query}`);
      }, 600);
    } else if (location.search.includes("q=")) {
      navigate("/products");
    }

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [searchQuery, navigate, location.search]);

  // ── Close panels on route change ─────────────────────────
  useEffect(() => {
    setOpen(false);
    setProfilePanel(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // ── Scroll handler with ref (no state dependency) ────────
  const scrolledRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolledRef.current) {
        scrolledRef.current = isScrolled;
        setScrolled(isScrolled);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []); // ← empty deps = mount once only

  // ── Measure real navbar height and expose it as a CSS var ─
  // so every page can set `padding-top: var(--navbar-height)`
  // instead of guessing a fixed px value (which caused the gap/
  // overlap mismatch since the header's real height shifts a
  // little between the scrolled/unscrolled padding states).
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const setVar = () => {
      document.documentElement.style.setProperty(
        "--navbar-height",
        `${el.offsetHeight}px`,
      );
    };

    setVar();

    const resizeObserver = new ResizeObserver(setVar);
    resizeObserver.observe(el);

    return () => resizeObserver.disconnect();
  }, [scrolled, isAdmin]);

  // ── Callbacks ────────────────────────────────────────────
  const openMenu = useCallback(() => setOpen(true), []);
  const closeMenu = useCallback(() => setOpen(false), []);
  const openProfile = useCallback(() => setProfilePanel(true), []);
  const closeProfile = useCallback(() => setProfilePanel(false), []);
  const openSearch = useCallback(() => setSearchOpen(true), []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
  }, []);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    setProfilePanel(false);
    toast.info("Logged out successfully.");
    navigate("/login");
  }, [dispatch, navigate]);

  const handleSearchSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const q = searchQuery.trim();
      if (q) {
        navigate(`/products?q=${q}`);
        setSearchOpen(false);
      }
    },
    [searchQuery, navigate],
  );

  // ── Header classes (memoized) ────────────────────────────
  const headerClass = useMemo(
    () =>
      `fixed top-0 z-[100] transition-all duration-300 ease-in-out ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl py-1.5 md:py-2 shadow-md border-b border-zinc-200"
          : "bg-white py-2 md:py-3 shadow-sm border-b border-zinc-100"
      } ${isAdmin ? "md:left-64 w-full md:w-[calc(100%-16rem)]" : "left-0 w-full"}`,
    [scrolled, isAdmin],
  );

  // ── First letter of user name ────────────────────────────
  const userInitial = useMemo(
    () => user?.fullName?.charAt(0).toUpperCase() || null,
    [user?.fullName],
  );

  return (
    <>
      {/* ─── HEADER BAR ──────────────────────────────────── */}
      <header ref={headerRef} className={headerClass}>
        <div className="max-w-[1800px] mx-auto px-4 md:px-8 flex items-center justify-between">
          {/* LEFT */}
          <div className="flex-1 flex items-center gap-4 md:gap-6">
            <HamburgerIcon onClick={openMenu} open={open} />
            {isAdmin && <AdminBadge />}
            <button
              type="button"
              aria-label="Open search"
              aria-expanded={searchOpen}
              onClick={openSearch}
              className="p-1.5 hover:bg-zinc-100 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-black"
            >
              <Search size={18} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>

          {/* CENTER */}
          <div className="flex justify-center flex-1">
            <Logo />
          </div>

          {/* RIGHT */}
          <div className="flex items-center justify-end gap-3 md:gap-5 flex-1">
            <Link
              to="/wishlist"
              aria-label={`View Wishlist. ${wishlistCount} items`}
              className="relative group hidden md:block p-1.5 outline-none focus-visible:ring-2 focus-visible:ring-black rounded-full"
            >
              <Heart
                size={20}
                strokeWidth={1.5}
                className="group-hover:fill-black transition-all duration-300"
                aria-hidden="true"
              />
              {wishlistCount > 0 && (
                <span
                  className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full border border-white"
                  aria-hidden="true"
                />
              )}
            </Link>

            <Link
              to="/cart"
              aria-label={`View Cart. ${cartCount} items`}
              className="relative group p-1.5 outline-none focus-visible:ring-2 focus-visible:ring-black rounded-full"
            >
              <ShoppingBag size={20} strokeWidth={1.5} aria-hidden="true" />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 flex items-center justify-center bg-black text-white text-[9px] font-bold w-4 h-4 rounded-full border border-white"
                  aria-hidden="true"
                >
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              aria-label="Open profile panel"
              aria-expanded={profilePanel}
              onClick={openProfile}
              className="flex items-center gap-2 border border-zinc-200 hover:border-black rounded-full p-1 pr-3 transition-all duration-300 group outline-none focus-visible:ring-2 focus-visible:ring-black"
            >
              <div
                className="w-7 h-7 bg-black rounded-full flex items-center justify-center text-white text-[10px] font-bold overflow-hidden"
                aria-hidden="true"
              >
                {userInitial || <User size={14} />}
              </div>
              <span className="hidden md:block text-[9px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-black transition-colors mt-0.5">
                {user ? "Account" : "Login"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── SEARCH OVERLAY ──────────────────────────────── */}
      <SearchOverlay
        searchOpen={searchOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSubmit={handleSearchSubmit}
        onClose={closeSearch}
      />

      {/* ─── SIDE MENU ───────────────────────────────────── */}
      <SideMenu
        open={open}
        onClose={closeMenu}
        navLinks={navLinks}
        wishlistCount={wishlistCount}
        cartCount={cartCount}
      />

      {/* ─── PROFILE PANEL ───────────────────────────────── */}
      <ProfilePanel
        profilePanel={profilePanel}
        onClose={closeProfile}
        user={user}
        onLogout={handleLogout}
        navigate={navigate}
      />
    </>
  );
}
