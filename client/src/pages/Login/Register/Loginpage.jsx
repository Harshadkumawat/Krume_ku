import React, { useEffect, useState } from "react";
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

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.auth,
  );

  const [data, setData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  
  useEffect(() => {
    // 1. Handle Error
    if (isError && message) {
      toast.error(message);
      dispatch(reset());
    }

    
    if (isSuccess && user) {
    
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }

      
      dispatch(reset());
    }
  }, [isSuccess, isError, message, navigate, dispatch]);
  

  const handleChange = (e) =>
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Google Login
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);

      const googleData = {
        fullName: result.user.displayName,
        email: result.user.email,
        avatar: result.user.photoURL,
        uid: result.user.uid,
      };

      await dispatch(googleLoginUser(googleData)).unwrap();
      toast.success("Logged in successfully!");
    } catch (error) {
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error("Google login failed.");
      }
    }
  };

  // Manual Login
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.email || !data.password) {
      return toast.error("Please fill all fields");
    }
    dispatch(loginUser(data));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans selection:bg-black selection:text-white">
      <div className="w-full max-w-[420px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden border border-gray-100">
        {/* Branding Header */}
        <div className="bg-black p-8 text-center relative">
          <Link
            to="/"
            className="text-white text-2xl font-black uppercase tracking-tighter italic"
          >
            KRUMEKU<span className="text-blue-500">.</span>
          </Link>
          <p className="text-gray-500 text-[9px] font-bold uppercase tracking-[0.3em] mt-2 opacity-80">
            Welcome Back
          </p>
        </div>

        <div className="p-8 md:p-10">
          <header className="mb-8 text-center">
            <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">
              Login
            </h2>
            <div className="h-1 w-10 bg-blue-500 mt-3 mx-auto rounded-full"></div>
          </header>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3.5 border-2 border-gray-100 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all mb-6 group disabled:opacity-50"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              className="w-5 h-5 group-hover:scale-110 transition-transform"
              alt="G"
            />
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-600">
              Continue with Google
            </span>
          </button>

          <div className="relative mb-8 flex items-center justify-center">
            <div className="absolute inset-x-0 h-[1px] bg-gray-100"></div>
            <span className="relative bg-white px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              OR LOGIN WITH EMAIL
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  name="email"
                  type="email"
                  required
                  onChange={handleChange}
                  className="w-full p-3.5 pl-12 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-sm focus:bg-white focus:border-black outline-none transition-all placeholder:text-gray-300"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold uppercase text-gray-400">
                  Password
                </label>
                <Link
                  to="/forgot"
                  className="text-[10px] font-bold text-black hover:text-blue-600 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  onChange={handleChange}
                  className="w-full p-3.5 pl-12 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-sm focus:bg-white focus:border-black outline-none transition-all placeholder:text-gray-300"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-black text-white rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:bg-zinc-700 hover:bg-zinc-900"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  LOGIN <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wide">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-black border-b-2 border-black ml-1 hover:text-blue-600 hover:border-blue-600 transition-all"
            >
              Register Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
