import React from "react";
import { ArrowRight, BadgePercent, ShieldCheck } from "lucide-react";

export default function CartSummary({
  billDetails,
  onCheckout,
  couponSection,
}) {
  const {
    cartTotalExclTax = 0,
    gstAmount = 0,
    shipping = 0,
    finalTotal = 0,
    discountAmount = 0,
  } = billDetails;

  // 🔥 NEW: Customer ko clear math dikhane ke liye Total calculate kiya (Delivery se pehle)
  const itemsTotal = cartTotalExclTax - discountAmount + gstAmount;

  return (
    <div className="bg-white rounded-md border border-gray-200 shadow-sm p-5 md:p-6 flex flex-col gap-5">
      {/* HEADER */}
      <div className="border-b border-gray-200 pb-3">
        <h2 className="text-xs md:text-sm font-bold uppercase tracking-widest text-gray-500">
          Price Details
        </h2>
      </div>

      {/* PRICE BREAKDOWN (With Math Signs) */}
      <div className="space-y-3">
        {/* Total MRP */}
        <div className="flex justify-between items-center text-[13px] md:text-sm font-medium text-gray-800">
          <span>Total MRP</span>
          <span>₹{cartTotalExclTax.toLocaleString("en-IN")}</span>
        </div>

        {/* Discount */}
        {discountAmount > 0 && (
          <div className="flex justify-between items-center text-[13px] md:text-sm font-medium text-emerald-600">
            <span>Discount on MRP</span>
            <span>- ₹{discountAmount.toLocaleString("en-IN")}</span>
          </div>
        )}

        {/* GST */}
        <div className="flex justify-between items-center text-[13px] md:text-sm font-medium text-gray-800">
          <span>Tax (GST)</span>
          <span>+ ₹{gstAmount.toLocaleString("en-IN")}</span>
        </div>

        {/* 🔥 NEW: Subtotal Line (MRP + GST) */}
        <div className="flex justify-between items-center text-[13px] md:text-sm font-bold text-gray-900 border-t border-gray-100 pt-3 mt-1">
          <span>Subtotal (incl. GST)</span>
          <span>₹{itemsTotal.toLocaleString("en-IN")}</span>
        </div>

        {/* Delivery Charges */}
        <div className="flex justify-between items-center text-[13px] md:text-sm font-medium text-gray-800">
          <span>Delivery Charges</span>
          <span
            className={
              shipping === 0 ? "text-emerald-600 font-bold" : "text-gray-800"
            }
          >
            {shipping === 0 ? "FREE" : `+ ₹${shipping.toLocaleString("en-IN")}`}
          </span>
        </div>
      </div>

      {/* COUPON SECTION */}
      <div className="py-2 border-t border-dashed border-gray-200 mt-1">
        {couponSection}
      </div>

      {/* FINAL TOTAL */}
      <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-200">
        <span className="text-base font-bold text-gray-900">Total Amount</span>
        <span className="text-xl font-black text-gray-900">
          ₹{finalTotal.toLocaleString("en-IN")}
        </span>
      </div>

      {/* THE GREEN SAVINGS BANNER */}
      {discountAmount > 0 && (
        <div className="bg-emerald-50 text-emerald-700 text-xs font-bold p-3 rounded flex items-center gap-2">
          <BadgePercent size={18} />
          You will save ₹{discountAmount.toLocaleString("en-IN")} on this order
        </div>
      )}

      {/* CHECKOUT BUTTON */}
      <button
        onClick={onCheckout}
        className="w-full bg-zinc-900 text-white h-12 rounded font-bold uppercase tracking-widest text-sm hover:bg-black transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 mt-2"
      >
        PLACE ORDER
        <ArrowRight size={18} />
      </button>

      {/* TRUST BADGE */}
      <div className="flex items-center justify-center gap-1.5 text-gray-400 mt-1">
        <ShieldCheck size={14} className="text-emerald-500" />
        <span className="text-[10px] font-bold uppercase tracking-widest">
          Safe and Secure Payments
        </span>
      </div>
    </div>
  );
}
