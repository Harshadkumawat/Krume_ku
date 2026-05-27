import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createOrder, resetOrderState } from "../features/orders/orderSlice";
import { clearCart } from "../features/cart/cartSlice";
import {
  MapPin,
  Package,
  CreditCard,
  ArrowRight,
  Banknote,
  ShieldCheck,
  Zap,
  TicketPercent,
  CheckCircle2,
  Scissors,
} from "lucide-react";
import { toast } from "react-toastify";
import { paymentService } from "../features/payment/paymentService";
import SEO from "../components/SEO";
import { cldImage } from "../utils/imageHelper";
import { formatPrice } from "../utils/formatters";
import Button from "../components/ui/Button";

export default function PlaceOrder() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { billDetails, shippingAddress, cartItems } = useSelector(
    (state) => state.cart,
  );

  const { orderCreated, isLoading, isError, message } = useSelector(
    (state) => state.order,
  );

  const [selectedPayment, setSelectedPayment] = useState("COD");
  const razorpayScriptLoaded = useRef(false);
  const isOrderPlaced = useRef(false);

  const subtotalWithTax =
    (billDetails?.finalTotal || 0) - (billDetails?.shipping || 0);

  useEffect(() => {
    dispatch(resetOrderState());

    if (!shippingAddress?.address) {
      navigate("/shipping");
    } else if (cartItems.length === 0 && !isOrderPlaced.current) {
      navigate("/products");
    }

    return () => {
      dispatch(resetOrderState());
    };
  }, [dispatch, shippingAddress, cartItems.length, navigate]);

  const dispatchCreateOrder = useCallback(
    (paymentInfo = null) => {
      if (cartItems.length === 0) {
        toast.error("Cart is empty. Please add items first.");
        return;
      }

      isOrderPlaced.current = true;

      dispatch(
        createOrder({
          shippingAddress: {
            fullName: shippingAddress?.fullName || "",
            phone: shippingAddress?.phone || "",
            pincode: shippingAddress?.pincode || "",
            city: shippingAddress?.city || "",
            state: shippingAddress?.state || "",
            address: shippingAddress?.address || "",
            landmark: shippingAddress?.landmark || "",
            country: "India",
          },
          paymentMethod: selectedPayment,
          isPaid: !!paymentInfo,
          paidAt: paymentInfo ? new Date().toISOString() : null,
          paymentResult: paymentInfo || {},
        }),
      );
    },
    [cartItems.length, dispatch, shippingAddress, selectedPayment],
  );

  const loadRazorpay = useCallback(async () => {
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      toast.error("Payment configuration missing. Please contact support.");
      return;
    }

    const initRazorpay = async () => {
      try {
        const orderData = await paymentService.createRazorpayOrder();

        const options = {
          key: razorpayKey,
          amount: orderData.order.amount,
          currency: orderData.order.currency,
          name: "Krumeku",
          description: "Premium Crafted Apparel",
          order_id: orderData.order.id,
          handler: async function (response) {
            try {
              const verifyRes = await paymentService.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes.success) {
                dispatchCreateOrder({
                  id: response.razorpay_payment_id,
                  status: "success",
                  update_time: new Date().toISOString(),
                });
              }
            } catch {
              toast.error("Payment Verification Failed!");
            }
          },
          prefill: { contact: shippingAddress?.phone || "" },
          theme: { color: "#000000" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to initiate payment.",
        );
      }
    };

    if (razorpayScriptLoaded.current || window.Razorpay) {
      razorpayScriptLoaded.current = true;
      await initRazorpay();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onerror = () => toast.error("Razorpay SDK failed to load.");
    script.onload = async () => {
      razorpayScriptLoaded.current = true;
      await initRazorpay();
    };
    document.body.appendChild(script);
  }, [dispatchCreateOrder, shippingAddress?.phone]);

  const placeOrderHandler = useCallback(() => {
    if (isLoading) return;
    selectedPayment === "Online" ? loadRazorpay() : dispatchCreateOrder();
  }, [isLoading, selectedPayment, loadRazorpay, dispatchCreateOrder]);

  useEffect(() => {
    if (orderCreated) {
      dispatch(clearCart());
      dispatch(resetOrderState());
      navigate("/orders");
    }

    if (isError) {
      toast.error(message || "Something went wrong!");
      isOrderPlaced.current = false;
      dispatch(resetOrderState());
    }
  }, [orderCreated, isError, message, navigate, dispatch]);

  const validCartItems = cartItems.filter((item) => item.product != null);

  return (
    <div className="bg-[#fafafa] min-h-screen pt-24 pb-20 selection:bg-black selection:text-white animate-in fade-in duration-500">
      <SEO
        title="Payment & Review"
        description="Finalize your Krumeku acquisition. Choose secure payment method and confirm order."
      />

      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div
          className="flex items-center gap-3 mb-8 opacity-60"
          aria-hidden="true"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Address
          </span>
          <div className="w-6 h-[1px] bg-zinc-300"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-black">
            Payment & Review
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-10">
          Finalize{" "}
          <span className="text-transparent [-webkit-text-stroke:1px_black]">
            Order
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-8 space-y-6">
            <section
              className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm"
              aria-labelledby="delivery-heading"
            >
              <div className="flex justify-between items-center mb-4">
                <h2
                  id="delivery-heading"
                  className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2"
                >
                  <MapPin size={14} aria-hidden="true" /> Deliver To
                </h2>
                <Link
                  to="/shipping"
                  className="text-[10px] font-bold text-zinc-400 border-b border-zinc-200 hover:text-black transition-colors outline-none focus-visible:ring-2 focus-visible:ring-black"
                >
                  EDIT
                </Link>
              </div>
              <p className="text-base font-bold uppercase">
                {shippingAddress?.address}
              </p>
              <p className="text-sm text-zinc-500 font-medium">
                {shippingAddress?.city}, {shippingAddress?.state} -{" "}
                {shippingAddress?.pincode}
              </p>
              <p className="text-xs font-bold mt-2">
                +91 {shippingAddress?.phone}
              </p>
            </section>

            <section
              className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm"
              aria-labelledby="payment-heading"
            >
              <h2
                id="payment-heading"
                className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2"
              >
                <CreditCard size={14} aria-hidden="true" /> Choose Payment
                Method
              </h2>
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                role="radiogroup"
                aria-label="Payment methods"
              >
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
                ].map((method) => {
                  const isSelected = selectedPayment === method.id;
                  return (
                    <div
                      key={method.id}
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onClick={() => setSelectedPayment(method.id)}
                      onKeyDown={(e) =>
                        (e.key === "Enter" || e.key === " ") &&
                        setSelectedPayment(method.id)
                      }
                      className={`relative cursor-pointer p-5 border-2 rounded-xl transition-all outline-none focus-visible:ring-2 focus-visible:ring-black ${
                        isSelected
                          ? "border-black bg-zinc-900 text-white shadow-lg scale-[1.02]"
                          : "border-zinc-100 hover:border-zinc-300 bg-zinc-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <method.icon
                          size={20}
                          className={
                            isSelected ? method.color : "text-zinc-400"
                          }
                          aria-hidden="true"
                        />
                        <span className="font-bold uppercase text-sm italic">
                          {method.label}
                        </span>
                      </div>
                      <p
                        className={`text-[10px] font-medium ${
                          isSelected ? "text-zinc-400" : "text-zinc-500"
                        }`}
                      >
                        {method.sub}
                      </p>
                      {isSelected && (
                        <CheckCircle2
                          size={16}
                          className="absolute top-4 right-4 text-white animate-in zoom-in"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section
              className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm"
              aria-labelledby="review-heading"
            >
              <h2
                id="review-heading"
                className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2"
              >
                <Package size={14} aria-hidden="true" /> Review Items
              </h2>
              <div className="divide-y divide-zinc-50" role="list">
                {validCartItems.map((item) => {
                  const displayPrice =
                    item.finalPriceWithTax ||
                    item.product?.pricing?.finalPriceWithTax ||
                    item.price;
                  const isEmbroidered =
                    item.product?.subCategory === "Embroidered";
                  const pName = item.product?.productName || item.productName;

                  return (
                    <div
                      key={item._id || item.product?._id}
                      className="flex gap-4 py-4 first:pt-0 last:pb-0"
                      role="listitem"
                    >
                      <div className="w-14 h-18 bg-zinc-50 rounded-lg overflow-hidden border border-zinc-100 shrink-0">
                        <img
                          src={cldImage(
                            item.product?.images?.[0]?.public_id || item.image,
                            200,
                          )}
                          className="w-full h-full object-cover"
                          alt={pName}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold uppercase line-clamp-1">
                            {pName}
                          </p>
                          {isEmbroidered && (
                            <Scissors
                              size={10}
                              className="text-red-500"
                              aria-label="Embroidered item"
                            />
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-400 font-bold mt-1 uppercase">
                          Size: {item.size} <span aria-hidden="true">•</span>{" "}
                          Qty: {item.quantity}
                        </p>
                        {isEmbroidered && (
                          <p className="text-[8px] text-zinc-400 uppercase font-bold mt-1 tracking-widest">
                            In-House Machine Work
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-zinc-900">
                          {formatPrice(displayPrice * item.quantity)}
                        </p>
                        <p className="text-[8px] text-zinc-400 font-medium uppercase">
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
            <div
              className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-2xl"
              role="region"
              aria-label="Price Breakdown"
            >
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">
                Price Breakdown
              </h2>
              <div className="space-y-4 text-[13px] font-medium text-zinc-600">
                <div className="flex justify-between italic">
                  <span>Item Total (excl. tax)</span>
                  <span className="text-black">
                    {formatPrice(billDetails?.cartTotalExclTax)}
                  </span>
                </div>
                <div className="flex justify-between italic">
                  <span>GST / Taxes (+)</span>
                  <span className="text-black">
                    {formatPrice(billDetails?.gstAmount)}
                  </span>
                </div>
                {billDetails?.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold italic">
                    <span className="flex items-center gap-1">
                      <TicketPercent size={14} aria-hidden="true" /> Discount
                      (-)
                    </span>
                    <span>- {formatPrice(billDetails?.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-zinc-50 text-black font-black italic uppercase text-[11px]">
                  <span>Subtotal (incl. GST)</span>
                  <span>{formatPrice(subtotalWithTax)}</span>
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
                      : formatPrice(billDetails?.shipping)}
                  </span>
                </div>
              </div>

              <div
                className="h-[2px] bg-zinc-900 my-6"
                aria-hidden="true"
              ></div>

              <div className="flex justify-between items-end mb-8">
                <span className="text-[10px] font-black uppercase text-zinc-400">
                  Total Amount
                </span>
                <span className="text-3xl font-black italic leading-none">
                  {formatPrice(billDetails?.finalTotal)}
                </span>
              </div>

              <Button
                variant="primary"
                onClick={placeOrderHandler}
                isLoading={isLoading}
                disabled={isLoading}
                className="w-full h-14"
                size="lg"
              >
                {selectedPayment === "COD"
                  ? "Confirm Order"
                  : "Pay & Place Order"}
                {!isLoading && (
                  <ArrowRight size={18} className="ml-2" aria-hidden="true" />
                )}
              </Button>

              <div className="mt-6 flex flex-col items-center gap-1.5 opacity-40">
                <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest">
                  <ShieldCheck
                    size={12}
                    className="text-emerald-500"
                    aria-hidden="true"
                  />{" "}
                  Secure SSL Encryption
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
