import axios from "axios";

// 1. Base URL decide karo
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API_URL = `${BASE_URL}/api/coupons`;

// 2. Axios Instance Banao (Baar-baar URL likhne se bachne ke liye)
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
  const response = await api.post("/apply", couponData);
  return response.data;
};

// ============================================================
// 2. REMOVE COUPON (User)
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
