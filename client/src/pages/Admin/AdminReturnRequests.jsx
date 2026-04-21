import React, { useEffect, useMemo, useCallback, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrders,
  adminManageReturn,
} from "../../features/orders/orderSlice";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Banknote,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { cldImage } from "../../utils/imageHelper";

// ── Memoized Child Component ─────────────────────────────────
const ReturnOrderCard = memo(({ order, onAction, isDisabled }) => {
  const { returnInfo, _id, orderItems, user, totalPrice, updatedAt } = order;

  return (
    <section className="bg-white p-5 md:p-8 rounded-[1.8rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-6 md:gap-10 justify-between group hover:border-orange-200 transition-all duration-500 hover:shadow-xl">
      <div className="flex-1 w-full min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5 border-b border-gray-50 pb-4">
          <div className="flex items-center gap-3">
            <span className="font-mono font-black text-[10px] bg-zinc-900 text-white px-3 py-1 rounded-md uppercase tracking-tighter">
              #{_id.slice(-8).toUpperCase()}
            </span>
            <span
              className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border tracking-[0.1em] ${
                returnInfo.type === "Refund"
                  ? "bg-red-50 border-red-100 text-red-600"
                  : "bg-blue-50 border-blue-100 text-blue-600"
              }`}
            >
              {returnInfo.type} Protocol
            </span>
          </div>
          <time className="text-[10px] text-gray-400 font-bold uppercase italic tabular-nums">
            Logged:{" "}
            {new Date(returnInfo.requestedAt || updatedAt).toLocaleDateString(
              "en-IN",
            )}
          </time>
        </div>

        <div className="flex items-start gap-5 md:gap-8">
          <div className="w-24 h-32 md:w-32 md:h-44 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0 shadow-inner group-hover:rotate-1 transition-transform">
            <img
              src={cldImage(orderItems?.[0]?.image, 400)}
              className="w-full h-full object-cover"
              alt={orderItems?.[0]?.productName || "Artifact"}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
          </div>
          <div className="flex-1 min-w-0 py-1">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
              <h2 className="text-base md:text-2xl font-black uppercase italic leading-none truncate">
                {user?.fullName || "Guest Artifact Holder"}
              </h2>
              <span className="font-black text-lg md:text-2xl text-zinc-900 italic flex-shrink-0 tabular-nums">
                ₹{totalPrice?.toLocaleString("en-IN")}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-bold mb-4 tracking-tighter truncate opacity-70">
              {user?.email || "No email provided"}
            </p>

            <div className="bg-orange-50/50 p-4 md:p-6 rounded-[1.5rem] border border-orange-100/50 relative">
              <p className="text-[10px] md:text-xs text-orange-900 leading-relaxed font-bold">
                <span className="font-black uppercase text-[9px] text-orange-500 tracking-widest block mb-2 underline underline-offset-4">
                  Primary Reason:
                </span>
                {returnInfo.reason || "Not specified"}
              </p>
              {returnInfo.comments && (
                <p className="text-[10px] md:text-xs text-orange-800 mt-4 italic border-t border-orange-200/30 pt-3 font-medium">
                  "{returnInfo.comments}"
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-72 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-10 shrink-0">
        <div className="flex items-center justify-between lg:flex-col lg:items-start lg:gap-3 w-full">
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">
            Current State
          </span>
          <span
            className={`text-[10px] font-black px-5 py-2.5 rounded-xl border flex items-center justify-center gap-2 uppercase tracking-widest italic w-fit lg:w-full transition-all ${
              returnInfo.status === "Pending"
                ? "bg-orange-50 border-orange-200 text-orange-600 animate-pulse shadow-md"
                : returnInfo.status === "Approved"
                  ? "bg-blue-50 border-blue-200 text-blue-600"
                  : returnInfo.status === "Refunded"
                    ? "bg-black border-black text-white"
                    : "bg-red-50 border-red-200 text-red-600"
            }`}
          >
            {returnInfo.status === "Pending" && (
              <AlertTriangle size={14} aria-hidden="true" />
            )}
            {returnInfo.status}
          </span>
        </div>

        <nav
          className="flex flex-row lg:flex-col gap-3 w-full mt-auto"
          aria-label="Order actions"
        >
          {returnInfo.status === "Pending" && (
            <>
              <button
                onClick={() => onAction(_id, "Approved")}
                disabled={isDisabled}
                aria-label="Approve return"
                className="flex-1 flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {isDisabled ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCircle size={14} aria-hidden="true" />
                )}
                Approve
              </button>
              <button
                onClick={() => onAction(_id, "Rejected")}
                disabled={isDisabled}
                aria-label="Reject return"
                className="flex-1 flex items-center justify-center gap-2 bg-red-50 border border-red-100 text-red-600 hover:bg-red-600 hover:text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {isDisabled ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <XCircle size={14} aria-hidden="true" />
                )}
                Reject
              </button>
            </>
          )}

          {returnInfo.status === "Approved" && (
            <button
              onClick={() => onAction(_id, "Refunded")}
              disabled={isDisabled}
              aria-label="Process final refund"
              className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {isDisabled ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Banknote size={16} aria-hidden="true" />
              )}
              Mark Refunded
            </button>
          )}

          {(returnInfo.status === "Refunded" ||
            returnInfo.status === "Rejected") && (
            <div className="w-full text-center py-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-300 text-[10px] font-black uppercase tracking-[0.3em] italic">
              Case Finalized
            </div>
          )}
        </nav>
      </div>
    </section>
  );
});

ReturnOrderCard.displayName = "ReturnOrderCard";

// ── Main Component ───────────────────────────────────────────
export default function AdminReturnRequests() {
  const dispatch = useDispatch();
  const {
    orders = [],
    isLoading,
    isMutating,
    isError,
    message,
  } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(getAllOrders());
  }, [dispatch]);

  const returnOrders = useMemo(
    () => orders?.filter((order) => order.returnInfo?.isReturnRequested) || [],
    [orders],
  );

  const pendingCount = useMemo(
    () => returnOrders.filter((o) => o.returnInfo?.status === "Pending").length,
    [returnOrders],
  );

  const handleAction = useCallback(
    (id, status) => {
      if (isMutating) return;

      const confirmMsg =
        status === "Refunded"
          ? "Confirm Refund? Inventory will be restocked automatically."
          : `Mark this return request as ${status}?`;

      if (window.confirm(confirmMsg)) {
        dispatch(adminManageReturn({ id, statusData: { status } }));
      }
    },
    [dispatch, isMutating],
  );

  if (isLoading && orders.length === 0) {
    return (
      <main
        className="flex flex-col justify-center items-center h-[70vh]"
        aria-busy="true"
      >
        <Loader2 className="animate-spin w-10 h-10 text-black mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
          Syncing Intelligence...
        </p>
      </main>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 overflow-x-hidden selection:bg-black selection:text-white">
      <header className="bg-black text-white p-6 md:p-12 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[100px] rounded-full -mr-20 -mt-20"
          aria-hidden="true"
        />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic leading-none">
            Return <span className="text-orange-500">Requests</span>
          </h1>
          <p className="text-gray-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] mt-3 italic opacity-80">
            Post-Purchase Support Protocol
          </p>
        </div>

        <div className="relative z-10 w-full md:w-auto">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 px-6 py-4 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-between md:justify-start gap-5">
            <span>Critical Pending</span>
            <span
              className="text-orange-400 bg-orange-500/20 px-4 py-1 rounded-lg text-sm tabular-nums"
              aria-live="polite"
            >
              {pendingCount}
            </span>
          </div>
        </div>
      </header>

      {isError && !isLoading && (
        <div className="text-center py-16 bg-red-50 rounded-[2rem] border border-red-100">
          <AlertTriangle className="mx-auto text-red-300 mb-4" size={40} />
          <p className="text-[10px] font-black uppercase tracking-widest text-red-400">
            {message || "Failed to load return requests"}
          </p>
          <button
            onClick={() => dispatch(getAllOrders())}
            className="mt-4 text-[10px] font-black uppercase bg-black text-white px-6 py-3 rounded-xl hover:bg-zinc-800 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <main className="grid gap-4 md:gap-6 w-full" role="list">
        {returnOrders.length === 0
          ? !isError && (
              <div className="text-center py-28 bg-white rounded-[2rem] border border-gray-100 shadow-inner">
                <RotateCcw
                  className="mx-auto text-gray-100 mb-6"
                  size={60}
                  aria-hidden="true"
                />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic px-4">
                  All return queues are currently empty.
                </p>
              </div>
            )
          : returnOrders.map((order) => (
              <ReturnOrderCard
                key={order._id}
                order={order}
                onAction={handleAction}
                isDisabled={isMutating}
              />
            ))}
      </main>
    </div>
  );
}
