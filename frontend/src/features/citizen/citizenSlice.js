import { createSlice } from "@reduxjs/toolkit";
import {
  getCitizenStats,
  getRecentActivity,
  getFollowedOrganizations,
  getNearbyOrganizations,
  toggleFollowOrganization,
  getSavedPosts,
  toggleSavePost,
  getLocalServices,
  getSurveys,
  submitSurvey,
  getImpactData,
  getNotifications,
  markNotificationRead,
  updateNotificationPreferences,
} from "./citizenAPI";

const initialState = {
  stats: {
    organizations: {
      following: 0,
      nearby: 0,
    },
    posts: {
      participated: 0,
      saved: 0,
    },
    messages: {
      unread: 0,
      total: 0,
    },
    notifications: {
      unread: 0,
    },
  },
  recentActivity: [],
  followedOrganizations: [],
  nearbyOrganizations: [],
  savedPosts: [],
  localServices: [],
  surveys: [],
  impactData: null,
  notifications: [],
  notificationPreferences: {},
  loading: false,
  error: null,
};

const citizenSlice = createSlice({
  name: "citizen",
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
    setRecentActivity: (state, action) => {
      state.recentActivity = action.payload;
      state.loading = false;
      state.error = null;
    },
    setFollowedOrganizations: (state, action) => {
      state.followedOrganizations = action.payload;
      state.loading = false;
      state.error = null;
    },
    setNearbyOrganizations: (state, action) => {
      state.nearbyOrganizations = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateOrganizationFollowStatus: (state, action) => {
      const { organizationId, isFollowing } = action.payload;
      if (isFollowing) {
        state.stats.organizations.following += 1;
      } else {
        state.stats.organizations.following -= 1;
      }
      state.followedOrganizations = state.followedOrganizations.filter(
        (org) => org._id !== organizationId
      );
    },
    setSavedPosts: (state, action) => {
      state.savedPosts = action.payload;
      state.loading = false;
      state.error = null;
    },
    updatePostSaveStatus: (state, action) => {
      const { postId, isSaved } = action.payload;
      if (isSaved) {
        state.stats.posts.saved += 1;
      } else {
        state.stats.posts.saved -= 1;
      }
      state.savedPosts = state.savedPosts.filter((post) => post._id !== postId);
    },
    setLocalServices: (state, action) => {
      state.localServices = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSurveys: (state, action) => {
      state.surveys = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateSurveyStatus: (state, action) => {
      const { surveyId, status } = action.payload;
      state.surveys = state.surveys.map((survey) =>
        survey._id === surveyId ? { ...survey, status } : survey
      );
    },
    setImpactData: (state, action) => {
      state.impactData = action.payload;
      state.loading = false;
      state.error = null;
    },
    setNotifications: (state, action) => {
      state.notifications = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateNotificationStatus: (state, action) => {
      const { notificationId, isRead } = action.payload;
      state.notifications = state.notifications.map((notification) =>
        notification._id === notificationId
          ? { ...notification, isRead }
          : notification
      );
      if (isRead) {
        state.stats.notifications.unread -= 1;
      }
    },
    setNotificationPreferences: (state, action) => {
      state.notificationPreferences = action.payload;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  startLoading,
  hasError,
  setStats,
  setRecentActivity,
  setFollowedOrganizations,
  setNearbyOrganizations,
  updateOrganizationFollowStatus,
  setSavedPosts,
  updatePostSaveStatus,
  setLocalServices,
  setSurveys,
  updateSurveyStatus,
  setImpactData,
  setNotifications,
  updateNotificationStatus,
  setNotificationPreferences,
} = citizenSlice.actions;

// Thunk actions
export const fetchCitizenStats = () => async (dispatch) => {
  try {
    dispatch(startLoading());
    const data = await getCitizenStats();
    dispatch(setStats(data));
  } catch (error) {
    dispatch(hasError(error.response?.data?.message || error.message));
  }
};

export const fetchRecentActivity = (params) => async (dispatch) => {
  try {
    dispatch(startLoading());
    const data = await getRecentActivity(params);
    dispatch(setRecentActivity(data.activities));
  } catch (error) {
    dispatch(hasError(error.response?.data?.message || error.message));
  }
};

export const fetchFollowedOrganizations = () => async (dispatch) => {
  try {
    dispatch(startLoading());
    const data = await getFollowedOrganizations();
    dispatch(setFollowedOrganizations(data.organizations));
  } catch (error) {
    dispatch(hasError(error.response?.data?.message || error.message));
  }
};

export const fetchNearbyOrganizations = (location) => async (dispatch) => {
  try {
    dispatch(startLoading());
    const data = await getNearbyOrganizations(location);
    dispatch(setNearbyOrganizations(data.organizations));
  } catch (error) {
    dispatch(hasError(error.response?.data?.message || error.message));
  }
};

export const handleFollowOrganization =
  (organizationId) => async (dispatch) => {
    try {
      dispatch(startLoading());
      const data = await toggleFollowOrganization(organizationId);
      dispatch(
        updateOrganizationFollowStatus({
          organizationId,
          isFollowing: data.isFollowing,
        })
      );
      return { success: true };
    } catch (error) {
      dispatch(hasError(error.response?.data?.message || error.message));
      return { success: false, error: error.response?.data?.message };
    }
  };

export const fetchSavedPosts = () => async (dispatch) => {
  try {
    dispatch(startLoading());
    const data = await getSavedPosts();
    dispatch(setSavedPosts(data.posts));
  } catch (error) {
    dispatch(hasError(error.response?.data?.message || error.message));
  }
};

export const handleSavePost = (postId) => async (dispatch) => {
  try {
    dispatch(startLoading());
    const data = await toggleSavePost(postId);
    dispatch(
      updatePostSaveStatus({
        postId,
        isSaved: data.isSaved,
      })
    );
    return { success: true };
  } catch (error) {
    dispatch(hasError(error.response?.data?.message || error.message));
    return { success: false, error: error.response?.data?.message };
  }
};

export const fetchLocalServices = (params) => async (dispatch) => {
  try {
    dispatch(startLoading());
    const data = await getLocalServices(params);
    dispatch(setLocalServices(data.services));
  } catch (error) {
    dispatch(hasError(error.response?.data?.message || error.message));
  }
};

export const fetchSurveys = () => async (dispatch) => {
  try {
    dispatch(startLoading());
    const data = await getSurveys();
    dispatch(setSurveys(data.surveys));
  } catch (error) {
    dispatch(hasError(error.response?.data?.message || error.message));
  }
};

export const handleSubmitSurvey = (surveyId, responses) => async (dispatch) => {
  try {
    dispatch(startLoading());
    const data = await submitSurvey(surveyId, responses);
    dispatch(
      updateSurveyStatus({
        surveyId,
        status: "completed",
      })
    );
    return { success: true };
  } catch (error) {
    dispatch(hasError(error.response?.data?.message || error.message));
    return { success: false, error: error.response?.data?.message };
  }
};

export const fetchImpactData = (params) => async (dispatch) => {
  try {
    dispatch(startLoading());
    const data = await getImpactData(params);
    dispatch(setImpactData(data));
  } catch (error) {
    dispatch(hasError(error.response?.data?.message || error.message));
  }
};

export const fetchNotifications = () => async (dispatch) => {
  try {
    dispatch(startLoading());
    const data = await getNotifications();
    dispatch(setNotifications(data.notifications));
  } catch (error) {
    dispatch(hasError(error.response?.data?.message || error.message));
  }
};

export const handleMarkNotificationRead =
  (notificationId) => async (dispatch) => {
    try {
      dispatch(startLoading());
      await markNotificationRead(notificationId);
      dispatch(
        updateNotificationStatus({
          notificationId,
          isRead: true,
        })
      );
      return { success: true };
    } catch (error) {
      dispatch(hasError(error.response?.data?.message || error.message));
      return { success: false, error: error.response?.data?.message };
    }
  };

export const handleUpdateNotificationPreferences =
  (preferences) => async (dispatch) => {
    try {
      dispatch(startLoading());
      const data = await updateNotificationPreferences(preferences);
      dispatch(setNotificationPreferences(data.preferences));
      return { success: true };
    } catch (error) {
      dispatch(hasError(error.response?.data?.message || error.message));
      return { success: false, error: error.response?.data?.message };
    }
  };

export default citizenSlice.reducer;
