import React, { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, RotateCcw, XCircle } from "lucide-react";
import { cldImage } from "../../utils/imageHelper";
import { formatId, formatPrice } from "../../utils/formatters";
import StatusBadge from "../ui/StatusBadge";

const checkEligibility = (deliveryDate) => {
  if (!deliveryDate) return false;
  const delivered = new Date(deliveryDate);
  const diffTime = Math.abs(new Date() - delivered);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7;
};

const OrderCard = memo(({ order, onReturnClick, onCancelClick }) => {
  const navigate = useNavigate();

  const isDelivered = order.orderStatus === "Delivered";
  const isProcessing = order.orderStatus === "Processing";
  const isEligible =
    isDelivered &&
    (order.deliveredAt ? checkEligibility(order.deliveredAt) : true);

  const isReturnRequested = order.returnInfo?.isReturnRequested;
  const returnStatus = order.returnInfo?.status;

  const item = order.orderItems?.[0];

  const handleCardClick = useCallback(() => {
    navigate(`/order/${order._id}`);
  }, [navigate, order._id]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View order details for ${item?.productName || "item"}`}
      onClick={handleCardClick}
      onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
      className="group bg-white border border-zinc-100 hover:border-black transition-all duration-500 p-4 md:p-6 mb-4 md:mb-6 shadow-sm hover:shadow-xl cursor-pointer rounded-[1.2rem] md:rounded-[1.5rem] outline-none focus-visible:ring-2 focus-visible:ring-black"
    >
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 md:gap-6">
        <div className="flex gap-4 md:gap-5 flex-1 min-w-0">
          <div className="w-20 h-24 md:w-24 md:h-32 bg-zinc-50 overflow-hidden flex-shrink-0 rounded-xl border border-zinc-100 relative">
            <img
              src={cldImage(item?.image, 300)}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 absolute inset-0"
              alt={item?.productName || "Order Item"}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.target.src =
                  "https://placehold.co/400x600/000000/FFFFFF?text=Image+Error";
              }}
            />
          </div>

          <div className="flex flex-col justify-center flex-1 min-w-0 py-1">
            <p className="text-[8px] md:text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1.5 md:mb-1">
              ID: {formatId(order._id)}
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
                {formatPrice(order.totalPrice)}
              </span>
              <StatusBadge status={order.orderStatus} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-start md:justify-end w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t border-zinc-100 md:border-t-0 md:min-w-[180px]">
          {isReturnRequested ? (
            <div className="text-left md:text-right w-full md:w-auto bg-orange-50 md:bg-transparent p-3 md:p-0 rounded-lg md:rounded-none border border-orange-100 md:border-none flex items-center justify-between md:block">
              <div className="flex flex-col items-start md:items-end gap-1">
                <span className="text-[8px] font-black uppercase text-zinc-400 block mb-0.5">
                  Return Status
                </span>
                <StatusBadge status={returnStatus} />
              </div>
              <ChevronRight
                size={14}
                className="md:hidden text-zinc-400"
                aria-hidden="true"
              />
            </div>
          ) : isProcessing ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onCancelClick) onCancelClick(order._id);
              }}
              aria-label={`Cancel order ${formatId(order._id)}`}
              className="flex items-center justify-center gap-2 md:gap-3 w-full md:w-auto text-[10px] md:text-[10px] font-black uppercase tracking-[0.1em] bg-red-50 text-red-600 border border-red-200 px-5 md:px-6 py-3.5 md:py-4 rounded-xl hover:bg-red-100 transition-all active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
            >
              <XCircle size={14} aria-hidden="true" /> Cancel Order
            </button>
          ) : isEligible ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onReturnClick(order);
              }}
              aria-label={`Return or exchange order ${formatId(order._id)}`}
              className="flex items-center justify-center gap-2 md:gap-3 w-full md:w-auto text-[10px] md:text-[10px] font-black uppercase tracking-[0.1em] bg-black text-white px-5 md:px-6 py-3.5 md:py-4 rounded-xl hover:bg-zinc-800 transition-all shadow-lg active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-zinc-800 focus-visible:ring-offset-2"
            >
              <RotateCcw size={14} aria-hidden="true" /> Return / Exchange
            </button>
          ) : (
            <button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              className="flex items-center justify-center gap-3 md:gap-4 w-full md:w-auto text-[10px] font-black uppercase tracking-[0.2em] border border-black px-6 md:px-8 py-3.5 md:py-4 hover:bg-black hover:text-white transition-all italic rounded-xl pointer-events-none"
            >
              Details <ChevronRight size={14} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

OrderCard.displayName = "OrderCard";
export default OrderCard;
