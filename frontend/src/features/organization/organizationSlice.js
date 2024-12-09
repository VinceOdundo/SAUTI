import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  organization: null,
  loading: false,
  error: null,
  success: false,
};

const organizationSlice = createSlice({
  name: "organization",
  initialState,
  reducers: {
    organizationStart: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    organizationSuccess: (state, action) => {
      state.loading = false;
      state.organization = action.payload;
      state.success = true;
    },
    organizationFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    },
    clearOrganizationState: (state) => {
      state.organization = null;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    updateOrganizationState: (state, action) => {
      state.organization = {
        ...state.organization,
        ...action.payload,
      };
    },
  },
});

export const {
  organizationStart,
  organizationSuccess,
  organizationFail,
  clearOrganizationState,
  updateOrganizationState,
} = organizationSlice.actions;

export default organizationSlice.reducer;
