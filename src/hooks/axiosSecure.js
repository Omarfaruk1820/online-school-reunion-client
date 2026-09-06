import axios from "axios";
import { auth } from "../Auth/firebase.config";

// ============================================================
// AXIOS SECURE INSTANCE
// ============================================================

const axiosSecure = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",

  timeout: 15000,

  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================
// REQUEST INTERCEPTOR
// Attach Firebase ID token automatically
// ============================================================

axiosSecure.interceptors.request.use(
  async (config) => {
    try {
      const currentUser = auth.currentUser;

      if (currentUser) {
        /*
         * getIdToken(false) is normally enough.
         *
         * Firebase automatically refreshes the token
         * when necessary.
         */

        const idToken = await currentUser.getIdToken(false);

        if (idToken) {
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

  (error) => {
    return Promise.reject(error);
  },
);

// ============================================================
// RESPONSE INTERCEPTOR
// Refresh token automatically on 401
// ============================================================

axiosSecure.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    /*
     * If request is unauthorized, try refreshing
     * Firebase ID token once.
     */

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

        /*
         * Force Firebase to refresh the ID token.
         */

        const refreshedToken = await currentUser.getIdToken(true);

        if (!refreshedToken) {
          return Promise.reject(error);
        }

        originalRequest.headers = originalRequest.headers || {};

        originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;

        /*
         * Retry the original request once.
         */

        return axiosSecure(originalRequest);
      } catch (refreshError) {
        console.error("Firebase token refresh failed:", refreshError);

        return Promise.reject(refreshError);
      }
    }

    /*
     * 403 = authenticated but not authorized.
     */

    if (error.response?.status === 403) {
      console.warn("Forbidden: user does not have permission.");
    }

    return Promise.reject(error);
  },
);

export default axiosSecure;
