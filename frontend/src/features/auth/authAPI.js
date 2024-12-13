import { authStart, authSuccess, authFail } from "./authSlice";
import { setAuthToken } from "../../utils/authUtils";
import api from "../../utils/axiosConfig";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../config";

export const register = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", userData);
      if (response.data.token) {
        setAuthToken(response.data.token);
        localStorage.setItem("token", response.data.token);
      }
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      console.error("Registration error:", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.put("/auth/profile", profileData);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update profile";
      console.error("Profile update error:", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to get user";
      console.error("Get current user error:", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", credentials);
      if (response.data.token) {
        setAuthToken(response.data.token);
        localStorage.setItem("token", response.data.token);
      }
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      console.error("Login error:", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("token");
      setAuthToken(null);
      return null;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Logout failed";
      console.error("Logout error:", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);
