import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { PackageSearch, ArrowRight, X, AlertCircle } from "lucide-react";

import {
  cancelOrderUser,
  getMyOrders,
  returnOrder,
} from "../features/orders/orderSlice";
import OrderCard from "../components/order/OrderCard";
import SEO from "../components/SEO";
import Button from "../components/ui/Button";
import StatusBadge from "../components/ui/StatusBadge";
import { ListSkeleton } from "../components/Skeletons";

export default function Orders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders = [], isLoading } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.auth);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnType, setReturnType] = useState("refund");
  const [returnReason, setReturnReason] = useState("");
  const [comments, setComments] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      dispatch(getMyOrders());
    }
    window.scrollTo(0, 0);
  }, [dispatch, user, navigate]);

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
          if (selectedOrder?._id === orderId) setSelectedOrder(null);
        })
        .catch((err) => toast.error(err));
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-[#FAFAFA] pt-24 md:pt-32 pb-20">
        <SEO title="Loading Orders..." />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="mb-10 border-b border-black/5 pb-6">
            <h1 className="text-4xl md:text-6xl font-black uppercase italic text-zinc-200">
              MY ORDERS
            </h1>
          </div>
          <div className="max-w-4xl mx-auto space-y-4">
            {[...Array(3)].map((_, i) => (
              <ListSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-24 md:pt-32 pb-20 selection:bg-black selection:text-white overflow-x-hidden">
      <SEO
        title="My Orders"
        description="Track and manage your premium Krumeku orders and embroidery collection."
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-12 border-b border-black/5 pb-6 md:pb-8">
          <div>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
              MY{" "}
              <span className="text-transparent stroke-text-black">ORDERS</span>
            </h1>
            <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 mt-3">
              Manage your premium wardrobe
            </p>
          </div>
          <div className="text-left md:text-center bg-white px-6 py-3 rounded-2xl border border-zinc-100 shadow-sm">
            <p className="text-xl md:text-2xl font-black italic text-black">
              {orders?.length || 0}
            </p>
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-1">
              Total Pieces
            </p>
          </div>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="py-20 md:py-28 text-center border-2 border-dashed border-zinc-200 bg-white rounded-[2rem] flex flex-col items-center">
            <PackageSearch size={40} className="text-zinc-200 mb-6" />
            <h2 className="text-xl md:text-2xl font-black uppercase italic mb-4">
              Order History Empty
            </h2>
            <Button
              onClick={() => navigate("/products")}
              variant="ghost"
              className="border border-zinc-200 mt-2"
            >
              Shop New Drops <ArrowRight size={14} className="ml-2" />
            </Button>
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

      {/* Return/Exchange Drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative bg-white w-full sm:w-[450px] h-full shadow-2xl overflow-y-auto rounded-l-[2rem]"
            >
              <div className="p-6 md:p-10 min-h-full flex flex-col">
                <div className="flex justify-between items-start mb-8 md:mb-10">
                  <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter leading-none">
                    {selectedOrder.returnInfo?.isReturnRequested
                      ? "Request\nStatus"
                      : "Return &\nExchange"}
                  </h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-3 bg-zinc-50 hover:bg-zinc-100 rounded-full transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 space-y-6">
                  {selectedOrder.returnInfo?.isReturnRequested ? (
                    <div className="space-y-6">
                      <div className="bg-zinc-50 border border-zinc-100 p-6 rounded-2xl">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">
                          Current Update
                        </p>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-3">
                            <StatusBadge
                              status={selectedOrder.returnInfo.status}
                              className="px-4 py-2 text-[11px]"
                            />
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                              Type: {selectedOrder.returnInfo.type}
                            </p>
                          </div>
                        </div>

                        {selectedOrder.returnInfo.adminComment && (
                          <div className="mt-6 p-4 bg-white border border-zinc-100 rounded-xl">
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-1 flex items-center gap-2">
                              Message from Krumeku:
                            </span>
                            <p className="text-[11px] font-bold text-zinc-800 uppercase tracking-tight italic">
                              "{selectedOrder.returnInfo.adminComment}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex gap-3">
                        <AlertCircle
                          className="text-orange-600 shrink-0 mt-0.5"
                          size={18}
                        />
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-orange-900 uppercase tracking-widest leading-tight">
                            Quality Policy
                          </p>
                          <p className="text-[10px] font-bold text-orange-800 uppercase tracking-tighter leading-tight">
                            Item must be unused with tags. Damage to embroidery
                            due to improper ironing is not covered.
                          </p>
                        </div>
                      </div>

                      <form onSubmit={handleReturnSubmit} className="space-y-6">
                        <div>
                          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-3">
                            Select Request Type
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <Button
                              type="button"
                              variant={
                                returnType === "refund" ? "primary" : "outline"
                              }
                              className="h-14 text-[10px]"
                              onClick={() => setReturnType("refund")}
                            >
                              I want Refund
                            </Button>
                            <Button
                              type="button"
                              variant={
                                returnType === "exchange"
                                  ? "primary"
                                  : "outline"
                              }
                              className="h-14 text-[10px]"
                              onClick={() => setReturnType("exchange")}
                            >
                              I want Exchange
                            </Button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-3">
                            Reason for Return
                          </label>
                          <select
                            required
                            value={returnReason}
                            onChange={(e) => setReturnReason(e.target.value)}
                            className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-xl outline-none text-[11px] font-bold uppercase focus:border-black transition-all cursor-pointer appearance-none"
                          >
                            <option value="">Select Reason</option>
                            <option value="size">Size Fit Issue</option>
                            <option value="quality">
                              Fabric/Quality Defect
                            </option>
                            <option value="wrong">Wrong Item Received</option>
                            <option value="mind">Changed my mind</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-3">
                            Describe Issue (Optional)
                          </label>
                          <textarea
                            rows="4"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="TELL US MORE ABOUT THE ISSUE..."
                            className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-xl outline-none text-[11px] font-medium focus:border-black transition-all resize-none uppercase"
                          />
                        </div>

                        <Button
                          type="submit"
                          variant="primary"
                          className="w-full h-14 mt-4"
                        >
                          Confirm Request{" "}
                          <ArrowRight size={14} className="ml-2" />
                        </Button>
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
