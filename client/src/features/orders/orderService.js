import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API_URL = `${BASE_URL}/api/orders/`;

const createOrder = async (orderData) => {
  const response = await axios.post(API_URL, orderData, {
    withCredentials: true,
  });
  return response.data;
};

const getMyOrders = async () => {
  const response = await axios.get(`${API_URL}myorders?t=${Date.now()}`, {
    withCredentials: true,
  });
  return response.data;
};

const getAllOrders = async () => {
  const response = await axios.get(`${API_URL}admin/all`, {
    withCredentials: true,
  });
  return response.data;
};

const getOrderDetails = async (orderId) => {
  if (!orderId || orderId === "super" || orderId.length < 10) {
    throw new Error("Invalid Order ID provided");
  }
  const response = await axios.get(`${API_URL}${orderId}`, {
    withCredentials: true,
  });
  return response.data;
};

const cancelOrder = async (orderId) => {
  const response = await axios.put(
    `${API_URL}${orderId}/cancel`,
    {},
    { withCredentials: true },
  );
  return response.data;
};

const requestReturn = async (orderId, returnData) => {
  const response = await axios.put(`${API_URL}${orderId}/return`, returnData, {
    withCredentials: true,
  });
  return response.data;
};

const manageReturn = async (orderId, statusData) => {
  const response = await axios.put(
    `${API_URL}${orderId}/return/manage`,
    statusData,
    { withCredentials: true },
  );
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
};

export default orderService;
