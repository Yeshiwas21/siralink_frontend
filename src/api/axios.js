import axios from "axios";

// Axios instance with cookie authentication enabled
const api = axios.create({
  baseURL: "http://192.168.100.63:8080/api",
  withCredentials: true,
});


// Prevent multiple refresh requests at the same time
let isRefreshing = false;

// Store requests waiting for token refresh
let failedQueue = [];


// Retry or reject queued requests after refresh completes
const processQueue = (error) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });

  failedQueue = [];
};


// Handle expired access tokens automatically
api.interceptors.response.use(
  response => response,

  async error => {
    const originalRequest = error.config;

    // Ignore non-auth errors and already retried requests
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url.includes("/token/refresh/")

    ) {
      return Promise.reject(error);
    }

    // Do not refresh after failed login
    if (
      originalRequest.url.includes(
        "/users/login/"
      )
    ) {
      return Promise.reject(error);
    }

    // Wait for the current refresh request
    if (isRefreshing) {

      return new Promise(
        (resolve, reject) => {

          failedQueue.push({
            resolve,
            reject,
          });

        }
      )
        .then(() => api(originalRequest))
        .catch(err => Promise.reject(err));

    }
    originalRequest._retry = true;
    isRefreshing = true;


    try {

      console.log("Trying token refresh...");

      // Refresh access cookie using HttpOnly refresh cookie
      await api.post(
        "/token/refresh/"
      );

      // Retry queued requests after successful refresh
      processQueue(null);


      return api(originalRequest);


    } catch (refreshError) {

      // Reject queued requests if refresh fails
      processQueue(refreshError);

      return Promise.reject(refreshError);


    } finally {

      isRefreshing = false;

    }

  }
);


export default api;