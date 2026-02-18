import React from "react";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";

export default function GlobalLoader() {
  // Sabhi slices se loading state uthao
  const cartLoading = useSelector((state) => state.cart.isLoading);
  const orderLoading = useSelector((state) => state.order.isLoading);
  const couponLoading = useSelector((state) => state.coupon.isLoading);
  const productLoading = useSelector((state) => state.products.isLoading);

  if (!cartLoading && !orderLoading && !couponLoading && !productLoading)
    return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
      <div className="relative">
        {/* Krumeku Style Loader */}
        <Loader2 className="w-12 h-12 text-black animate-spin" />
        <div className="absolute inset-0 w-12 h-12 border-4 border-black/10 rounded-full"></div>
      </div>
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] italic text-black animate-pulse">
        Krumeku is Syncing...
      </p>
    </div>
  );
}
