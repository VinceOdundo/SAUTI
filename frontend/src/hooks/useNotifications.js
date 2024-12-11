import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { useToast } from "../contexts/ToastContext";
import { API_BASE_URL } from "../config";

export const useNotifications = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      setError(err.message);
      addToast({
        message: "Failed to load notifications",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, addToast]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/notifications/${notificationId}/read`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to mark notification as read");
        }

        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        addToast({
          message: "Failed to mark notification as read",
          type: "error",
        });
      }
    },
    [addToast]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      addToast({
        message: "Failed to mark all notifications as read",
        type: "error",
      });
    }
  }, [addToast]);

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/notifications/${notificationId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete notification");
        }

        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== notificationId)
        );
        setUnreadCount((prev) =>
          notifications.find((n) => n.id === notificationId && !n.read)
            ? prev - 1
            : prev
        );
      } catch (err) {
        addToast({
          message: "Failed to delete notification",
          type: "error",
        });
      }
    },
    [notifications, addToast]
  );

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  // WebSocket connection for real-time notifications
  useEffect(() => {
    if (!user) return;

    const ws = new WebSocket(
      `${
        process.env.REACT_APP_WS_URL
      }/notifications?token=${localStorage.getItem("token")}`
    );

    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      addToast({
        message: notification.message,
        type: "info",
      });
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, [user, addToast]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
};
