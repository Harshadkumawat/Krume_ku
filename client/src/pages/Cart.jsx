import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  RotateCcw,
  Scissors,
  Loader2,
  ArrowLeft,
} from "lucide-react";

import {
  removeCartItem,
  updateCartItem,
  resetCartState,
  applyCoupon,
  removeCoupon,
} from "../features/cart/cartSlice";

import CartItem from "../components/carts/CartItem";
import CartSummary from "../components/carts/CartSummary";
import CouponSection from "../components/carts/CouponSection";
import SEO from "../components/SEO";
import { ListSkeleton } from "../components/Skeletons";
import Button from "../components/ui/Button";

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState("");

  const {
    cartItems,
    billDetails,
    isLoading,
    isError,
    message,
    couponRemoved,
    appliedCoupon,
  } = useSelector((state) => state.cart);

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
      dispatch(resetCartState());
    }
  }, [isError, message, dispatch]);

  useEffect(() => {
    if (couponRemoved) {
      toast.error("Coupon removed — cart total dropped below minimum.");
      dispatch(resetCartState());
    }
  }, [couponRemoved, dispatch]);

  const handleQuantity = useCallback(
    (itemId, action) => dispatch(updateCartItem({ itemId, action })),
    [dispatch],
  );

  const handleSizeChange = useCallback(
    (itemId, newSize) =>
      dispatch(updateCartItem({ itemId, action: "updateSize", size: newSize })),
    [dispatch],
  );

  const handleRemoveItem = useCallback(
    (id) => dispatch(removeCartItem(id)),
    [dispatch],
  );

  const handleApplyCoupon = useCallback(() => {
    if (!couponInput.trim()) return toast.info("Enter a promo code first.");
    dispatch(resetCartState());
    dispatch(applyCoupon({ code: couponInput.toUpperCase().trim() }));
    setCouponInput("");
  }, [couponInput, dispatch]);

  const handleRemoveCoupon = useCallback(
    () => dispatch(removeCoupon()),
    [dispatch],
  );

  const onCheckout = useCallback(() => {
    if (!cartItems?.length) return toast.warning("Your bag is empty.");
    if (!billDetails?.finalTotal || billDetails.finalTotal <= 0)
      return toast.warning("Cart total is invalid.");
    navigate("/shipping", { state: { finalAmount: billDetails.finalTotal } });
  }, [cartItems, billDetails?.finalTotal, navigate]);

  // ── Skeleton loader ────────────────────────────────────────────────────────
  if (isLoading && (!cartItems || cartItems.length === 0)) {
    return (
      <div className="bg-white min-h-screen pt-20 md:pt-28 pb-24">
        <SEO title="Your Bag" />
        <div className="max-w-[1320px] mx-auto px-5 md:px-10 lg:px-16">
          <div className="mb-10 md:mb-14">
            <div className="h-16 w-64 bg-zinc-100 rounded animate-pulse mb-3" />
            <div className="h-3 w-32 bg-zinc-100 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              {[...Array(3)].map((_, i) => (
                <ListSkeleton key={i} />
              ))}
            </div>
            <div className="lg:col-span-5 xl:col-span-4 h-[520px] bg-zinc-50 border border-zinc-100 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // ── Empty bag ──────────────────────────────────────────────────────────────
  const isEmpty = !cartItems || cartItems.length === 0;

  return (
    <>
      <style>{`
        .stroke-bag {
          -webkit-text-stroke: 1.5px #000;
          color: transparent;
        }
        @keyframes cart-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cart-page { animation: cart-fade-up 0.4s cubic-bezier(0.33,1,0.68,1) both; }

        .item-row { transition: background 0.15s; }
        .item-row:hover { background: #fafafa; }

        .summary-card {
          border: 1.5px solid #e4e4e7;
          background: #fff;
          box-shadow: 0 2px 16px 0 rgba(0,0,0,0.04), 0 1px 3px 0 rgba(0,0,0,0.06);
        }

        .trust-badge {
          display: flex; flex-direction: column;
          align-items: center; gap: 6px; text-align: center;
        }
        .trust-badge-icon {
          width: 36px; height: 36px; border: 1.5px solid #e4e4e7;
          display: flex; align-items: center; justify-content: center;
          color: #71717a;
        }
      `}</style>

      <div className="bg-white min-h-screen pt-20 md:pt-28 pb-28 overflow-x-hidden selection:bg-black selection:text-white">
        <SEO
          title="Your Bag"
          description="Review your selected Krumeku streetwear before checkout."
        />

        <div className="max-w-[1320px] mx-auto px-5 md:px-10 lg:px-16 cart-page">
          {/* ── Page Header ── */}
          <div className="mb-10 md:mb-14">
            <h1 className="text-5xl md:text-[80px] font-black uppercase tracking-tighter leading-[0.9] italic mb-3">
              Your <span className="stroke-bag">Bag</span>
            </h1>
            <div className="flex items-center gap-3 mt-4">
              <div className="h-[2px] w-6 bg-black" />
              <p
                className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400"
                aria-live="polite"
              >
                {cartItems?.length || 0}{" "}
                {cartItems?.length === 1 ? "Piece" : "Pieces"} Selected
              </p>
            </div>
          </div>

          {/* ── Empty State ── */}
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center py-28 md:py-36 border-2 border-dashed border-zinc-200">
              <ShoppingBag
                size={52}
                className="text-zinc-200 mb-6"
                aria-hidden="true"
                strokeWidth={1.5}
              />
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-zinc-300 mb-2">
                Your bag is empty
              </h2>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-300 mb-10">
                Add some pieces to get started
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate("/products")}
                className="text-[11px] font-black tracking-[0.2em] uppercase"
              >
                Explore Collection
                <ArrowRight size={14} className="ml-2" />
              </Button>
            </div>
          ) : (
            /* ── Bag Content ── */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-16 items-start">
              {/* ── Left: Items ── */}
              <div className="lg:col-span-7 xl:col-span-8">
                {/* Column headers — desktop only */}
                <div className="hidden md:grid grid-cols-[1fr_auto] mb-1 pb-2 border-b-2 border-black">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">
                    Product
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">
                    Total
                  </p>
                </div>

                {/* Item rows */}
                <div role="list">
                  {cartItems.map((item, i) => (
                    <div
                      key={item._id}
                      className="item-row border-b border-zinc-100 last:border-b-0"
                      role="listitem"
                      style={{ animationDelay: `${i * 0.06}s` }}
                    >
                      <CartItem
                        item={item}
                        handleQuantity={handleQuantity}
                        onRemove={handleRemoveItem}
                        handleSizeChange={handleSizeChange}
                      />
                    </div>
                  ))}
                </div>

                {/* Continue shopping — desktop */}
                <div className="hidden lg:flex items-center mt-8">
                  <button
                    type="button"
                    onClick={() => navigate("/products")}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-colors"
                  >
                    <ArrowLeft size={12} />
                    Continue Shopping
                  </button>
                </div>

                {/* Continue shopping — mobile */}
                <div className="lg:hidden flex justify-center mt-8">
                  <Button variant="ghost" onClick={() => navigate("/products")}>
                    <ArrowLeft size={12} className="mr-2" />
                    Continue Shopping
                  </Button>
                </div>
              </div>

              {/* ── Right: Summary ── */}
              <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-28 space-y-6">
                {/* Summary card */}
                <div className="summary-card relative p-6 md:p-7">
                  {/* Loading overlay */}
                  {isLoading && cartItems.length > 0 && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                      <Loader2 className="animate-spin text-black" size={22} />
                    </div>
                  )}

                  <CartSummary
                    billDetails={billDetails}
                    onCheckout={onCheckout}
                    couponSection={
                      <CouponSection
                        couponInput={couponInput}
                        setCouponInput={setCouponInput}
                        handleApply={handleApplyCoupon}
                        appliedCoupon={appliedCoupon}
                        handleRemove={handleRemoveCoupon}
                        isError={isError}
                        message={message}
                        discountAmount={billDetails?.discountAmount || 0}
                        isLoading={isLoading}
                      />
                    }
                  />
                </div>

                {/* Trust badges */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {[
                    { icon: <ShieldCheck size={14} />, label: "Secure Pay" },
                    { icon: <RotateCcw size={14} />, label: "7-Day Returns" },
                    { icon: <Scissors size={14} />, label: "In-House Made" },
                  ].map(({ icon, label }) => (
                    <div key={label} className="trust-badge opacity-50">
                      <div className="trust-badge-icon">{icon}</div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
