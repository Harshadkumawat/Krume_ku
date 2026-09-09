

import React from "react";
import { Check } from "lucide-react";

const CheckoutStepper = () => {
  return (
    <div
      className="hidden md:flex justify-center items-center gap-0 mb-10"
      aria-hidden="true"
    >
      {/* Cart */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
          <Check size={14} className="text-white" strokeWidth={3} />
        </div>

        <span className="text-[9px] font-black uppercase tracking-widest text-black">
          Cart
        </span>
      </div>

      <div className="h-[2px] w-16 bg-black mb-5" />

      {/* Shipping */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center ring-4 ring-black/10">
          <span className="text-white text-[11px] font-black">2</span>
        </div>

        <span className="text-[9px] font-black uppercase tracking-widest text-black">
          Shipping
        </span>
      </div>

      <div className="h-[2px] w-16 bg-zinc-200 mb-5" />

      {/* Payment */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-200 flex items-center justify-center">
          <span className="text-zinc-400 text-[11px] font-black">3</span>
        </div>

        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
          Payment
        </span>
      </div>
    </div>
  );
};

export default CheckoutStepper;
