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
} from "lucide-react";

const AdminOrders = () => {
  const dispatch = useDispatch();
  const { orders, isLoading } = useSelector((state) => state.admin);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // ☁️ Cloudinary Config
  const CLOUD_NAME = "dftticvtc";

  // 🖼️ Image URL Helper
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
    if (window.confirm("Permanently terminate this order record?")) {
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
          Fetching Logistics...
        </p>
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* 1. HEADER SECTION */}
      <div className="bg-black text-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic">
            Logistics <span className="text-emerald-500">Archive</span>
          </h2>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2 italic">
            Global Fulfillment Control
          </p>
        </div>

        <div className="relative w-full md:w-80 z-10">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="ID OR IDENTITY QUERY..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl focus:bg-white focus:text-black outline-none text-[10px] font-black uppercase tracking-widest transition-all placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* 2. ORDERS TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        {!filteredOrders || filteredOrders.length === 0 ? (
          <div className="text-center py-32">
            <Package className="mx-auto text-gray-100 mb-4" size={60} />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 text-center italic">
              No Deployment Records Found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="p-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] italic">
                    Sequence ID
                  </th>
                  <th className="p-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] italic">
                    Identity
                  </th>
                  <th className="p-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] italic">
                    Total Value
                  </th>
                  <th className="p-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] italic">
                    Logistics Status
                  </th>
                  <th className="p-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] italic text-right">
                    Operations
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
                          <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-black text-xs shadow-lg">
                            {order.user?.fullName?.[0] || "U"}
                          </div>
                          <div>
                            <p className="font-black text-[11px] uppercase italic text-gray-900">
                              {order.user?.fullName || "Classified User"}
                            </p>
                            <p className="text-[9px] text-gray-400 font-bold tracking-tight lowercase">
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
                          {order.orderItems.length} Units Packed
                        </p>
                      </td>
                      <td className="p-6">
                        {isCancelled ? (
                          <div
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border ${getStatusStyle("Cancelled")}`}
                          >
                            <XCircle size={12} /> Terminated
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
        )}
      </div>

      {/* 3. ORDER DETAIL MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 no-scrollbar">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 p-8 flex justify-between items-center z-20">
              <div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none">
                  Manifest <span className="text-blue-600">Details</span>
                </h3>
                <p className="text-[10px] text-gray-400 font-mono mt-2 tracking-widest">
                  SEQ: {selectedOrder._id.toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-3 bg-gray-100 hover:bg-black hover:text-white rounded-2xl transition-all active:scale-90"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-10">
              {/* Top Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100 flex items-center gap-5 group">
                  <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-xl group-hover:rotate-12 transition-transform">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">
                      Timestamp
                    </p>
                    <p className="text-sm font-black italic">
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100 flex items-center gap-5 group">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-xl group-hover:rotate-12 transition-transform">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">
                      Payment Ledger
                    </p>
                    <p
                      className={`text-sm font-black italic ${selectedOrder.isPaid ? "text-emerald-600" : "text-red-500"}`}
                    >
                      {selectedOrder.isPaid
                        ? "VERIFIED PAID"
                        : "PENDING COLLECTION"}{" "}
                      ({selectedOrder.paymentMethod})
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping & Items */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Shipping */}
                <div className="lg:col-span-5 space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 flex items-center gap-3 italic">
                    <MapPin size={16} className="text-blue-500" /> Destination
                    Archive
                  </h4>
                  <div className="bg-black text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full"></div>
                    <p className="text-lg font-black italic mb-4">
                      {selectedOrder.user?.fullName}
                    </p>
                    <div className="space-y-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                      <p>{selectedOrder.shippingAddress?.address}</p>
                      <p>
                        {selectedOrder.shippingAddress?.city} —{" "}
                        {selectedOrder.shippingAddress?.postalCode}
                      </p>
                      <p>{selectedOrder.shippingAddress?.country}</p>
                      <p className="pt-4 text-white font-black italic border-t border-white/10 mt-4">
                        PH: {selectedOrder.shippingAddress?.phone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Items */}
                <div className="lg:col-span-7 space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 flex items-center gap-3 italic">
                    <Package size={16} className="text-purple-500" /> Inventory
                    Manifest
                  </h4>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                    {selectedOrder.orderItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-5 p-4 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 rounded-3xl transition-all group"
                      >
                        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg border border-white group-hover:scale-105 transition-transform">
                          <img
                            src={getImgUrl(item.image)}
                            className="w-full h-full object-cover"
                            alt="Artifact"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-xs uppercase italic tracking-tight">
                            {item.productName || item.name || "Premium Piece"}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <span className="text-[8px] bg-black text-white px-2 py-1 rounded font-black uppercase italic">
                              {item.size}
                            </span>
                            <span className="text-[8px] border border-black/10 px-2 py-1 rounded font-black uppercase italic">
                              {item.color}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-gray-300 italic">
                            {item.quantity} X ₹{item.price}
                          </p>
                          <p className="text-sm font-black italic text-gray-900 mt-1">
                            ₹{item.quantity * item.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Summary Box */}
                  <div className="bg-gray-900 text-white p-8 rounded-[2.5rem] shadow-2xl">
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                        <span>Base Total</span>
                        <span>₹{selectedOrder.itemsPrice}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 pb-3 border-b border-white/5">
                        <span>Logistics Fee</span>
                        <span>₹{selectedOrder.shippingPrice}</span>
                      </div>
                      <div className="flex justify-between text-2xl font-black italic text-emerald-400 pt-2">
                        <span>Net Value</span>
                        <span>
                          ₹{selectedOrder.totalPrice.toLocaleString("en-IN")}
                        </span>
                      </div>
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
