import React, { memo } from "react";
import { X, TicketPercent, AlertCircle, Loader2 } from "lucide-react";

const CouponSection = memo(
  ({
    couponInput,
    setCouponInput,
    handleApply,
    handleRemove,
    isError,
    message,
    discountAmount, 
    isLoading, 
  }) => {
   
    const isCouponActive = discountAmount > 0;

    return (
      <div className="py-2">
        {!isCouponActive ? (
          <div className="relative group">
            <input
              type="text"
              placeholder="ENTER PROMO CODE"
              aria-label="Enter promo code"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              className={`w-full border-b-2 py-2 text-xs font-black uppercase outline-none transition-colors ${
                isError
                  ? "border-red-400"
                  : "border-gray-200 focus:border-black"
              }`}
            />
            <button
              type="button"
              disabled={isLoading || !couponInput}
              onClick={handleApply}
              className="absolute right-0 top-1 text-[10px] font-black uppercase text-blue-600 hover:text-black disabled:text-gray-300 transition-all"
            >
              {isLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                "Apply"
              )}
            </button>
          </div>
        ) : (
          /* 🔥 Active Coupon State: Ye tab dikhega jab discountAmount > 0 ho */
          <div className="flex items-center justify-between bg-emerald-600 text-white px-4 py-3 rounded-sm shadow-md animate-in fade-in slide-in-from-top-1">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <TicketPercent size={14} className="text-white" />
                <span className="text-[10px] font-black uppercase tracking-tighter">
                  COUPON APPLIED
                </span>
              </div>
              <p className="text-[9px] font-bold opacity-90 italic">
                Discount reflected in total
              </p>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="bg-white/20 hover:bg-white/40 rounded-full p-1 transition-colors"
              title="Remove Coupon"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Error Feedback */}
        {isError && message && (
          <div
            role="alert"
            className="mt-3 p-2 bg-red-50 border-l-2 border-red-500 flex items-start gap-2 animate-shake"
          >
            <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-[10px] font-bold text-red-700 uppercase leading-tight">
              {message}
            </p>
          </div>
        )}
      </div>
    );
  },
);

CouponSection.displayName = "CouponSection";
export default CouponSection;
