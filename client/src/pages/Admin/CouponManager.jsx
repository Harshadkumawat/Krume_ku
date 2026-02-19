import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllCoupons,
  createNewCoupon,
  updateExistingCoupon,
  deleteCoupon,
} from "../../features/coupon/couponSlice";
import {
  TicketPercent,
  Plus,
  Trash2,
  Edit3,
  Loader2,
  X,
  Users,
  AlertCircle,
  Calendar,
} from "lucide-react";

const CouponManager = () => {
  const dispatch = useDispatch();
  const { coupons, isLoading } = useSelector((state) => state.coupon);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountAmount: "",
    minOrderAmount: "",
    usageLimit: "",
    expiryDate: "",
  });

  useEffect(() => {
    dispatch(getAllCoupons());
  }, [dispatch]);

  const handleEditClick = (coupon) => {
    setEditId(coupon._id);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountAmount: coupon.discountAmount,
      minOrderAmount: coupon.minOrderAmount,
      usageLimit: coupon.usageLimit,
      expiryDate: coupon.expiryDate.split("T")[0],
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      dispatch(updateExistingCoupon({ id: editId, couponData: formData })).then(
        () => closeModal(),
      );
    } else {
      dispatch(createNewCoupon(formData)).then(() => closeModal());
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setFormData({
      code: "",
      discountType: "percentage",
      discountAmount: "",
      minOrderAmount: "",
      usageLimit: "",
      expiryDate: "",
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Bhai, pakka uda dein ye coupon?")) {
      dispatch(deleteCoupon(id));
    }
  };

  if (isLoading && coupons.length === 0)
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-black w-10 h-10" />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0 pb-20 animate-fade-in overflow-x-hidden">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 bg-black p-6 md:p-8 rounded-3xl text-white shadow-2xl">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic">
            Manage <span className="text-blue-500">Coupons</span>
          </h1>
          <p className="text-gray-500 text-[10px] md:text-xs font-black uppercase tracking-widest mt-1">
            Create and track store offers
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full md:w-auto bg-white text-black px-6 py-4 md:py-3 rounded-xl flex justify-center items-center gap-2 text-[10px] font-black uppercase hover:scale-105 transition-all shadow-lg active:scale-95"
        >
          <Plus size={16} /> Create New Coupon
        </button>
      </div>

      {/* --- STATS OVERVIEW --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-10">
        <StatCard
          icon={<TicketPercent size={20} />}
          title="Total Coupons"
          value={coupons.length}
          bg="bg-blue-50"
          color="text-blue-600"
        />
        <StatCard
          icon={<Users size={20} />}
          title="Total Used"
          value={coupons.reduce((acc, c) => acc + c.usedCount, 0)}
          bg="bg-green-50"
          color="text-green-600"
        />
        <StatCard
          icon={<AlertCircle size={20} />}
          title="Inactive Offers"
          value={coupons.filter((c) => !c.isActive).length}
          bg="bg-orange-50"
          color="text-orange-600"
        />
      </div>

      {/* --- LISTING AREA --- */}
      <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        {/* 🖥️ DESKTOP VIEW: TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr className="text-[9px] font-black uppercase text-gray-400 tracking-[0.3em] italic">
                <th className="px-8 py-5">Coupon Code</th>
                <th className="px-8 py-5">Discount</th>
                <th className="px-8 py-5">Usage Status</th>
                <th className="px-8 py-5">Min. Order</th>
                <th className="px-8 py-5">Expiry</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {coupons.map((coupon) => (
                <tr
                  key={coupon._id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${coupon.isActive ? "bg-black text-white" : "bg-gray-100 text-gray-400"}`}
                      >
                        <TicketPercent size={16} />
                      </div>
                      <span className="font-black text-sm uppercase tracking-tight">
                        {coupon.code}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-bold text-sm">
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountAmount}%`
                      : `₹${coupon.discountAmount}`}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{
                            width: `${(coupon.usedCount / coupon.usageLimit) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-[9px] font-black text-gray-400">
                        {coupon.usedCount} / {coupon.usageLimit} Used
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-medium">
                    ₹{coupon.minOrderAmount}
                  </td>
                  <td className="px-8 py-6 text-xs font-bold text-gray-50 italic">
                    {new Date(coupon.expiryDate).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => handleEditClick(coupon)}
                      className="p-2.5 bg-gray-100 hover:bg-black hover:text-white rounded-xl transition-all"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(coupon._id)}
                      className="p-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 📱 MOBILE VIEW: CARD LAYOUT */}
        <div className="md:hidden flex flex-col gap-4 p-4">
          {coupons.map((coupon) => (
            <div
              key={coupon._id}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm relative overflow-hidden flex flex-col gap-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${coupon.isActive ? "bg-black text-white" : "bg-gray-100 text-gray-400"}`}
                  >
                    <TicketPercent size={18} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-tighter">
                      {coupon.code}
                    </h3>
                    <p className="text-[10px] font-bold text-blue-500 uppercase italic">
                      {coupon.discountType === "percentage"
                        ? `${coupon.discountAmount}% OFF`
                        : `₹${coupon.discountAmount} OFF`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">
                    Min Order
                  </p>
                  <p className="text-xs font-black italic">
                    ₹{coupon.minOrderAmount}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[9px] font-black uppercase text-gray-400">
                  <span>Usage Status</span>
                  <span>
                    {coupon.usedCount} / {coupon.usageLimit}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: `${(coupon.usedCount / coupon.usageLimit) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-gray-50 pt-4">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Calendar size={12} />
                  <span className="text-[9px] font-black uppercase italic">
                    {new Date(coupon.expiryDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(coupon)}
                    className="p-2.5 bg-gray-100 rounded-lg active:scale-90"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(coupon._id)}
                    className="p-2.5 bg-red-50 text-red-600 rounded-lg active:scale-90"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- MODAL (Responsive Modal) --- */}
      {showModal && (
        <div className="fixed inset-0 z-[300] flex items-end md:items-center justify-center p-0 md:p-6 bg-black/70 backdrop-blur-md">
          <div className="bg-white w-full max-w-xl rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl p-6 md:p-10 relative animate-in slide-in-from-bottom md:zoom-in duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full active:scale-90"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 italic">
              {editId ? "Edit Offer" : "New Coupon"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-2 gap-4 pb-6"
            >
              <div className="col-span-2">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest block mb-1.5 italic">
                  Code
                </label>
                <input
                  required
                  type="text"
                  disabled={!!editId}
                  placeholder="E.G. FIRST100"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  className={`w-full p-4 rounded-xl outline-none font-bold uppercase transition-all border ${editId ? "bg-gray-100 text-gray-400" : "bg-gray-50 focus:border-black"}`}
                />
              </div>

              <div className="col-span-1">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest block mb-1.5 italic">
                  Type
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) =>
                    setFormData({ ...formData, discountType: e.target.value })
                  }
                  className="w-full bg-gray-50 p-4 rounded-xl font-bold outline-none border cursor-pointer"
                >
                  <option value="percentage">% Percent</option>
                  <option value="fixed">₹ Fixed</option>
                </select>
              </div>

              <div className="col-span-1">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest block mb-1.5 italic">
                  Amount
                </label>
                <input
                  required
                  type="number"
                  value={formData.discountAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, discountAmount: e.target.value })
                  }
                  className="w-full bg-gray-50 p-4 rounded-xl font-bold outline-none border focus:border-black transition-all"
                />
              </div>

              <div className="col-span-1">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest block mb-1.5 italic">
                  Usage Limit
                </label>
                <input
                  required
                  type="number"
                  placeholder="100"
                  value={formData.usageLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, usageLimit: e.target.value })
                  }
                  className="w-full bg-gray-50 p-4 rounded-xl font-bold outline-none border focus:border-black transition-all"
                />
              </div>

              <div className="col-span-1">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest block mb-1.5 italic">
                  Min Order
                </label>
                <input
                  required
                  type="number"
                  placeholder="999"
                  value={formData.minOrderAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, minOrderAmount: e.target.value })
                  }
                  className="w-full bg-gray-50 p-4 rounded-xl font-bold outline-none border focus:border-black transition-all"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest block mb-1.5 italic">
                  Expiry Date
                </label>
                <input
                  required
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
                  className="w-full bg-gray-50 p-4 rounded-xl font-bold outline-none border focus:border-black transition-all"
                />
              </div>

              <button
                type="submit"
                className="col-span-2 mt-4 bg-black text-white py-4 md:py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-gray-800 transition-all shadow-xl active:scale-95"
              >
                {editId ? "Update Coupon" : "Launch Coupon"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Stat Card
const StatCard = ({ icon, title, value, bg, color }) => (
  <div
    className={`bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4 group transition-all hover:shadow-xl`}
  >
    <div
      className={`w-12 h-12 md:w-14 md:h-14 ${bg} ${color} rounded-xl md:rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform`}
    >
      {icon}
    </div>
    <div>
      <h3 className="text-xl md:text-2xl font-black italic">{value}</h3>
      <p className="text-[8px] md:text-[9px] font-black uppercase text-gray-400 tracking-widest">
        {title}
      </p>
    </div>
  </div>
);

export default CouponManager;
