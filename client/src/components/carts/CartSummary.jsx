import React from "react";
import { ArrowRight } from "lucide-react";
import { TicketPercent } from "lucide-react";

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

  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-sm p-6 space-y-4">
      <div className="font-black uppercase italic border-b pb-4">Summary</div>
      <div className="flex justify-between text-sm font-bold uppercase tracking-widest">
        <span className="text-gray-400">Subtotal</span>
        <span className="font-black">₹{cartTotalExclTax.toLocaleString()}</span>
      </div>

      {discountAmount > 0 && (
        <div className="flex justify-between p-3 border-2 border-dashed border-green-200 bg-green-50/50 my-2">
          <span className="text-xs font-black uppercase text-green-700 italic flex items-center gap-2">
            <TicketPercent size={14} /> DISCOUNT APPLIED
          </span>
          <span className="font-black text-green-700">
            - ₹{discountAmount.toLocaleString()}
          </span>
        </div>
      )}

      <div className="flex justify-between text-sm font-bold uppercase tracking-widest">
        <span className="text-gray-400">GST</span>
        <span className="font-black">₹{gstAmount.toLocaleString()}</span>
      </div>

      <div className="flex justify-between text-sm font-bold uppercase tracking-widest border-b pb-4">
        <span className="text-gray-400">Shipping</span>
        <span
          className={
            shipping === 0 ? "text-teal-600 font-black italic" : "font-black"
          }
        >
          {shipping === 0 ? "FREE" : `₹${shipping}`}
        </span>
      </div>

      {couponSection}

      <div className="flex justify-between items-center pt-4 border-t-2 border-black">
        <span className="text-lg font-black uppercase italic tracking-tighter">
          Total Amount
        </span>
        <span className="text-2xl font-black italic">
          ₹{finalTotal.toLocaleString()}
        </span>
      </div>

      <button
        onClick={onCheckout}
        className="w-full bg-[#167a7a] text-white py-5 font-black uppercase tracking-[0.3em] text-xs hover:bg-[#126666] flex items-center justify-center gap-4 group italic"
      >
        Place Order{" "}
        <ArrowRight
          size={18}
          className="group-hover:translate-x-2 transition-transform"
        />
      </button>
    </div>
  );
}
