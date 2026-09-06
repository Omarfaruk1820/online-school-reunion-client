import axios from "axios";
import { auth } from "../Auth/firebase.config";

const axiosSecure = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",

  timeout: 15000,
});

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================

axiosSecure.interceptors.request.use(
  async (config) => {
    try {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const idToken = await currentUser.getIdToken(false);

        if (idToken) {
          config.headers.Authorization = `Bearer ${idToken}`;
        }
      }

      return config;
    } catch (error) {
      console.error("Firebase token error:", error);
      return Promise.reject(error);
    }
  },

  (error) => Promise.reject(error),
);

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

axiosSecure.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const currentUser = auth.currentUser;

        if (!currentUser) {
          return Promise.reject(error);
        }

        const refreshedToken = await currentUser.getIdToken(true);

        originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;

        return axiosSecure(originalRequest);
      } catch (refreshError) {
        console.error("Firebase token refresh failed:", refreshError);

        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 403) {
      console.warn("Forbidden: user does not have permission.");
    }

    return Promise.reject(error);
  },
);

export default axiosSecure;
