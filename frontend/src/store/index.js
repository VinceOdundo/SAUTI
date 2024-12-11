import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import forumReducer from "./slices/forumSlice";
import messageReducer from "./slices/messageSlice";
import uiReducer from "./slices/uiSlice";
import profileReducer from "./slices/profileSlice";
import searchReducer from "./slices/searchSlice";
import notificationReducer from "./slices/notificationSlice";
import adminReducer from "./slices/adminSlice";
import analyticsReducer from "./slices/analyticsSlice";
import activityReducer from "./slices/activitySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    forum: forumReducer,
    messages: messageReducer,
    ui: uiReducer,
    profile: profileReducer,
    search: searchReducer,
    notifications: notificationReducer,
    admin: adminReducer,
    analytics: analyticsReducer,
    activity: activityReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          "auth/login/fulfilled",
          "auth/logout/fulfilled",
          "profile/uploadAvatar/fulfilled",
        ],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});
