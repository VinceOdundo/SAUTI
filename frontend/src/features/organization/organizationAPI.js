import axios from "axios";
import { API_URL } from "../../config";

const API = axios.create({
  baseURL: `${API_URL}/api/organizations`,
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Register a new organization
export const registerOrganization = async (formData) => {
  try {
    const response = await API.post("/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get organization details
export const getOrganization = async (organizationId) => {
  try {
    const response = await API.get(`/${organizationId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update organization
export const updateOrganization = async (organizationId, formData) => {
  try {
    const response = await API.patch(`/${organizationId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Add representative to organization
export const addRepresentative = async (organizationId, userData) => {
  try {
    const response = await API.post(
      `/${organizationId}/representatives`,
      userData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get organization representatives
export const getOrganizationRepresentatives = async (organizationId) => {
  try {
    const response = await API.get(`/${organizationId}/representatives`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get organization verification status
export const getVerificationStatus = async (organizationId) => {
  try {
    const response = await API.get(`/${organizationId}/verification-status`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get organization statistics
export const getOrganizationStats = async (organizationId) => {
  try {
    const response = await API.get(`/${organizationId}/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
