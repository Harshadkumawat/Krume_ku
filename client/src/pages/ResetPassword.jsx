import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Lock, Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import { reset, resetPassword,  } from "../features/auth/authSlice";

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword)
      return toast.error("Passwords do not match!");
    if (password.length < 6)
      return toast.error("Security key must be at least 6 characters.");

    dispatch(resetPassword({ token, password }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans selection:bg-black selection:text-white">
      <div className="w-full max-w-[420px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden border border-gray-100">
        <div className="bg-black p-8 text-center">
          <Link
            to="/"
            className="text-white text-2xl font-black uppercase tracking-tighter italic"
          >
            KRUMEKU<span className="text-blue-500">.</span>
          </Link>
          <p className="text-gray-500 text-[8px] font-black uppercase tracking-[0.4em] mt-2 opacity-70">
            Security Protocol
          </p>
        </div>

        <div className="p-8 md:p-10">
          <header className="mb-8 text-center">
            <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">
              New Access Key
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">
              Update your security credentials
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-gray-400 ml-1">
                New Security Key
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                  size={16}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3.5 pl-12 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-sm focus:bg-white focus:border-black outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-black"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-gray-400 ml-1">
                Confirm Key
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                  size={16}
                />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3.5 pl-12 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-sm focus:bg-white focus:border-black outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Update Security Key"
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2 text-red-500 opacity-80">
            <ShieldAlert size={14} />
            <span className="text-[8px] font-black uppercase tracking-widest">
              Single Use Token Protocol
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
