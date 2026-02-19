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
      <div className="h-[80vh] flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-black w-10 h-10" />
      </div>
    );

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen pb-24 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-10 border-b border-gray-200 pb-6 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-zinc-900 leading-none">
            Return <span className="text-orange-500">Requests</span>
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] md:tracking-[0.4em] mt-3">
            Manage Refunds, Exchanges & Reverse Pickups
          </p>
        </div>
        <div className="bg-black text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center">
          Pending:
          <span className="text-orange-400 ml-2">
            {returnOrders?.filter((o) => o.returnInfo.status === "Pending")
              .length || 0}
          </span>
        </div>
      </div>

      {/* Requests List */}
      <div className="grid gap-4 md:gap-6 max-w-6xl mx-auto">
        {!returnOrders || returnOrders.length === 0 ? (
          <div className="text-center py-20 md:py-32 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <RotateCcw className="mx-auto text-gray-200 mb-6" size={50} />
            <p className="font-black uppercase text-gray-300 tracking-[0.2em] italic text-sm px-4">
              No active return requests found
            </p>
          </div>
        ) : (
          returnOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white p-5 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm border border-gray-100 flex flex-col xl:flex-row gap-6 md:gap-8 justify-between items-start xl:items-center group hover:border-orange-200 transition-all duration-500"
            >
              {/* 1. ORDER & CUSTOMER DETAILS */}
              <div className="flex-1 w-full">
                <div className="flex flex-wrap items-center gap-3 mb-5">
                  <span className="font-mono font-bold text-[9px] md:text-[10px] bg-zinc-100 px-3 py-1 rounded text-zinc-500 uppercase">
                    ID: #{order._id.slice(-8).toUpperCase()}
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border tracking-widest ${
                      order.returnInfo.type === "Refund"
                        ? "bg-red-50 border-red-100 text-red-600"
                        : "bg-blue-50 border-blue-100 text-blue-600"
                    }`}
                  >
                    {order.returnInfo.type}
                  </span>
                  <span className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase ml-auto xl:ml-0 italic">
                    Date:{" "}
                    {new Date(
                      order.returnInfo.requestedAt || order.updatedAt,
                    ).toLocaleDateString("en-IN")}
                  </span>
                </div>

                <div className="flex items-start gap-4 md:gap-6">
                  <div className="w-16 h-20 md:w-20 md:h-28 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 shadow-sm">
                    <img
                      src={getImgUrl(order.orderItems?.[0]?.image)}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      alt="Product"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-lg font-black uppercase italic leading-none mb-1 truncate">
                      {order.user?.fullName || "Guest User"}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold mb-4 tracking-tight truncate">
                      {order.user?.email}
                    </p>

                    {/* Reason Box */}
                    <div className="bg-orange-50/70 p-4 rounded-xl border border-orange-100 relative overflow-hidden">
                      <p className="text-[10px] md:text-[11px] text-orange-900 leading-relaxed relative z-10">
                        <span className="font-black uppercase text-[9px] text-orange-400 tracking-widest block mb-1">
                          Reason for return:
                        </span>{" "}
                        {order.returnInfo.reason}
                      </p>
                      {order.returnInfo.comments && (
                        <p className="text-[10px] md:text-[11px] text-orange-800 mt-2 italic border-t border-orange-100 pt-2 font-medium">
                          "{order.returnInfo.comments}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. STATUS & ACTIONS */}
              <div className="flex flex-col items-stretch md:items-start xl:items-end gap-4 w-full xl:w-auto border-t xl:border-t-0 border-gray-100 pt-5 xl:pt-0">
                <div className="flex flex-row xl:flex-col justify-between items-center xl:items-end">
                  <span className="text-[9px] font-black uppercase text-gray-300 tracking-widest xl:mb-2">
                    Request Status
                  </span>
                  <span
                    className={`text-[10px] font-black px-4 py-1.5 rounded-lg border flex items-center gap-2 uppercase tracking-widest italic transition-all ${
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
                      <AlertTriangle size={12} />
                    )}
                    {order.returnInfo.status}
                  </span>
                </div>

                <div className="flex gap-2 w-full">
                  {order.returnInfo.status === "Pending" && (
                    <>
                      <button
                        onClick={() => handleAction(order._id, "Approved")}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                      >
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button
                        onClick={() => handleAction(order._id, "Rejected")}
                        className="flex-1 flex items-center justify-center gap-2 bg-white border border-red-100 text-red-600 hover:bg-red-50 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </>
                  )}

                  {order.returnInfo.status === "Approved" && (
                    <button
                      onClick={() => handleAction(order._id, "Refunded")}
                      className="flex-1 flex items-center justify-center gap-3 bg-black text-white px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 shadow-xl active:scale-95 transition-all"
                    >
                      <Banknote size={14} /> Complete Refund
                    </button>
                  )}

                  {order.returnInfo.status === "Refunded" && (
                    <div className="w-full text-center py-3 bg-gray-100 rounded-xl text-gray-400 text-[10px] font-black uppercase tracking-widest italic">
                      Completed & Closed
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
