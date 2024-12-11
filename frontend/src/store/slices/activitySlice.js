import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const trackActivity = createAsyncThunk(
  "activity/trackActivity",
  async (activity, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/activity/track`, activity);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to track activity"
      );
    }
  }
);

export const fetchUserActivities = createAsyncThunk(
  "activity/fetchUserActivities",
  async ({ userId, page = 1, limit = 20, type }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/activity/user/${userId}`, {
        params: { page, limit, type },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user activities"
      );
    }
  }
);

export const fetchActivityStream = createAsyncThunk(
  "activity/fetchActivityStream",
  async ({ page = 1, limit = 20, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/activity/stream`, {
        params: { page, limit, ...filters },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch activity stream"
      );
    }
  }
);

export const fetchActivityStats = createAsyncThunk(
  "activity/fetchActivityStats",
  async ({ userId, period = "7d" }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/activity/stats/${userId}`, {
        params: { period },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch activity statistics"
      );
    }
  }
);

const initialState = {
  currentActivity: {
    data: null,
    loading: false,
    error: null,
  },
  userActivities: {
    data: [],
    total: 0,
    loading: false,
    error: null,
  },
  activityStream: {
    data: [],
    total: 0,
    loading: false,
    error: null,
  },
  stats: {
    data: null,
    loading: false,
    error: null,
  },
  filters: {
    period: "7d",
    type: "all",
    sortBy: "recent",
  },
};

const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearActivityData: (state) => {
      state.userActivities.data = [];
      state.activityStream.data = [];
      state.stats.data = null;
    },
    updateCurrentActivity: (state, action) => {
      state.currentActivity.data = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Track Activity
      .addCase(trackActivity.pending, (state) => {
        state.currentActivity.loading = true;
        state.currentActivity.error = null;
      })
      .addCase(trackActivity.fulfilled, (state, action) => {
        state.currentActivity.loading = false;
        state.currentActivity.data = action.payload;
      })
      .addCase(trackActivity.rejected, (state, action) => {
        state.currentActivity.loading = false;
        state.currentActivity.error = action.payload;
      })
      // Fetch User Activities
      .addCase(fetchUserActivities.pending, (state) => {
        state.userActivities.loading = true;
        state.userActivities.error = null;
      })
      .addCase(fetchUserActivities.fulfilled, (state, action) => {
        state.userActivities.loading = false;
        state.userActivities.data = action.payload.activities;
        state.userActivities.total = action.payload.total;
      })
      .addCase(fetchUserActivities.rejected, (state, action) => {
        state.userActivities.loading = false;
        state.userActivities.error = action.payload;
      })
      // Fetch Activity Stream
      .addCase(fetchActivityStream.pending, (state) => {
        state.activityStream.loading = true;
        state.activityStream.error = null;
      })
      .addCase(fetchActivityStream.fulfilled, (state, action) => {
        state.activityStream.loading = false;
        state.activityStream.data = action.payload.activities;
        state.activityStream.total = action.payload.total;
      })
      .addCase(fetchActivityStream.rejected, (state, action) => {
        state.activityStream.loading = false;
        state.activityStream.error = action.payload;
      })
      // Fetch Activity Stats
      .addCase(fetchActivityStats.pending, (state) => {
        state.stats.loading = true;
        state.stats.error = null;
      })
      .addCase(fetchActivityStats.fulfilled, (state, action) => {
        state.stats.loading = false;
        state.stats.data = action.payload;
      })
      .addCase(fetchActivityStats.rejected, (state, action) => {
        state.stats.loading = false;
        state.stats.error = action.payload;
      });
  },
});

export const { setFilters, clearActivityData, updateCurrentActivity } =
  activitySlice.actions;

export default activitySlice.reducer;
