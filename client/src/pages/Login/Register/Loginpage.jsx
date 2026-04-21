import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff, Lock, Mail, Loader2, ArrowRight } from "lucide-react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../../firebaseConfig";
import {
  loginUser,
  googleLoginUser,
  reset,
} from "../../../features/auth/authSlice";
import SEO from "../../../components/SEO";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.auth,
  );

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (isError) {
      toast.error(message || "Login failed");
      dispatch(reset());
    }

    if (isSuccess && user) {
      toast.success(
        `Welcome back, ${user?.fullName?.split(" ")[0] || "User"}!`,
      );
      const targetPath = user.role === "admin" ? "/admin/dashboard" : "/";
      navigate(targetPath);
      dispatch(reset());
    }
  }, [isSuccess, isError, message, user, navigate, dispatch]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const togglePassword = useCallback(
    () => setShowPassword((prev) => !prev),
    [],
  );

  // ✅ FIX 3: Double click protection
  const handleGoogleLogin = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const result = await signInWithPopup(auth, provider);

      const googlePayload = {
        fullName: result.user.displayName,
        email: result.user.email,
        avatar: result.user.photoURL,
        uid: result.user.uid,
      };

      await dispatch(googleLoginUser(googlePayload)).unwrap();
    } catch (error) {
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error("Google authentication interrupted.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      return toast.warn("Credentials are required");
    }

    dispatch(loginUser({ email, password }));
  };

  const anyLoading = isLoading || googleLoading;

  const isSubmitDisabled = useMemo(
    () => anyLoading || !formData.email || !formData.password,
    [anyLoading, formData],
  );

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans selection:bg-black selection:text-white">
      <SEO
        title="Login | Krumeku Archive"
        description="Login to access your premium streetwear archive and track your exclusive orders."
      />

      <div className="w-full max-w-[420px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden border border-gray-100">
        {/* Branding */}
        <div className="bg-black p-8 text-center">
          <Link
            to="/"
            className="text-white text-2xl font-black uppercase tracking-tighter italic"
          >
            KRUMEKU<span className="text-red-600">.</span>
          </Link>
          <p className="text-gray-500 text-[9px] font-bold uppercase tracking-[0.3em] mt-2">
            Collective Archive
          </p>
        </div>

        <div className="p-8 md:p-10">
          <header className="mb-8 text-center">
            <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">
              Login
            </h1>
            <div className="h-1 w-10 bg-red-600 mt-3 mx-auto rounded-full"></div>
          </header>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={anyLoading}
            className="w-full py-3.5 border-2 border-gray-100 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all mb-6 group disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 className="animate-spin text-gray-500" size={18} />
            ) : (
              <>
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  className="w-5 h-5 group-hover:scale-110 transition-transform"
                  alt="Google"
                />
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-600">
                  Continue with Google
                </span>
              </>
            )}
          </button>

          <div className="relative mb-8 flex items-center justify-center">
            <div className="absolute inset-x-0 h-[1px] bg-gray-100"></div>
            <span className="relative bg-white px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Or Email Auth
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="group space-y-1.5">
              <label
                htmlFor="email"
                className="text-[10px] font-bold uppercase text-gray-400 ml-1"
              >
                Email Address
              </label>
              <div className="relative focus-within:ring-2 focus-within:ring-black rounded-2xl transition-all">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={anyLoading}
                  className="w-full p-3.5 pl-12 bg-gray-50 border-none rounded-2xl font-bold text-sm focus:bg-white outline-none transition-all disabled:opacity-60"
                  placeholder="name@archive.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="group space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label
                  htmlFor="password"
                  className="text-[10px] font-bold uppercase text-gray-400"
                >
                  Password
                </label>
                <Link
                  to="/forgot"
                  className="text-[10px] font-bold text-black hover:text-red-600 transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative focus-within:ring-2 focus-within:ring-black rounded-2xl transition-all">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={anyLoading}
                  className="w-full p-3.5 pl-12 bg-gray-50 border-none rounded-2xl font-bold text-sm focus:bg-white outline-none transition-all disabled:opacity-60"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  disabled={anyLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="w-full py-4 bg-black text-white rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:bg-zinc-800 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  Enter Archive <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wide">
            New to the collective?{" "}
            <Link
              to="/register"
              className="text-black border-b-2 border-black ml-1 hover:text-red-600 hover:border-red-600 transition-all"
            >
              Join Us
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Login;
