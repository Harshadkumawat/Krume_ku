import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";

const ProtectedRoute = () => {
  const { user, isLoading } = useSelector((state) => state.auth);
  const location = useLocation();
  const [timedOut, setTimedOut] = useState(false);

  // 🛡️ Safety Timer: 3 seconds ka buffer (Standard time)
  useEffect(() => {
    let timer;
    if (isLoading) {
      timer = setTimeout(() => {
        setTimedOut(true);
        console.warn(
          "🛡️ Auth timeout: User status unknown, allowing bypass check.",
        );
      }, 3000);
    } else {
      setTimedOut(false); // Agar loading khatam ho jaye to timeout reset karo
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  
  if (isLoading && !timedOut) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <div className="relative flex items-center justify-center">
          <Loader2
            className="animate-spin text-black"
            size={42}
            strokeWidth={2.5}
          />
          <div className="absolute inset-0 border-4 border-gray-100 rounded-full -z-10"></div>
        </div>
        <p className="mt-5 text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 animate-pulse">
          Authenticating
        </p>
      </div>
    );
  }

  
 
  if (!user && (!isLoading || timedOut)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  
  return <Outlet />;
};

export default ProtectedRoute;
