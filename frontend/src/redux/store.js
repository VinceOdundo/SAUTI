import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import organizationReducer from "../features/organization/organizationSlice";
import representativeReducer from "../features/representative/representativeSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    organization: organizationReducer,
    representative: representativeReducer,
  },
});

export default store;
