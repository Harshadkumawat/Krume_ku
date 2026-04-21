
import api from "../../utils/api";

const createRazorpayOrder = async () => {
  const response = await api.post("/api/payment/create-order");
  return response.data;
};

const verifyPayment = async (paymentData) => {
  const response = await api.post("/api/payment/verify", paymentData);
  return response.data;
};

export const paymentService = {
  createRazorpayOrder,
  verifyPayment,
};
