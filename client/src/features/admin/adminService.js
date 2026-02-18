import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API_URL = `${BASE_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const createProduct = async (formData) => {
  const res = await api.post("/admin/products", formData);
  return res.data;
};

const getAdminProducts = async () => {
  const res = await api.get("/admin/products");
  return res.data;
};

const updateProduct = async (id, formData) => {
  const res = await api.put(`/admin/products/${id}`, formData);
  return res.data;
};

const deleteProduct = async (id) => {
  const res = await api.delete(`/admin/products/${id}`);
  return res.data;
};

const getStats = async () => {
  const res = await api.get("/orders/admin/stats");
  return res.data;
};

const getAllOrders = async () => {
  const res = await api.get("/orders/admin/all");
  return res.data;
};

const updateOrderStatus = async (id, status) => {
  const res = await api.put(`/orders/${id}`, { status });
  return res.data;
};

const deleteOrder = async (id) => {
  const res = await api.delete(`/orders/${id}`);
  return res.data;
};

const adminService = {
  createProduct,
  getAdminProducts,
  updateProduct,
  deleteProduct,
  getStats,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
};

export default adminService;
