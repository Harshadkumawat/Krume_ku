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
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-toastify";
import SmartImage from "../components/SmartImage";
import { paymentService } from "../features/payment/paymentService";

export default function PlaceOrder() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cart = useSelector((state) => state.cart);
  const { isSuccess, isLoading, isError, message } = useSelector(
    (state) => state.order,
  );
  const { user } = useSelector((state) => state.auth);
  const { billDetails, shippingAddress, cartItems } = cart;

  const [selectedPayment, setSelectedPayment] = useState("COD");

  const subtotalWithTax =
    (billDetails?.cartTotalExclTax || 0) +
    (billDetails?.gstAmount || 0) -
    (billDetails?.discountAmount || 0);

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

  const dispatchCreateOrder = (paymentInfo = null) => {
    const formattedOrderItems = cartItems.map((item) => ({
      product: item.product?._id || item.product,
      productName: item.product?.productName || item.productName,
      image:
        item.product?.images?.[0]?.public_id ||
        item.product?.images?.[0] ||
        item.image,
      price:
        item.product?.pricing?.finalPriceWithTax ||
        item.finalPriceWithTax ||
        item.price,
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
        isPaid: paymentInfo ? true : false,
        paidAt: paymentInfo ? new Date() : null,
        paymentResult: paymentInfo,
      }),
    );
  };

  const loadRazorpay = async () => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onerror = () => toast.error("Razorpay SDK failed to load.");
    document.body.appendChild(script);

    script.onload = async () => {
      try {
        const orderData = await paymentService.createRazorpayOrder({
          amount: billDetails?.finalTotal || 0,
        });

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: orderData.order.amount,
          currency: orderData.order.currency,
          name: "Krumeku",
          description: "Premium T-Shirts",
          order_id: orderData.order.id,
          handler: async function (response) {
            try {
              const verifyRes = await paymentService.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes.success) {
                const paymentInfo = {
                  id: response.razorpay_payment_id,
                  status: "success",
                  update_time: new Date().toISOString(),
                };
                dispatchCreateOrder(paymentInfo);
              }
            } catch (error) {
              toast.error("Payment Verification Failed!");
            }
          },
          prefill: {
            name: "Krumeku Customer",
            contact: shippingAddress.phone,
          },
          theme: {
            color: "#000000",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (error) {
        console.log("RAZORPAY ERROR:", error.response?.data || error.message);
        toast.error(
          error.response?.data?.message || "Failed to initiate payment.",
        );
      }
    };
  };

  const placeOrderHandler = () => {
    if (isLoading) return;

    if (selectedPayment === "Online") {
      loadRazorpay();
    } else {
      dispatchCreateOrder();
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(
        selectedPayment === "COD"
          ? "Order Placed! Jai Mata Di! 🚩"
          : "Payment Successful!",
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
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="flex items-center gap-3 mb-8 opacity-60">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Address
          </span>
          <div className="w-6 h-[1px] bg-zinc-300"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-black">
            Payment & Review
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-10">
          Finalize <span className="text-transparent stroke-black">Order</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-8 space-y-6">
            <section className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <MapPin size={14} /> Deliver To
                </h2>
                <Link
                  to="/shipping"
                  className="text-[10px] font-bold text-zinc-400 border-b border-zinc-200 hover:text-black transition-colors"
                >
                  EDIT
                </Link>
              </div>
              <p className="text-base font-bold uppercase">
                {shippingAddress.address}
              </p>
              <p className="text-sm text-zinc-500 font-medium">
                {shippingAddress.city}, {shippingAddress.state} -{" "}
                {shippingAddress.pincode}
              </p>
              <p className="text-xs font-bold mt-2">
                +91 {shippingAddress.phone}
              </p>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
                <CreditCard size={14} /> Choose Payment
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    id: "Online",
                    label: "Pay Online",
                    sub: "UPI, Cards, Wallet",
                    icon: Zap,
                    color: "text-amber-500",
                  },
                  {
                    id: "COD",
                    label: "Cash On Delivery",
                    sub: "Pay at your door",
                    icon: Banknote,
                    color: "text-emerald-500",
                  },
                ].map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`relative cursor-pointer p-5 border-2 rounded-xl transition-all ${selectedPayment === method.id ? "border-black bg-zinc-900 text-white shadow-lg" : "border-zinc-100 hover:border-zinc-300 bg-zinc-50/50"}`}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <method.icon
                        size={20}
                        className={
                          selectedPayment === method.id
                            ? method.color
                            : "text-zinc-400"
                        }
                      />
                      <span className="font-bold uppercase text-sm italic">
                        {method.label}
                      </span>
                    </div>
                    <p
                      className={`text-[10px] font-medium ${selectedPayment === method.id ? "text-zinc-400" : "text-zinc-500"}`}
                    >
                      {method.sub}
                    </p>
                    {selectedPayment === method.id && (
                      <CheckCircle2
                        size={16}
                        className="absolute top-4 right-4 text-white"
                      />
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
                <Package size={14} /> Review Items
              </h2>
              <div className="divide-y divide-zinc-50">
                {cartItems.map((item, index) => {
                  const displayPrice =
                    item.finalPriceWithTax ||
                    item.product?.pricing?.finalPriceWithTax ||
                    item.price;

                  return (
                    <div
                      key={index}
                      className="flex gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="w-14 h-18 bg-zinc-50 rounded-lg overflow-hidden border border-zinc-100 shrink-0">
                        <SmartImage
                          src={item.product?.images?.[0] || item.image}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold uppercase line-clamp-1">
                          {item.product?.productName || item.productName}
                        </p>
                        <p className="text-[10px] text-zinc-400 font-bold mt-1 uppercase">
                          Size: {item.size} • Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-zinc-900">
                          ₹
                          {(displayPrice * item.quantity).toLocaleString(
                            "en-IN",
                          )}
                        </p>
                        <p className="text-[8px] text-zinc-400 font-medium">
                          Incl. Tax
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-2xl">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">
                Price Breakdown
              </h2>

              <div className="space-y-4 text-[13px] font-medium text-zinc-600">
                <div className="flex justify-between italic">
                  <span>Total MRP</span>
                  <span className="text-black">
                    ₹{billDetails?.cartTotalExclTax?.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between italic">
                  <span>GST / Taxes (+)</span>
                  <span className="text-black">
                    ₹{billDetails?.gstAmount?.toLocaleString("en-IN")}
                  </span>
                </div>
                {billDetails?.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold italic">
                    <span className="flex items-center gap-1">
                      <TicketPercent size={14} /> Discount (-)
                    </span>
                    <span>
                      - ₹{billDetails?.discountAmount?.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                <div className="flex justify-between pt-3 border-t border-zinc-50 text-black font-black italic uppercase text-[11px]">
                  <span>Subtotal (incl. GST)</span>
                  <span>₹{subtotalWithTax.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-between italic">
                  <span>Delivery Charges (+)</span>
                  <span
                    className={
                      billDetails?.shipping === 0
                        ? "text-emerald-600 font-bold"
                        : "text-black"
                    }
                  >
                    {billDetails?.shipping === 0
                      ? "FREE"
                      : `₹${billDetails?.shipping}`}
                  </span>
                </div>
              </div>

              <div className="h-[2px] bg-zinc-900 my-6"></div>

              <div className="flex justify-between items-end mb-8">
                <span className="text-[10px] font-black uppercase text-zinc-400">
                  Total Amount
                </span>
                <span className="text-3xl font-black italic leading-none">
                  ₹{billDetails?.finalTotal?.toLocaleString("en-IN")}
                </span>
              </div>

              <button
                onClick={placeOrderHandler}
                disabled={isLoading}
                className="w-full h-14 bg-zinc-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-zinc-200"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    {selectedPayment === "COD"
                      ? "Confirm COD Order"
                      : "Pay & Place Order"}{" "}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="mt-6 flex flex-col items-center gap-3">
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                  <ShieldCheck size={12} className="text-emerald-500" /> Secure
                  SSL Encryption
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`.stroke-black { -webkit-text-stroke: 1px black; }`}</style>
    </div>
  );
}
