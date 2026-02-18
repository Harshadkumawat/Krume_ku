import React from "react";
import { X, TicketPercent, AlertCircle } from "lucide-react";

export default function CouponSection({
  couponInput,
  setCouponInput,
  handleApply,
  appliedCoupon,
  handleRemove,
  isError,
  message,
  discountAmount,
}) {
  return (
    <div className="py-2">
      {discountAmount === 0 ? (
        <div className="relative">
          <input
            type="text"
            placeholder="PROMO CODE"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            className="w-full border-b-2 py-2 text-xs font-black uppercase outline-none focus:border-black"
          />
          <button
            onClick={handleApply}
            className="absolute right-0 top-1 text-[10px] font-black uppercase text-gray-400 hover:text-black"
          >
            Apply
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-black text-white px-4 py-3 text-[10px] font-black uppercase italic tracking-widest">
          <div className="flex items-center gap-2">
            <TicketPercent size={14} className="text-teal-400" /> COUPON ACTIVE
          </div>
          <X
            size={14}
            className="cursor-pointer hover:text-red-400"
            onClick={handleRemove}
          />
        </div>
      )}

      {isError && message && (
        <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-500 flex items-center gap-3">
          <AlertCircle size={16} className="text-red-500 shrink-0" />
          <p className="text-[11px] font-bold text-red-700 uppercase leading-tight">
            {message}
          </p>
        </div>
      )}
    </div>
  );
}
