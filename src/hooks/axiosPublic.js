import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const baseURL = API_URL.replace(/\/+$/, "");

const axiosPublic = axios.create({
  baseURL,
  timeout: 15000,

  headers: {
    "Content-Type": "application/json",
  },
});

axiosPublic.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosPublic.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(
        "Public API Error:",
        error.response.status,
        error.response.data,
      );
    } else if (error.request) {
      console.error("Public API Network Error:", error.message);
    } else {
      console.error("Public API Request Error:", error.message);
    }

    return Promise.reject(error);
  },
);

export default axiosPublic;
