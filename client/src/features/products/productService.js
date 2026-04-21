import api from "../../utils/api";

const getAllProducts = async (params = {}, signal) => {
  const config = { params };
  if (signal) {
    config.signal = signal;
  }
  const response = await api.get("/api/products", config);
  return response.data;
};

const getProductById = async (id) => {
  if (!id) {
    throw new Error("Product ID is required");
  }
  const response = await api.get(`/api/products/${id}`);
  return response.data;
};

const getHomeProducts = async () => {
  const response = await api.get("/api/products/home");
  return response.data;
};

export const productService = {
  getAllProducts,
  getProductById,
  getHomeProducts,
};
