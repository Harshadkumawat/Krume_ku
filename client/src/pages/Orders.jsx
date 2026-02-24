import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  Loader2,
  PackageSearch,
  ArrowRight,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Banknote,
  XCircle,
  RotateCcw,
} from "lucide-react";

import {
  cancelOrderUser,
  getMyOrders,
  returnOrder,
} from "../features/orders/orderSlice";
import OrderCard from "../components/order/OrderCard";
import SEO from "../components/SEO"; // 🚀 SEO Import Added

export default function Orders() {
  const dispatch = useDispatch();
  const { orders = [], isLoading } = useSelector((state) => state.order);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnType, setReturnType] = useState("refund");
  const [returnReason, setReturnReason] = useState("");
  const [comments, setComments] = useState("");

  useEffect(() => {
    dispatch(getMyOrders());
  }, [dispatch]);

  const handleReturnSubmit = (e) => {
    e.preventDefault();
    if (!returnReason) return toast.error("Please select a reason for return");

    const returnData = {
      type: returnType,
      reason: returnReason,
      comments: comments,
    };

    dispatch(returnOrder({ id: selectedOrder._id, returnData }))
      .unwrap()
      .then(() => {
        toast.success(`Request for ${returnType} initiated successfully.`);
        setSelectedOrder(null);
        setReturnReason("");
        setComments("");
      })
      .catch((err) => toast.error(err));
  };

  const handleCancelOrder = (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      dispatch(cancelOrderUser(orderId))
        .unwrap()
        .then(() => {
          toast.success("Order cancelled successfully");
          dispatch(getMyOrders());
        })
        .catch((err) => toast.error(err));
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <SEO title="Loading Orders..." />
        <Loader2 className="animate-spin text-black w-10 h-10" />
      </div>
    );

  return (
    <div className="min-h-screen bg-white pt-24 md:pt-32 pb-20 selection:bg-black selection:text-white overflow-x-hidden">
      <SEO
        title="My Orders"
        description="Track and manage your premium Krumeku streetwear acquisitions."
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-12 border-b border-black/5 pb-6 md:pb-8">
          <div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none">
              MY{" "}
              <span className="text-transparent stroke-text-black">ORDERS</span>
            </h1>
            <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mt-3">
              Track your premium acquisitions
            </p>
          </div>
          <div className="text-left md:text-center bg-zinc-50 px-6 py-3 rounded-xl border border-zinc-100">
            <p className="text-xl md:text-2xl font-black italic text-black">
              {orders?.length || 0}
            </p>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">
              Total Pieces
            </p>
          </div>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="py-20 md:py-28 text-center border-2 border-dashed border-gray-100 rounded-[2rem]">
            <PackageSearch size={40} className="mx-auto text-gray-300 mb-6" />
            <h2 className="text-xl md:text-2xl font-black uppercase italic mb-4">
              No History Found
            </h2>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border-b-2 border-black pb-1"
            >
              Acquire Your First Piece <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto space-y-4 md:space-y-6">
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onReturnClick={(ord) => setSelectedOrder(ord)}
                onCancelClick={handleCancelOrder}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative bg-white w-full sm:w-[400px] md:w-[500px] h-full shadow-2xl overflow-y-auto rounded-l-3xl"
            >
              <div className="p-6 md:p-8 lg:p-12 min-h-full flex flex-col">
                <div className="flex justify-between items-start mb-8 md:mb-10">
                  <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter leading-none">
                    {selectedOrder.returnInfo?.isReturnRequested
                      ? "Request\nStatus"
                      : "Initiate\nProtocol"}
                  </h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 md:p-3 bg-zinc-50 hover:bg-zinc-100 rounded-full transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 space-y-6">
                  {selectedOrder.returnInfo?.isReturnRequested ? (
                    <div className="space-y-6">
                      <div className="bg-zinc-50 border border-zinc-100 p-6 rounded-2xl">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                          Current Status
                        </p>
                        <div className="flex items-center gap-4">
                          {selectedOrder.returnInfo.status === "Pending" && (
                            <Clock size={24} className="text-orange-600" />
                          )}
                          {selectedOrder.returnInfo.status === "Approved" && (
                            <CheckCircle size={24} className="text-blue-600" />
                          )}
                          {selectedOrder.returnInfo.status === "Refunded" && (
                            <Banknote size={24} className="text-emerald-600" />
                          )}
                          {selectedOrder.returnInfo.status === "Rejected" && (
                            <XCircle size={24} className="text-red-600" />
                          )}
                          <div>
                            <h3 className="text-xl font-black uppercase italic tracking-tighter">
                              {selectedOrder.returnInfo.status}
                            </h3>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                              Type: {selectedOrder.returnInfo.type}
                            </p>
                          </div>
                        </div>
                        {selectedOrder.returnInfo.adminComment && (
                          <div className="mt-6 p-4 bg-white border border-gray-200 rounded-xl">
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                              Update from Support:
                            </span>
                            <p className="text-[11px] font-bold text-gray-800 uppercase tracking-tight italic">
                              "{selectedOrder.returnInfo.adminComment}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-orange-50 border border-orange-100 p-3 rounded-xl flex gap-3">
                        <AlertCircle
                          className="text-orange-600 shrink-0 mt-0.5"
                          size={18}
                        />
                        <p className="text-[10px] font-bold text-orange-800 uppercase tracking-tighter">
                          Ensure artifact is unused, unwashed, and original tags
                          attached.
                        </p>
                      </div>
                      <form onSubmit={handleReturnSubmit} className="space-y-6">
                        <div>
                          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-2">
                            Request Type
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setReturnType("refund")}
                              className={`py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${returnType === "refund" ? "border-black bg-black text-white" : "border-zinc-100 text-zinc-400"}`}
                            >
                              Refund
                            </button>
                            <button
                              type="button"
                              onClick={() => setReturnType("exchange")}
                              className={`py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${returnType === "exchange" ? "border-black bg-black text-white" : "border-zinc-100 text-zinc-400"}`}
                            >
                              Exchange
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-2">
                            Reason
                          </label>
                          <select
                            required
                            value={returnReason}
                            onChange={(e) => setReturnReason(e.target.value)}
                            className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none text-[11px] font-bold uppercase focus:border-black transition-all"
                          >
                            <option value="">Select Protocol</option>
                            <option value="size">Size Fit Issue</option>
                            <option value="quality">
                              Fabric Defect / Damage
                            </option>
                            <option value="wrong">
                              Wrong Artifact Received
                            </option>
                            <option value="mind">Change of Mind</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-2">
                            Remarks
                          </label>
                          <textarea
                            rows="3"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="DESCRIBE THE ISSUE..."
                            className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none text-[11px] font-medium focus:border-black transition-all resize-none uppercase"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-zinc-800 transition-all shadow-xl"
                        >
                          Confirm Request
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`.stroke-text-black { -webkit-text-stroke: 1.5px black; color: transparent; }`}</style>
    </div>
  );
}
