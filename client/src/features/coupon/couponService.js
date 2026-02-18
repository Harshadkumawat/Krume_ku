import axios from "axios";

// 🔥 Path consistency ke liye hamesha base URL rakhein
const API_URL = "http://localhost:8080/api/coupons";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================
// 1. APPLY COUPON (User)
// ============================================================
const applyCoupon = async (couponData) => {
  // couponData: { code: "HARSHAD10" }
  const response = await api.post("/apply", couponData);
  return response.data; // Backend ab data: { appliedCoupon } bhej raha hai
};

// ============================================================
// 2. REMOVE COUPON (User - New)
// ============================================================
const removeCoupon = async () => {
  const response = await api.post("/remove");
  return response.data;
};

// ============================================================
// 3. ADMIN OPERATIONS
// ============================================================
const createCoupon = async (couponData) => {
  const response = await api.post("/", couponData);
  return response.data;
};

const getAllCoupons = async () => {
  const response = await api.get("/");
  return response.data;
};

const deleteCoupon = async (id) => {
  const response = await api.delete(`/${id}`);
  return response.data;
};

const updateCouponStatus = async (id) => {
  const response = await api.put(`/status/${id}`, {});
  return response.data;
};

const updateCoupon = async (id, couponData) => {
  const response = await api.put(`/${id}`, couponData);
  return response.data;
};

const couponService = {
  applyCoupon,
  removeCoupon, 
  createCoupon,
  getAllCoupons,
  deleteCoupon,
  updateCouponStatus,
  updateCoupon,
};

export default couponService;
