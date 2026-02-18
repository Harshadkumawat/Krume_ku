import axios from "axios";

const API_URL = "http://localhost:8080/api/orders/";

// 1. Create Order
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

// 3. Get All Orders (Admin)
const getAllOrders = async () => {
  const response = await axios.get(`${API_URL}admin/all`, {
    withCredentials: true,
  });
  return response.data;
};

// 4. Get Single Order
const getOrderDetails = async (orderId) => {
  if (!orderId || orderId === "super" || orderId.length < 10) {
    throw new Error("Invalid Order ID provided");
  }
  const response = await axios.get(`${API_URL}${orderId}`, {
    withCredentials: true,
  });
  return response.data;
};

// 5. Cancel Order
const cancelOrder = async (orderId) => {
  const response = await axios.put(
    `${API_URL}${orderId}/cancel`,
    {},
    { withCredentials: true },
  );
  return response.data;
};

// 6. Request Return
const requestReturn = async (orderId, returnData) => {
  const response = await axios.put(`${API_URL}${orderId}/return`, returnData, {
    withCredentials: true,
  });
  return response.data;
};

// 7. Manage Return
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
