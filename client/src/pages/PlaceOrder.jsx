import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createOrder, resetOrderState } from "../features/orders/orderSlice";
import { clearCart } from "../features/cart/cartSlice";
import {
  Loader2,
  MapPin,
  Package,
  CreditCard,
  ArrowRight,
  Banknote,
  ShieldCheck,
  Zap,
  TicketPercent,
  Lock,
} from "lucide-react";
import { toast } from "react-toastify";
import SmartImage from "../components/SmartImage";

export default function PlaceOrder() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cart = useSelector((state) => state.cart);
  const { isSuccess, isLoading, isError, message } = useSelector(
    (state) => state.order,
  );
  const { billDetails, shippingAddress, cartItems } = cart;

  const [selectedPayment, setSelectedPayment] = useState("COD");

  
  useEffect(() => {
    dispatch(resetOrderState());
  }, [dispatch]);

  
  useEffect(() => {
    if (!shippingAddress.address) {
      navigate("/shipping");
    } else if (cartItems.length === 0) {
      navigate("/products");
    }
  }, [shippingAddress, cartItems, navigate]);

  const placeOrderHandler = () => {
    if (isLoading) return;

    const formattedOrderItems = cartItems.map((item) => ({
      product: item.product?._id || item.product,
      productName: item.product?.productName || item.productName,
      image:
        item.product?.images?.[0]?.public_id ||
        item.product?.images?.[0] ||
        item.image,
      price:
        item.product?.discountPrice || item.product?.price || item.price || 0,
      quantity: item.quantity,
      size: item.size || "M",
      color: item.color || "Standard",
    }));

    dispatch(
      createOrder({
        orderItems: formattedOrderItems,
        shippingAddress: {
          address: shippingAddress.address,
          city: shippingAddress.city,
          postalCode: shippingAddress.pincode,
          country: "India",
          phone: shippingAddress.phone,
          state: shippingAddress.state,
        },
        paymentMethod: selectedPayment,
        itemsPrice: billDetails?.cartTotalExclTax || 0,
        shippingPrice: billDetails?.shipping || 0,
        taxPrice: billDetails?.gstAmount || 0,
        discountPrice: billDetails?.discountAmount || 0,
        totalPrice: billDetails?.finalTotal || 0,
      }),
    );
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(
        selectedPayment === "COD"
          ? "Order Placed Successfully! "
          : "Payment Processed!",
      );
      dispatch(clearCart());
      dispatch(resetOrderState());
      navigate("/orders");
    }
    if (isError) {
      toast.error(message);
      dispatch(resetOrderState());
    }
  }, [isSuccess, isError, message, navigate, dispatch, selectedPayment]);

  return (
    <div className="bg-[#fafafa] min-h-screen pt-24 pb-20 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-12">
        {/* Stepper */}
        <div className="flex items-center gap-4 mb-8">
          <span className="text-[10px] font-bold uppercase tracking-widest text-black">
            Payment
          </span>
          <div className="w-10 h-[2px] bg-black"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Confirmation
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-10">
          Secure <span className="text-transparent stroke-black">Checkout</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* LEFT SIDE: Details */}
          <div className="lg:col-span-8 space-y-8">
            {/* Address Summary */}
            <section className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                <MapPin size={14} /> Shipping To
              </h2>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-bold uppercase">
                    {shippingAddress.address}
                  </p>
                  <p className="text-sm text-gray-500 font-medium mt-1">
                    {shippingAddress.city}, {shippingAddress.state} -{" "}
                    {shippingAddress.pincode}
                  </p>
                  <p className="text-xs font-bold mt-2 text-black">
                    +91 {shippingAddress.phone}
                  </p>
                </div>
                <Link
                  to="/shipping"
                  className="text-[10px] font-black border-b border-black pb-1 hover:text-red-600 hover:border-red-600 transition-colors"
                >
                  CHANGE
                </Link>
              </div>
            </section>

            {/* Payment Method */}
            <section className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                <CreditCard size={14} /> Payment Method
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => setSelectedPayment("Online")}
                  className={`cursor-pointer p-5 border-2 rounded-xl transition-all ${selectedPayment === "Online" ? "border-black bg-black text-white" : "border-gray-200 hover:border-gray-400"}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Zap
                      size={20}
                      className={
                        selectedPayment === "Online"
                          ? "text-yellow-400"
                          : "text-black"
                      }
                    />
                    <span className="font-bold uppercase text-sm italic">
                      Pay Online
                    </span>
                  </div>
                  <p
                    className={`text-[10px] font-medium tracking-wide ${selectedPayment === "Online" ? "text-gray-300" : "text-gray-500"}`}
                  >
                    UPI, Cards, NetBanking
                  </p>
                </div>

                <div
                  onClick={() => setSelectedPayment("COD")}
                  className={`cursor-pointer p-5 border-2 rounded-xl transition-all ${selectedPayment === "COD" ? "border-black bg-black text-white" : "border-gray-200 hover:border-gray-400"}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Banknote
                      size={20}
                      className={
                        selectedPayment === "COD"
                          ? "text-green-400"
                          : "text-black"
                      }
                    />
                    <span className="font-bold uppercase text-sm italic">
                      Cash on Delivery
                    </span>
                  </div>
                  <p
                    className={`text-[10px] font-medium tracking-wide ${selectedPayment === "COD" ? "text-gray-300" : "text-gray-500"}`}
                  >
                    Pay at your doorstep
                  </p>
                </div>
              </div>
            </section>

            {/* Cart Items */}
            <section className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <Package size={14} /> Order Items ({cartItems.length})
              </h2>
              <div className="space-y-6">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex gap-4 items-center">
                    <div className="w-16 h-20 bg-gray-100 rounded-md overflow-hidden">
                      <SmartImage
                        src={item.product?.images?.[0] || item.image}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold uppercase">
                        {item.product?.productName || item.productName}
                      </p>
                      <p className="text-[10px] text-gray-500 font-bold mt-1">
                        Size: {item.size} | Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-sm">
                      ₹
                      {(
                        (item.product?.discountPrice || item.price) *
                        item.quantity
                      ).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT SIDE: Summary Sticky */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-xl">
              <h2 className="text-lg font-black uppercase italic mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 text-xs font-bold uppercase tracking-wider text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>
                    ₹{billDetails?.cartTotalExclTax?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>GST / Tax</span>
                  <span>₹{billDetails?.gstAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span
                    className={
                      billDetails?.shipping === 0 ? "text-green-600" : ""
                    }
                  >
                    {billDetails?.shipping === 0
                      ? "FREE"
                      : `₹${billDetails?.shipping}`}
                  </span>
                </div>
                {billDetails?.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <TicketPercent size={14} /> Discount
                    </span>
                    <span>
                      - ₹{billDetails?.discountAmount?.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="h-[1px] bg-gray-200 my-6"></div>

              <div className="flex justify-between items-end mb-8">
                <span className="text-xs font-black uppercase text-black">
                  Grand Total
                </span>
                <span className="text-3xl font-black italic">
                  ₹{billDetails?.finalTotal?.toLocaleString()}
                </span>
              </div>

              <button
                onClick={placeOrderHandler}
                disabled={isLoading}
                className="w-full py-4 bg-black text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    {selectedPayment === "COD"
                      ? "Place COD Order"
                      : "Proceed to Pay"}{" "}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="mt-4 flex justify-center items-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                <Lock size={10} /> 100% Secure Transaction
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`.stroke-black { -webkit-text-stroke: 1px black; }`}</style>
    </div>
  );
}
