import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  representative: null,
  loading: false,
  error: null,
  success: false,
  stats: null,
};

const representativeSlice = createSlice({
  name: "representative",
  initialState,
  reducers: {
    representativeStart: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    representativeSuccess: (state, action) => {
      state.loading = false;
      state.representative = action.payload;
      state.success = true;
    },
    representativeFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    },
    clearRepresentativeState: (state) => {
      state.representative = null;
      state.loading = false;
      state.error = null;
      state.success = false;
      state.stats = null;
    },
    updateRepresentativeState: (state, action) => {
      state.representative = {
        ...state.representative,
        ...action.payload,
      };
    },
    setRepresentativeStats: (state, action) => {
      state.stats = action.payload;
    },
  },
});

export const {
  representativeStart,
  representativeSuccess,
  representativeFail,
  clearRepresentativeState,
  updateRepresentativeState,
  setRepresentativeStats,
} = representativeSlice.actions;

export default representativeSlice.reducer;
