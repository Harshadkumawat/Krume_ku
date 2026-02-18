import axios from "axios";

const API_URL = "http://localhost:8080";

const api = axios.create({
  baseURL: API_URL,
});

// --- 1. Get All Products ---

const getProduct = async (params = {}) => {
  const response = await api.get("/api/products", { params });

  return response.data;
};

// --- 2. Get Single Product ---
const singleProduct = async (id) => {
  const response = await api.get(`/api/products/${id}`);
  return response.data;
};

// --- 3. Get Home Page Data ---
const getHomeProducts = async () => {
  const response = await api.get("/api/products/home");

  return response.data;
};

export const productService = {
  getProduct,
  singleProduct,
  getHomeProducts,
};
