// src/config/axios.js or services/api.js

import axios from "axios";

const AxiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  timeout: 10000, // Request timeout in milliseconds
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  // withCredentials: true, // If you need to send cookies across domains
});

// Optional: Add request interceptor
AxiosClient.interceptors.request.use(
  (config) => {
    // Example: Add an authorization token if available
    const token = globalThis?.window?.localStorage.getItem("auth_token") ?? ""; // Or from your state management
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add response interceptor
AxiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Example: Handle global errors
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Handle unauthorized access, e.g., redirect to login
          console.error("Unauthorized access. Redirecting to login...");
          // window.location.href = '/login'; // Example: Redirect
          break;
        case 403:
          console.error("Forbidden. You do not have permission.");
          break;
        case 500:
          console.error("Server error. Please try again later.");
          break;
        default:
          console.error(
            `API Error: ${error.response.status} - ${
              error.response.data.message || error.message
            }`
          );
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error setting up request:", error.message);
    }
    return Promise.reject(error);
  }
);

export default AxiosClient;
