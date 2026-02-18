import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_URL,
});

const getProduct = async (params = {}) => {
  const response = await api.get("/api/products", { params });
  return response.data;
};

const singleProduct = async (id) => {
  const response = await api.get(`/api/products/${id}`);
  return response.data;
};

const getHomeProducts = async () => {
  const response = await api.get("/api/products/home");
  return response.data;
};

export const productService = {
  getProduct,
  singleProduct,
  getHomeProducts,
};
