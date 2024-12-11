import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data);
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const { token, user: userData } = response.data;
      localStorage.setItem("token", token);
      setUser(userData);

      // Configure axios defaults for future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      return userData;
    } catch (error) {
      setError(
        error.response?.data?.message || "An error occurred during login"
      );
      throw error;
    }
  };

  const register = async (formData) => {
    try {
      setError(null);
      const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { token, user: userData } = response.data;
      localStorage.setItem("token", token);
      setUser(userData);

      // Configure axios defaults for future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      return userData;
    } catch (error) {
      setError(
        error.response?.data?.message || "An error occurred during registration"
      );
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await axios.put(
        `${API_BASE_URL}/auth/profile`,
        profileData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUser(response.data);
      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "An error occurred while updating profile"
      );
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      setError(null);
      await axios.post(`${API_BASE_URL}/auth/reset-password`, { email });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "An error occurred while requesting password reset"
      );
      throw error;
    }
  };

  const confirmResetPassword = async (token, password) => {
    try {
      setError(null);
      await axios.post(`${API_BASE_URL}/auth/reset-password/${token}`, {
        password,
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "An error occurred while resetting password"
      );
      throw error;
    }
  };

  const verifyEmail = async (token) => {
    try {
      setError(null);
      const response = await axios.post(
        `${API_BASE_URL}/auth/verify-email/${token}`
      );
      setUser(response.data);
      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "An error occurred while verifying email"
      );
      throw error;
    }
  };

  const resendVerificationEmail = async () => {
    try {
      setError(null);
      await axios.post(`${API_BASE_URL}/auth/resend-verification`);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "An error occurred while resending verification email"
      );
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    resetPassword,
    confirmResetPassword,
    verifyEmail,
    resendVerificationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
