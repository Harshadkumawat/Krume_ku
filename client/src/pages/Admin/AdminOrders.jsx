import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "../../features/orders/orderSlice";
import {
  Loader2,
  Package,
  Trash2,
  Search,
  Eye,
  X,
  MapPin,
  Calendar,
  CreditCard,
  Clock,
} from "lucide-react";
import { cldImage } from "../../utils/imageHelper";
import { formatDate, formatId, formatPrice } from "../../utils/formatters";
import StatusBadge from "../../components/ui/StatusBadge";

const VALID_TRANSITIONS = {
  Processing: ["Confirmed", "Cancelled"],
  Confirmed: ["Shipped", "Cancelled"],
  Shipped: ["Out for Delivery", "Cancelled"],
  "Out for Delivery": ["Delivered", "Cancelled"],
  Delivered: ["Return Requested"],
  "Return Requested": ["Return Approved", "Delivered"],
  "Return Approved": ["Returned"],
  Cancelled: [],
  Returned: [],
};

const TERMINAL_STATUSES = ["Cancelled", "Returned"];

const getSelectStyle = (status) => {
  switch (status) {
    case "Delivered":
      return "bg-green-50 text-green-600 border-green-200";
    case "Shipped":
    case "Out for Delivery":
      return "bg-blue-50 text-blue-600 border-blue-100";
    case "Processing":
      return "bg-orange-50 text-orange-600 border-orange-200 shadow-sm";
    case "Confirmed":
      return "bg-indigo-50 text-indigo-600 border-indigo-100";
    case "Cancelled":
      return "bg-red-50 text-red-600 border-red-100";
    case "Return Requested":
    case "Return Approved":
      return "bg-amber-50 text-amber-600 border-amber-100";
    case "Returned":
      return "bg-gray-50 text-gray-600 border-gray-200";
    default:
      return "bg-gray-50 text-gray-500 border-gray-100";
  }
};

