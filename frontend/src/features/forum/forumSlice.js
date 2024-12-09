import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  posts: [],
  currentPost: null,
  loading: false,
  error: null,
  success: false,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
  },
  filters: {
    category: null,
    tags: [],
    location: null,
    visibility: "public",
    sort: "recent",
    search: "",
  },
};

const forumSlice = createSlice({
  name: "forum",
  initialState,
  reducers: {
    forumStart: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    forumSuccess: (state) => {
      state.loading = false;
      state.error = null;
      state.success = true;
    },
    forumFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    },
    setPosts: (state, action) => {
      state.posts = action.payload.posts;
      state.pagination = {
        currentPage: action.payload.currentPage,
        totalPages: action.payload.totalPages,
        total: action.payload.total,
      };
    },
    setCurrentPost: (state, action) => {
      state.currentPost = action.payload;
    },
    updatePost: (state, action) => {
      const updatedPost = action.payload;
      state.posts = state.posts.map((post) =>
        post._id === updatedPost._id ? updatedPost : post
      );
      if (state.currentPost?._id === updatedPost._id) {
        state.currentPost = updatedPost;
      }
    },
    addPost: (state, action) => {
      state.posts.unshift(action.payload);
    },
    removePost: (state, action) => {
      state.posts = state.posts.filter((post) => post._id !== action.payload);
      if (state.currentPost?._id === action.payload) {
        state.currentPost = null;
      }
    },
    addComment: (state, action) => {
      const { postId, comment } = action.payload;
      const post = state.posts.find((p) => p._id === postId);
      if (post) {
        post.comments.push(comment);
      }
      if (state.currentPost?._id === postId) {
        state.currentPost.comments.push(comment);
      }
    },
    updateComment: (state, action) => {
      const { postId, commentId, updates } = action.payload;
      const post = state.posts.find((p) => p._id === postId);
      if (post) {
        const comment = post.comments.find((c) => c._id === commentId);
        if (comment) {
          Object.assign(comment, updates);
        }
      }
      if (state.currentPost?._id === postId) {
        const comment = state.currentPost.comments.find(
          (c) => c._id === commentId
        );
        if (comment) {
          Object.assign(comment, updates);
        }
      }
    },
    removeComment: (state, action) => {
      const { postId, commentId } = action.payload;
      const post = state.posts.find((p) => p._id === postId);
      if (post) {
        post.comments = post.comments.filter((c) => c._id !== commentId);
      }
      if (state.currentPost?._id === postId) {
        state.currentPost.comments = state.currentPost.comments.filter(
          (c) => c._id !== commentId
        );
      }
    },
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearForumState: (state) => {
      return initialState;
    },
  },
});

export const {
  forumStart,
  forumSuccess,
  forumFail,
  setPosts,
  setCurrentPost,
  updatePost,
  addPost,
  removePost,
  addComment,
  updateComment,
  removeComment,
  setFilters,
  resetFilters,
  clearForumState,
} = forumSlice.actions;

export default forumSlice.reducer;
