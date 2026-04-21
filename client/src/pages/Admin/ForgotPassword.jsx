import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Mail, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import { forgotPassword, reset } from "../../features/auth/authSlice";
import SEO from "../../components/SEO";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const { isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.auth,
  );

  const emailRef = useRef(email);
  emailRef.current = email;

  useEffect(() => {
    if (isSuccess) {
      toast.success(message || "Reset link dispatched to your email!");
      dispatch(reset());
      setEmail("");
    }
    if (isError) {
      toast.error(message);
      dispatch(reset());
    }
  }, [isSuccess, isError, message, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedEmail = emailRef.current.trim().toLowerCase();
    if (!trimmedEmail)
      return toast.error("Please enter your registered email.");
    dispatch(forgotPassword(trimmedEmail));
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans selection:bg-black selection:text-white">
      <SEO
        title="Forgot Password"
        description="Recover access to your Krumeku account by requesting a password reset link."
      />

      <div className="w-full max-w-[420px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden border border-gray-100">
        <div className="bg-black p-8 text-center relative">
          <Link
            to="/"
            aria-label="Go to Krumeku homepage"
            className="text-white text-2xl font-black uppercase tracking-tighter italic outline-none focus-visible:ring-2 focus-visible:ring-white rounded px-2"
          >
            KRUMEKU
            <span className="text-blue-500" aria-hidden="true">
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
              Recover Access
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">
              Enter your email to receive a reset link
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="space-y-1.5">
              <label
                htmlFor="recovery-email"
                className="text-[9px] font-black uppercase text-gray-400 ml-1"
              >
                Registered Email
              </label>
              <div className="relative focus-within:ring-2 focus-within:ring-black rounded-2xl transition-all">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                  size={16}
                  aria-hidden="true"
                />
                <input
                  id="recovery-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full p-3.5 pl-12 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-sm focus:bg-white outline-none transition-all disabled:opacity-60"
                  placeholder="name@archive.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim()}
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
                "Send Reset Link"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-50 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 hover:text-black transition-colors outline-none focus-visible:ring-2 focus-visible:ring-black rounded px-1"
            >
              <ArrowLeft size={14} aria-hidden="true" /> Back to Login
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-gray-400 opacity-50">
            <ShieldCheck size={14} aria-hidden="true" />
            <span className="text-[8px] font-black uppercase tracking-widest">
              Secured by Krumeku Guard
            </span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ForgotPassword;
