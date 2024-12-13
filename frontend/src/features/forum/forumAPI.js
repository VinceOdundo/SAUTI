import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: "/forum",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Posts
export const getPosts = async (filter = "all", page = 1, limit = 10) => {
  const response = await api.get("/posts", {
    params: { filter, page, limit },
  });
  return response.data;
};

export const getPost = async (postId) => {
  const response = await api.get(`/posts/${postId}`);
  return response.data;
};

export const createPost = async (formData) => {
  const response = await api.post("/posts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updatePost = async (postId, formData) => {
  const response = await api.put(`/posts/${postId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deletePost = async (postId) => {
  const response = await api.delete(`/posts/${postId}`);
  return response.data;
};

export const likePost = async (postId) => {
  const response = await api.post(`/posts/${postId}/vote`, { type: "upvote" });
  return response.data;
};

export const unlikePost = async (postId) => {
  const response = await api.post(`/posts/${postId}/vote`, {
    type: "downvote",
  });
  return response.data;
};

// Comments
export const getComments = async (postId, page = 1, limit = 10) => {
  const response = await api.get(`/posts/${postId}/comments`, {
    params: { page, limit },
  });
  return response.data;
};

export const createComment = async (postId, content) => {
  const response = await api.post(`/posts/${postId}/comments`, { content });
  return response.data;
};

export const updateComment = async (postId, commentId, content) => {
  const response = await api.put(`/posts/${postId}/comments/${commentId}`, {
    content,
  });
  return response.data;
};

export const deleteComment = async (postId, commentId) => {
  const response = await api.delete(`/posts/${postId}/comments/${commentId}`);
  return response.data;
};

export const likeComment = async (postId, commentId) => {
  const response = await api.post(
    `/posts/${postId}/comments/${commentId}/vote`,
    {
      type: "upvote",
    }
  );
  return response.data;
};

export const unlikeComment = async (postId, commentId) => {
  const response = await api.post(
    `/posts/${postId}/comments/${commentId}/vote`,
    {
      type: "downvote",
    }
  );
  return response.data;
};

// Locations
export const getCounties = async () => {
  const response = await api.get("/locations/counties");
  return response.data;
};

export const getConstituencies = async (county) => {
  const response = await api.get(`/locations/constituencies/${county}`);
  return response.data;
};

export const getWards = async (constituency) => {
  const response = await api.get(`/locations/wards/${constituency}`);
  return response.data;
};

// Representatives
export const getRepresentatives = async (location) => {
  const response = await api.get("/representatives", {
    params: location,
  });
  return response.data;
};

export const getRepresentative = async (representativeId) => {
  const response = await api.get(`/representatives/${representativeId}`);
  return response.data;
};

export const followRepresentative = async (representativeId) => {
  const response = await api.post(
    `/representatives/${representativeId}/follow`
  );
  return response.data;
};

export const unfollowRepresentative = async (representativeId) => {
  const response = await api.delete(
    `/representatives/${representativeId}/follow`
  );
  return response.data;
};

// Search
export const search = async (query, type = "all", page = 1, limit = 10) => {
  const response = await api.get("/search", {
    params: { query, type, page, limit },
  });
  return response.data;
};

// Stats
export const getPublicStats = async () => {
  const response = await api.get("/stats/public");
  return response.data;
};

export const getUserStats = async (userId) => {
  const response = await api.get(`/stats/users/${userId}`);
  return response.data;
};

export default api;
