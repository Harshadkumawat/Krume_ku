import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

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

  const onCheckout = () => {
    if (billDetails?.finalTotal > 0) {
      navigate("/shipping", { state: { finalAmount: billDetails.finalTotal } });
    }
  };

  if (isLoading && (!cartItems || cartItems.length === 0)) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin text-black w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-28 pb-20 selection:bg-black selection:text-white">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="mb-16">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-2 italic">
            Shopping Bag
          </h1>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            {cartItems?.length || 0} Items Selected
          </p>
        </div>

        {!cartItems || cartItems.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-100 italic">
            <h2 className="text-2xl font-black uppercase mb-4 opacity-30">
              Your bag is empty
            </h2>
            <Link
              to="/products"
              className="text-xs font-black uppercase border-b-2 border-black pb-1 hover:text-gray-500"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-8 border-t-2 border-black">
              {cartItems.map((item) => (
                <CartItem
                  key={item._id}
                  item={item}
                  handleQuantity={handleQuantity}
                  onRemove={(id) => dispatch(removeCartItem(id))}
                />
              ))}
            </div>

            <div className="lg:col-span-4 lg:sticky lg:top-32">
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
                        applyCoupon({ code: couponInput.toUpperCase().trim() }),
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
          </div>
        )}
      </div>
    </div>
  );
}
