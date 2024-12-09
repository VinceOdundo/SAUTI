import axios from "axios";
import { API_URL } from "../../config";

const API = axios.create({
  baseURL: `${API_URL}/forum`,
  withCredentials: true,
});

// Create a new post
export const createPost = async (formData) => {
  const response = await API.post("/posts", formData);
  return response.data;
};

// Get posts with filters and pagination
export const getPosts = async (params) => {
  const response = await API.get("/posts", { params });
  return response.data;
};

// Get a single post
export const getPost = async (postId) => {
  const response = await API.get(`/posts/${postId}`);
  return response.data;
};

// Update a post
export const updatePost = async (postId, formData) => {
  const response = await API.patch(`/posts/${postId}`, formData);
  return response.data;
};

// Delete a post
export const deletePost = async (postId) => {
  const response = await API.delete(`/posts/${postId}`);
  return response.data;
};

// Vote on a post
export const votePost = async (postId, vote) => {
  const response = await API.post(`/posts/${postId}/vote`, { vote });
  return response.data;
};

// Add a comment
export const addComment = async (postId, content) => {
  const response = await API.post(`/posts/${postId}/comments`, { content });
  return response.data;
};

// Vote on a comment
export const voteComment = async (postId, commentId, vote) => {
  const response = await API.post(
    `/posts/${postId}/comments/${commentId}/vote`,
    {
      vote,
    }
  );
  return response.data;
};

// Report a post
export const reportPost = async (postId, reason) => {
  const response = await API.post(`/posts/${postId}/report`, { reason });
  return response.data;
};

// Moderate a post (admin only)
export const moderatePost = async (postId, action, reason) => {
  const response = await API.post(`/posts/${postId}/moderate`, {
    action,
    reason,
  });
  return response.data;
};

// Vote on a poll
export const votePoll = async (postId, optionIndex) => {
  const response = await API.post(`/posts/${postId}/poll/vote`, {
    optionIndex,
  });
  return response.data;
};
