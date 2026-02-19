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
} from "lucide-react";

import { getMyOrders, returnOrder } from "../features/orders/orderSlice";
import OrderCard from "../components/order/OrderCard";

export default function Orders() {
  const dispatch = useDispatch();
  // 🔥 Orders data nikalte waqt empty array fallback zaroori hai
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
    if (!returnReason) {
      return toast.error("Please select a reason for return");
    }

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

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-black w-10 h-10" />
      </div>
    );

  return (
    <div className="min-h-screen bg-white pt-8 md:pt-16 pb-20 selection:bg-black selection:text-white overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-16 border-b border-black/5 pb-8 md:pb-10">
          <div>
            <h1 className="text-5xl sm:text-7xl lg:text-9xl font-black uppercase tracking-tighter italic leading-[0.85] md:leading-[0.8]">
              MY <span className="text-white stroke-text-black">ORDERS</span>
            </h1>
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-gray-400 mt-4 md:mt-6 max-w-xs md:max-w-none">
              Track and manage your premium acquisitions
            </p>
          </div>
          <div className="flex items-center gap-8 self-start md:self-auto">
            <div className="text-left md:text-center">
              <p className="text-xl md:text-2xl font-black italic">
                {orders?.length || 0}
              </p>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1 md:mt-0">
                Total Orders
              </p>
            </div>
          </div>
        </div>

        {/* ORDERS LIST */}
        {!orders || orders.length === 0 ? (
          <div className="py-16 md:py-20 text-center border-2 border-dashed border-gray-100 rounded-[1.5rem] md:rounded-[2rem] mx-2 md:mx-0">
            <PackageSearch
              size={40}
              className="mx-auto text-gray-200 mb-5 md:mb-6 md:w-12 md:h-12"
            />
            <h2 className="text-xl md:text-2xl font-black uppercase italic mb-3 md:mb-4">
              No History Found
            </h2>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest border-b-2 border-black pb-1 hover:text-gray-500 transition-all"
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
              />
            ))}
          </div>
        )}
      </div>

      {/* RETURN / EXCHANGE DRAWER */}
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
              className="relative bg-white w-full sm:w-[400px] md:w-[500px] h-full shadow-2xl overflow-y-auto"
            >
              {/* Padding adjusted for mobile screens */}
              <div className="p-6 md:p-8 lg:p-12 min-h-full flex flex-col">
                <div className="flex justify-between items-start mb-8 md:mb-10">
                  <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter leading-none mt-1">
                    Initiate
                    <br />
                    Protocol
                  </h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 md:p-3 bg-zinc-50 hover:bg-zinc-100 rounded-full transition-all"
                  >
                    <X size={20} className="md:w-6 md:h-6" />
                  </button>
                </div>

                <div className="flex-1 space-y-6 md:space-y-8">
                  <div className="bg-orange-50 border border-orange-100 p-3 md:p-4 rounded-xl flex gap-3">
                    <AlertCircle
                      className="text-orange-600 shrink-0 mt-0.5"
                      size={18}
                    />
                    <p className="text-[10px] md:text-[11px] font-bold text-orange-800 leading-relaxed uppercase tracking-tighter">
                      Ensure artifact is unused, unwashed, and original tags
                      attached. QC will be performed at pickup.
                    </p>
                  </div>

                  <form
                    onSubmit={handleReturnSubmit}
                    className="space-y-6 md:space-y-8 pb-10"
                  >
                    <div className="space-y-2 md:space-y-3">
                      <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Request Type
                      </label>
                      <div className="grid grid-cols-2 gap-3 md:gap-4">
                        <button
                          type="button"
                          onClick={() => setReturnType("refund")}
                          className={`py-3 md:py-4 rounded-xl border-2 text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all ${returnType === "refund" ? "border-black bg-black text-white" : "border-zinc-100 text-zinc-400 hover:border-black"}`}
                        >
                          Refund
                        </button>
                        <button
                          type="button"
                          onClick={() => setReturnType("exchange")}
                          className={`py-3 md:py-4 rounded-xl border-2 text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all ${returnType === "exchange" ? "border-black bg-black text-white" : "border-zinc-100 text-zinc-400 hover:border-black"}`}
                        >
                          Exchange
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 md:space-y-3">
                      <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Reason
                      </label>
                      <select
                        required
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        className="w-full p-3 md:p-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none text-[11px] md:text-xs font-bold uppercase focus:border-black transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select Protocol</option>
                        <option value="size">Size Fit Issue</option>
                        <option value="quality">Fabric Defect / Damage</option>
                        <option value="wrong">Wrong Artifact Received</option>
                        <option value="mind">Change of Mind</option>
                      </select>
                    </div>

                    <div className="space-y-2 md:space-y-3">
                      <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Remarks
                      </label>
                      <textarea
                        rows="3"
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="DESCRIBE THE ISSUE..."
                        className="w-full p-3 md:p-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none text-[11px] md:text-xs font-medium focus:border-black transition-all resize-none uppercase"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 md:py-5 bg-black text-white text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-zinc-800 transition-all shadow-xl active:scale-95"
                    >
                      Confirm Request
                    </button>
                  </form>
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
