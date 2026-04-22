import api from "../../utils/api";

// ── PRODUCT OPERATIONS ────────────────────────────────────

const createProduct = async (formData) => {
  const res = await api.post("/api/admin/products", formData);
  return res.data;
};

const getAdminProducts = async () => {
  const res = await api.get("/api/admin/products");
  return res.data;
};

const updateProduct = async (id, formData) => {
  const res = await api.put(`/api/admin/products/${id}`, formData);
  return res.data;
};

const deleteProduct = async (id) => {
  const res = await api.delete(`/api/admin/products/${id}`);
  return res.data;
};
// ── DASHBOARD STATS ────────────────────────────────────────

const getStats = async (range = "daily") => {
  const res = await api.get(`/api/admin/stats?range=${range}`);
  return res.data;
};

const adminService = {
  createProduct,
  getAdminProducts,
  updateProduct,
  deleteProduct,
  getStats,
};

export default adminService;
