import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../config/api";

// Async thunks
export const fetchPosts = createAsyncThunk(
  "forum/fetchPosts",
  async ({ page = 1, limit = 10, category = null }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(category && { category }),
      });

      const response = await api.get(`/forum/posts?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch posts"
      );
    }
  }
);

export const fetchPostById = createAsyncThunk(
  "forum/fetchPostById",
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/forum/posts/${postId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch post"
      );
    }
  }
);

export const createPost = createAsyncThunk(
  "forum/createPost",
  async (postData, { rejectWithValue }) => {
    try {
      const config = {
        headers:
          postData instanceof FormData
            ? {
                "Content-Type": "multipart/form-data",
              }
            : undefined,
      };
      const response = await api.post("/forum/posts", postData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create post"
      );
    }
  }
);

export const updatePost = createAsyncThunk(
  "forum/updatePost",
  async ({ postId, postData }, { rejectWithValue }) => {
    try {
      const config = {
        headers:
          postData instanceof FormData
            ? {
                "Content-Type": "multipart/form-data",
              }
            : undefined,
      };
      const response = await api.put(
        `/forum/posts/${postId}`,
        postData,
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update post"
      );
    }
  }
);

export const deletePost = createAsyncThunk(
  "forum/deletePost",
  async (postId, { rejectWithValue }) => {
    try {
      await api.delete(`/forum/posts/${postId}`);
      return postId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete post"
      );
    }
  }
);

export const votePost = createAsyncThunk(
  "forum/votePost",
  async ({ postId, voteType }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/forum/posts/${postId}/vote`, {
        type: voteType,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to vote on post"
      );
    }
  }
);

export const commentOnPost = createAsyncThunk(
  "forum/commentOnPost",
  async ({ postId, content }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/forum/posts/${postId}/comments`, {
        content,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to comment on post"
      );
    }
  }
);

export const repostPost = createAsyncThunk(
  "forum/repostPost",
  async ({ postId, content }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/forum/posts/${postId}/reshare`, {
        content,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reshare post"
      );
    }
  }
);

// Slice definition
const forumSlice = createSlice({
  name: "forum",
  initialState: {
    posts: [],
    currentPost: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    },
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch posts
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.posts;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create post
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload.post);
      })
      // Update post
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex(
          (post) => post._id === action.payload.post._id
        );
        if (index !== -1) {
          state.posts[index] = action.payload.post;
        }
        if (state.currentPost?._id === action.payload.post._id) {
          state.currentPost = action.payload.post;
        }
      })
      // Delete post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((post) => post._id !== action.payload);
        if (state.currentPost?._id === action.payload) {
          state.currentPost = null;
        }
      })
      // Vote post
      .addCase(votePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex(
          (post) => post._id === action.payload.post._id
        );
        if (index !== -1) {
          state.posts[index] = action.payload.post;
        }
        if (state.currentPost?._id === action.payload.post._id) {
          state.currentPost = action.payload.post;
        }
      })
      // Comment on post
      .addCase(commentOnPost.fulfilled, (state, action) => {
        const index = state.posts.findIndex(
          (post) => post._id === action.payload.post._id
        );
        if (index !== -1) {
          state.posts[index] = action.payload.post;
        }
        if (state.currentPost?._id === action.payload.post._id) {
          state.currentPost = action.payload.post;
        }
      });
  },
});

export const { clearError, clearCurrentPost } = forumSlice.actions;

export default forumSlice.reducer;
