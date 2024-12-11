import axios from "axios";
import { API_URL } from "../../config";

const API = axios.create({
  baseURL: `${API_URL}/api/representatives`,
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Register as a representative
export const registerRepresentative = async (formData) => {
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

// Get representative details
export const getRepresentative = async (representativeId) => {
  try {
    const response = await API.get(`/${representativeId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update representative profile
export const updateRepresentative = async (representativeId, formData) => {
  try {
    const response = await API.patch(`/${representativeId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Follow a representative
export const followRepresentative = async (representativeId) => {
  try {
    const response = await API.post(`/${representativeId}/follow`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Unfollow a representative
export const unfollowRepresentative = async (representativeId) => {
  try {
    const response = await API.post(`/${representativeId}/unfollow`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get representative statistics
export const getRepresentativeStats = async (representativeId) => {
  try {
    const response = await API.get(`/${representativeId}/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get representative's followers
export const getRepresentativeFollowers = async (representativeId) => {
  try {
    const response = await API.get(`/${representativeId}/followers`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get representative's activities
export const getRepresentativeActivities = async (representativeId) => {
  try {
    const response = await API.get(`/${representativeId}/activities`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
