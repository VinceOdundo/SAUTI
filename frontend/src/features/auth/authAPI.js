import axios from "axios";
import { authStart, authSuccess, authFail } from "./authSlice";
import { setAuthToken } from "../../utils/authUtils";

const API_URL = "http://localhost:5000/api/auth";

export const register = (userData) => async (dispatch) => {
  try {
    dispatch(authStart());
    const response = await axios.post(`${API_URL}/register`, userData);
    setAuthToken(response.data.token);
    dispatch(authSuccess(response.data.user));
  } catch (error) {
    dispatch(authFail(error.response?.data?.message || "Registration failed"));
  }
};

export const login = (credentials) => async (dispatch) => {
  try {
    dispatch(authStart());
    const response = await axios.post(`${API_URL}/login`, credentials);
    setAuthToken(response.data.token);
    dispatch(authSuccess(response.data.user));
  } catch (error) {
    dispatch(authFail(error.response?.data?.message || "Login failed"));
  }
};

export const getCurrentUser = () => async (dispatch) => {
  try {
    dispatch(authStart());
    const response = await axios.get(`${API_URL}/me`);
    dispatch(authSuccess(response.data.user));
  } catch (error) {
    dispatch(authFail(error.response?.data?.message || "Failed to fetch user"));
  }
};
