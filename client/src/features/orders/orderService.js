import api from "../../utils/api";

// ── USER OPERATIONS ────────────────────────────────────────

const createOrder = async (orderData) => {
  const response = await api.post("/api/orders", orderData);
  return response.data;
};

const getMyOrders = async () => {
  const response = await api.get("/api/orders/myorders");
  return response.data;
};

const getOrderDetails = async (orderId) => {
  if (!orderId || orderId === "super" || orderId.length < 10) {
    throw new Error("Invalid Order ID provided");
  }
  const response = await api.get(`/api/orders/${orderId}`);
  return response.data;
};

const cancelOrder = async (orderId) => {
  const response = await api.put(`/api/orders/${orderId}/cancel`, {});
  return response.data;
};

const requestReturn = async (orderId, returnData) => {
  const response = await api.put(`/api/orders/${orderId}/return`, returnData);
  return response.data;
};

// ── ADMIN OPERATIONS ───────────────────────────────────────

const getAllOrders = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = query
    ? `/api/orders/admin/all?${query}`
    : "/api/orders/admin/all";
  const response = await api.get(url);
  return response.data;
};

const manageReturn = async (orderId, statusData) => {
  const response = await api.put(
    `/api/orders/${orderId}/return/manage`,
    statusData,
  );
  return response.data;
};

const updateOrderStatus = async (id, status) => {
  const response = await api.put(`/api/orders/${id}`, { status });
  return response.data;
};

const deleteOrder = async (id) => {
  const response = await api.delete(`/api/orders/${id}`);
  return response.data;
};

const orderService = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderDetails,
  cancelOrder,
  requestReturn,
  manageReturn,
  updateOrderStatus,
  deleteOrder,
};

export default orderService;
