import React, { memo } from "react";
import { Link } from "react-router-dom";
import { Package, ChevronRight } from "lucide-react";
import { cldImage } from "../../utils/imageHelper";
import { formatPrice, formatId } from "../../utils/formatters";
import StatusBadge from "../ui/StatusBadge";


const OrdersTab = memo(({ orders }) => {
  if (!orders || orders.length === 0) {
    return (
      <div className="py-20 text-center bg-zinc-50 rounded-[1.5rem] border border-dashed border-zinc-200 animate-in fade-in duration-500">
        <Package
          size={40}
          className="mx-auto text-zinc-300 mb-4"
          aria-hidden="true"
        />
        <p
          className="text-[11px] font-black uppercase tracking-widest text-zinc-400"
          role="status"
        >
          No orders placed yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500" role="list">
      {orders.map((order) => {
        const item = order.orderItems?.[0];
        const pName = item?.productName || "Premium Piece";

        return (
          <div
            key={order._id}
            role="listitem"
            className="bg-white border border-zinc-200 p-4 md:p-6 rounded-[1.5rem] flex flex-col md:flex-row justify-between gap-4 md:gap-6 shadow-sm hover:border-black transition-all"
          >
            <div className="flex gap-4 md:gap-6">
              {/* 🖼️ Image Section */}
              <div className="w-20 h-24 md:w-24 md:h-28 bg-zinc-50 rounded-xl border border-zinc-100 overflow-hidden flex-shrink-0">
                <img
                  src={cldImage(item?.image, 300)}
                  className="w-full h-full object-cover"
                  alt={pName}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.target.src =
                      "https://placehold.co/400x600/000000/FFFFFF?text=Image+Error";
                  }}
                />
              </div>

              {/* 📝 Order Info */}
              <div className="flex flex-col justify-center">
                <p className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-1">
                  ID: {formatId(order._id)}
                </p>
                <h3 className="text-sm md:text-base font-black uppercase italic leading-tight truncate max-w-[200px] md:max-w-xs mb-2">
                  {pName}
                </h3>
                <p className="text-sm md:text-lg font-black italic mb-2">
                  {formatPrice(order.totalPrice)}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={order.orderStatus} />
                  {order.returnInfo?.isReturnRequested && (
                    <StatusBadge
                      status={order.returnInfo.status || "Return Requested"}
                      className="opacity-80 scale-95"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* 🔗 Action Button */}
            <div className="flex items-center justify-start md:justify-end gap-3 border-t md:border-t-0 border-zinc-100 pt-4 md:pt-0">
              <Link
                to={`/order/${order._id}`}
                aria-label={`View details for order ${formatId(order._id)}`}
                className="bg-black text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-zinc-800 transition-colors w-full md:w-auto text-center flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                Details <ChevronRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
});

OrdersTab.displayName = "OrdersTab";
export default OrdersTab;
