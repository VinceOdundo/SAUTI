import { createSlice } from "@reduxjs/toolkit";
import {
  getAdminStats,
  getActivityTrends,
  getVerificationRequests,
  verifyDocument,
  getReportedContent,
  moderateContent,
  getUsers,
  manageUser,
} from "./adminAPI";

const initialState = {
  stats: {
    users: { total: 0, verified: 0, pending: 0 },
    organizations: { total: 0, verified: 0, pending: 0 },
    representatives: { total: 0, verified: 0, pending: 0 },
    posts: { total: 0, reported: 0 },
    messages: { total: 0, today: 0 },
    reports: { total: 0, pending: 0 },
  },
  activityTrends: {
    userActivity: [],
    postActivity: [],
    messageActivity: [],
  },
  verificationRequests: [],
  reportedContent: [],
  users: [],
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    startLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    hasError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setStats: (state, action) => {
      state.stats = action.payload;
      state.loading = false;
      state.error = null;
    },
    setActivityTrends: (state, action) => {
      state.activityTrends = action.payload;
      state.loading = false;
      state.error = null;
    },
    setVerificationRequests: (state, action) => {
      state.verificationRequests = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateVerificationRequest: (state, action) => {
      const { requestId, updates } = action.payload;
      state.verificationRequests = state.verificationRequests.map((req) =>
        req._id === requestId ? { ...req, ...updates } : req
      );
    },
    setReportedContent: (state, action) => {
      state.reportedContent = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateReportedContent: (state, action) => {
      const { reportId, updates } = action.payload;
      state.reportedContent = state.reportedContent.map((report) =>
        report._id === reportId ? { ...report, ...updates } : report
      );
    },
    setUsers: (state, action) => {
      state.users = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateUser: (state, action) => {
      const { userId, updates } = action.payload;
      state.users = state.users.map((user) =>
        user._id === userId ? { ...user, ...updates } : user
      );
    },
  },
});

export const {
  startLoading,
  hasError,
  setStats,
  setActivityTrends,
  setVerificationRequests,
  updateVerificationRequest,
  setReportedContent,
  updateReportedContent,
  setUsers,
  updateUser,
} = adminSlice.actions;

// Thunk actions
export const fetchAdminStats = () => async (dispatch) => {
  try {
    dispatch(startLoading());
    const data = await getAdminStats();
    dispatch(setStats(data));
  } catch (error) {
    dispatch(hasError(error.response?.data?.message || error.message));
  }
};

export const fetchActivityTrends = (timeRange) => async (dispatch) => {
  try {
    dispatch(startLoading());
    const data = await getActivityTrends(timeRange);
    dispatch(setActivityTrends(data));
  } catch (error) {
    dispatch(hasError(error.response?.data?.message || error.message));
  }
};

export const fetchVerificationRequests = (params) => async (dispatch) => {
  try {
    dispatch(startLoading());
    const data = await getVerificationRequests(params);
    dispatch(setVerificationRequests(data.requests));
  } catch (error) {
    dispatch(hasError(error.response?.data?.message || error.message));
  }
};

export const handleVerifyDocument = (requestData) => async (dispatch) => {
  try {
    dispatch(startLoading());
    const data = await verifyDocument(requestData);
    dispatch(
      updateVerificationRequest({
        requestId: data.request._id,
        updates: data.request,
      })
    );
    return { success: true };
  } catch (error) {
    dispatch(hasError(error.response?.data?.message || error.message));
    return { success: false, error: error.response?.data?.message };
  }
};

export const fetchReportedContent = (params) => async (dispatch) => {
  try {
    dispatch(startLoading());
    const data = await getReportedContent(params);
    dispatch(setReportedContent(data.reports));
  } catch (error) {
    dispatch(hasError(error.response?.data?.message || error.message));
  }
};

export const handleModerateContent = (moderationData) => async (dispatch) => {
  try {
    dispatch(startLoading());
    const data = await moderateContent(moderationData);
    dispatch(
      updateReportedContent({
        reportId: data.report._id,
        updates: data.report,
      })
    );
    return { success: true };
  } catch (error) {
    dispatch(hasError(error.response?.data?.message || error.message));
    return { success: false, error: error.response?.data?.message };
  }
};

export const fetchUsers = (params) => async (dispatch) => {
  try {
    dispatch(startLoading());
    const data = await getUsers(params);
    dispatch(setUsers(data.users));
  } catch (error) {
    dispatch(hasError(error.response?.data?.message || error.message));
  }
};

export const handleManageUser = (userData) => async (dispatch) => {
  try {
    dispatch(startLoading());
    const data = await manageUser(userData);
    dispatch(
      updateUser({
        userId: data.user._id,
        updates: data.user,
      })
    );
    return { success: true };
  } catch (error) {
    dispatch(hasError(error.response?.data?.message || error.message));
    return { success: false, error: error.response?.data?.message };
  }
};

export default adminSlice.reducer;
