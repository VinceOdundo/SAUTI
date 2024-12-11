import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Async thunks for admin actions
export const fetchUsers = createAsyncThunk(
  "admin/fetchUsers",
  async (
    { page = 1, limit = 10, search = "", filters = {} },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get(`${API_URL}/admin/users`, {
        params: { page, limit, search, ...filters },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  "admin/updateUserStatus",
  async ({ userId, status }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/admin/users/${userId}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update user status"
      );
    }
  }
);

export const fetchContentModeration = createAsyncThunk(
  "admin/fetchContentModeration",
  async ({ page = 1, limit = 10, type = "all" }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/admin/moderation`, {
        params: { page, limit, type },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch content for moderation"
      );
    }
  }
);

export const moderateContent = createAsyncThunk(
  "admin/moderateContent",
  async ({ contentId, action, reason }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/admin/moderation/${contentId}`,
        {
          action,
          reason,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to moderate content"
      );
    }
  }
);

export const fetchAnalytics = createAsyncThunk(
  "admin/fetchAnalytics",
  async ({ period = "7d" }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/admin/analytics`, {
        params: { period },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch analytics"
      );
    }
  }
);

const initialState = {
  users: {
    data: [],
    total: 0,
    loading: false,
    error: null,
  },
  moderation: {
    items: [],
    total: 0,
    loading: false,
    error: null,
  },
  analytics: {
    data: null,
    loading: false,
    error: null,
  },
  filters: {
    userStatus: "all",
    contentType: "all",
    dateRange: "7d",
  },
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearErrors: (state) => {
      state.users.error = null;
      state.moderation.error = null;
      state.analytics.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Users
      .addCase(fetchUsers.pending, (state) => {
        state.users.loading = true;
        state.users.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users.loading = false;
        state.users.data = action.payload.users;
        state.users.total = action.payload.total;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.users.loading = false;
        state.users.error = action.payload;
      })
      // User Status Update
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const index = state.users.data.findIndex(
          (user) => user.id === action.payload.id
        );
        if (index !== -1) {
          state.users.data[index] = action.payload;
        }
      })
      // Content Moderation
      .addCase(fetchContentModeration.pending, (state) => {
        state.moderation.loading = true;
        state.moderation.error = null;
      })
      .addCase(fetchContentModeration.fulfilled, (state, action) => {
        state.moderation.loading = false;
        state.moderation.items = action.payload.items;
        state.moderation.total = action.payload.total;
      })
      .addCase(fetchContentModeration.rejected, (state, action) => {
        state.moderation.loading = false;
        state.moderation.error = action.payload;
      })
      // Analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.analytics.loading = true;
        state.analytics.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.analytics.loading = false;
        state.analytics.data = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.analytics.loading = false;
        state.analytics.error = action.payload;
      });
  },
});

export const { setFilters, clearErrors } = adminSlice.actions;

export default adminSlice.reducer;
