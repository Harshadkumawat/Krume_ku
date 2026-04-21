import React, { useEffect, useState, memo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";

const ProtectedRoute = memo(() => {
  const { user, isLoading } = useSelector((state) => state.auth);
  const location = useLocation();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    let timer;
    if (isLoading) {
      timer = setTimeout(() => {
        setTimedOut(true);
        console.warn("🛡️ Auth timeout: Proceeding with fallback check.");
      }, 3000);
    } else {
      setTimedOut(false);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (isLoading && !timedOut) {
    return (
      <main
        className="h-screen flex flex-col items-center justify-center bg-white"
        role="status"
        aria-live="polite"
      >
        <div className="relative flex items-center justify-center">
          <Loader2
            className="animate-spin text-black"
            size={42}
            strokeWidth={2.5}
            aria-hidden="true"
          />
          <div className="absolute inset-0 border-4 border-zinc-100 rounded-full -z-10"></div>
        </div>
        <p className="mt-5 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 animate-pulse">
          Authenticating
        </p>
      </main>
    );
  }

  if (!user && (!isLoading || timedOut)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
});

ProtectedRoute.displayName = "ProtectedRoute";
export default ProtectedRoute;
