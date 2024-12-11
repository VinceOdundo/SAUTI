import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { trackActivity } from "../store/slices/activitySlice";

const TRACKED_EVENTS = {
  PAGE_VIEW: "page_view",
  POST_CREATE: "post_create",
  POST_LIKE: "post_like",
  POST_COMMENT: "post_comment",
  MESSAGE_SEND: "message_send",
  PROFILE_UPDATE: "profile_update",
  SEARCH_QUERY: "search_query",
  CONTENT_SHARE: "content_share",
  REPORT_SUBMIT: "report_submit",
};

export const useActivity = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // Track page views automatically
  useEffect(() => {
    if (user) {
      dispatch(
        trackActivity({
          type: TRACKED_EVENTS.PAGE_VIEW,
          path: location.pathname,
          timestamp: new Date().toISOString(),
        })
      );
    }
  }, [dispatch, location.pathname, user]);

  const trackUserActivity = async (type, details = {}) => {
    if (!user) return;

    try {
      await dispatch(
        trackActivity({
          type,
          userId: user.id,
          timestamp: new Date().toISOString(),
          details: {
            path: location.pathname,
            ...details,
          },
        })
      ).unwrap();
    } catch (error) {
      console.error("Failed to track activity:", error);
    }
  };

  const trackPostCreate = (postId, title) => {
    trackUserActivity(TRACKED_EVENTS.POST_CREATE, { postId, title });
  };

  const trackPostLike = (postId) => {
    trackUserActivity(TRACKED_EVENTS.POST_LIKE, { postId });
  };

  const trackPostComment = (postId, commentId) => {
    trackUserActivity(TRACKED_EVENTS.POST_COMMENT, { postId, commentId });
  };

  const trackMessageSend = (recipientId, messageType) => {
    trackUserActivity(TRACKED_EVENTS.MESSAGE_SEND, {
      recipientId,
      messageType,
    });
  };

  const trackProfileUpdate = (updatedFields) => {
    trackUserActivity(TRACKED_EVENTS.PROFILE_UPDATE, { updatedFields });
  };

  const trackSearchQuery = (query, filters) => {
    trackUserActivity(TRACKED_EVENTS.SEARCH_QUERY, { query, filters });
  };

  const trackContentShare = (contentId, contentType, platform) => {
    trackUserActivity(TRACKED_EVENTS.CONTENT_SHARE, {
      contentId,
      contentType,
      platform,
    });
  };

  const trackReportSubmit = (contentId, contentType, reason) => {
    trackUserActivity(TRACKED_EVENTS.REPORT_SUBMIT, {
      contentId,
      contentType,
      reason,
    });
  };

  return {
    trackPostCreate,
    trackPostLike,
    trackPostComment,
    trackMessageSend,
    trackProfileUpdate,
    trackSearchQuery,
    trackContentShare,
    trackReportSubmit,
    trackCustomActivity: trackUserActivity,
  };
};

export const ACTIVITY_TYPES = TRACKED_EVENTS;
