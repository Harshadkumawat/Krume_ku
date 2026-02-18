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

  // ☁️ Cloudinary Configuration
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
        ? "Confirm Refund? Inventory will be restocked."
        : `Mark this request as ${status}?`;

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
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-black w-10 h-10" />
      </div>
    );

  return (
    <div className="p-8 bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-gray-200 pb-6 gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-zinc-900 leading-none">
            Return <span className="text-orange-500">Protocol</span>
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-3">
            Manage Refunds, Exchanges & Reverse Pickups
          </p>
        </div>
        <div className="bg-black text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
          Pending Request Queue:{" "}
          <span className="text-orange-400 ml-1">
            {returnOrders?.filter((o) => o.returnInfo.status === "Pending")
              .length || 0}
          </span>
        </div>
      </div>

      {/* Requests List */}
      <div className="grid gap-6">
        {!returnOrders || returnOrders.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200">
            <RotateCcw className="mx-auto text-gray-200 mb-6" size={64} />
            <p className="font-black uppercase text-gray-300 tracking-[0.3em] italic">
              No Active Return Requests in Archive
            </p>
          </div>
        ) : (
          returnOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col xl:flex-row gap-8 justify-between items-start xl:items-center group hover:border-black/20 transition-all duration-500"
            >
              {/* 1. ORDER DETAILS */}
              <div className="flex-1 w-full">
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <span className="font-mono font-bold text-[10px] bg-zinc-100 px-3 py-1 rounded text-zinc-500 uppercase tracking-tighter">
                    SEQ: #{order._id.slice(-8).toUpperCase()}
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border tracking-widest ${
                      order.returnInfo.type === "Refund"
                        ? "bg-red-50 border-red-100 text-red-600"
                        : "bg-blue-50 border-blue-100 text-blue-600"
                    }`}
                  >
                    {order.returnInfo.type} Request
                  </span>
                  <span className="text-[10px] text-gray-400 font-black uppercase ml-auto xl:ml-0 italic">
                    Logged:{" "}
                    {new Date(
                      order.returnInfo.requestedAt || order.updatedAt,
                    ).toLocaleDateString("en-IN")}
                  </span>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-20 h-28 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 shadow-sm">
                    <img
                      src={getImgUrl(order.orderItems?.[0]?.image)}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      alt="Artifact"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-black uppercase italic leading-none mb-1">
                      {order.user?.fullName || "Classified User"}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold mb-4 tracking-tight">
                      {order.user?.email}
                    </p>

                    {/* Reason Box */}
                    <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 max-w-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-5 italic font-black text-4xl">
                        REASON
                      </div>
                      <p className="text-[11px] text-orange-900 leading-relaxed relative z-10">
                        <span className="font-black uppercase text-[9px] text-orange-400 tracking-widest block mb-1">
                          Protocol Breach:
                        </span>{" "}
                        {order.returnInfo.reason}
                      </p>
                      {order.returnInfo.comments && (
                        <p className="text-[11px] text-orange-800 mt-2 italic border-t border-orange-100 pt-2 font-medium">
                          "{order.returnInfo.comments}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. CURRENT STATUS & ACTIONS */}
              <div className="flex flex-col items-start xl:items-end gap-5 w-full xl:w-auto border-t xl:border-t-0 border-gray-100 pt-6 xl:pt-0">
                <div className="flex flex-col items-start xl:items-end">
                  <span className="text-[9px] font-black uppercase text-gray-300 tracking-[0.3em] mb-2">
                    Operational Status
                  </span>
                  <span
                    className={`text-[10px] font-black px-5 py-2 rounded-xl border flex items-center gap-2 uppercase tracking-widest italic transition-all ${
                      order.returnInfo.status === "Pending"
                        ? "bg-orange-50 border-orange-200 text-orange-600 shadow-[4px_4px_0px_0px_rgba(249,115,22,0.1)]"
                        : order.returnInfo.status === "Approved"
                          ? "bg-green-50 border-green-200 text-green-600"
                          : order.returnInfo.status === "Refunded"
                            ? "bg-black border-black text-white shadow-xl"
                            : "bg-red-50 border-red-200 text-red-600"
                    }`}
                  >
                    {order.returnInfo.status === "Pending" && (
                      <AlertTriangle size={12} />
                    )}
                    {order.returnInfo.status === "Approved" && (
                      <CheckCircle size={12} />
                    )}
                    {order.returnInfo.status}
                  </span>
                </div>

                <div className="flex gap-3 w-full xl:w-auto">
                  {order.returnInfo.status === "Pending" && (
                    <>
                      <button
                        onClick={() => handleAction(order._id, "Approved")}
                        className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                      >
                        <CheckCircle size={14} /> Authorize
                      </button>
                      <button
                        onClick={() => handleAction(order._id, "Rejected")}
                        className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-white border border-red-100 text-red-600 hover:bg-red-50 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                      >
                        <XCircle size={14} /> Deny
                      </button>
                    </>
                  )}

                  {order.returnInfo.status === "Approved" && (
                    <button
                      onClick={() => handleAction(order._id, "Refunded")}
                      className="flex-1 xl:flex-none flex items-center justify-center gap-3 bg-black text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 shadow-2xl active:scale-95 transition-all"
                    >
                      <Banknote size={14} /> Process Liquidation
                    </button>
                  )}

                  {order.returnInfo.status === "Refunded" && (
                    <div className="px-8 py-4 bg-gray-100 rounded-xl text-gray-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 italic">
                      Archive Locked
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
