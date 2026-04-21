import React, { useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getOrderDetails,
  cancelOrderUser,
} from "../features/orders/orderSlice";
import {
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
} from "lucide-react";
import SEO from "../components/SEO";
import { cldImage } from "../utils/imageHelper";
import { formatDate, formatId, formatPrice } from "../utils/formatters";
import StatusBadge from "../components/ui/StatusBadge";
import { OrderDetailsSkeleton } from "../components/Skeletons";
import Button from "../components/ui/Button";

const checkEligibility = (deliveryDate) => {
  if (!deliveryDate) return false;
  const delivered = new Date(deliveryDate);
  const diffDays = Math.ceil(
    Math.abs(new Date() - delivered) / (1000 * 60 * 60 * 24),
  );
  return diffDays <= 7;
};

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

  const handleCancel = useCallback(() => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      dispatch(cancelOrderUser(id));
    }
  }, [dispatch, id]);

  const handlePrint = useCallback(() => window.print(), []);

  const trackerData = useMemo(() => {
    if (!order) return { width: "0%", color: "bg-black", steps: [] };

    const isReturnRequested = order.returnInfo?.isReturnRequested;
    const returnStatus = order.returnInfo?.status || "None";

    let width = "0%",
      color = "bg-black",
      steps = [];

    if (isReturnRequested) {
      const typeLabel =
        order.returnInfo?.type === "Exchange" ? "Exchanged" : "Refunded";

      if (returnStatus === "Rejected") {
        width = "50%";
        color = "bg-red-500";
        steps = [
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
        const isAppr =
          returnStatus === "Approved" || returnStatus === "Refunded";
        const isRef = returnStatus === "Refunded";
        width = isRef ? "100%" : isAppr ? "50%" : "0%";
        color = isRef
          ? "bg-green-500"
          : isAppr
            ? "bg-blue-500"
            : "bg-orange-500";

        steps = [
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
      width = isDel ? "100%" : isShip ? "50%" : "0%";

      steps = [
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
    return { width, color, steps };
  }, [order]);

  if (isLoading) return <OrderDetailsSkeleton />;

  if (isError || id === "super" || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <SEO title="Order Not Found" />
        <AlertCircle
          className="text-red-500 mb-4"
          size={40}
          aria-hidden="true"
        />
        <p
          className="font-black uppercase italic tracking-widest text-lg"
          role="alert"
        >
          {message || "Order Not Found"}
        </p>
        <Button
          variant="outline"
          onClick={() => navigate("/orders")}
          className="mt-6"
        >
          Return to My Orders
        </Button>
      </div>
    );
  }

  const isEligibleForReturn =
    order.orderStatus === "Delivered" &&
    !order.returnInfo?.isReturnRequested &&
    (order.deliveredAt ? checkEligibility(order.deliveredAt) : true);

  return (
    <div className="min-h-screen bg-white pt-8 md:pt-16 pb-20 selection:bg-black selection:text-white animate-in fade-in duration-500">
      <SEO
        title={`Order ${formatId(order._id)}`}
        description="Track your order status and view delivery details at Krumeku."
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-8 md:mb-10 print:hidden">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-black transition-all outline-none focus-visible:ring-2 focus-visible:ring-black rounded px-1"
          >
            <ArrowLeft size={16} aria-hidden="true" /> Back to My Orders
          </button>
          <Button
            variant="ghost"
            onClick={handlePrint}
            icon={Printer}
            className="rounded-full bg-zinc-50 hover:bg-zinc-100"
          >
            Print Invoice
          </Button>
        </div>

        {/* Order Title & Status */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-black/10 pb-8 md:pb-10 mb-8 md:mb-12">
          <div>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
              Order
              <span className="text-gray-300 ml-3">{formatId(order._id)}</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mt-4">
              Placed on
              <span className="text-black ml-2">
                {formatDate(order.createdAt)}
              </span>
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3 mt-6 md:mt-0 w-full md:w-auto print:hidden">
            <StatusBadge
              status={order.orderStatus}
              className="px-4 py-2.5 text-[11px]"
            />
            {isEligibleForReturn && (
              <Button
                variant="ghost"
                onClick={() =>
                  navigate("/orders", {
                    state: { openReturn: order._id },
                  })
                }
                icon={RotateCcw}
                className="w-full md:w-auto border border-black/5"
              >
                Request Return
              </Button>
            )}
            {order.orderStatus === "Processing" && (
              <Button
                variant="danger"
                onClick={handleCancel}
                icon={XCircle}
                className="w-full md:w-auto"
              >
                Cancel Order
              </Button>
            )}
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="mb-12 md:mb-16 bg-zinc-50 p-6 md:p-10 rounded-xl border border-zinc-100 overflow-x-auto scrollbar-hide print:hidden">
          <div
            className="flex justify-between items-center relative min-w-[500px] max-w-3xl mx-auto"
            role="progressbar"
            aria-valuenow={parseInt(trackerData.width)}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Order Progress"
          >
            <div
              className="absolute top-1/2 left-0 w-full h-[2px] bg-zinc-200 -translate-y-1/2 z-0"
              aria-hidden="true"
            ></div>
            <div
              className={`absolute top-1/2 left-0 h-[2px] ${trackerData.color} -translate-y-1/2 transition-all duration-1000 z-0`}
              style={{ width: trackerData.width }}
              aria-hidden="true"
            ></div>

            {trackerData.steps.map((step, idx) => (
              <div
                key={idx}
                className="relative z-10 flex flex-col items-center gap-3 bg-zinc-50 px-2"
                aria-hidden="true"
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

            <span className="sr-only">
              Current status:{" "}
              {order.returnInfo?.isReturnRequested
                ? order.returnInfo.status
                : order.orderStatus}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] border-b border-zinc-200 pb-3 flex items-center gap-2 text-zinc-500">
                <Package size={16} aria-hidden="true" /> Order Items (
                {order.orderItems?.length})
              </h2>

              <div role="list" className="divide-y divide-zinc-100">
                {order.orderItems?.map((item) => {
                  const pName = item.productName || "Premium Piece";
                  return (
                    <div
                      key={item._id}
                      role="listitem"
                      className="flex flex-row gap-4 md:gap-6 py-6 group"
                    >
                      <div className="w-24 h-32 md:w-28 md:h-40 bg-zinc-50 overflow-hidden flex-shrink-0 border border-zinc-100 rounded-xl">
                        <img
                          src={cldImage(item.image, 400)}
                          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                          alt={pName}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-center min-w-0">
                        <h3 className="text-base md:text-xl font-black uppercase italic leading-tight truncate">
                          {pName}
                        </h3>
                        <p className="text-[10px] font-medium text-zinc-500 mt-1 uppercase tracking-wider">
                          Color: {item.color || "Standard"}{" "}
                          <span aria-hidden="true">|</span> Size: {item.size}
                        </p>
                        <p className="font-black text-lg italic mt-4">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Help Section */}
            <section
              className="bg-zinc-900 text-white rounded-2xl p-6 md:p-8 print:hidden flex flex-col sm:flex-row items-center justify-between gap-6"
              aria-labelledby="help-heading"
            >
              <div className="flex items-start gap-4">
                <div
                  className="bg-zinc-800 p-3 rounded-full"
                  aria-hidden="true"
                >
                  <MessageCircleQuestion size={24} className="text-zinc-300" />
                </div>
                <div>
                  <h3
                    id="help-heading"
                    className="text-sm font-black uppercase tracking-widest italic mb-1"
                  >
                    Need Help?
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-medium uppercase">
                    Contact us for any questions about this order.
                  </p>
                </div>
              </div>
              <a
                href={`mailto:support@krumeku.com?subject=Help with Order ${formatId(order._id)}`}
                className="w-full sm:w-auto text-center bg-white text-black hover:bg-zinc-200 transition-colors text-[10px] font-black uppercase tracking-[0.2em] py-3 px-6 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
              >
                Email Support
              </a>
            </section>
          </div>

          {/* ── Sidebar ── */}
          <div className="lg:col-span-4 space-y-6">
            {/* Address */}
            <section
              className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm"
              aria-labelledby="address-heading"
            >
              <h2
                id="address-heading"
                className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-zinc-500 border-b border-zinc-100 pb-4 mb-4"
              >
                <MapPin size={16} aria-hidden="true" /> Address
              </h2>
              <address className="text-[11px] font-bold text-zinc-500 leading-relaxed uppercase space-y-1 not-italic">
                <p className="text-black mb-2 font-black text-sm">
                  {order.shippingAddress?.fullName || user?.fullName}
                </p>
                <p>
                  {order.shippingAddress?.address},{" "}
                  {order.shippingAddress?.city}
                </p>
                {/* ✅ FIX: postalCode → pincode (matches backend schema) */}
                <p>
                  {order.shippingAddress?.state} -{" "}
                  {order.shippingAddress?.pincode}
                </p>
                <p className="mt-4 pt-4 border-t border-zinc-100 text-black">
                  +91 {order.shippingAddress?.phone}
                </p>
              </address>
            </section>

            {/* Order Summary */}
            <section
              className="bg-zinc-50 border border-zinc-200 p-6 rounded-2xl shadow-sm"
              aria-labelledby="summary-heading"
            >
              <h2
                id="summary-heading"
                className="text-[11px] font-black uppercase tracking-[0.2em] border-b border-zinc-200 pb-4 mb-5 flex items-center gap-2 text-zinc-500"
              >
                <ReceiptText size={16} aria-hidden="true" /> Summary
              </h2>
              <div className="space-y-4 text-[11px] font-bold uppercase text-zinc-500">
                <div className="flex justify-between">
                  <span>Payment</span>
                  <span className="text-black">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>MRP</span>
                  <span className="text-black">
                    {formatPrice(order.itemsPrice)}
                  </span>
                </div>
                {order.discountPrice > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>- {formatPrice(order.discountPrice)}</span>
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
                      : formatPrice(order.shippingPrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-zinc-200 pt-5 mt-2">
                  <span className="text-black font-black">Total</span>
                  <span className="text-2xl font-black italic text-black">
                    {formatPrice(order.totalPrice)}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
