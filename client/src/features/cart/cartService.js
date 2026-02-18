import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const addToCart = async (data) => {
  try {
    const response = await api.post("/api/cart/add", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getCart = async () => {
  try {
    const response = await api.get("/api/cart/");
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateCartItem = async (data) => {
  const response = await api.put("/api/cart/update", data);
  return response.data;
};

const removeCartItem = async (itemId) => {
  const response = await api.delete(`/api/cart/remove/${itemId}`);
  return response.data;
};

const clearCart = async () => {
  const response = await api.delete("/api/cart/clear");
  return response.data;
};

export const cartService = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
