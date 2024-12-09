import api from "../../utils/axiosConfig";
import {
  representativeStart,
  representativeSuccess,
  representativeFail,
  setRepresentativeStats,
} from "./representativeSlice";

export const registerRepresentative = (formData) => async (dispatch) => {
  try {
    dispatch(representativeStart());
    const response = await api.post("/representatives/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    dispatch(representativeSuccess(response.data.representative));
    return { success: true };
  } catch (error) {
    dispatch(
      representativeFail(
        error.response?.data?.message || "Failed to register as representative"
      )
    );
    return { success: false, error: error.response?.data?.message };
  }
};

export const getRepresentative = (representativeId) => async (dispatch) => {
  try {
    dispatch(representativeStart());
    const response = await api.get(`/representatives/${representativeId}`);
    dispatch(representativeSuccess(response.data.representative));
    return { success: true };
  } catch (error) {
    dispatch(
      representativeFail(
        error.response?.data?.message || "Failed to fetch representative"
      )
    );
    return { success: false, error: error.response?.data?.message };
  }
};

export const updateRepresentative =
  (representativeId, formData) => async (dispatch) => {
    try {
      dispatch(representativeStart());
      const response = await api.patch(
        `/representatives/${representativeId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      dispatch(representativeSuccess(response.data.representative));
      return { success: true };
    } catch (error) {
      dispatch(
        representativeFail(
          error.response?.data?.message || "Failed to update representative"
        )
      );
      return { success: false, error: error.response?.data?.message };
    }
  };

export const verifyRepresentative =
  (representativeId, verificationData) => async (dispatch) => {
    try {
      dispatch(representativeStart());
      const response = await api.post(
        `/representatives/${representativeId}/verify`,
        verificationData
      );
      dispatch(representativeSuccess(response.data.representative));
      return { success: true };
    } catch (error) {
      dispatch(
        representativeFail(
          error.response?.data?.message || "Failed to verify representative"
        )
      );
      return { success: false, error: error.response?.data?.message };
    }
  };

export const followRepresentative = (representativeId) => async (dispatch) => {
  try {
    dispatch(representativeStart());
    const response = await api.post(
      `/representatives/${representativeId}/follow`
    );
    dispatch(representativeSuccess(response.data.representative));
    return { success: true };
  } catch (error) {
    dispatch(
      representativeFail(
        error.response?.data?.message || "Failed to follow representative"
      )
    );
    return { success: false, error: error.response?.data?.message };
  }
};

export const unfollowRepresentative =
  (representativeId) => async (dispatch) => {
    try {
      dispatch(representativeStart());
      const response = await api.post(
        `/representatives/${representativeId}/unfollow`
      );
      dispatch(representativeSuccess(response.data.representative));
      return { success: true };
    } catch (error) {
      dispatch(
        representativeFail(
          error.response?.data?.message || "Failed to unfollow representative"
        )
      );
      return { success: false, error: error.response?.data?.message };
    }
  };

export const getRepresentativeStats = () => async (dispatch) => {
  try {
    dispatch(representativeStart());
    const response = await api.get("/representatives/stats");
    dispatch(setRepresentativeStats(response.data));
    return { success: true };
  } catch (error) {
    dispatch(
      representativeFail(
        error.response?.data?.message || "Failed to fetch representative stats"
      )
    );
    return { success: false, error: error.response?.data?.message };
  }
};
