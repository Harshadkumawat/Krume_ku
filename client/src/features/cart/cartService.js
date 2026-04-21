// features/cart/cartService.js
import api from "../../utils/api";

const addToCart = async (data) => {
  const response = await api.post("/api/cart/add", data);
  return response.data;
};

const getCart = async () => {
  const response = await api.get("/api/cart/");
  return response.data;
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

const applyCoupon = async (data) => {
  const response = await api.post("/api/coupons/apply", data);
  return response.data;
};

const removeCoupon = async () => {
  const response = await api.post("/api/coupons/remove");
  return response.data;
};

export const cartService = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyCoupon,
  removeCoupon,
};
