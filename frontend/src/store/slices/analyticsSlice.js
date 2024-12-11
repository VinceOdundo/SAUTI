import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const fetchAnalyticsOverview = createAsyncThunk(
  "analytics/fetchOverview",
  async ({ period = "7d" }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/analytics/overview`, {
        params: { period },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch analytics overview"
      );
    }
  }
);

export const fetchUserEngagement = createAsyncThunk(
  "analytics/fetchUserEngagement",
  async ({ period = "7d", type = "all" }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/analytics/engagement`, {
        params: { period, type },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user engagement data"
      );
    }
  }
);

export const fetchContentMetrics = createAsyncThunk(
  "analytics/fetchContentMetrics",
  async ({ period = "7d", contentType = "all" }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/analytics/content`, {
        params: { period, contentType },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch content metrics"
      );
    }
  }
);

export const generateReport = createAsyncThunk(
  "analytics/generateReport",
  async ({ type, period, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/analytics/reports`, {
        type,
        period,
        filters,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to generate report"
      );
    }
  }
);

const initialState = {
  overview: {
    data: null,
    loading: false,
    error: null,
  },
  userEngagement: {
    data: null,
    loading: false,
    error: null,
  },
  contentMetrics: {
    data: null,
    loading: false,
    error: null,
  },
  reports: {
    data: null,
    loading: false,
    error: null,
  },
  filters: {
    period: "7d",
    contentType: "all",
    engagementType: "all",
  },
};

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearAnalyticsData: (state) => {
      state.overview.data = null;
      state.userEngagement.data = null;
      state.contentMetrics.data = null;
      state.reports.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Overview
      .addCase(fetchAnalyticsOverview.pending, (state) => {
        state.overview.loading = true;
        state.overview.error = null;
      })
      .addCase(fetchAnalyticsOverview.fulfilled, (state, action) => {
        state.overview.loading = false;
        state.overview.data = action.payload;
      })
      .addCase(fetchAnalyticsOverview.rejected, (state, action) => {
        state.overview.loading = false;
        state.overview.error = action.payload;
      })
      // User Engagement
      .addCase(fetchUserEngagement.pending, (state) => {
        state.userEngagement.loading = true;
        state.userEngagement.error = null;
      })
      .addCase(fetchUserEngagement.fulfilled, (state, action) => {
        state.userEngagement.loading = false;
        state.userEngagement.data = action.payload;
      })
      .addCase(fetchUserEngagement.rejected, (state, action) => {
        state.userEngagement.loading = false;
        state.userEngagement.error = action.payload;
      })
      // Content Metrics
      .addCase(fetchContentMetrics.pending, (state) => {
        state.contentMetrics.loading = true;
        state.contentMetrics.error = null;
      })
      .addCase(fetchContentMetrics.fulfilled, (state, action) => {
        state.contentMetrics.loading = false;
        state.contentMetrics.data = action.payload;
      })
      .addCase(fetchContentMetrics.rejected, (state, action) => {
        state.contentMetrics.loading = false;
        state.contentMetrics.error = action.payload;
      })
      // Reports
      .addCase(generateReport.pending, (state) => {
        state.reports.loading = true;
        state.reports.error = null;
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.reports.loading = false;
        state.reports.data = action.payload;
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.reports.loading = false;
        state.reports.error = action.payload;
      });
  },
});

export const { setFilters, clearAnalyticsData } = analyticsSlice.actions;

export default analyticsSlice.reducer;
