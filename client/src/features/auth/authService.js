import api from "../../utils/api";





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
  const response = await api.patch(`/api/auth/reset-password/${token}`, {
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

const addUserAddress = async (addressData) => {
  const response = await api.post("/api/auth/address", addressData);
  return response.data;
};

const updateUserAddress = async (id, addressData) => {
  const response = await api.put(`/api/auth/address/${id}`, addressData);
  return response.data;
};

const deleteUserAddress = async (id) => {
  const response = await api.delete(`/api/auth/address/${id}`);
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
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
};
