import axios from "axios";
import { API_URL } from "../../config";

const API = axios.create({
  baseURL: `${API_URL}/admin`,
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get dashboard statistics
export const getStats = async () => {
  try {
    const response = await API.get("/stats");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get activity trends
export const getActivityTrends = async (timeRange = "week") => {
  try {
    const response = await API.get("/activity", { params: { timeRange } });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get verification requests
export const getVerificationRequests = async (
  type = "all",
  status = "pending"
) => {
  try {
    const response = await API.get("/verification-requests", {
      params: { type, status },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Verify a document
export const verifyDocument = async (data) => {
  try {
    const response = await API.post("/verify-document", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get reported content
export const getReportedContent = async (type = "all", status = "pending") => {
  try {
    const response = await API.get("/reported-content", {
      params: { type, status },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Moderate content
export const moderateContent = async (reportId, action) => {
  try {
    const response = await API.post("/moderate", { reportId, action });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get users list
export const getUsers = async (filters = {}) => {
  try {
    const response = await API.get("/users", { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Manage user
export const manageUser = async (userId, action) => {
  try {
    const response = await API.post("/manage-user", { userId, action });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get system logs
export const getSystemLogs = async (startDate, endDate) => {
  try {
    const response = await API.get("/logs", {
      params: { startDate, endDate },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get system health status
export const getSystemHealth = async () => {
  try {
    const response = await API.get("/health");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
