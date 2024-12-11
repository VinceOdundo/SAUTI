import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  theme: "light",
  sidebarOpen: false,
  activeModal: null,
  notifications: [],
  globalLoading: false,
  loadingStates: {},
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    openModal: (state, action) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload;
    },
    setLoadingState: (state, action) => {
      const { key, value } = action.payload;
      state.loadingStates[key] = value;
    },
    clearLoadingStates: (state) => {
      state.loadingStates = {};
    },
  },
});

export const {
  toggleTheme,
  toggleSidebar,
  setSidebarOpen,
  openModal,
  closeModal,
  addNotification,
  removeNotification,
  setGlobalLoading,
  setLoadingState,
  clearLoadingStates,
} = uiSlice.actions;

export default uiSlice.reducer;
