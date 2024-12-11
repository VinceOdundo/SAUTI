import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const submitVerification = async (formData) => {
  try {
    const response = await axios.post(
      `${API_URL}/verification/submit`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getVerificationStatus = async () => {
  try {
    const response = await axios.get(`${API_URL}/verification/status`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getPendingVerifications = async (
  status = "pending",
  page = 1,
  limit = 10
) => {
  try {
    const response = await axios.get(
      `${API_URL}/verification/pending?status=${status}&page=${page}&limit=${limit}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const reviewVerification = async (id, data) => {
  try {
    const response = await axios.post(
      `${API_URL}/verification/${id}/review`,
      data,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getDocument = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/verification/${id}/document`, {
      withCredentials: true,
      responseType: "blob",
    });
    return URL.createObjectURL(response.data);
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
