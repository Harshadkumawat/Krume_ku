import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllOrders,
  updateOrder,
  deleteOrder,
} from "../../features/admin/adminSlice";
import {
  Loader2,
  Package,
  Truck,
  CheckCircle,
  Trash2,
  Search,
  Eye,
  X,
  MapPin,
  Calendar,
  CreditCard,
  AlertCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";

const AdminOrders = () => {
  const dispatch = useDispatch();
  const { orders, isLoading } = useSelector((state) => state.admin);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const CLOUD_NAME = "dftticvtc";

  const getImgUrl = (imgId) => {
    if (!imgId)
      return "https://placehold.co/400x600/000000/FFFFFF?text=No+Image";
    if (typeof imgId === "string" && imgId.startsWith("http")) return imgId;
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,w_300,q_auto,f_auto/${imgId}`;
  };

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const handleStatusChange = (id, newStatus) => {
    dispatch(updateOrder({ id, status: newStatus }));
  };

  const handleDelete = (id) => {
    if (window.confirm("Permanently delete this order record?")) {
      dispatch(deleteOrder(id));
      if (selectedOrder?._id === id) setSelectedOrder(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Shipped":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "Processing":
        return "bg-orange-50 text-orange-600 border-orange-100 shadow-sm";
      case "Cancelled":
        return "bg-red-50 text-red-600 border-red-100";
      default:
        return "bg-gray-50 text-gray-500 border-gray-100";
    }
  };

  const filteredOrders = orders?.filter(
    (order) =>
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isLoading)
    return (
      <div className="flex flex-col justify-center items-center h-[70vh]">
        <Loader2 className="animate-spin w-10 h-10 text-black mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
          Loading Orders...
        </p>
      </div>
    );

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 overflow-x-hidden">
      {/* 1. HEADER SECTION */}
      <div className="bg-black text-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic">
            Order <span className="text-emerald-500">Management</span>
          </h2>
          <p className="text-gray-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic opacity-80">
            Monitor and update customer shipments
          </p>
        </div>

        <div className="relative w-full md:w-80 z-10">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="SEARCH BY ORDER ID OR NAME..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 md:py-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl md:rounded-2xl focus:bg-white focus:text-black outline-none text-[10px] font-black uppercase tracking-widest transition-all placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* 2. ORDERS LISTING (Hybrid Layout) */}
      {!filteredOrders || filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100">
          <Package className="mx-auto text-gray-100 mb-4" size={60} />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">
            No orders found
          </p>
        </div>
      ) : (
        <>
          {/* 🖥️ DESKTOP VIEW: TABLE */}
          <div className="hidden md:block bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="p-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] italic">
                    Order ID
                  </th>
                  <th className="p-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] italic">
                    Customer
                  </th>
                  <th className="p-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] italic">
                    Value
                  </th>
                  <th className="p-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] italic">
                    Status
                  </th>
                  <th className="p-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] italic text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map((order) => {
                  const isCancelled = order.orderStatus === "Cancelled";
                  return (
                    <tr
                      key={order._id}
                      className={`group hover:bg-gray-50/50 transition-all ${isCancelled ? "opacity-60 bg-red-50/10" : ""}`}
                    >
                      <td className="p-6">
                        <span className="font-mono text-[10px] font-black text-gray-400 bg-gray-100 px-2 py-1 rounded">
                          #
                          {order._id
                            .substring(order._id.length - 8)
                            .toUpperCase()}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-black text-xs shadow-lg flex-shrink-0">
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
                      <td className="p-6">
                        <p className="font-black text-sm italic text-gray-900">
                          ₹{order.totalPrice.toLocaleString("en-IN")}
                        </p>
                        <p className="text-[8px] font-black uppercase text-gray-300 tracking-tighter">
                          {order.orderItems.length} Items
                        </p>
                      </td>
                      <td className="p-6">
                        {isCancelled ? (
                          <div
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border ${getStatusStyle("Cancelled")}`}
                          >
                            <XCircle size={12} /> Cancelled
                          </div>
                        ) : (
                          <div className="relative inline-block group/select">
                            <select
                              value={order.orderStatus}
                              onChange={(e) =>
                                handleStatusChange(order._id, e.target.value)
                              }
                              className={`appearance-none pl-3 pr-8 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer outline-none border transition-all ${getStatusStyle(order.orderStatus)}`}
                            >
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                            <Clock
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40"
                              size={10}
                            />
                          </div>
                        )}
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-3 bg-gray-100 hover:bg-black hover:text-white rounded-xl transition-all shadow-sm"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(order._id)}
                            className="p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm"
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

          {/* 📱 MOBILE VIEW: CARDS (No horizontal scroll) */}
          <div className="md:hidden flex flex-col gap-4">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm flex flex-col gap-4"
              >
                <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                  <span className="font-mono text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded">
                    #{order._id.substring(order._id.length - 8).toUpperCase()}
                  </span>
                  <p className="text-sm font-black italic">
                    ₹{order.totalPrice.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-black text-sm shadow-md flex-shrink-0">
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

                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">
                      Update Status:
                    </span>
                    <div className="relative">
                      <select
                        value={order.orderStatus}
                        disabled={order.orderStatus === "Cancelled"}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        className={`appearance-none pl-3 pr-8 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border outline-none w-32 ${getStatusStyle(order.orderStatus)}`}
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <Clock
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-40"
                        size={10}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-gray-50 pt-4 mt-1">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex-1 py-3 bg-gray-100 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest active:scale-95"
                    >
                      <Eye size={14} /> View Details
                    </button>
                    <button
                      onClick={() => handleDelete(order._id)}
                      className="w-12 py-3 bg-red-50 text-red-600 rounded-xl flex items-center justify-center active:scale-95"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 3. ORDER DETAIL MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 md:p-6">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="bg-white w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-[1.5rem] md:rounded-[3rem] shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 no-scrollbar">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-gray-100 p-6 md:p-8 flex justify-between items-center z-20">
              <div>
                <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">
                  Order <span className="text-blue-600">Details</span>
                </h3>
                <p className="text-[9px] text-gray-400 font-mono mt-1 tracking-widest uppercase">
                  ID: {selectedOrder._id.toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 md:p-3 bg-gray-100 hover:bg-black hover:text-white rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-[1.5rem] md:rounded-[2rem] p-5 border border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center shadow-md">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase text-gray-400">
                      Order Date
                    </p>
                    <p className="text-[11px] md:text-sm font-black italic">
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-[1.5rem] md:rounded-[2rem] p-5 border border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase text-gray-400">
                      Payment Status
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
                {/* Shipping Address */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 flex items-center gap-2 italic">
                    <MapPin size={14} className="text-blue-500" /> Delivery
                    Address
                  </h4>
                  <div className="bg-zinc-900 text-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl relative overflow-hidden">
                    <p className="text-base md:text-lg font-black italic mb-3">
                      {selectedOrder.user?.fullName}
                    </p>
                    <div className="space-y-1.5 text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                      <p>{selectedOrder.shippingAddress?.address}</p>
                      <p>
                        {selectedOrder.shippingAddress?.city} —{" "}
                        {selectedOrder.shippingAddress?.postalCode}
                      </p>
                      <p className="pt-3 text-white font-black italic border-t border-white/10 mt-3 flex items-center gap-2">
                        <span className="text-blue-400">Mob:</span> +91{" "}
                        {selectedOrder.shippingAddress?.phone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 flex items-center gap-2 italic">
                    <Package size={14} className="text-purple-500" /> Order
                    Items
                  </h4>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                    {selectedOrder.orderItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-100 rounded-2xl"
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                          <img
                            src={getImgUrl(item.image)}
                            className="w-full h-full object-cover"
                            alt="product"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-[10px] uppercase italic truncate">
                            {item.productName || item.name}
                          </p>
                          <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase">
                            Size: {item.size} | Qty: {item.quantity}
                          </p>
                          <p className="text-[10px] font-black italic mt-1">
                            ₹{item.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-emerald-500 text-white p-5 rounded-2xl md:rounded-3xl shadow-lg mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                        Final Total Amount
                      </span>
                      <span className="text-xl md:text-2xl font-black italic">
                        ₹{selectedOrder.totalPrice.toLocaleString("en-IN")}
                      </span>
                    </div>
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
