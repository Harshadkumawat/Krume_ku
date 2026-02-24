import React, { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  Banknote,
  Printer,
  MessageCircleQuestion,
  ExternalLink,
} from "lucide-react";
import SEO from "../components/SEO";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { order, isLoading, isError, message } = useSelector(
    (state) => state.order,
  );
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (id && id !== "super" && id.length > 10) {
      dispatch(getOrderDetails(id));
    }
  }, [id, dispatch]);

  const checkEligibility = (deliveryDate) => {
    if (!deliveryDate) return false;
    const delivered = new Date(deliveryDate);
    const today = new Date();
    const diffDays = Math.ceil(
      Math.abs(today - delivered) / (1000 * 60 * 60 * 24),
    );
    return diffDays <= 7;
  };

  const getImgUrl = (imgId) => {
    if (!imgId)
      return "https://placehold.co/400x600/000000/FFFFFF?text=No+Image";
    if (imgId.startsWith("http")) return imgId;
    return `https://res.cloudinary.com/dftticvtc/image/upload/c_fill,w_400,q_auto,f_auto/${imgId}`;
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      dispatch(cancelOrderUser(id));
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <SEO title="Loading Order..." />
        <Loader2 className="animate-spin text-black w-10 h-10" />
      </div>
    );

  if (isError || id === "super" || !order)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <SEO title="Order Not Found" />
        <AlertCircle className="text-red-500 mb-4" size={40} />
        <p className="font-black uppercase italic tracking-widest text-lg">
          {message || "Order Not Found"}
        </p>
        <button
          onClick={() => navigate("/orders")}
          className="mt-6 border-b-2 border-black pb-1 text-xs font-black uppercase tracking-widest"
        >
          Return to My Orders
        </button>
      </div>
    );

  const isDelivered = order.orderStatus === "Delivered";
  const isReturnRequested = order.returnInfo?.isReturnRequested;
  const returnStatus = order.returnInfo?.status || "None";
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
      case "Refunded":
        return "bg-zinc-500 text-white";
      default:
        return "bg-zinc-100 text-zinc-800";
    }
  };

  // Tracking Progress Logic
  let progressWidth = "0%",
    progressColor = "bg-black",
    trackerSteps = [];
  if (isReturnRequested) {
    const typeLabel =
      order.returnInfo?.type === "Exchange" ? "Exchanged" : "Refunded";
    if (returnStatus === "Rejected") {
      progressWidth = "50%";
      progressColor = "bg-red-500";
      trackerSteps = [
        {
          label: "Requested",
          icon: RotateCcw,
          color: "bg-orange-500 border-orange-500 text-white",
          textColor: "text-orange-500",
        },
        {
          label: "Rejected",
          icon: XCircle,
          color: "bg-red-500 border-red-500 text-white scale-110 shadow-md",
          textColor: "text-red-500",
        },
        {
          label: typeLabel,
          icon: Banknote,
          color: "bg-white border-zinc-200 text-zinc-300",
          textColor: "text-zinc-400",
        },
      ];
    } else {
      const isAppr = returnStatus === "Approved" || returnStatus === "Refunded";
      const isRef = returnStatus === "Refunded";
      progressWidth = isRef ? "100%" : isAppr ? "50%" : "0%";
      progressColor = isRef
        ? "bg-green-500"
        : isAppr
          ? "bg-blue-500"
          : "bg-orange-500";
      trackerSteps = [
        {
          label: "Requested",
          icon: RotateCcw,
          color: "bg-orange-500 border-orange-500 text-white",
          textColor: "text-orange-500",
        },
        {
          label: "Approved",
          icon: CheckCircle2,
          color: isAppr
            ? "bg-blue-500 border-blue-500 text-white"
            : "bg-white border-zinc-200 text-zinc-300",
          textColor: isAppr ? "text-blue-500" : "text-zinc-400",
        },
        {
          label: typeLabel,
          icon: Banknote,
          color: isRef
            ? "bg-green-500 border-green-500 text-white"
            : "bg-white border-zinc-200 text-zinc-300",
          textColor: isRef ? "text-green-500" : "text-zinc-400",
        },
      ];
    }
  } else {
    const isShip =
      order.orderStatus === "Shipped" || order.orderStatus === "Delivered";
    const isDel = order.orderStatus === "Delivered";
    progressWidth = isDel ? "100%" : isShip ? "50%" : "0%";
    trackerSteps = [
      {
        label: "Confirmed",
        icon: Clock,
        color: "bg-black border-black text-white",
        textColor: "text-black",
      },
      {
        label: "Shipped",
        icon: Truck,
        color: isShip
          ? "bg-black border-black text-white"
          : "bg-white border-zinc-200 text-zinc-300",
        textColor: isShip ? "text-black" : "text-zinc-400",
      },
      {
        label: "Delivered",
        icon: CheckCircle2,
        color: isDel
          ? "bg-black border-black text-white"
          : "bg-white border-zinc-200 text-zinc-300",
        textColor: isDel ? "text-black" : "text-zinc-400",
      },
    ];
  }

  return (
    <div className="min-h-screen bg-white pt-8 md:pt-16 pb-20 selection:bg-black selection:text-white">
      <SEO
        title={`Order #${order._id?.slice(-6)}`}
        description="Track your order status and view delivery details at Krumeku."
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8 md:mb-10 print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-black transition-all"
          >
            <ArrowLeft size={16} /> Back to My Orders
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] bg-zinc-50 hover:bg-zinc-100 px-4 py-2 rounded-full transition-all text-black"
          >
            <Printer size={14} /> Print Invoice
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-black/10 pb-8 md:pb-10 mb-8 md:mb-12">
          <div>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
              Order{" "}
              <span className="text-gray-300">#{order._id?.slice(-6)}</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mt-4">
              Placed on{" "}
              <span className="text-black">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3 mt-6 md:mt-0 w-full md:w-auto print:hidden">
            <div
              className={`px-4 md:px-6 py-2.5 text-[10px] font-black uppercase tracking-widest italic rounded-md ${getStatusColor(order.orderStatus)}`}
            >
              {order.orderStatus}
            </div>
            {isEligibleForReturn && (
              <button
                onClick={() => navigate("/orders")}
                className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest bg-zinc-100 px-4 py-2.5 hover:bg-black hover:text-white transition-all italic border border-black/5 rounded-md w-full md:w-auto"
              >
                <RotateCcw size={14} /> Request Return
              </button>
            )}
            {order.orderStatus === "Processing" && (
              <button
                onClick={handleCancel}
                className="flex items-center justify-center gap-2 text-[10px] font-black uppercase text-red-600 bg-red-50 px-4 py-2 rounded-md transition-colors w-full md:w-auto"
              >
                <XCircle size={14} /> Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Tracker */}
        <div className="mb-12 md:mb-16 bg-zinc-50 p-6 md:p-10 rounded-xl border border-zinc-100 overflow-x-auto scrollbar-hide print:hidden">
          <div className="flex justify-between items-center relative min-w-[500px] max-w-3xl mx-auto">
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-zinc-200 -translate-y-1/2 z-0"></div>
            <div
              className={`absolute top-1/2 left-0 h-[2px] ${progressColor} -translate-y-1/2 transition-all duration-1000 z-0`}
              style={{ width: progressWidth }}
            ></div>
            {trackerSteps.map((step, idx) => (
              <div
                key={idx}
                className="relative z-10 flex flex-col items-center gap-3 bg-zinc-50 px-2"
              >
                <div
                  className={`p-2.5 rounded-full border-2 transition-all duration-500 ${step.color}`}
                >
                  <step.icon size={18} />
                </div>
                <span
                  className={`text-[9px] font-black uppercase tracking-widest italic ${step.textColor}`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] border-b border-zinc-200 pb-3 flex items-center gap-2 text-zinc-500">
                <Package size={16} /> Order Items ({order.orderItems?.length})
              </h3>
              {order.orderItems?.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-row gap-4 md:gap-6 py-6 border-b border-zinc-100 group"
                >
                  <div className="w-24 h-32 md:w-28 md:h-40 bg-zinc-50 overflow-hidden flex-shrink-0 border border-zinc-100 rounded-xl">
                    <img
                      src={getImgUrl(item.image)}
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                      alt="Product"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <h4 className="text-base md:text-xl font-black uppercase italic leading-tight truncate">
                      {item.productName || "Premium Piece"}
                    </h4>
                    <p className="text-[10px] font-medium text-zinc-500 mt-1 uppercase tracking-wider">
                      Color: {item.color || "Standard"} | Size: {item.size}
                    </p>
                    <p className="font-black text-lg italic mt-4">
                      ₹{item.price?.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-zinc-900 text-white rounded-2xl p-6 md:p-8 print:hidden flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="bg-zinc-800 p-3 rounded-full">
                  <MessageCircleQuestion size={24} className="text-zinc-300" />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest italic mb-1">
                    Need Help?
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-medium uppercase">
                    Contact us for any questions about this order.
                  </p>
                </div>
              </div>
              <a
                href="mailto:support@krumeku.com"
                className="w-full sm:w-auto text-center bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] py-3 px-6 rounded-lg"
              >
                Email Support
              </a>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-zinc-500 border-b border-zinc-100 pb-4 mb-4">
                <MapPin size={16} /> Address
              </h3>
              <div className="text-[11px] font-bold text-zinc-500 leading-relaxed uppercase space-y-1">
                <p className="text-black mb-2 font-black text-sm">
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
                <p className="mt-4 pt-4 border-t border-zinc-100 text-black">
                  +91 {order.shippingAddress?.phone}
                </p>
              </div>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-2xl shadow-sm">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] border-b border-zinc-200 pb-4 mb-5 flex items-center gap-2 text-zinc-500">
                <ReceiptText size={16} /> Summary
              </h3>
              <div className="space-y-4 text-[11px] font-bold uppercase text-zinc-500">
                <div className="flex justify-between">
                  <span>Payment</span>
                  <span className="text-black">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>MRP</span>
                  <span className="text-black">
                    ₹{order.itemsPrice?.toLocaleString("en-IN")}
                  </span>
                </div>
                {order.discountPrice > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>
                      - ₹{order.discountPrice?.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span
                    className={
                      order.shippingPrice === 0
                        ? "text-green-600 font-black"
                        : "text-black"
                    }
                  >
                    {order.shippingPrice === 0
                      ? "FREE"
                      : `₹${order.shippingPrice}`}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-zinc-200 pt-5 mt-2">
                  <span className="text-black font-black">Total</span>
                  <span className="text-2xl font-black italic text-black">
                    ₹{order.totalPrice?.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
