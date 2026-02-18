import axios from "axios";

const API_URL = "http://localhost:8080";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const authRegister = async (data) => {
  const response = await api.post("/api/auth/register", data);
  return response.data;
};

const authLogin = async (data) => {
  const response = await api.post("/api/auth/login", data);
  return response.data;
};

const authGoogle = async (googleData) => {
  const response = await api.post("/api/auth/google-auth", googleData);
  return response.data;
};

const authLogout = async () => {
  const response = await api.post("/api/auth/logout", {});
  return response.data;
};

const forgotPassword = async (email) => {
  const response = await api.post("/api/auth/forgot-password", { email });
  return response.data;
};

const resetPassword = async (token, password) => {
  const response = await api.put(`/api/auth/reset-password/${token}`, {
    password,
  });
  return response.data;
};

const getCurrentUser = async () => {
  const response = await api.get("/api/auth/me");

  return response.data;
};

const updateProfile = async (userData) => {
  const response = await api.put("/api/auth/update-profile", userData);
  return response.data;
};

const getAllUsers = async () => {
  const response = await api.get("/api/auth/admin/users");
  return response.data;
};

const getUserStats = async () => {
  const response = await api.get("/api/auth/admin/user-stats");
  return response.data;
};

export const authService = {
  authRegister,
  authLogin,
  authGoogle,
  authLogout,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  updateProfile,
  getAllUsers,
  getUserStats,
};
