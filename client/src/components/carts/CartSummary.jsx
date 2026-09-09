import React, { memo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Truck, Lock, Zap } from "lucide-react";
import { formatPrice } from "../../utils/formatters";
import Button from "../ui/Button";

const CartSummary = memo(({ billDetails, onCheckout, couponSection }) => {
  const {
    cartTotalExclTax = 0,
    gstAmount = 0,
    discountAmount = 0,
    shipping = 0,
    finalTotal = 0,
  } = billDetails || {};

  // ✅ Correct calculations
  const discountedBase = cartTotalExclTax - discountAmount; // ₹959
  const subtotal = discountedBase + gstAmount; // ₹1007

  return (
    <>
      <style>{`
        @keyframes cs-slide-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cs-row {
          animation: cs-slide-in 0.3s cubic-bezier(0.33,1,0.68,1) both;
        }
        .cs-row:nth-child(1) { animation-delay: 0.05s; }
        .cs-row:nth-child(2) { animation-delay: 0.10s; }
        .cs-row:nth-child(3) { animation-delay: 0.15s; }
        .cs-row:nth-child(4) { animation-delay: 0.20s; }

        .cs-btn { position: relative; overflow: hidden; }
        .cs-btn::after {
          content: '';
          position: absolute;
          top: 0; left: -80%; width: 55%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.09), transparent);
          transition: left 0.6s ease;
          pointer-events: none;
        }
        .cs-btn:hover::after { left: 135%; }

        .cs-badge {
          display: inline-flex; align-items: center;
          background: #000; color: #fff;
          font-size: 8.5px; font-weight: 900;
          letter-spacing: 0.1em; text-transform: uppercase;
          padding: 3px 12px 3px 8px;
          clip-path: polygon(7px 0%, 100% 0%, calc(100% - 7px) 100%, 0% 100%);
        }

        .cs-total-num {
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.03em;
        }
      `}</style>

      <div
        role="region"
        aria-label="Order Summary"
        className="flex flex-col select-none"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
            Order Summary
          </h2>
          {discountAmount > 0 && (
            <span className="cs-badge">
              Saving {formatPrice(discountAmount)}
            </span>
          )}
        </div>

        {/* ── Rows ── */}
        <div className="space-y-0">
          {/* Item Total */}
          <div className="cs-row flex justify-between items-start py-3.5 border-b border-zinc-100">
            <div>
              <p className="text-[13px] font-semibold text-zinc-800 leading-snug">
                Item Total
              </p>
              <p className="text-[10px] text-zinc-400 mt-0.5 font-medium">
                Price before tax
              </p>
            </div>
            <div className="text-right">
              {/* Strikethrough original price if coupon applied */}
              {discountAmount > 0 && (
                <p className="text-[11px] text-zinc-400 line-through tabular-nums">
                  {formatPrice(cartTotalExclTax)}
                </p>
              )}
              <span className="text-[13px] font-bold text-zinc-800 tabular-nums">
                {formatPrice(discountedBase)}
              </span>
            </div>
          </div>

          {/* GST */}
          <div className="cs-row flex justify-between items-start py-3.5 border-b border-zinc-100">
            <div>
              <p className="text-[13px] font-semibold text-zinc-500 leading-snug">
                GST{" "}
                <span className="text-[10px] font-normal text-zinc-400">
                  (Govt. tax)
                </span>
              </p>
              <p className="text-[10px] text-zinc-400 mt-0.5 font-medium">
                Included in your final price
              </p>
            </div>
            <span className="text-[13px] font-semibold text-zinc-400 tabular-nums">
              +&thinsp;{formatPrice(gstAmount)}
            </span>
          </div>

          {/* Subtotal */}
          <div className="cs-row flex justify-between items-center py-3.5 border-b border-zinc-200">
            <p className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-500">
              Subtotal
            </p>
            <span className="text-[14px] font-black text-zinc-800 tabular-nums">
              {formatPrice(subtotal)}
            </span>
          </div>

          {/* Delivery */}
          <div className="cs-row flex justify-between items-start py-3.5">
            <div className="flex items-start gap-1.5">
              <Truck
                size={11}
                className={`mt-1 shrink-0 ${shipping === 0 ? "text-emerald-500" : "text-zinc-400"}`}
              />
              <div>
                <p className="text-[13px] font-semibold text-zinc-800 leading-snug">
                  Delivery
                </p>
                <p
                  className={`text-[10px] mt-0.5 font-medium ${shipping === 0 ? "text-emerald-500" : "text-zinc-400"}`}
                >
                  {shipping === 0
                    ? "Free on orders above ₹1,000 ✓"
                    : "Free delivery on orders above ₹1,000"}
                </p>
              </div>
            </div>
            <span
              className={`text-[13px] font-black tabular-nums ${shipping === 0 ? "text-emerald-600" : "text-zinc-800"}`}
            >
              {shipping === 0 ? "FREE" : `+\u2009${formatPrice(shipping)}`}
            </span>
          </div>
        </div>

        {/* ── Grand Total ── */}
        <div className="mt-1 pt-5 border-t-[2.5px] border-black">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 mb-1">
                Grand Total
              </p>
              <p className="text-[10px] text-zinc-400 font-medium">
                Incl. all taxes &amp; charges
              </p>
            </div>
            <p
              className="cs-total-num text-[32px] font-black text-zinc-900 leading-none"
              aria-label={`Grand total ${formatPrice(finalTotal)}`}
            >
              {formatPrice(finalTotal)}
            </p>
          </div>
        </div>

        {/* ── Coupon Input ── */}
        <div className="mt-6 pt-5 border-t border-dashed border-zinc-200">
          {couponSection}
        </div>

        {/* ── CTA ── */}
        <div className="cs-btn mt-5 rounded-none">
          <Button
            variant="primary"
            onClick={onCheckout}
            className="w-full py-[14px] text-[11px] font-black tracking-[0.25em] uppercase rounded-none"
            size="lg"
          >
            Proceed to Checkout
            <ArrowRight size={14} className="ml-2" aria-hidden="true" />
          </Button>
        </div>

        {/* ── Trust ── */}
        <div className="flex items-center justify-center gap-1.5 mt-4 opacity-40">
          <Lock size={10} aria-hidden="true" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">
            Secure &middot; UPI &middot; Cards &middot; COD
          </span>
        </div>
      </div>
    </>
  );
});

CartSummary.displayName = "CartSummary";
export default CartSummary;
