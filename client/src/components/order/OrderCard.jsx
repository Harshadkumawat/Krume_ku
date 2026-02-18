import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  CheckCircle2,
  ChevronRight,
  Clock,
  RotateCcw,
  XCircle,
  AlertTriangle,
} from "lucide-react";

export default function OrderCard({ order, onReturnClick }) {
  const navigate = useNavigate();
  const CLOUD_NAME = "dftticvtc";

  // 🛡️ 1. Eligibility Logic (7 Din ka check)
  const checkEligibility = (deliveryDate) => {
    if (!deliveryDate) return false;
    const delivered = new Date(deliveryDate);
    const today = new Date();
    const diffTime = Math.abs(today - delivered);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const isDelivered = order.orderStatus === "Delivered";
  // 🔥 Date missing ho to testing ke liye 'true' return karega
  const isEligible =
    isDelivered &&
    (order.deliveredAt ? checkEligibility(order.deliveredAt) : true);
  const isReturnRequested = order.returnInfo?.isReturnRequested;

  const getImgUrl = (imgId) => {
    if (!imgId)
      return "https://placehold.co/400x600/000000/FFFFFF?text=No+Image";
    if (imgId.startsWith("http")) return imgId;
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,w_300,q_auto,f_auto/${imgId}`;
  };

  const getStatusDetail = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return {
          color: "text-green-600",
          bg: "bg-green-50",
          icon: CheckCircle2,
        };
      case "processing":
        return { color: "text-orange-600", bg: "bg-orange-50", icon: Clock };
      default:
        return { color: "text-zinc-500", bg: "bg-zinc-100", icon: Clock };
    }
  };

  const { color, bg, icon: StatusIcon } = getStatusDetail(order.orderStatus);
  const item = order.orderItems?.[0];

  return (
    <div
      onClick={() => navigate(`/order/${order._id}`)}
      className="group bg-white border border-zinc-100 hover:border-black transition-all duration-500 p-5 mb-6 shadow-sm hover:shadow-xl cursor-pointer rounded-[1.5rem]"
    >
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="flex gap-5 flex-1">
          <div className="w-20 h-28 bg-zinc-50 overflow-hidden flex-shrink-0 rounded-xl border border-zinc-100">
            <img
              src={getImgUrl(item?.image)}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              alt="Artifact"
              onError={(e) => {
                e.target.src =
                  "https://placehold.co/400x600/000000/FFFFFF?text=Image+Error";
              }}
            />
          </div>

          <div className="flex flex-col justify-between py-1 flex-1">
            <div>
              <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">
                ID: #{order._id?.slice(-8)}
              </p>
              <h2 className="text-lg font-black uppercase italic leading-none truncate">
                {item?.productName || "Premium Piece"}
              </h2>
              <div className="flex gap-2 mt-2">
                <span className="text-[8px] font-bold px-2 py-0.5 bg-zinc-100 rounded text-zinc-500 uppercase">
                  Size: {item?.size}
                </span>
                <span className="text-[8px] font-bold px-2 py-0.5 bg-zinc-100 rounded text-zinc-500 uppercase">
                  Qty: {item?.quantity}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <span className="text-lg font-black italic tracking-tighter">
                ₹{order.totalPrice?.toLocaleString("en-IN")}
              </span>
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${bg} ${color}`}
              >
                <StatusIcon size={12} />
                <span className="text-[9px] font-black uppercase tracking-tighter">
                  {order.orderStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 🛠️ ACTION BUTTONS SECTION */}
        <div className="flex items-center justify-end md:min-w-[180px]">
          {isReturnRequested ? (
            <div className="text-right">
              <span className="text-[8px] font-black uppercase text-zinc-400 block mb-1">
                Status
              </span>
              <span className="text-[10px] font-black uppercase italic text-orange-500">
                Return Requested
              </span>
            </div>
          ) : isEligible ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReturnClick(order);
              }}
              className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.1em] bg-black text-white px-6 py-4 rounded-xl hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
            >
              <RotateCcw size={14} /> Return / Exchange
            </button>
          ) : (
            <button className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] border border-black px-8 py-4 hover:bg-black hover:text-white transition-all italic rounded-xl">
              Details <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
