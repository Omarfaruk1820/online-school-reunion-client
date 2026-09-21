import axios from "axios";
import { auth } from "../Auth/firebase.config";

const axiosSecure = axios.create({
  // IMPORTANT:
  // VITE_API_URL must NOT contain /api
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",

  timeout: 15000,

  withCredentials: true,
});

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================

axiosSecure.interceptors.request.use(
  async (config) => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        return config;
      }

      const idToken = await currentUser.getIdToken(false);

      if (idToken) {
        if (config.headers?.set) {
          config.headers.set("Authorization", `Bearer ${idToken}`);
        } else {
          config.headers = config.headers || {};
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

    // ========================================================
    // 401 → REFRESH TOKEN → RETRY ONCE
    // ========================================================

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

        if (originalRequest.headers?.set) {
          originalRequest.headers.set(
            "Authorization",
            `Bearer ${refreshedToken}`,
          );
        } else {
          originalRequest.headers = originalRequest.headers || {};

          originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;
        }

        return axiosSecure(originalRequest);
      } catch (refreshError) {
        console.error("Firebase token refresh failed:", refreshError);

        return Promise.reject(refreshError);
      }
    }

    // ========================================================
    // 403 → FORBIDDEN
    // ========================================================

    if (error.response?.status === 403) {
      console.warn("Forbidden: user does not have permission.");
    }

    return Promise.reject(error);
  },
);

export default axiosSecure;
