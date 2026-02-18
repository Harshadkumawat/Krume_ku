import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getOrderDetails,
  cancelOrderUser,
} from "../features/orders/orderSlice";
import {
  Loader2,
  ArrowLeft,
  Package,
  MapPin,
  ReceiptText,
  AlertCircle,
  XCircle,
  Truck,
  CheckCircle2,
  Clock,
  RotateCcw,
} from "lucide-react";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { order, isLoading, isError, message } = useSelector(
    (state) => state.order,
  );
  const { user } = useSelector((state) => state.auth);

  // 🛡️ Eligibility Logic (7 Din ka check)
  const checkEligibility = (deliveryDate) => {
    if (!deliveryDate) return false;
    const delivered = new Date(deliveryDate);
    const today = new Date();
    const diffTime = Math.abs(today - delivered);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  // ☁️ Cloudinary Image Helper
  const getImgUrl = (imgId) => {
    if (!imgId)
      return "https://placehold.co/400x600/000000/FFFFFF?text=No+Image";
    if (imgId.startsWith("http")) return imgId;
    return `https://res.cloudinary.com/dftticvtc/image/upload/c_fill,w_400,q_auto,f_auto/${imgId}`;
  };

  useEffect(() => {
    if (id && id !== "super" && id.length > 10) {
      dispatch(getOrderDetails(id));
    }
  }, [id, dispatch]);

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel this acquisition?")) {
      dispatch(cancelOrderUser(id));
    }
  };

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-black w-10 h-10" />
      </div>
    );

  if (isError || id === "super" || !order)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <AlertCircle className="text-red-500 mb-4" size={40} />
        <p className="font-black uppercase italic tracking-widest">
          {message || "Archive Not Found"}
        </p>
        <button
          onClick={() => navigate("/orders")}
          className="mt-4 underline text-[10px] font-black uppercase"
        >
          Return to History
        </button>
      </div>
    );

  // Status & Eligibility Constants
  const isDelivered = order.orderStatus === "Delivered";
  const isReturnRequested = order.returnInfo?.isReturnRequested;
  const returnStatus = order.returnInfo?.status || "None";

  // Return Eligible tabhi hoga jab status Delivered ho aur return request na hui ho
  const isEligibleForReturn =
    isDelivered &&
    !isReturnRequested &&
    (order.deliveredAt ? checkEligibility(order.deliveredAt) : true);

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-black text-white";
      case "Cancelled":
        return "bg-red-600 text-white";
      case "Return Requested":
        return "bg-orange-500 text-white";
      case "Return Approved":
        return "bg-green-600 text-white";
      case "Returned":
        return "bg-zinc-500 text-white";
      default:
        return "bg-zinc-100 text-zinc-600";
    }
  };

  return (
    <div className="min-h-screen bg-white pt-10 md:pt-16 pb-20 selection:bg-black selection:text-white">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] mb-10 hover:gap-4 transition-all"
        >
          <ArrowLeft size={16} /> Back to Archive
        </button>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-black pb-10 mb-12">
          <div>
            <h1 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
              Order{" "}
              <span className="text-gray-300">#{order._id?.slice(-6)}</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mt-4">
              Authenticated on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="flex flex-col items-end gap-4 mt-6 md:mt-0">
            <div
              className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest italic shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${getStatusColor(order.orderStatus)}`}
            >
              {order.orderStatus}
            </div>

            {/* Return Action Button */}
            {isEligibleForReturn && (
              <button
                onClick={() => navigate("/orders")}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-zinc-100 px-4 py-2 hover:bg-black hover:text-white transition-all italic border border-black/5"
              >
                <RotateCcw size={14} /> Request Return
              </button>
            )}

            {/* Admin Approved Note */}
            {returnStatus === "Approved" && (
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-green-600 uppercase italic">
                  Return Approved
                </span>
                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">
                  Reverse pickup initiated
                </span>
              </div>
            )}

            {order.orderStatus === "Processing" && (
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 text-[9px] font-black uppercase text-red-600 hover:underline"
              >
                <XCircle size={14} /> Cancel Acquisition
              </button>
            )}
          </div>
        </div>

        {/* PROGRESS TRACKER */}
        <div className="mb-20 bg-zinc-50 p-10 rounded-sm border border-zinc-100 overflow-x-auto">
          <div className="flex justify-between items-center relative min-w-[400px] max-w-2xl mx-auto">
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-zinc-200 -translate-y-1/2 z-0"></div>
            <div
              className="absolute top-1/2 left-0 h-[1.5px] bg-black -translate-y-1/2 transition-all duration-1000 z-0"
              style={{
                width:
                  order.orderStatus === "Delivered"
                    ? "100%"
                    : order.orderStatus === "Shipped"
                      ? "50%"
                      : "0%",
              }}
            ></div>
            {[
              { label: "Confirmed", status: "Processing", icon: Clock },
              { label: "Shipped", status: "Shipped", icon: Truck },
              { label: "Delivered", status: "Delivered", icon: CheckCircle2 },
            ].map((step, idx) => {
              const Icon = step.icon;
              const isActive =
                order.orderStatus === step.status ||
                (step.label === "Confirmed" &&
                  order.orderStatus !== "Cancelled");
              return (
                <div
                  key={idx}
                  className="relative z-10 flex flex-col items-center gap-4 bg-zinc-50 px-2"
                >
                  <div
                    className={`p-2 rounded-full border-2 transition-all duration-500 ${isActive ? "bg-black text-white border-black scale-110" : "bg-white text-zinc-300 border-zinc-200"}`}
                  >
                    <Icon size={16} />
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest italic ${isActive ? "text-black" : "text-zinc-300"}`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] border-b pb-4 flex items-center gap-2 text-zinc-400">
              <Package size={16} /> Acquired Pieces ({order.orderItems?.length})
            </h3>
            {order.orderItems?.map((item, index) => (
              <div
                key={index}
                className="flex gap-6 py-4 border-b border-zinc-50 group"
              >
                <div className="w-24 h-32 bg-zinc-50 overflow-hidden flex-shrink-0 border border-zinc-100 rounded-lg">
                  <img
                    src={getImgUrl(item.image)}
                    className="w-full h-full object-cover transition-all duration-500"
                    alt="Artifact"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h4 className="text-xl font-black uppercase italic leading-none">
                      {item.productName || item.name || "Premium Piece"}
                    </h4>
                    <p className="text-[10px] font-bold text-zinc-400 mt-3 uppercase tracking-[0.1em]">
                      Size: {item.size} | Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-black text-sm italic">
                    ₹{item.price?.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-4 space-y-12">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 text-zinc-400">
                <MapPin size={16} /> Destination
              </h3>
              <div className="text-[11px] font-bold text-zinc-500 leading-relaxed uppercase">
                <p className="text-black mb-1 font-black">
                  {order.shippingAddress?.fullName || user?.fullName}
                </p>
                <p>
                  {order.shippingAddress?.address},{" "}
                  {order.shippingAddress?.city}
                </p>
                <p>
                  {order.shippingAddress?.state} -{" "}
                  {order.shippingAddress?.postalCode}
                </p>
                <p className="mt-2 text-black">
                  {order.shippingAddress?.phone}
                </p>
              </div>
            </div>

            <div className="bg-zinc-50 p-8 space-y-4 border border-black/5 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] border-b border-black/10 pb-4 flex items-center gap-2">
                <ReceiptText size={16} /> Summary
              </h3>
              <div className="flex justify-between text-[11px] font-bold uppercase">
                <span className="text-zinc-400">Subtotal</span>
                <span>₹{order.itemsPrice?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold uppercase border-t border-black/5 pt-4 text-xl font-black italic">
                <span>Total</span>
                <span>₹{order.totalPrice?.toLocaleString()}</span>
              </div>
              {isReturnRequested && (
                <div className="mt-6 pt-6 border-t border-zinc-200">
                  <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">
                    Return Status: {returnStatus}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
