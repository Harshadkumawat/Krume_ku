import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  registerUser,
  googleLoginUser,
  reset,
} from "../../../features/auth/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../../../firebaseConfig";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { toast } from "react-toastify";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import SEO from "../../../components/SEO";

export default function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.auth,
  );

  const [data, setData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  // ✅ FIX 1: Google loading state
  const [googleLoading, setGoogleLoading] = useState(false);

  const anyLoading = isLoading || googleLoading;

  // ✅ FIX 1: Double click protection
  const handleGoogleRegister = useCallback(async () => {
    if (googleLoading) return;
    setGoogleLoading(true);

    try {
      const googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, googleProvider);
      const googleData = {
        fullName: result.user.displayName,
        email: result.user.email,
        avatar: result.user.photoURL,
        uid: result.user.uid,
      };
      await dispatch(googleLoginUser(googleData)).unwrap();
      toast.success("Welcome to the Movement! 🎉");
    } catch (error) {
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error("Google Signup Failed.");
      }
    } finally {
      setGoogleLoading(false);
    }
  }, [dispatch, googleLoading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const val = name === "phone" ? value.replace(/\D/g, "") : value;
    setData((prev) => ({ ...prev, [name]: val }));
  };

  // ✅ FIX 3: All fields validation
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!data.fullName.trim()) return toast.warn("Please enter your name.");
    if (!data.email.trim()) return toast.warn("Please enter your email.");
    if (data.phone.length !== 10)
      return toast.warn("Please enter a valid 10-digit phone number.");
    if (data.password.length < 6)
      return toast.warn("Password must be at least 6 characters.");

    dispatch(registerUser(data));
  };

  useEffect(() => {
    if (isSuccess && user) {
      toast.success("Account Created Successfully!");
      navigate(user.role === "admin" ? "/admin/dashboard" : "/");
      dispatch(reset());
    }

    if (isError && message) {
      toast.error(message || "Registration failed.");
      dispatch(reset());
    }
  }, [isSuccess, isError, message, navigate, dispatch, user]);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans selection:bg-black selection:text-white">
      <SEO
        title="Join the Movement"
        description="Create your Krumeku account to join the premium streetwear community."
      />

      <div className="w-full max-w-[440px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden border border-gray-100">
        <div className="bg-black p-8 text-center relative">
          <Link
            to="/"
            aria-label="Krumeku Home"
            className="text-white text-2xl font-black uppercase tracking-tighter italic outline-none focus-visible:ring-2 focus-visible:ring-white rounded px-2"
          >
            KRUMEKU
            <span className="text-red-600" aria-hidden="true">
              .
            </span>
          </Link>
          <p className="text-gray-500 text-[9px] font-bold uppercase tracking-[0.3em] mt-2 opacity-80">
            Join the Movement
          </p>
        </div>

        <div className="p-8 md:p-10">
          <header className="mb-6 text-center">
            <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">
              Create Account
            </h1>
            <div
              className="h-1 w-10 bg-red-600 mt-3 mx-auto rounded-full"
              aria-hidden="true"
            ></div>
          </header>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={anyLoading}
            className="w-full py-3.5 border-2 border-gray-100 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all mb-6 group disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            {googleLoading ? (
              <Loader2 className="animate-spin text-gray-500" size={18} />
            ) : (
              <>
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  className="w-5 h-5 group-hover:scale-110 transition-transform"
                  alt=""
                  aria-hidden="true"
                />
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-600">
                  Sign up with Google
                </span>
              </>
            )}
          </button>

          <div
            className="relative mb-6 flex items-center justify-center"
            aria-hidden="true"
          >
            <div className="absolute inset-x-0 h-[1px] bg-gray-100"></div>
            <span className="relative bg-white px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              OR REGISTER WITH EMAIL
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div className="space-y-1">
              <label
                htmlFor="reg-name"
                className="text-[10px] font-bold uppercase text-gray-400 ml-1"
              >
                Full Name
              </label>
              <input
                id="reg-name"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                value={data.fullName}
                onChange={handleChange}
                disabled={anyLoading}
                className="w-full p-3 bg-gray-50 border-none rounded-2xl font-bold text-sm focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-gray-300 disabled:opacity-60"
                placeholder="Enter your name"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label
                htmlFor="reg-email"
                className="text-[10px] font-bold uppercase text-gray-400 ml-1"
              >
                Email Address
              </label>
              <input
                id="reg-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={data.email}
                onChange={handleChange}
                disabled={anyLoading}
                className="w-full p-3 bg-gray-50 border-none rounded-2xl font-bold text-sm focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-gray-300 disabled:opacity-60"
                placeholder="name@example.com"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label
                htmlFor="reg-phone"
                className="text-[10px] font-bold uppercase text-gray-400 ml-1"
              >
                Phone Number
              </label>
              <div className="relative flex items-center focus-within:ring-2 focus-within:ring-black rounded-2xl">
                <div
                  className="absolute left-3 font-bold text-[11px] text-black border-r border-gray-200 pr-2"
                  aria-hidden="true"
                >
                  +91
                </div>
                <input
                  id="reg-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  maxLength="10"
                  required
                  value={data.phone}
                  onChange={handleChange}
                  disabled={anyLoading}
                  className="w-full p-3 bg-gray-50 border-none rounded-2xl font-bold text-sm focus:bg-white outline-none transition-all tracking-widest pl-14 disabled:opacity-60"
                  placeholder="0000000000"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label
                htmlFor="reg-pass"
                className="text-[10px] font-bold uppercase text-gray-400 ml-1"
              >
                Password
              </label>
              <div className="relative focus-within:ring-2 focus-within:ring-black rounded-2xl">
                <input
                  id="reg-pass"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={data.password}
                  onChange={handleChange}
                  disabled={anyLoading}
                  className="w-full p-3 bg-gray-50 border-none rounded-2xl font-bold text-sm focus:bg-white outline-none transition-all disabled:opacity-60"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={anyLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors outline-none focus-visible:text-black"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={anyLoading}
              className="w-full py-4 bg-black text-white rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-zinc-900 disabled:bg-zinc-700 mt-2 outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
              {isLoading ? (
                <Loader2
                  className="animate-spin"
                  size={18}
                  aria-hidden="true"
                />
              ) : (
                <>
                  REGISTER <ArrowRight size={16} aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wide">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-black border-b-2 border-black ml-1 hover:text-red-600 hover:border-red-600 transition-all outline-none focus-visible:ring-1 focus-visible:ring-black"
            >
              Login Here
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
