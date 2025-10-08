const api = "http://localhost:8080";

import axios from "axios";
import { fetchCurrentUser } from "./authSlice";

axios.defaults.withCredentials = true;

// REGISTER
const authRegister = async (data) => {
  const response = await axios.post(`${api}/api/auth/register`, data, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

// LOGIN
const authLogin = async (data) => {
  const response = await axios.post(`${api}/api/auth/login`, data, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

// LOGOUT
const authLogout = async () => {
  const response = await axios.post(
    `${api}/api/auth/logout`,
    {},
    { headers: { "Content-Type": "application/json" } }
  );
  return response.data;
};

const getCurrentUser = async () => {
  const response = await axios.get(`${api}/api/auth/me`, {
    headers: { "Content-Type": "application/json" },
  });

  return response.data;
};

export const authService = {
  authRegister,
  authLogin,
  authLogout,
  getCurrentUser,
};
