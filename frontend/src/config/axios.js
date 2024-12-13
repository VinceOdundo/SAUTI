import axios from "axios";

// Create axios instance with custom config
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true, // Important for handling cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor
instance.interceptors.request.use(
  (config) => {
    // Get token from localStorage or cookie
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error status is 401 and there is no originalRequest._retry flag,
    // it means the token has expired and we need to refresh it
    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      error.response.data.code === "TOKEN_EXPIRED"
    ) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const response = await instance.post("/auth/refresh-token");
        const { accessToken } = response.data;

        // Store the new token
        localStorage.setItem("token", accessToken);

        // Update the authorization header
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

        // Retry the original request
        return instance(originalRequest);
      } catch (error) {
        // If refresh token fails, redirect to login
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
