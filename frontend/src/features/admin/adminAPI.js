import axios from "axios";
import { API_URL } from "../../config";

const API = axios.create({
  baseURL: `${API_URL}/admin`,
  withCredentials: true,
});

// Get admin dashboard stats
export const getAdminStats = async () => {
  const response = await API.get("/stats");
  return response.data;
};

// Get activity trends
export const getActivityTrends = async (timeRange) => {
  const response = await API.get("/activity", {
    params: { timeRange },
  });
  return response.data;
};

// Get verification requests
export const getVerificationRequests = async (params) => {
  const response = await API.get("/verification-requests", { params });
  return response.data;
};

// Verify document
export const verifyDocument = async (data) => {
  const response = await API.post("/verify-document", data);
  return response.data;
};

// Get reported content
export const getReportedContent = async (params) => {
  const response = await API.get("/reported-content", { params });
  return response.data;
};

// Moderate content
export const moderateContent = async (data) => {
  const response = await API.post("/moderate", data);
  return response.data;
};

// Get users for management
export const getUsers = async (params) => {
  const response = await API.get("/users", { params });
  return response.data;
};

// Manage user
export const manageUser = async (data) => {
  const response = await API.post("/manage-user", data);
  return response.data;
};
