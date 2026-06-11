// api/axios.js

import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearTokens,
} from "../services/tokenService";

/**
 * Axios instance configured with base API URL
 */
const api = axios.create({
  baseURL: "http://192.168.3.25:8080/api",
});

/**
 * Attach access token to every outgoing request
 */
api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Handle response errors (mainly token expiration)
 */
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) return Promise.reject(error);

    // Skip login endpoint to avoid infinite retry loop
    if (originalRequest.url.includes("/users/login/")) {
      return Promise.reject(error);
    }

    /**
     * If access token expired → try refreshing it
     */
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = getRefreshToken();

        // No refresh token → force logout
        if (!refresh) {
          clearTokens();
          return Promise.reject(error);
        }

        // Request new tokens
        const res = await axios.post(
          "http://192.168.3.25:8080/api/token/refresh/",
          { refresh }
        );

        const newAccess = res.data.access;
        const newRefresh = res.data.refresh;

        // Update stored tokens
        setAccessToken(newAccess);

        if (newRefresh) {
          setRefreshToken(newRefresh);
        }

        // Retry original request with new access token
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        return api(originalRequest);
      } catch (err) {
        // Refresh failed → logout user
        clearTokens();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;