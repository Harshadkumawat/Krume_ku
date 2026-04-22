import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

let storeRef = null;
let isRedirecting = false; // ← loop rokne ka flag

export const injectStore = (store) => {
  storeRef = store;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Cancel ya network error — ignore
    if (axios.isCancel(error) || error.code === "ERR_CANCELED") {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      // Yeh routes pe 401 aaye toh redirect mat karo
      const ignoredEndpoints = [
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/google-auth",
        "/api/auth/me", // ← important — loop rokta hai
        "/api/auth/logout",
      ];

      const isIgnored = ignoredEndpoints.some((ep) =>
        error.config?.url?.includes(ep),
      );

      // Sirf tab redirect karo jab:
      // 1. Ignored route nahi hai
      // 2. Store available hai
      // 3. Pehle se redirect nahi ho raha
      if (!isIgnored && storeRef && !isRedirecting) {
        isRedirecting = true;
        storeRef.dispatch({ type: "auth/clearUser" });
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  },
);

// Request logging — sirf development mein
if (import.meta.env.DEV) {
  api.interceptors.request.use((config) => {
    console.log(`🔗 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  });
}

export default api;
