import { useState, useEffect } from "react";
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

  const handleGoogleRegister = async () => {
    try {
      const googleProvider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, googleProvider);
      const googleData = {
        fullName: result.user.displayName,
        email: result.user.email,
        avatar: result.user.photoURL,
        uid: result.user.uid,
      };
      dispatch(googleLoginUser(googleData));
    } catch (error) {
      toast.error("Google Signup Failed.");
    }
  };

  const handleChange = (e) => {
    const val =
      e.target.name === "phone"
        ? e.target.value.replace(/\D/g, "")
        : e.target.value;
    setData((prev) => ({ ...prev, [e.target.name]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (data.phone.length !== 10)
      return toast.warn("Please enter a valid 10-digit phone number.");
    dispatch(registerUser(data));
  };

  useEffect(() => {
    if (isSuccess && user) {
      toast.success("Account Created Successfully! 🎉");

      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }

      dispatch(reset());
    }

    // 2. Agar koi Error aaya
    if (isError && message) {
      toast.error(message || "Registration failed.");
      dispatch(reset());
    }
  }, [isSuccess, isError, message,  navigate, dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans selection:bg-black selection:text-white">
      <div className="w-full max-w-[440px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden border border-gray-100">
        {/* Header Branding */}
        <div className="bg-black p-8 text-center relative">
          <Link
            to="/"
            className="text-white text-2xl font-black uppercase tracking-tighter italic"
          >
            KRUMEKU<span className="text-blue-500">.</span>
          </Link>
          <p className="text-gray-500 text-[9px] font-bold uppercase tracking-[0.3em] mt-2 opacity-80">
            Join the Movement
          </p>
        </div>

        <div className="p-8 md:p-10">
          <header className="mb-6 text-center">
            <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">
              Create Account
            </h2>
            <div className="h-1 w-10 bg-blue-500 mt-3 mx-auto rounded-full"></div>
          </header>

          <button
            type="button"
            onClick={handleGoogleRegister}
            className="w-full py-3.5 border-2 border-gray-100 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all mb-6 group"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              className="w-5 h-5 group-hover:scale-110 transition-transform"
              alt="G"
            />
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-600">
              Sign up with Google
            </span>
          </button>

          <div className="relative mb-6 flex items-center justify-center">
            <div className="absolute inset-x-0 h-[1px] bg-gray-100"></div>
            <span className="relative bg-white px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              OR REGISTER WITH EMAIL
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">
                Full Name
              </label>
              <input
                name="fullName"
                type="text"
                required
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-sm focus:bg-white focus:border-black outline-none transition-all placeholder:text-gray-300"
                placeholder="Enter your name"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                required
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-sm focus:bg-white focus:border-black outline-none transition-all placeholder:text-gray-300"
                placeholder="name@example.com"
              />
            </div>

            {/* Phone Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">
                Phone Number
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 font-bold text-[11px] text-black border-r border-gray-200 pr-2">
                  +91
                </div>
                <input
                  name="phone"
                  type="tel"
                  maxLength="10"
                  required
                  value={data.phone}
                  onChange={handleChange}
                  className="w-full p-3 pl-14 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-sm focus:bg-white focus:border-black outline-none transition-all tracking-widest placeholder:text-gray-300"
                  placeholder="0000000000"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-sm focus:bg-white focus:border-black outline-none transition-all placeholder:text-gray-300"
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
              className="w-full py-4 bg-black text-white rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-zinc-900 disabled:bg-zinc-700 mt-2"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  REGISTER <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wide">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-black border-b-2 border-black ml-1 hover:text-blue-600 hover:border-blue-600 transition-all"
            >
              Login Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
