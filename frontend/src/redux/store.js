import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import forumReducer from "../features/forum/forumSlice";
import organizationReducer from "../features/organization/organizationSlice";
import representativeReducer from "../features/representative/representativeSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    forum: forumReducer,
    organization: organizationReducer,
    representative: representativeReducer,
  },
});

export default store;
