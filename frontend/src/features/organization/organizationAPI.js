import api from "../../utils/axiosConfig";
import {
  organizationStart,
  organizationSuccess,
  organizationFail,
} from "./organizationSlice";

export const registerOrganization = (formData) => async (dispatch) => {
  try {
    dispatch(organizationStart());
    const response = await api.post("/organizations/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    dispatch(organizationSuccess(response.data.organization));
    return { success: true };
  } catch (error) {
    dispatch(
      organizationFail(
        error.response?.data?.message || "Failed to register organization"
      )
    );
    return { success: false, error: error.response?.data?.message };
  }
};

export const getOrganization = (organizationId) => async (dispatch) => {
  try {
    dispatch(organizationStart());
    const response = await api.get(`/organizations/${organizationId}`);
    dispatch(organizationSuccess(response.data.organization));
    return { success: true };
  } catch (error) {
    dispatch(
      organizationFail(
        error.response?.data?.message || "Failed to fetch organization"
      )
    );
    return { success: false, error: error.response?.data?.message };
  }
};

export const updateOrganization =
  (organizationId, formData) => async (dispatch) => {
    try {
      dispatch(organizationStart());
      const response = await api.patch(
        `/organizations/${organizationId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      dispatch(organizationSuccess(response.data.organization));
      return { success: true };
    } catch (error) {
      dispatch(
        organizationFail(
          error.response?.data?.message || "Failed to update organization"
        )
      );
      return { success: false, error: error.response?.data?.message };
    }
  };

export const verifyOrganization =
  (organizationId, verificationData) => async (dispatch) => {
    try {
      dispatch(organizationStart());
      const response = await api.post(
        `/organizations/${organizationId}/verify`,
        verificationData
      );
      dispatch(organizationSuccess(response.data.organization));
      return { success: true };
    } catch (error) {
      dispatch(
        organizationFail(
          error.response?.data?.message || "Failed to verify organization"
        )
      );
      return { success: false, error: error.response?.data?.message };
    }
  };

export const addRepresentative =
  (organizationId, representativeData) => async (dispatch) => {
    try {
      dispatch(organizationStart());
      const response = await api.post(
        `/organizations/${organizationId}/representatives`,
        representativeData
      );
      dispatch(organizationSuccess(response.data.organization));
      return { success: true };
    } catch (error) {
      dispatch(
        organizationFail(
          error.response?.data?.message || "Failed to add representative"
        )
      );
      return { success: false, error: error.response?.data?.message };
    }
  };
