import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllCoupons,
  createNewCoupon,
  updateExistingCoupon,
  updateCouponStatus,
  deleteCoupon,
} from "../../features/coupon/couponSlice";
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  Power,
  X,
  Tag,
  AlertTriangle,
} from "lucide-react";
import { formatDate } from "../../utils/formatters";

const INITIAL_FORM_STATE = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  minOrderAmount: "",
  maxDiscountAmount: "",
  usageLimit: "",
  expiresAt: "",
};

const CouponManager = () => {
  const dispatch = useDispatch();
  const { coupons, isLoading, isMutating } = useSelector(
    (state) => state.coupon,
  );

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  useEffect(() => {
    dispatch(getAllCoupons());
  }, [dispatch]);

  const getUsedCount = useCallback((coupon) => coupon.usedBy?.length || 0, []);

  const handleEditClick = useCallback((coupon) => {
    setEditId(coupon._id);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue || "",
      minOrderAmount: coupon.minOrderAmount || "",
      maxDiscountAmount: coupon.maxDiscountAmount || "",
      usageLimit: coupon.usageLimit || "",
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split("T")[0] : "",
    });
    setShowModal(true);
  }, []);

  const handleDeleteClick = useCallback(
    (id) => {
      if (window.confirm("Permanently delete this coupon?")) {
        dispatch(deleteCoupon(id));
      }
    },
    [dispatch],
  );

  const handleModalClose = () => {
    setShowModal(false);
    setEditId(null);
    setFormData(INITIAL_FORM_STATE);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      code: formData.code.toUpperCase().trim(),
      discountValue: Number(formData.discountValue),
      minOrderAmount: Number(formData.minOrderAmount) || 0,
      maxDiscountAmount: Number(formData.maxDiscountAmount) || 0,
      usageLimit: Number(formData.usageLimit) || 0,
    };

    if (editId) {
      dispatch(updateExistingCoupon({ id: editId, couponData: payload })).then(
        (res) => {
          if (!res.error) handleModalClose();
        },
      );
    } else {
      dispatch(createNewCoupon(payload)).then((res) => {
        if (!res.error) handleModalClose();
      });
    }
  };

  if (isLoading && coupons.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh]">
        <Loader2 className="animate-spin w-10 h-10 text-black mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
          Loading Vault...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 overflow-x-hidden selection:bg-black selection:text-white">
      {/* ── Header ── */}
      <div className="bg-black text-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full -mr-20 -mt-20"
          aria-hidden="true"
        />
        <div className="relative z-10">
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic flex items-center gap-3">
            <Tag size={32} className="text-purple-500" /> Coupon{" "}
            <span className="text-purple-500">Vault</span>
          </h1>
          <p className="text-gray-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic opacity-80">
            Discount & Promotion Protocols
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="relative z-10 w-full md:w-auto px-8 py-4 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-purple-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus size={16} /> Create Code
        </button>
      </div>

      {/* ── Coupons List ── */}
      {!coupons.length ? (
        <div className="text-center py-24 bg-white rounded-[2rem] border border-gray-100 shadow-inner">
          <Tag className="mx-auto text-gray-100 mb-4" size={60} />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">
            No active promotion codes
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                {[
                  "Identity",
                  "Value",
                  "Limits",
                  "Usage",
                  "Expiry",
                  "Actions",
                ].map((th) => (
                  <th
                    key={th}
                    className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] italic"
                  >
                    {th}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {coupons.map((coupon) => (
                <tr
                  key={coupon._id}
                  className="group hover:bg-gray-50/50 transition-all"
                >
                  {/* Identity Column */}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => dispatch(updateCouponStatus(coupon._id))}
                        disabled={isMutating}
                        aria-label={
                          coupon.isActive
                            ? "Deactivate coupon"
                            : "Activate coupon"
                        }
                        title={
                          coupon.isActive
                            ? "Click to deactivate"
                            : "Click to activate"
                        }
                        className={`p-2 rounded-lg transition-all ${
                          coupon.isActive
                            ? "bg-black text-white hover:bg-red-600 shadow-md"
                            : "bg-zinc-100 text-zinc-400 hover:bg-emerald-500 hover:text-white"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <Power size={16} />
                      </button>
                      <div>
                        <span
                          className={`font-mono font-black text-sm uppercase tracking-tight block ${coupon.isActive ? "text-black" : "text-gray-400 line-through"}`}
                        >
                          {coupon.code}
                        </span>
                        {!coupon.isActive && (
                          <span className="text-[8px] font-bold text-red-400 uppercase tracking-widest">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Value Column */}
                  <td className="px-8 py-6 font-black text-xs italic">
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountValue}% OFF`
                      : `₹${coupon.discountValue} OFF`}
                    {coupon.discountType === "percentage" &&
                      coupon.maxDiscountAmount > 0 && (
                        <span className="block text-[8px] font-bold text-purple-500 mt-1 not-italic tracking-widest">
                          MAX CAP: ₹{coupon.maxDiscountAmount}
                        </span>
                      )}
                  </td>

                  {/* Limits Column */}
                  <td className="px-8 py-6">
                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest space-y-1">
                      <p>
                        Min Order:{" "}
                        <span className="text-black">
                          ₹{coupon.minOrderAmount || 0}
                        </span>
                      </p>
                      <p>
                        Per User:{" "}
                        <span className="text-black">
                          {coupon.usageLimit || "∞"} Uses
                        </span>
                      </p>
                    </div>
                  </td>

                  {/* Usage Column */}
                  <td className="px-8 py-6">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black italic border border-blue-100">
                      {getUsedCount(coupon)} Redeemed
                    </span>
                  </td>

                  {/* Expiry Column */}
                  <td className="px-8 py-6">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest ${new Date(coupon.expiresAt) < new Date() ? "text-red-500" : "text-gray-500"}`}
                    >
                      {coupon.expiresAt
                        ? formatDate(coupon.expiresAt)
                        : "Never"}
                    </span>
                  </td>

                  {/* Actions Column */}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditClick(coupon)}
                        className="p-2.5 bg-gray-100 hover:bg-black hover:text-white rounded-xl transition-all"
                        aria-label="Edit coupon"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(coupon._id)}
                        disabled={isMutating}
                        className="p-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Delete coupon"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleModalClose}
          />
          <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-black text-white p-6 md:p-8 flex justify-between items-center">
              <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                <Tag size={20} className="text-purple-400" />
                {editId ? "Update Protocol" : "New Protocol"}
              </h3>
              <button
                onClick={handleModalClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest block mb-2 italic">
                    Code Identity
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. KRUMEKU10"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="w-full bg-zinc-50 border-zinc-100 p-4 rounded-xl font-black uppercase tracking-widest outline-none border focus:border-black transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest block mb-2 italic">
                      Type
                    </label>
                    <select
                      value={formData.discountType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountType: e.target.value,
                        })
                      }
                      className="w-full bg-zinc-50 border-zinc-100 p-4 rounded-xl font-bold uppercase tracking-widest outline-none border focus:border-black text-[10px] cursor-pointer"
                    >
                      <option value="percentage">Percent %</option>
                      <option value="fixed">Fixed ₹</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest block mb-2 italic">
                      Value
                    </label>
                    <input
                      required
                      min="1"
                      type="number"
                      placeholder="e.g. 10"
                      value={formData.discountValue}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountValue: e.target.value,
                        })
                      }
                      className="w-full bg-zinc-50 border-zinc-100 p-4 rounded-xl font-bold outline-none border focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest block mb-2 italic">
                    Min Order Value (₹)
                  </label>
                  <input
                    min="0"
                    type="number"
                    placeholder="e.g. 1999 (0 = none)"
                    value={formData.minOrderAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minOrderAmount: e.target.value,
                      })
                    }
                    className="w-full bg-zinc-50 border-zinc-100 p-4 rounded-xl font-bold outline-none border focus:border-black"
                  />
                </div>

                {/* Conditional Max Discount Field */}
                {formData.discountType === "percentage" && (
                  <div>
                    <label
                      htmlFor="c-maxDiscount"
                      className="text-[9px] font-black uppercase text-zinc-400 tracking-widest block mb-2 italic"
                    >
                      Max Discount Cap (₹)
                    </label>
                    <input
                      id="c-maxDiscount"
                      min="0"
                      type="number"
                      placeholder="e.g. 500 (0 = no cap)"
                      value={formData.maxDiscountAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxDiscountAmount: e.target.value,
                        })
                      }
                      className="w-full bg-zinc-50 border-zinc-100 p-4 rounded-xl font-bold outline-none border focus:border-black"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest block mb-2 italic">
                    Usage Limit Per User
                  </label>
                  <input
                    min="0"
                    type="number"
                    placeholder="e.g. 1 (0 = unlimited)"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, usageLimit: e.target.value })
                    }
                    className="w-full bg-zinc-50 border-zinc-100 p-4 rounded-xl font-bold outline-none border focus:border-black"
                  />
                </div>

                <div
                  className={
                    formData.discountType !== "percentage"
                      ? "md:col-span-2"
                      : ""
                  }
                >
                  <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest block mb-2 italic">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expiresAt}
                    onChange={(e) =>
                      setFormData({ ...formData, expiresAt: e.target.value })
                    }
                    className="w-full bg-zinc-50 border-zinc-100 p-4 rounded-xl font-bold outline-none border focus:border-black uppercase tracking-widest text-[11px]"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleModalClose}
                  disabled={isMutating}
                  className="px-6 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isMutating}
                  className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {isMutating && <Loader2 size={14} className="animate-spin" />}
                  {editId ? "Update Protocol" : "Engage Protocol"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManager;
