import axios from "axios";

const API_URL = "https://krume-ku.onrender.com"; 


const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
});

// REGISTER
const authRegister = async (data) => {
  const response = await api.post("/api/auth/register", data);
  return response.data;
};

// LOGIN
const authLogin = async (data) => {
  const response = await api.post("/api/auth/login", data);
  return response.data;
};

// LOGOUT
const authLogout = async () => {
  const response = await api.post("/api/auth/logout", {});
  return response.data;
};

// CURRENT USER
const getCurrentUser = async () => {
  const response = await api.get("/api/auth/me");
  return response.data;
};

export const authService = {
  authRegister,
  authLogin,
  authLogout,
  getCurrentUser,
};
