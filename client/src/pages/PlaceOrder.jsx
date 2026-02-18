import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
// 🔥 Fixed: Sahi reducer ka naam 'resetOrderState' hai
import { createOrder, resetOrderState } from "../features/orders/orderSlice";
import { clearCart } from "../features/cart/cartSlice";
import {
  Loader2,
  MapPin,
  Package,
  CreditCard,
  ArrowRight,
  Smartphone,
  Banknote,
  ShieldCheck,
  Truck,
  ShoppingBag,
  TicketPercent,
  Lock,
  Zap,
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

  const placeOrderHandler = () => {
    const formattedOrderItems = cartItems.map((item) => {
      const imageToSave =
        item.product?.images?.[0]?.public_id ||
        item.product?.images?.[0] ||
        item.image;

      return {
        product: item.product?._id || item.product,
        productName: item.product?.productName || item.productName,
        image: imageToSave, 
        price:
          item.product?.discountPrice || item.product?.price || item.price || 0,
        quantity: item.quantity,
        size: item.size || "M",
        color: item.color || "Standard",
      };
    });

    dispatch(
      createOrder({
        orderItems: formattedOrderItems,
        shippingAddress: {
          address: shippingAddress.address,
          city: shippingAddress.city,
          postalCode: shippingAddress.pincode || shippingAddress.postalCode,
          country: "India",
          phone: shippingAddress.phone,
          state: shippingAddress.state,
        },
        paymentMethod: selectedPayment,
        itemsPrice: subtotal,
        shippingPrice: shipping,
        taxPrice: tax,
        discountPrice: discountAmount,
        totalPrice: total,
      }),
    );
  };

  // --- 2. NAVIGATION & STATUS HANDLER ---
  useEffect(() => {
    if (isSuccess) {
      toast.success(
        selectedPayment === "COD"
          ? "Order Secured! 🚚"
          : "Processing Payment...",
      );
      dispatch(clearCart());
      dispatch(resetOrderState());
      navigate(`/orders`);
    }

    if (isError) {
      toast.error(message);
      dispatch(resetOrderState()); 
    }

    if (cart.isLoading === false && (!cartItems || cartItems.length === 0)) {
      navigate("/products");
    }
  }, [
    isSuccess,
    isError,
    message,
    navigate,
    dispatch,
    cartItems,
    cart.isLoading,
    selectedPayment,
  ]);

  const {
    cartTotalExclTax: subtotal = 0,
    gstAmount: tax = 0,
    shipping = 0,
    discountAmount = 0,
    finalTotal: total = 0,
  } = billDetails || {};

  return (
    <div className="bg-[#fafafa] min-h-screen pt-28 pb-20 selection:bg-black selection:text-white">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* STEPPER */}
        <div className="flex items-center gap-4 mb-10">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black">
            03 Payment
          </span>
          <div className="w-10 h-[1px] bg-black"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
            04 Success
          </span>
        </div>

        <div className="mb-16">
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.8] mb-6 italic">
            SECURE <br />
            <span className="text-white stroke-text-black">CHECKOUT</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* LEFT SIDE: DETAILS */}
          <div className="lg:col-span-8 space-y-12">
            {/* ADDRESS BOX */}
            <section>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 text-gray-400 flex items-center gap-3">
                <MapPin size={14} /> Shipping Destination
              </h2>
              <div className="bg-white border border-gray-100 p-8 shadow-sm hover:border-black transition-all">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 uppercase">
                    <p className="text-xl font-black italic leading-none">
                      {shippingAddress.address}
                    </p>
                    <p className="text-xs font-bold text-gray-400 tracking-widest">
                      {shippingAddress.city}, {shippingAddress.state} •{" "}
                      {shippingAddress.pincode}
                    </p>
                    <p className="text-[10px] font-black pt-4">
                      Contact: {shippingAddress.phone}
                    </p>
                  </div>
                  <Link
                    to="/shipping"
                    className="text-[10px] font-black border-b border-black pb-1"
                  >
                    EDIT
                  </Link>
                </div>
              </div>
            </section>

            {/* PAYMENT BOX */}
            <section>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 text-gray-400 flex items-center gap-3">
                <CreditCard size={14} /> Settlement
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => setSelectedPayment("Online")}
                  className={`p-8 border-2 text-left transition-all duration-500 ${selectedPayment === "Online" ? "border-black bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]" : "border-gray-100 opacity-60"}`}
                >
                  <Zap size={24} className="mb-4" />
                  <p className="font-black uppercase italic text-sm">
                    Instant Pay
                  </p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    UPI / Cards / Net Banking
                  </p>
                </button>
                <button
                  onClick={() => setSelectedPayment("COD")}
                  className={`p-8 border-2 text-left transition-all duration-500 ${selectedPayment === "COD" ? "border-black bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]" : "border-gray-100 opacity-60"}`}
                >
                  <Banknote size={24} className="mb-4" />
                  <p className="font-black uppercase italic text-sm">
                    Cash on Entry
                  </p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    Pay at your doorstep
                  </p>
                </button>
              </div>
            </section>

            {/* ITEMS MINI LIST */}
            <section>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 text-gray-400 flex items-center gap-3">
                <Package size={14} /> Inventory
              </h2>
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-8 py-4 border-b border-gray-50 group"
                  >
                    <div className="w-16 h-20 bg-gray-50 overflow-hidden flex-shrink-0">
                      <SmartImage
                        src={item.product?.images?.[0] || item.image}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-black uppercase italic leading-none">
                        {item.product?.productName || item.productName}
                      </p>
                      <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
                        SZ: {item.size} • QTY: {item.quantity}
                      </p>
                    </div>
                    <p className="font-black italic text-sm">
                      ₹
                      {(
                        (item.product?.discountPrice ||
                          item.product?.price ||
                          0) * item.quantity
                      ).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT SIDE: SUMMARY */}
          <div className="lg:col-span-4 lg:sticky lg:top-32">
            <div className="bg-black text-white p-10 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.05)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Lock size={80} />
              </div>
              <h2 className="text-2xl font-black uppercase italic border-b border-white/10 pb-6 mb-8">
                Order Summary
              </h2>
              <div className="space-y-5 text-[10px] font-black uppercase tracking-[0.2em]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-teal-400 italic">
                    <span className="flex items-center gap-2">
                      <TicketPercent size={14} /> Promo
                    </span>
                    <span>- ₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-white/10 pb-6">
                  <span className="text-gray-500">Logistics</span>
                  <span className={shipping === 0 ? "text-teal-400" : ""}>
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-end py-10">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">
                  Total Amount
                </span>
                <span className="text-4xl font-black italic tracking-tighter leading-none">
                  ₹{total.toLocaleString()}
                </span>
              </div>
              <button
                onClick={placeOrderHandler}
                disabled={isLoading}
                className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] hover:bg-gray-200 transition-all flex items-center justify-center gap-4 group disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    {" "}
                    {selectedPayment === "COD"
                      ? "Authenticate"
                      : "Pay Now"}{" "}
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-2 transition-transform"
                    />{" "}
                  </>
                )}
              </button>
              <p className="mt-8 text-[8px] text-center font-bold text-gray-600 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                <ShieldCheck size={12} /> Secure encrypted gateway
              </p>
            </div>
          </div>
        </div>
      </div>
      <style>{`.stroke-text-black { -webkit-text-stroke: 1.5px black; color: transparent; }`}</style>
    </div>
  );
}
