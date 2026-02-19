import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ChevronRight, Clock, RotateCcw } from "lucide-react";

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

  const isEligible =
    isDelivered &&
    (order.deliveredAt ? checkEligibility(order.deliveredAt) : true);

  const isReturnRequested = order.returnInfo?.isReturnRequested;
  const returnStatus = order.returnInfo?.status; // 🔥 Naya: Return ka exact status nikal liya

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
      className="group bg-white border border-zinc-100 hover:border-black transition-all duration-500 p-4 md:p-6 mb-4 md:mb-6 shadow-sm hover:shadow-xl cursor-pointer rounded-[1.2rem] md:rounded-[1.5rem]"
    >
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 md:gap-6">
        {/* 📦 IMAGE & INFO SECTION */}
        <div className="flex gap-4 md:gap-5 flex-1 min-w-0">
          <div className="w-20 h-24 md:w-24 md:h-32 bg-zinc-50 overflow-hidden flex-shrink-0 rounded-xl border border-zinc-100 relative">
            <img
              src={getImgUrl(item?.image)}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 absolute inset-0"
              alt="Artifact"
              onError={(e) => {
                e.target.src =
                  "https://placehold.co/400x600/000000/FFFFFF?text=Image+Error";
              }}
            />
          </div>

          <div className="flex flex-col justify-center flex-1 min-w-0 py-1">
            <p className="text-[8px] md:text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1.5 md:mb-1">
              ID: #{order._id?.slice(-8)}
            </p>
            <h2 className="text-sm md:text-lg font-black uppercase italic leading-tight truncate">
              {item?.productName || "Premium Piece"}
            </h2>

            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-[8px] font-bold px-2 py-0.5 bg-zinc-100 rounded text-zinc-500 uppercase">
                Size: {item?.size || "N/A"}
              </span>
              <span className="text-[8px] font-bold px-2 py-0.5 bg-zinc-100 rounded text-zinc-500 uppercase">
                Qty: {item?.quantity || 1}
              </span>
            </div>

            <div className="flex items-center gap-2 md:gap-3 mt-3 md:mt-4">
              <span className="text-base md:text-lg font-black italic tracking-tighter">
                ₹{order.totalPrice?.toLocaleString("en-IN")}
              </span>
              <div
                className={`flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 rounded-full ${bg} ${color}`}
              >
                <StatusIcon size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" />
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-tighter">
                  {order.orderStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 🛠️ ACTION BUTTONS SECTION */}
        <div className="flex items-center justify-start md:justify-end w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t border-zinc-100 md:border-t-0 md:min-w-[180px]">
          {isReturnRequested ? (
            <div className="text-left md:text-right w-full md:w-auto bg-orange-50 md:bg-transparent p-3 md:p-0 rounded-lg md:rounded-none border border-orange-100 md:border-none flex items-center justify-between md:block">
              <div>
                <span className="text-[8px] font-black uppercase text-zinc-400 block mb-0.5 md:mb-1">
                  Return Status
                </span>
                {/* 🔥 NAYA LOGIC: Yahan returnStatus variable use ho raha hai */}
                <span
                  className={`text-[10px] md:text-[11px] font-black uppercase italic ${
                    returnStatus === "Pending"
                      ? "text-orange-500"
                      : returnStatus === "Approved"
                        ? "text-blue-600"
                        : returnStatus === "Refunded"
                          ? "text-green-600"
                          : returnStatus === "Rejected"
                            ? "text-red-600"
                            : "text-zinc-600"
                  }`}
                >
                  {returnStatus}
                </span>
              </div>

              {/* Mobile par ek chhota sa arrow dikhega taaki pata chale ki click karke details dekh sakte hain */}
              <ChevronRight size={14} className="md:hidden text-zinc-400" />
            </div>
          ) : isEligible ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReturnClick(order);
              }}
              className="flex items-center justify-center gap-2 md:gap-3 w-full md:w-auto text-[10px] md:text-[10px] font-black uppercase tracking-[0.1em] bg-black text-white px-5 md:px-6 py-3.5 md:py-4 rounded-xl hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
            >
              <RotateCcw size={14} /> Return / Exchange
            </button>
          ) : (
            <button className="flex items-center justify-center gap-3 md:gap-4 w-full md:w-auto text-[10px] font-black uppercase tracking-[0.2em] border border-black px-6 md:px-8 py-3.5 md:py-4 hover:bg-black hover:text-white transition-all italic rounded-xl">
              Details <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
