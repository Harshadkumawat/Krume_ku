import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllCoupons,
  createNewCoupon,
  updateExistingCoupon, // 🔥 New Action
  deleteCoupon,
} from "../../features/coupon/couponSlice";
import {
  TicketPercent,
  Plus,
  Trash2,
  Edit3, // 🔥 New Icon
  Loader2,
  X,
  Users,
  AlertCircle,
} from "lucide-react";

const CouponManager = () => {
  const dispatch = useDispatch();
  const { coupons, isLoading } = useSelector((state) => state.coupon);

  // --- States ---
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null); // 🔥 Track if editing
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

  // 🔥 Open Modal for Editing
  const handleEditClick = (coupon) => {
    setEditId(coupon._id);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountAmount: coupon.discountAmount,
      minOrderAmount: coupon.minOrderAmount,
      usageLimit: coupon.usageLimit,
      expiryDate: coupon.expiryDate.split("T")[0], // Format date for input
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      // 🔥 UPDATE LOGIC
      dispatch(updateExistingCoupon({ id: editId, couponData: formData })).then(
        () => {
          closeModal();
        },
      );
    } else {
      // CREATE LOGIC
      dispatch(createNewCoupon(formData)).then(() => {
        closeModal();
      });
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
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-fade-in">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">
            Coupon Engine
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Create and manage promotional offers.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-black text-white px-6 py-3 rounded-2xl flex items-center gap-2 text-xs font-black uppercase hover:shadow-2xl hover:shadow-black/20 transition-all"
        >
          <Plus size={16} /> Create New Coupon
        </button>
      </div>

      {/* --- STATS OVERVIEW --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <TicketPercent size={20} />
          </div>
          <h3 className="text-2xl font-black">{coupons.length}</h3>
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
            Total Coupons
          </p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
            <Users size={20} />
          </div>
          <h3 className="text-2xl font-black">
            {coupons.reduce((acc, c) => acc + c.usedCount, 0)}
          </h3>
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
            Total Redemptions
          </p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm border-l-4 border-l-orange-400">
          <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4">
            <AlertCircle size={20} />
          </div>
          <h3 className="text-2xl font-black">
            {coupons.filter((c) => !c.isActive).length}
          </h3>
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
            Inactive/Expired
          </p>
        </div>
      </div>

      {/* --- COUPON TABLE --- */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
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
                  <td className="px-8 py-6 text-xs font-bold text-gray-500">
                    {new Date(coupon.expiryDate).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6 text-right flex justify-end gap-2">
                    {/* 🔥 EDIT BUTTON */}
                    <button
                      onClick={() => handleEditClick(coupon)}
                      className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition-all"
                    >
                      <Edit3 size={18} />
                    </button>
                    {/* DELETE BUTTON */}
                    <button
                      onClick={() => handleDelete(coupon._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL (CREATE / EDIT) --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-8 relative animate-scale-up">
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6 italic">
              {editId ? "Update Offer" : "Generate Offer"}
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">
                  Coupon Code
                </label>
                <input
                  required
                  type="text"
                  disabled={!!editId} // 🔥 Usually coupon codes aren't editable after creation
                  placeholder="E.G. FIRST100"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  className={`w-full p-4 rounded-2xl outline-none font-bold uppercase transition-all border-2 border-transparent ${editId ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-50 focus:border-black"}`}
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">
                  Type
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) =>
                    setFormData({ ...formData, discountType: e.target.value })
                  }
                  className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none cursor-pointer"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">
                  Discount Value
                </label>
                <input
                  required
                  type="number"
                  value={formData.discountAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, discountAmount: e.target.value })
                  }
                  className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-black transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">
                  Usage Limit (Users)
                </label>
                <input
                  required
                  type="number"
                  placeholder="100"
                  value={formData.usageLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, usageLimit: e.target.value })
                  }
                  className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-black transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">
                  Min Order Value
                </label>
                <input
                  required
                  type="number"
                  placeholder="999"
                  value={formData.minOrderAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, minOrderAmount: e.target.value })
                  }
                  className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-black transition-all"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">
                  Expiry Date
                </label>
                <input
                  required
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
                  className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-black transition-all"
                />
              </div>

              <button
                type="submit"
                className="col-span-2 mt-4 bg-black text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-gray-800 transition-all shadow-xl shadow-black/10"
              >
                {editId ? "Save Changes" : "Launch Coupon"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManager;
