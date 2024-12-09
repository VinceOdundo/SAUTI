import axios from "axios";
import { API_URL } from "../../config";

const API = axios.create({
  baseURL: `${API_URL}/citizen`,
  withCredentials: true,
});

// Get citizen dashboard stats
export const getCitizenStats = async () => {
  const response = await API.get("/stats");
  return response.data;
};

// Get recent activity
export const getRecentActivity = async (params) => {
  const response = await API.get("/activity", { params });
  return response.data;
};

// Get followed organizations
export const getFollowedOrganizations = async () => {
  const response = await API.get("/organizations/following");
  return response.data;
};

// Get nearby organizations
export const getNearbyOrganizations = async (location) => {
  const response = await API.get("/organizations/nearby", {
    params: { location },
  });
  return response.data;
};

// Follow/unfollow organization
export const toggleFollowOrganization = async (organizationId) => {
  const response = await API.post(`/organizations/${organizationId}/follow`);
  return response.data;
};

// Get saved posts
export const getSavedPosts = async () => {
  const response = await API.get("/posts/saved");
  return response.data;
};

// Save/unsave post
export const toggleSavePost = async (postId) => {
  const response = await API.post(`/posts/${postId}/save`);
  return response.data;
};

// Get available local services
export const getLocalServices = async (params) => {
  const response = await API.get("/services", { params });
  return response.data;
};

// Get available surveys
export const getSurveys = async () => {
  const response = await API.get("/surveys");
  return response.data;
};

// Submit survey response
export const submitSurvey = async (surveyId, responses) => {
  const response = await API.post(`/surveys/${surveyId}/submit`, { responses });
  return response.data;
};

// Get impact tracking data
export const getImpactData = async (params) => {
  const response = await API.get("/impact", { params });
  return response.data;
};

// Get notifications
export const getNotifications = async () => {
  const response = await API.get("/notifications");
  return response.data;
};

// Mark notification as read
export const markNotificationRead = async (notificationId) => {
  const response = await API.post(`/notifications/${notificationId}/read`);
  return response.data;
};

// Update notification preferences
export const updateNotificationPreferences = async (preferences) => {
  const response = await API.put("/notifications/preferences", preferences);
  return response.data;
};
