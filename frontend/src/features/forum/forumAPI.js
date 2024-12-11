import axios from "axios";
import { API_URL } from "../../config";

const API = axios.create({
  baseURL: `${API_URL}/api/forum`,
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("Token in interceptor:", token); // Debug log

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log("Final headers:", config.headers); // Debug log
  return config;
});

// Create a new post
export const createPost = async (formData) => {
  try {
    const token = localStorage.getItem("token");
    console.log("Token in createPost:", token); // Debug log

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await API.post("/posts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Post creation error details:", {
      error: error.response?.data || error,
      status: error.response?.status,
      headers: error.response?.headers,
    });
    throw error.response?.data || error;
  }
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
  const response = await API.patch(`/posts/${postId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
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

// Reshare a post
export const resharePost = async (postId, commentary) => {
  const response = await API.post(`/posts/${postId}/reshare`, { commentary });
  return response.data;
};

// Search posts
export const searchPosts = async (query) => {
  const response = await API.get("/posts", {
    params: {
      search: query,
      sort: "relevance",
    },
  });
  return response.data;
};

// Get trending hashtags
export const getTrendingHashtags = async () => {
  const response = await API.get("/posts/trending-hashtags");
  return response.data;
};

// Get post analytics (for representatives)
export const getPostAnalytics = async (postId) => {
  const response = await API.get(`/posts/${postId}/analytics`);
  return response.data;
};
