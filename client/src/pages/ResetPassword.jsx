import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Lock, Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import { reset, resetPassword } from "../features/auth/authSlice";
import SEO from "../components/SEO";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.auth,
  );

  // Token check
  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link.");
      navigate("/forgot", { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Access key updated! Redirecting to login...");
      dispatch(reset());
      setTimeout(() => navigate("/login"), 3000);
    }
    if (isError) {
      toast.error(message || "Invalid or expired token.");
      dispatch(reset());
    }
  }, [isSuccess, isError, message, dispatch, navigate]);

  // ✅ SPEED: Simple function — no useCallback needed for forms
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      return toast.error("Please fill both fields.");
    }
    if (password.length < 6) {
      return toast.error("Security key must be at least 6 characters.");
    }
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    dispatch(resetPassword({ token, password }));
  };

  if (!token) return null;

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans selection:bg-black selection:text-white">
      <SEO
        title="Reset Access Key"
        description="Securely update your Krumeku account credentials using our single-use token protocol."
      />

      <div className="w-full max-w-[420px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden border border-gray-100">
        <div className="bg-black p-8 text-center">
          <Link
            to="/"
            aria-label="Go to Krumeku homepage"
            className="text-white text-2xl font-black uppercase tracking-tighter italic outline-none focus-visible:ring-2 focus-visible:ring-white rounded px-2"
          >
            KRUMEKU
            <span className="text-red-600" aria-hidden="true">
              .
            </span>
          </Link>
          <p className="text-gray-500 text-[8px] font-black uppercase tracking-[0.4em] mt-2 opacity-70">
            Security Protocol
          </p>
        </div>

        <div className="p-8 md:p-10">
          <header className="mb-8 text-center">
            <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">
              New Access Key
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">
              Update your security credentials
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* New Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="new-password"
                className="text-[9px] font-black uppercase text-gray-400 ml-1"
              >
                New Security Key
              </label>
              <div className="relative focus-within:ring-2 focus-within:ring-black rounded-2xl transition-all">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                  size={16}
                  aria-hidden="true"
                />
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full p-3.5 pl-12 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-sm focus:bg-white outline-none transition-all disabled:opacity-60"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-black outline-none focus-visible:text-black rounded p-1 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff size={16} aria-hidden="true" />
                  ) : (
                    <Eye size={16} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirm-password"
                className="text-[9px] font-black uppercase text-gray-400 ml-1"
              >
                Confirm Key
              </label>
              <div className="relative focus-within:ring-2 focus-within:ring-black rounded-2xl transition-all">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                  size={16}
                  aria-hidden="true"
                />
                <input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full p-3.5 pl-12 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-sm focus:bg-white outline-none transition-all disabled:opacity-60"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !password || !confirmPassword}
              aria-busy={isLoading}
              className="w-full py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2
                  className="animate-spin"
                  size={18}
                  aria-hidden="true"
                />
              ) : (
                "Update Security Key"
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2 text-red-500 opacity-80">
            <ShieldAlert size={14} aria-hidden="true" />
            <span className="text-[8px] font-black uppercase tracking-widest">
              Single Use Token Protocol
            </span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ResetPassword;