const AdminOrders = () => {
  const dispatch = useDispatch();
  const {
    orders = [],
    isLoading,
    isMutating,
  } = useSelector((state) => state.order);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    dispatch(getAllOrders());
  }, [dispatch]);

  useEffect(() => {
    document.body.style.overflow = selectedOrder ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedOrder]);

  const handleStatusChange = useCallback(
    (id, newStatus) => {
      if (isMutating) return;
      dispatch(updateOrderStatus({ id, status: newStatus }));
    },
    [dispatch, isMutating],
  );

  const handleDelete = useCallback(
    (id) => {
      if (isMutating) return;
      if (
        window.confirm(
          "Permanently delete this order record? This cannot be undone.",
        )
      ) {
        dispatch(deleteOrder(id));
        if (selectedOrder?._id === id) setSelectedOrder(null);
      }
    },
    [dispatch, selectedOrder, isMutating],
  );

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    const term = searchTerm.toLowerCase();
    return orders.filter(
      (order) =>
        order._id.toLowerCase().includes(term) ||
        order.user?.fullName?.toLowerCase().includes(term) ||
        order.shippingAddress?.phone?.includes(term),
    );
  }, [orders, searchTerm]);

  const renderStatusControl = useCallback(
    (order) => {
      const currentStatus = order.orderStatus;
      const isTerminal = TERMINAL_STATUSES.includes(currentStatus);
      const isRefunded = order.returnInfo?.status === "Refunded";

      if (isTerminal || isRefunded) {
        return <StatusBadge status={isRefunded ? "Refunded" : currentStatus} />;
      }

      const allowedNext = VALID_TRANSITIONS[currentStatus] || [];

      if (allowedNext.length === 0) {
        return <StatusBadge status={currentStatus} />;
      }

      return (
        <div className="relative inline-block">
          <select
            aria-label="Change order status"
            value={currentStatus}
            disabled={isMutating}
            onChange={(e) => handleStatusChange(order._id, e.target.value)}
            className={`appearance-none pl-3 pr-8 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer outline-none border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${getSelectStyle(currentStatus)} focus:ring-2 focus:ring-black`}
          >
            <option value={currentStatus}>{currentStatus}</option>
            {allowedNext.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <Clock
            className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40"
            size={10}
            aria-hidden="true"
          />
        </div>
      );
    },
    [handleStatusChange, isMutating],
  );

  if (isLoading && orders.length === 0) {
    return (
      <div
        className="flex flex-col justify-center items-center h-[70vh]"
        aria-live="polite"
      >
        <Loader2
          className="animate-spin w-10 h-10 text-black mb-4"
          aria-hidden="true"
        />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
          Loading Archive...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 overflow-x-hidden">
      {/* ── Header & Search ── */}
      <div className="bg-black text-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -mr-20 -mt-20"
          aria-hidden="true"
        />
        <div className="relative z-10">
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic">
            Order <span className="text-emerald-500">Management</span>
          </h1>
          <p className="text-gray-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic opacity-80">
            Control Center / {filteredOrders.length} Records Found
          </p>
        </div>

        <div className="relative w-full md:w-80 z-10">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="ORDER ID, NAME, OR PHONE..."
            aria-label="Search orders"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 md:py-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl md:rounded-2xl focus:bg-white focus:text-black outline-none text-[10px] font-black uppercase tracking-widest transition-all placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* ── Orders List ── */}
      {!filteredOrders.length ? (
        <div className="text-center py-24 bg-white rounded-[2rem] border border-gray-100 shadow-inner">
          <Package
            className="mx-auto text-gray-100 mb-4"
            size={60}
            aria-hidden="true"
          />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">
            No matching orders found
          </p>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="hidden md:block bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left" role="table">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  {["Order ID", "Customer", "Value", "Status"].map((th) => (
                    <th
                      key={th}
                      className="p-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] italic"
                    >
                      {th}
                    </th>
                  ))}
                  <th className="p-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] italic text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map((order) => {
                  const isTerminal =
                    TERMINAL_STATUSES.includes(order.orderStatus) ||
                    order.returnInfo?.status === "Refunded";
                  return (
                    <tr
                      key={order._id}
                      className={`group hover:bg-gray-50/50 transition-all ${isTerminal ? "opacity-60" : ""}`}
                    >
                      <td className="p-6">
                        <span className="font-mono text-[10px] font-black text-gray-400 bg-gray-100 px-2 py-1 rounded">
                          {formatId(order._id)}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-black text-xs shadow-lg shrink-0"
                            aria-hidden="true"
                          >
                            {order.user?.fullName?.[0] || "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-[11px] uppercase italic text-gray-900 truncate max-w-[150px]">
                              {order.user?.fullName || "Guest User"}
                            </p>
                            <p className="text-[9px] text-gray-400 font-bold tracking-tight lowercase truncate max-w-[150px]">
                              {order.user?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-gray-900 font-black text-sm italic">
                        {formatPrice(order.totalPrice)}
                      </td>
                      <td className="p-6">{renderStatusControl(order)}</td>
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            aria-label={`View order ${formatId(order._id)}`}
                            className="p-3 bg-gray-100 hover:bg-black hover:text-white rounded-xl transition-all"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(order._id)}
                            disabled={isMutating}
                            aria-label={`Delete order ${formatId(order._id)}`}
                            className="p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="md:hidden space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm space-y-4"
              >
                <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                  <span className="font-mono text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded">
                    {formatId(order._id)}
                  </span>
                  <p className="text-sm font-black italic">
                    {formatPrice(order.totalPrice)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-black text-sm shadow-md"
                    aria-hidden="true"
                  >
                    {order.user?.fullName?.[0] || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-xs uppercase italic text-gray-900 truncate">
                      {order.user?.fullName || "Guest User"}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold lowercase truncate">
                      {order.user?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[9px] font-black uppercase text-gray-400">
                    Status:
                  </span>
                  {renderStatusControl(order)}
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 py-3 bg-gray-100 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest active:scale-95"
                  >
                    <Eye size={14} /> View
                  </button>
                  <button
                    onClick={() => handleDelete(order._id)}
                    disabled={isMutating}
                    className="w-12 py-3 bg-red-50 text-red-600 rounded-xl flex items-center justify-center active:scale-95 disabled:opacity-50"
                    aria-label="Delete order"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── ORDER DETAIL MODAL ── */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-3 md:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedOrder(null)}
            aria-hidden="true"
          />
          <div className="bg-white w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-[1.5rem] md:rounded-[3rem] shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 no-scrollbar">
            <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-gray-100 p-6 md:p-8 flex justify-between items-center z-20">
              <h3
                id="modal-title"
                className="text-xl md:text-2xl font-black uppercase italic tracking-tighter"
              >
                Order <span className="text-blue-600">Details</span>
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                aria-label="Close details"
                className="p-3 bg-gray-100 hover:bg-black hover:text-white rounded-xl transition-all"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="p-6 md:p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-[1.5rem] md:rounded-[2rem] p-6 border border-gray-100 flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center shadow-md"
                    aria-hidden="true"
                  >
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase text-gray-400">
                      Order Date
                    </p>
                    <p className="text-[11px] md:text-sm font-black italic">
                      {formatDate(selectedOrder.createdAt, true)}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-[1.5rem] md:rounded-[2rem] p-6 border border-gray-100 flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md"
                    aria-hidden="true"
                  >
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase text-gray-400">
                      Payment
                    </p>
                    <p
                      className={`text-[11px] md:text-sm font-black italic ${selectedOrder.isPaid ? "text-emerald-600" : "text-red-500"}`}
                    >
                      {selectedOrder.isPaid ? "PAID" : "UNPAID"} (
                      {selectedOrder.paymentMethod})
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 flex items-center gap-2 italic">
                    <MapPin
                      size={14}
                      className="text-blue-500"
                      aria-hidden="true"
                    />{" "}
                    Delivery Address
                  </h4>
                  <div className="bg-zinc-900 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
                    <p className="text-lg font-black italic mb-3">
                      {selectedOrder.user?.fullName}
                    </p>
                    <address className="not-italic space-y-1.5 text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                      <p>{selectedOrder.shippingAddress?.address}</p>
                      <p>
                        {selectedOrder.shippingAddress?.city} —{" "}
                        {selectedOrder.shippingAddress?.pincode}
                      </p>
                      <p className="pt-3 text-white font-black italic border-t border-white/10 mt-3">
                        Mob: +91 {selectedOrder.shippingAddress?.phone}
                      </p>
                    </address>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 flex items-center gap-2 italic">
                    <Package
                      size={14}
                      className="text-purple-500"
                      aria-hidden="true"
                    />{" "}
                    Items Summary
                  </h4>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedOrder.orderItems?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-100 rounded-2xl"
                      >
                        <img
                          src={cldImage(item.image, 200)}
                          alt={item.productName}
                          loading="lazy"
                          decoding="async"
                          className="w-16 h-16 rounded-xl object-cover shadow-sm shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-[10px] uppercase italic truncate">
                            {item.productName || item.name}
                          </p>
                          <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase">
                            Size: {item.size} | Qty: {item.quantity}
                          </p>
                          <p className="text-[10px] font-black italic mt-1">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-emerald-500 text-white p-6 rounded-[2rem] shadow-lg flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                      Total Amount
                    </span>
                    <span className="text-xl md:text-2xl font-black italic">
                      {formatPrice(selectedOrder.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
