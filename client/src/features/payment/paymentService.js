import api from "../../utils/api";

const createRazorpayOrder = async () => {
  const response = await api.post("/api/payment/create-order");
  return response.data;
};

// ✅ Naya function — Online payment ke liye
// Razorpay checkout complete hone ke baad DB mein order banata hai
// razorpayOrderId saath bhejta hai — verify step mein order dhundhne ke liye
const createOrderInDB = async (orderPayload) => {
  const response = await api.post("/api/orders", orderPayload);
  return response.data; // { success: true, data: { _id, ... } }
};

const verifyPayment = async (paymentData) => {
  const response = await api.post("/api/payment/verify", paymentData);
  return response.data;
};

export const paymentService = {
  createRazorpayOrder,
  createOrderInDB, // ✅ naya
  verifyPayment,
};
