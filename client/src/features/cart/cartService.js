import axios from "axios";

const API_URL = "http://localhost:8080";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔥 Token Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ------------------------------------------------------------------
// 1. ADD TO CART (🔍 Debug Logs Added Here)
// ------------------------------------------------------------------
const addToCart = async (data) => {
  try {
    const response = await api.post("/api/cart/add", data);

    return response.data;
  } catch (error) {
    if (error.response) {
    } else if (error.request) {
    } else throw error;
  }
};

// 2. GET CART
const getCart = async () => {
  try {
    const response = await api.get("/api/cart/");

    return response.data;
  } catch (error) {
    throw error;
  }
};

// 3. UPDATE QUANTITY
const updateCartItem = async (data) => {
  const response = await api.put("/api/cart/update", data);
  return response.data;
};

// 4. REMOVE ITEM
const removeCartItem = async (itemId) => {
  const response = await api.delete(`/api/cart/remove/${itemId}`);
  return response.data;
};

// 5. CLEAR CART
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
