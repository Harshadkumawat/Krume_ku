import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  adminManageReturn,
  getAllOrders,
} from "../../features/orders/orderSlice";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Banknote,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";

export default function AdminReturnRequests() {
  const dispatch = useDispatch();
  const { orders, isLoading } = useSelector((state) => state.order);

  const CLOUD_NAME = "dftticvtc";

  // 🖼️ Image URL Helper
  const getImgUrl = (imgId) => {
    if (!imgId)
      return "https://placehold.co/400x600/000000/FFFFFF?text=No+Image";
    if (typeof imgId === "string" && imgId.startsWith("http")) return imgId;
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,w_300,q_auto,f_auto/${imgId}`;
  };

  useEffect(() => {
    dispatch(getAllOrders());
  }, [dispatch]);

  const returnOrders = orders?.filter(
    (order) => order.returnInfo && order.returnInfo.isReturnRequested,
  );

  const handleAction = (id, status) => {
    const confirmMsg =
      status === "Refunded"
        ? "Confirm Refund? Inventory will be restocked automatically."
        : `Mark this return request as ${status}?`;

    if (window.confirm(confirmMsg)) {
      dispatch(
        adminManageReturn({
          id,
          statusData: { status },
        }),
      );
    }
  };

  if (isLoading)
    return (
      <div className="flex flex-col justify-center items-center h-[70vh]">
        <Loader2 className="animate-spin w-10 h-10 text-black mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
          Syncing Returns...
        </p>
      </div>
    );

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 overflow-x-hidden">
      {/* 1. HEADER SECTION */}
      <div className="bg-black text-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[100px] rounded-full -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic">
            Return <span className="text-orange-500">Requests</span>
          </h2>
          <p className="text-gray-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic opacity-80">
            Manage Refunds, Exchanges & Pickups
          </p>
        </div>

        <div className="relative z-10 w-full md:w-auto">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 px-5 py-4 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-between md:justify-start gap-4">
            <span>Pending Actions</span>
            <span className="text-orange-400 bg-orange-500/20 px-3 py-1 rounded-lg text-sm">
              {returnOrders?.filter((o) => o.returnInfo.status === "Pending")
                .length || 0}
            </span>
          </div>
        </div>
      </div>

      {/* 2. REQUESTS LIST */}
      <div className="grid gap-4 md:gap-6 w-full">
        {!returnOrders || returnOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
            <RotateCcw className="mx-auto text-gray-200 mb-4" size={50} />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic px-4">
              No active return requests found
            </p>
          </div>
        ) : (
          returnOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white p-4 md:p-6 lg:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-5 md:gap-8 justify-between group hover:border-orange-200 transition-all duration-300"
            >
              {/* LEFT SIDE: ORDER & CUSTOMER DETAILS */}
              <div className="flex-1 w-full">
                {/* Badges Row (Mobile friendly flex-wrap) */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[9px] md:text-[10px] bg-gray-50 px-2.5 py-1 rounded-md text-gray-500 uppercase tracking-widest">
                      #{order._id.slice(-8).toUpperCase()}
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-md border tracking-widest ${
                        order.returnInfo.type === "Refund"
                          ? "bg-red-50 border-red-100 text-red-600"
                          : "bg-blue-50 border-blue-100 text-blue-600"
                      }`}
                    >
                      {order.returnInfo.type}
                    </span>
                  </div>
                  <span className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase italic">
                    {new Date(
                      order.returnInfo.requestedAt || order.updatedAt,
                    ).toLocaleDateString("en-IN")}
                  </span>
                </div>

                {/* Product & User Details */}
                <div className="flex items-start gap-4">
                  <div className="w-20 h-24 md:w-24 md:h-32 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 shadow-sm">
                    <img
                      src={getImgUrl(order.orderItems?.[0]?.image)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt="Product"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-sm md:text-lg font-black uppercase italic leading-none mb-1 truncate">
                        {order.user?.fullName || "Guest User"}
                      </h3>
                      <span className="font-black text-sm md:text-base text-gray-900 italic flex-shrink-0">
                        ₹{order.totalPrice.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold mb-3 tracking-tight truncate lowercase">
                      {order.user?.email}
                    </p>

                    {/* Reason Box */}
                    <div className="bg-orange-50 p-3 md:p-4 rounded-xl border border-orange-100">
                      <p className="text-[10px] md:text-[11px] text-orange-900 leading-snug font-bold">
                        <span className="font-black uppercase text-[9px] text-orange-500 tracking-widest block mb-1">
                          Reason for return:
                        </span>
                        {order.returnInfo.reason}
                      </p>
                      {order.returnInfo.comments && (
                        <p className="text-[10px] md:text-[11px] text-orange-800 mt-2 italic border-t border-orange-100 pt-2 font-medium line-clamp-2 md:line-clamp-none">
                          "{order.returnInfo.comments}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: STATUS & ACTIONS */}
              <div className="w-full lg:w-64 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-gray-100 pt-5 lg:pt-0 lg:pl-8 shrink-0">
                <div className="flex items-center justify-between lg:flex-col lg:items-start lg:gap-2 w-full">
                  <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">
                    Request Status
                  </span>
                  <span
                    className={`text-[9px] md:text-[10px] font-black px-4 py-2 rounded-xl border flex items-center justify-center gap-2 uppercase tracking-widest italic transition-all w-fit lg:w-full ${
                      order.returnInfo.status === "Pending"
                        ? "bg-orange-50 border-orange-200 text-orange-600 shadow-sm"
                        : order.returnInfo.status === "Approved"
                          ? "bg-green-50 border-green-200 text-green-600"
                          : order.returnInfo.status === "Refunded"
                            ? "bg-black border-black text-white"
                            : "bg-red-50 border-red-200 text-red-600"
                    }`}
                  >
                    {order.returnInfo.status === "Pending" && (
                      <AlertTriangle size={14} />
                    )}
                    {order.returnInfo.status}
                  </span>
                </div>

                {/* Buttons wrapper: Row on mobile, Column on desktop if needed, but Row looks good universally if flex-1 is used */}
                <div className="flex flex-row lg:flex-col gap-2 w-full mt-auto">
                  {order.returnInfo.status === "Pending" && (
                    <>
                      <button
                        onClick={() => handleAction(order._id, "Approved")}
                        className="flex-1 flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-md"
                      >
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button
                        onClick={() => handleAction(order._id, "Rejected")}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-50 border border-red-100 text-red-600 hover:bg-red-600 hover:text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </>
                  )}

                  {order.returnInfo.status === "Approved" && (
                    <button
                      onClick={() => handleAction(order._id, "Refunded")}
                      className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                    >
                      <Banknote size={16} /> Mark Refunded
                    </button>
                  )}

                  {order.returnInfo.status === "Refunded" && (
                    <div className="w-full text-center py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-400 text-[10px] font-black uppercase tracking-widest italic">
                      Closed
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
