import { authStart, authSuccess, authFail } from "./authSlice";
import { setAuthToken } from "../../utils/authUtils";
import api from "../../utils/axiosConfig";

export const register = (userData) => async (dispatch) => {
  try {
    dispatch(authStart());
    const response = await api.post("/auth/register", userData);
    setAuthToken(response.data.token);
    dispatch(authSuccess(response.data.user));
  } catch (error) {
    dispatch(authFail(error.response?.data?.message || "Registration failed"));
  }
};

export const login = (credentials) => async (dispatch) => {
  try {
    dispatch(authStart());
    const response = await api.post("/auth/login", credentials);
    localStorage.setItem("token", response.data.token);
    dispatch(authSuccess(response.data.user));
  } catch (error) {
    dispatch(authFail(error.response?.data?.message || "Login failed"));
  }
};

export const getCurrentUser = () => async (dispatch) => {
  try {
    dispatch(authStart());
    const response = await api.get("/auth/me");
    dispatch(authSuccess(response.data.user));
  } catch (error) {
    dispatch(authFail(error.response?.data?.message || "Failed to fetch user"));
  }
};
