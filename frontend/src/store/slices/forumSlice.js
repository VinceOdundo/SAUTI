import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

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

      const response = await axios.get(`${API_URL}/forum/posts?${params}`);
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
      const response = await axios.get(`${API_URL}/forum/posts/${postId}`);
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
      const response = await axios.post(`${API_URL}/forum/posts`, postData);
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
      const response = await axios.put(
        `${API_URL}/forum/posts/${postId}`,
        postData
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
      await axios.delete(`${API_URL}/forum/posts/${postId}`);
      return postId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete post"
      );
    }
  }
);

export const createComment = createAsyncThunk(
  "forum/createComment",
  async ({ postId, content }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/forum/posts/${postId}/comments`,
        {
          content,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create comment"
      );
    }
  }
);

export const voteOnPost = createAsyncThunk(
  "forum/voteOnPost",
  async ({ postId, voteType }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/forum/posts/${postId}/vote`,
        {
          voteType,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to vote on post"
      );
    }
  }
);

const initialState = {
  posts: [],
  currentPost: null,
  totalPosts: 0,
  currentPage: 1,
  loading: false,
  error: null,
  categories: [
    "General",
    "Policy",
    "Infrastructure",
    "Education",
    "Healthcare",
    "Environment",
    "Economy",
    "Security",
  ],
};

const forumSlice = createSlice({
  name: "forum",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.posts;
        state.totalPosts = action.payload.total;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Single Post
      .addCase(fetchPostById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPost = action.payload;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Post
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
        state.totalPosts += 1;
      })
      // Update Post
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex(
          (post) => post.id === action.payload.id
        );
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        if (state.currentPost?.id === action.payload.id) {
          state.currentPost = action.payload;
        }
      })
      // Delete Post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((post) => post.id !== action.payload);
        state.totalPosts -= 1;
        if (state.currentPost?.id === action.payload) {
          state.currentPost = null;
        }
      })
      // Create Comment
      .addCase(createComment.fulfilled, (state, action) => {
        if (state.currentPost) {
          state.currentPost.comments.push(action.payload);
        }
      })
      // Vote on Post
      .addCase(voteOnPost.fulfilled, (state, action) => {
        const { postId, votes, userVote } = action.payload;
        const post = state.posts.find((p) => p.id === postId);
        if (post) {
          post.votes = votes;
          post.userVote = userVote;
        }
        if (state.currentPost?.id === postId) {
          state.currentPost.votes = votes;
          state.currentPost.userVote = userVote;
        }
      });
  },
});

export const { clearError, setCurrentPage, clearCurrentPost } =
  forumSlice.actions;
export default forumSlice.reducer;
