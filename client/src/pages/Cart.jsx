import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Loader2, ArrowRight, ShoppingBag } from "lucide-react";

import {
  removeCartItem,
  updateCartItem,
  resetCartState,
} from "../features/cart/cartSlice";
import {
  applyCoupon,
  removeCoupon,
  resetCouponState,
} from "../features/coupon/couponSlice";

import CartItem from "../components/carts/CartItem";
import CartSummary from "../components/carts/CartSummary";
import CouponSection from "../components/carts/CouponSection";

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState("");

  const { cartItems, billDetails, isLoading, couponRemoved } = useSelector(
    (state) => state.cart,
  );

  const { appliedCoupon, isError, message } = useSelector(
    (state) => state.coupon,
  );

  useEffect(() => {
    dispatch(resetCouponState());
  }, [dispatch]);

  useEffect(() => {
    if (couponRemoved) {
      toast.error("Subtotal ₹999 se kam hone ki wajah se coupon hat gaya!");
      dispatch(resetCartState());
      dispatch(resetCouponState());
    }
  }, [couponRemoved, dispatch]);

  const handleQuantity = (itemId, currentQty, action) => {
    if (action === "dec" && currentQty <= 1) return;
    dispatch(updateCartItem({ itemId, action }));
  };

  // 🔥 NAYA FUNCTION: Size Update karne ke liye
  const handleSizeChange = (itemId, newSize) => {
    dispatch(updateCartItem({ itemId, action: "updateSize", size: newSize }));
  };

  const onCheckout = () => {
    if (billDetails?.finalTotal > 0) {
      navigate("/shipping", { state: { finalAmount: billDetails.finalTotal } });
    }
  };

  if (isLoading && (!cartItems || cartItems.length === 0)) {
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-black" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
          Updating Bag...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-20 md:pt-32 pb-24 lg:pb-32 selection:bg-black selection:text-white overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12">
        {/* --- Header Section --- */}
        <div className="mb-10 md:mb-16">
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-3 italic">
            Your <span className="text-transparent stroke-text-black">Bag</span>
          </h1>
          <div className="flex items-center gap-3">
            <span className="h-[2px] w-8 bg-black"></span>
            <p className="text-[10px] md:text-sm font-black uppercase tracking-widest text-zinc-400">
              {cartItems?.length || 0} Items in your bag
            </p>
          </div>
        </div>

        {!cartItems || cartItems.length === 0 ? (
          <div className="text-center py-24 md:py-32 bg-zinc-50 rounded-[2rem] border-2 border-dashed border-zinc-100 italic px-6">
            <ShoppingBag className="mx-auto mb-6 text-zinc-200" size={60} />
            <h2 className="text-xl md:text-2xl font-black uppercase mb-6 text-zinc-400">
              Your bag is currently empty
            </h2>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95 shadow-xl"
            >
              Start Shopping <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 items-start">
            {/* --- Left Column: Items --- */}
            <div className="lg:col-span-8 flex flex-col divide-y divide-zinc-100 border-t-2 border-black">
              {cartItems.map((item) => (
                <div key={item._id} className="py-2">
                  <CartItem
                    item={item}
                    handleQuantity={handleQuantity}
                    onRemove={(id) => dispatch(removeCartItem(id))}
                    handleSizeChange={handleSizeChange} // 🔥 YAHAN ADD KIYA HAI
                  />
                </div>
              ))}

              {/* Back to Shop link for mobile */}
              <Link
                to="/products"
                className="lg:hidden flex items-center justify-center gap-2 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400"
              >
                <ArrowRight size={12} className="rotate-180" /> Continue
                Shopping
              </Link>
            </div>

            {/* --- Right Column: Summary & Coupon --- */}
            <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-32">
              <div className="bg-zinc-50 rounded-[2rem] p-6 md:p-8 border border-zinc-100 shadow-sm">
                <CartSummary
                  billDetails={billDetails}
                  onCheckout={onCheckout}
                  couponSection={
                    <CouponSection
                      couponInput={couponInput}
                      setCouponInput={setCouponInput}
                      handleApply={() => {
                        if (!couponInput.trim())
                          return toast.info("Enter coupon code");
                        dispatch(
                          applyCoupon({
                            code: couponInput.toUpperCase().trim(),
                          }),
                        );
                        setCouponInput("");
                      }}
                      appliedCoupon={appliedCoupon}
                      handleRemove={() => dispatch(removeCoupon())}
                      isError={isError}
                      message={message}
                      discountAmount={billDetails?.discountAmount || 0}
                    />
                  }
                />
              </div>

              {/* Trust Badges - Essential for Indian Vibe */}
              <div className="px-4 py-2 grid grid-cols-3 gap-4 border-t border-zinc-100 pt-8 opacity-60">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600">
                    ₹
                  </div>
                  <p className="text-[8px] font-black uppercase tracking-tighter">
                    Secure Payment
                  </p>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600">
                    7D
                  </div>
                  <p className="text-[8px] font-black uppercase tracking-tighter">
                    Easy Returns
                  </p>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600">
                    100
                  </div>
                  <p className="text-[8px] font-black uppercase tracking-tighter">
                    Genuine Artifacts
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`.stroke-text-black { -webkit-text-stroke: 1px black; }`}</style>
    </div>
  );
}
