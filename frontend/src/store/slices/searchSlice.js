import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const searchAll = createAsyncThunk(
  "search/searchAll",
  async ({ query, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/search`, {
        params: {
          q: query,
          ...filters,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Search failed");
    }
  }
);

export const searchPosts = createAsyncThunk(
  "search/searchPosts",
  async ({ query, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/search/posts`, {
        params: {
          q: query,
          ...filters,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Post search failed"
      );
    }
  }
);

export const searchUsers = createAsyncThunk(
  "search/searchUsers",
  async ({ query, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/search/users`, {
        params: {
          q: query,
          ...filters,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "User search failed"
      );
    }
  }
);

export const searchOrganizations = createAsyncThunk(
  "search/searchOrganizations",
  async ({ query, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/search/organizations`, {
        params: {
          q: query,
          ...filters,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Organization search failed"
      );
    }
  }
);

const initialState = {
  query: "",
  results: {
    posts: [],
    users: [],
    organizations: [],
  },
  filters: {
    type: "all", // all, posts, users, organizations
    sortBy: "relevance", // relevance, date, popularity
    timeRange: "all", // all, day, week, month, year
    category: "all",
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
  },
  loading: false,
  error: null,
  recentSearches: [],
  popularSearches: [],
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    clearResults: (state) => {
      state.results = initialState.results;
      state.pagination = initialState.pagination;
    },
    addRecentSearch: (state, action) => {
      const search = action.payload;
      state.recentSearches = [
        search,
        ...state.recentSearches.filter((s) => s !== search).slice(0, 9),
      ];
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
    },
    updatePopularSearches: (state, action) => {
      state.popularSearches = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Search All
      .addCase(searchAll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchAll.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.results;
        state.pagination = action.payload.pagination;
        if (state.query) {
          state.recentSearches = [
            state.query,
            ...state.recentSearches
              .filter((s) => s !== state.query)
              .slice(0, 9),
          ];
        }
      })
      .addCase(searchAll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search Posts
      .addCase(searchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.results.posts = action.payload.results;
        state.pagination = action.payload.pagination;
      })
      .addCase(searchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search Users
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.results.users = action.payload.results;
        state.pagination = action.payload.pagination;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search Organizations
      .addCase(searchOrganizations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchOrganizations.fulfilled, (state, action) => {
        state.loading = false;
        state.results.organizations = action.payload.results;
        state.pagination = action.payload.pagination;
      })
      .addCase(searchOrganizations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setQuery,
  setFilters,
  setPage,
  clearResults,
  addRecentSearch,
  clearRecentSearches,
  updatePopularSearches,
} = searchSlice.actions;

export default searchSlice.reducer;
