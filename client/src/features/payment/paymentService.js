import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, 
});

// Ab hume koi config ya token manually bhejne ki zaroorat nahi hai
const createRazorpayOrder = async (orderData) => {
  const response = await api.post("/api/payment/create-order", orderData);
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
