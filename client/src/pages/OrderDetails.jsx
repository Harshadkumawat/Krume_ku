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
  Banknote,
  Printer,
  MessageCircleQuestion,
  ExternalLink,
} from "lucide-react";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { order, isLoading, isError, message } = useSelector(
    (state) => state.order,
  );
  const { user } = useSelector((state) => state.auth);

  const checkEligibility = (deliveryDate) => {
    if (!deliveryDate) return false;
    const delivered = new Date(deliveryDate);
    const today = new Date();
    const diffTime = Math.abs(today - delivered);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

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
    if (window.confirm("Are you sure you want to cancel this order?")) {
      dispatch(cancelOrderUser(id));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-black w-10 h-10" />
      </div>
    );

  if (isError || id === "super" || !order)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <AlertCircle className="text-red-500 mb-4" size={40} />
        <p className="font-black uppercase italic tracking-widest text-lg">
          {message || "Order Not Found"}
        </p>
        <button
          onClick={() => navigate("/orders")}
          className="mt-6 border-b-2 border-black pb-1 text-xs font-black uppercase tracking-widest hover:text-gray-500 transition-colors"
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

  let progressWidth = "0%";
  let progressColor = "bg-black";
  let trackerSteps = [];

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
      const isPend = returnStatus === "Pending";

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
          color: `bg-orange-500 border-orange-500 text-white ${isPend ? "scale-110 shadow-md" : ""}`,
          textColor: "text-orange-500",
        },
        {
          label: "Approved",
          icon: CheckCircle2,
          color: isAppr
            ? `bg-blue-500 border-blue-500 text-white ${returnStatus === "Approved" ? "scale-110 shadow-md" : ""}`
            : "bg-white border-zinc-200 text-zinc-300",
          textColor: isAppr ? "text-blue-500" : "text-zinc-400",
        },
        {
          label: typeLabel,
          icon: Banknote,
          color: isRef
            ? "bg-green-500 border-green-500 text-white scale-110 shadow-md"
            : "bg-white border-zinc-200 text-zinc-300",
          textColor: isRef ? "text-green-500" : "text-zinc-400",
        },
      ];
    }
  } else {
    const isShip =
      order.orderStatus === "Shipped" || order.orderStatus === "Delivered";
    const isDel = order.orderStatus === "Delivered";
    const isConf = order.orderStatus === "Processing";

    progressWidth = isDel ? "100%" : isShip ? "50%" : "0%";
    progressColor = "bg-black";

    trackerSteps = [
      {
        label: "Confirmed",
        icon: Clock,
        color: `bg-black border-black text-white ${isConf ? "scale-110 shadow-md" : ""}`,
        textColor: "text-black",
      },
      {
        label: "Shipped",
        icon: Truck,
        color: isShip
          ? `bg-black border-black text-white ${order.orderStatus === "Shipped" ? "scale-110 shadow-md" : ""}`
          : "bg-white border-zinc-200 text-zinc-300",
        textColor: isShip ? "text-black" : "text-zinc-400",
      },
      {
        label: "Delivered",
        icon: CheckCircle2,
        color: isDel
          ? "bg-black border-black text-white scale-110 shadow-md"
          : "bg-white border-zinc-200 text-zinc-300",
        textColor: isDel ? "text-black" : "text-zinc-400",
      },
    ];
  }

  return (
    <div className="min-h-screen bg-white pt-8 md:pt-16 pb-20 selection:bg-black selection:text-white overflow-x-hidden">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8 md:mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] hover:gap-3 transition-all text-zinc-500 hover:text-black print:hidden"
          >
            <ArrowLeft size={16} /> Back to My Orders
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] bg-zinc-50 hover:bg-zinc-100 px-4 py-2 rounded-full transition-all text-black print:hidden"
          >
            <Printer size={14} /> Print Invoice
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-black/10 pb-8 md:pb-10 mb-8 md:mb-12">
          <div className="w-full md:w-auto">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none break-all md:break-normal">
              Order{" "}
              <span className="text-gray-300">#{order._id?.slice(-6)}</span>
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 md:mt-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                Placed on{" "}
                <span className="text-black">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </p>
              {order.isPaid && (
                <span className="bg-green-100 text-green-700 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded">
                  Payment Confirmed
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3 md:gap-4 mt-6 md:mt-0 w-full md:w-auto print:hidden">
            <div
              className={`px-4 md:px-6 py-2 md:py-2.5 text-[10px] md:text-[11px] font-black uppercase tracking-widest italic rounded-md shadow-sm ${getStatusColor(order.orderStatus)}`}
            >
              {order.orderStatus}
            </div>

            {isEligibleForReturn && (
              <button
                onClick={() => navigate("/orders")}
                className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest bg-zinc-100 px-4 py-3 md:py-2.5 hover:bg-black hover:text-white transition-all italic border border-black/5 rounded-md w-full md:w-auto"
              >
                <RotateCcw size={14} /> Request Return
              </button>
            )}

            {order.orderStatus === "Processing" && (
              <button
                onClick={handleCancel}
                className="flex items-center justify-center gap-2 text-[10px] font-black uppercase text-red-600 hover:text-red-800 hover:underline bg-red-50 hover:bg-red-100 px-4 py-3 md:py-2 rounded-md transition-colors w-full md:w-auto"
              >
                <XCircle size={14} /> Cancel Order
              </button>
            )}
          </div>
        </div>

        <div className="mb-12 md:mb-16 bg-zinc-50 p-6 md:p-10 rounded-xl border border-zinc-100 overflow-x-auto scrollbar-hide print:hidden">
          <div className="flex justify-between items-center relative min-w-[500px] max-w-3xl mx-auto px-4 md:px-0">
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-zinc-200 -translate-y-1/2 z-0"></div>
            <div
              className={`absolute top-1/2 left-0 h-[2px] ${progressColor} -translate-y-1/2 transition-all duration-1000 z-0`}
              style={{ width: progressWidth }}
            ></div>

            {trackerSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="relative z-10 flex flex-col items-center gap-3 md:gap-4 bg-zinc-50 px-2"
                >
                  <div
                    className={`p-2.5 md:p-3 rounded-full border-2 transition-all duration-500 ${step.color}`}
                  >
                    <Icon size={18} className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <span
                    className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest italic transition-all duration-500 ${step.textColor}`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
          {/* LEFT SIDE: Items & Support */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] border-b border-zinc-200 pb-3 flex items-center gap-2 text-zinc-500">
                <Package size={16} /> Order Items ({order.orderItems?.length})
              </h3>

              <div className="space-y-0">
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

                    <div className="flex-1 flex flex-col justify-center py-1 min-w-0">
                      <h4 className="text-base md:text-xl font-black uppercase italic leading-tight truncate">
                        {item.productName || item.name || "Premium Piece"}
                      </h4>
                      <p className="text-[10px] md:text-xs font-medium text-zinc-500 mt-1 uppercase tracking-wider">
                        Color: {item.color || "Standard"}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-3 md:mt-4">
                        <span className="text-[9px] font-black text-black bg-zinc-100 px-3 py-1.5 rounded uppercase tracking-widest border border-zinc-200">
                          Size: {item.size}
                        </span>
                        <span className="text-[9px] font-black text-black bg-zinc-100 px-3 py-1.5 rounded uppercase tracking-widest border border-zinc-200">
                          Qty: {item.quantity}
                        </span>
                      </div>

                      <p className="font-black text-lg md:text-xl italic mt-4">
                        ₹{item.price?.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 🔥 NEW NEED HELP SECTION */}
            <div className="bg-zinc-900 text-white rounded-2xl p-6 md:p-8 print:hidden flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="bg-zinc-800 p-3 rounded-full">
                  <MessageCircleQuestion size={24} className="text-zinc-300" />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest italic mb-1">
                    Need Help With This Order?
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                    Contact us for any questions or issues.
                  </p>
                </div>
              </div>
              <a
                href="mailto:support@krumeku.com"
                className="w-full sm:w-auto text-center bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] py-3 px-6 rounded-lg hover:bg-zinc-200 transition-colors"
              >
                Email Support
              </a>
            </div>
          </div>

          {/* RIGHT SIDE: Address & Summary */}
          <div className="lg:col-span-4 space-y-6 md:space-y-8">
            {/* 🔥 NEW TRACKING SECTION (Shows only if shipped) */}
            {(order.orderStatus === "Shipped" ||
              order.orderStatus === "Delivered") &&
              order.shiprocketOrderId && (
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl print:hidden">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-blue-800 mb-3">
                    <Truck size={16} /> Tracking Detail
                  </h3>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4">
                    Track your shipment directly via courier partner.
                  </p>
                  <a
                    href={`https://shiprocket.co/tracking/${order.shiprocketOrderId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex justify-center items-center gap-2 w-full py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                  >
                    Track Order <ExternalLink size={14} />
                  </a>
                </div>
              )}

            <div className="bg-white border border-zinc-200 p-6 md:p-8 rounded-2xl shadow-sm">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-zinc-500 border-b border-zinc-100 pb-4 mb-4">
                <MapPin size={16} /> Delivery Address
              </h3>
              <div className="text-[11px] md:text-xs font-bold text-zinc-500 leading-relaxed uppercase space-y-1">
                <p className="text-black mb-2 font-black text-sm">
                  {order.shippingAddress?.fullName || user?.fullName}
                </p>
                <p>{order.shippingAddress?.address}</p>
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}
                </p>
                <p>
                  Pincode:{" "}
                  <span className="text-black">
                    {order.shippingAddress?.postalCode}
                  </span>
                </p>
                <p className="mt-4 pt-4 border-t border-zinc-100 text-black flex items-center gap-2">
                  <span className="text-zinc-400">Phone:</span> +91{" "}
                  {order.shippingAddress?.phone}
                </p>
              </div>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 p-6 md:p-8 rounded-2xl shadow-sm">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] border-b border-zinc-200 pb-4 mb-5 flex items-center gap-2 text-zinc-500">
                <ReceiptText size={16} /> Order Summary
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between text-[11px] font-bold uppercase text-zinc-500">
                  <span>Payment Mode</span>
                  <span className="text-black">{order.paymentMethod}</span>
                </div>

                <div className="flex justify-between text-[11px] font-bold uppercase text-zinc-500">
                  <span>Payment Status</span>
                  <span
                    className={
                      order.isPaid ? "text-green-600" : "text-orange-600"
                    }
                  >
                    {order.isPaid ? "Paid" : "Pending"}
                  </span>
                </div>

                <div className="h-[1px] bg-zinc-200 my-2"></div>

                <div className="flex justify-between text-[11px] font-bold uppercase text-zinc-500">
                  <span>Total MRP</span>
                  <span className="text-black">
                    ₹{order.itemsPrice?.toLocaleString("en-IN")}
                  </span>
                </div>

                {order.taxPrice > 0 && (
                  <div className="flex justify-between text-[11px] font-bold uppercase text-zinc-500">
                    <span>GST / Taxes (+)</span>
                    <span className="text-black">
                      ₹{order.taxPrice?.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                {order.discountPrice > 0 && (
                  <div className="flex justify-between text-[11px] font-bold uppercase text-green-600">
                    <span>Discount (-)</span>
                    <span>
                      - ₹{order.discountPrice?.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-[11px] font-bold uppercase text-zinc-500">
                  <span>Delivery Charges (+)</span>
                  <span
                    className={
                      order.shippingPrice === 0
                        ? "text-green-600 font-black"
                        : "text-black"
                    }
                  >
                    {order.shippingPrice === 0
                      ? "FREE"
                      : `₹${order.shippingPrice?.toLocaleString("en-IN")}`}
                  </span>
                </div>

                <div className="flex justify-between items-center border-t border-zinc-200 pt-5 mt-2">
                  <span className="text-[11px] font-black uppercase tracking-widest text-black">
                    Final Total
                  </span>
                  <span className="text-2xl font-black italic text-black">
                    ₹{order.totalPrice?.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {isReturnRequested && (
                <div
                  className={`mt-8 pt-6 border-t border-zinc-200 -mx-6 md:-mx-8 -mb-6 md:-mb-8 p-6 md:p-8 rounded-b-2xl ${
                    returnStatus === "Pending"
                      ? "bg-orange-50"
                      : returnStatus === "Approved"
                        ? "bg-blue-50"
                        : returnStatus === "Refunded"
                          ? "bg-green-50"
                          : "bg-red-50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {returnStatus === "Pending" && (
                      <Clock size={18} className="text-orange-600" />
                    )}
                    {returnStatus === "Approved" && (
                      <CheckCircle2 size={18} className="text-blue-600" />
                    )}
                    {returnStatus === "Refunded" && (
                      <Banknote size={18} className="text-green-600" />
                    )}
                    {returnStatus === "Rejected" && (
                      <XCircle size={18} className="text-red-600" />
                    )}
                    <h4
                      className={`text-sm font-black uppercase italic ${
                        returnStatus === "Pending"
                          ? "text-orange-600"
                          : returnStatus === "Approved"
                            ? "text-blue-600"
                            : returnStatus === "Refunded"
                              ? "text-green-600"
                              : "text-red-600"
                      }`}
                    >
                      {returnStatus}
                    </h4>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">
                    Type: {order.returnInfo.type}
                  </p>
                  {order.returnInfo.adminComment && (
                    <div className="bg-white p-3 rounded-xl border border-white/40 mt-3 shadow-sm">
                      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 block mb-1">
                        Update from Support:
                      </span>
                      <p className="text-[10px] font-bold text-zinc-800 uppercase tracking-tight italic">
                        "{order.returnInfo.adminComment}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
