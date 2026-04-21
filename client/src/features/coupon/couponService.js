import api from "../../utils/api";

// ══════════════════════════════════════════════════
// ADMIN OPERATIONS ONLY
// (User apply/remove is in cartService.js)
// ══════════════════════════════════════════════════

const createCoupon = async (couponData) => {
  const response = await api.post("/api/coupons", couponData);
  return response.data;
};

const getAllCoupons = async () => {
  const response = await api.get("/api/coupons");
  return response.data;
};

const deleteCoupon = async (id) => {
  const response = await api.delete(`/api/coupons/${id}`);
  return response.data;
};

const updateCouponStatus = async (id) => {
  const response = await api.put(`/api/coupons/status/${id}`, {});
  return response.data;
};

const updateCoupon = async (id, couponData) => {
  const response = await api.put(`/api/coupons/${id}`, couponData);
  return response.data;
};

const couponService = {
  createCoupon,
  getAllCoupons,
  deleteCoupon,
  updateCouponStatus,
  updateCoupon,
};

export default couponService;
