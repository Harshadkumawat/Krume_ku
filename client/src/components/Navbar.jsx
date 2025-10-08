import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { logout, reset } from "../features/auth/authSlice";
import {
  Menu,
  X,
  User,
  LogOut,
  ShoppingBag,
  Home,
  Info,
  Mail,
  Crown,
} from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      dispatch(reset());

      toast.success("Logged out successfully");
      navigate("/login");
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Logout failed");
    }
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Glassmorphism backdrop */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-purple-900/95 to-indigo-900/95 backdrop-blur-xl border-b border-white/10"></div>

      <nav className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold tracking-wider bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-indigo-300 transition-all duration-300">
                  KRUMEKU
                </span>
              </Link>

              {/* Desktop Navigation Links */}
              <div className="hidden lg:flex items-center gap-1">
                <Link
                  to="/"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium"
                >
                  <Home className="w-4 h-4" />
                  Home
                </Link>
                <Link
                  to="/shop"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Shop
                </Link>
                <Link
                  to="/about"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium"
                >
                  <Info className="w-4 h-4" />
                  About
                </Link>
                <Link
                  to="/contact"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium"
                >
                  <Mail className="w-4 h-4" />
                  Contact
                </Link>
              </div>
            </div>

            {/* Right: Auth Actions */}
            <div className="hidden md:flex items-center gap-3">
              {!user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to="/register"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Register
                  </Link>
                  <Link
                    to="/login"
                    className="px-6 py-2.5 rounded-xl border-2 border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/10 text-white font-semibold backdrop-blur-sm transition-all duration-200"
                  >
                    Login
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-medium">
                      {user.fullName || user.name || "Harshad"}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg hover:shadow-red-500/25 transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setOpen(!open)}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                aria-expanded={open}
              >
                <span className="sr-only">Open main menu</span>
                {open ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {open && (
          <div className="md:hidden">
            <div className="absolute top-full left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-white/10 shadow-2xl">
              <div className="px-4 py-6 space-y-4">
                {/* Mobile Navigation Links */}
                <div className="space-y-2">
                  <Link
                    to="/"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium"
                  >
                    <Home className="w-5 h-5" />
                    Home
                  </Link>
                  <Link
                    to="/shop"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Shop
                  </Link>
                  <Link
                    to="/about"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium"
                  >
                    <Info className="w-5 h-5" />
                    About
                  </Link>
                  <Link
                    to="/contact"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium"
                  >
                    <Mail className="w-5 h-5" />
                    Contact
                  </Link>
                </div>

                {/* Mobile Auth Section */}
                <div className="pt-4 border-t border-white/10">
                  {!user ? (
                    <div className="space-y-3">
                      <Link
                        to="/register"
                        onClick={() => setOpen(false)}
                        className="block w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-center shadow-lg"
                      >
                        Register
                      </Link>
                      <Link
                        to="/login"
                        onClick={() => setOpen(false)}
                        className="block w-full px-6 py-3 rounded-xl border-2 border-purple-500/50 text-white font-semibold text-center backdrop-blur-sm"
                      >
                        Login
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white font-medium">
                          {user.fullName || user.name || "Harshad"}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
