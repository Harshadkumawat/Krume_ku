// frontend/src/components/admin/ProductFormParts/PricingSection.jsx
// ✅ UPDATED — 1 fix
// FIX: Removed "In Stock" checkbox — backend calculates from sizes array
//      Admin was toggling it but pre-save hook overwrites it every time

import React from "react";
import { DollarSign, Percent } from "lucide-react";

export default function PricingSection({
  form,
  updateField,
  discountedPrice,
  discountAmount,
  isLoading,
  isEditMode,
  SectionHeader,
}) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-xl lg:sticky lg:top-6">
      <SectionHeader title="Pricing Protocol" icon={DollarSign} />

      <div className="space-y-5">
        <div>
          <label className="input-label">M.R.P (₹)</label>
          <input
            required
            type="number"
            className="input-field text-lg font-black"
            placeholder="999"
            value={form.price}
            onChange={(e) => updateField("price", e.target.value)}
          />
        </div>

        <div>
          <label className="input-label">Discount %</label>
          <div className="relative">
            <input
              type="number"
              className="input-field"
              placeholder="10"
              value={form.discountPercent}
              onChange={(e) => updateField("discountPercent", e.target.value)}
            />
            <Percent
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600"
              size={14}
            />
          </div>
        </div>

        <div className="bg-black rounded-2xl p-5 border border-neutral-800 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase text-neutral-500">
              Sale Price
            </span>
            <span className="text-xl font-black text-indigo-400 italic">
              ₹{discountedPrice.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-neutral-800 text-red-500">
            <span className="text-[9px] font-black uppercase">Savings</span>
            <span className="text-[11px] font-black">
              -₹{discountAmount.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="pt-6 border-t border-neutral-800 space-y-3">
          {/* ✅ FIX: Removed "In Stock" checkbox
              Backend pre-save hook calculates inStock from sizes[].stock
              This checkbox was misleading — admin thought it worked
              but value was always overwritten on save */}

          <div className="flex items-center justify-between p-4 bg-black rounded-xl border border-neutral-800">
            <span className="text-[10px] font-black uppercase text-neutral-500">
              Featured
            </span>
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => updateField("isFeatured", e.target.checked)}
              className="accent-indigo-500 w-4 h-4 cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-black rounded-xl border border-neutral-800">
            <span className="text-[10px] font-black uppercase text-indigo-400">
              New Arrival
            </span>
            <input
              type="checkbox"
              checked={form.isNewArrival}
              onChange={(e) => updateField("isNewArrival", e.target.checked)}
              className="accent-indigo-500 w-4 h-4 cursor-pointer"
            />
          </div>

          {/* Stock info — read-only from sizes */}
          <div className="flex items-center justify-between p-4 bg-black rounded-xl border border-neutral-800">
            <span className="text-[10px] font-black uppercase text-neutral-500">
              Total Stock
            </span>
            <span className="text-sm font-black text-indigo-400">
              {form.sizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0)}{" "}
              units
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 rounded-xl bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-neutral-200 transition-all active:scale-95 disabled:opacity-50 mt-4 shadow-xl shadow-white/5"
        >
          {isLoading
            ? "Processing..."
            : isEditMode
              ? "Update Product"
              : "Publish Product"}
        </button>
      </div>
    </div>
  );
}
