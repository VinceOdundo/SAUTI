import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../../contexts/ToastContext";
import AppLayout from "../layouts/AppLayout";
import axios from "axios";

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread
  const { showToast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/notifications?filter=${filter}`);
      setNotifications(response.data);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to fetch notifications",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.post(`/notifications/${notificationId}/read`);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to mark notification as read",
        "error"
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post("/notifications/read-all");
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
      showToast("All notifications marked as read", "success");
    } catch (error) {
      showToast(
        error.response?.data?.message ||
          "Failed to mark all notifications as read",
        "error"
      );
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        );
      case "comment":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        );
      case "follow":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        );
    }
  };

  return (
    <AppLayout>
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Notifications</h1>
            <p className="text-secondary mt-1">
              Stay updated with your latest activities
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/notifications/preferences" className="btn btn-secondary">
              Preferences
            </Link>
            <button
              onClick={markAllAsRead}
              className="btn btn-primary"
              disabled={!notifications.some((n) => !n.read)}
            >
              Mark All as Read
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-base ${
                filter === "all"
                  ? "bg-accent-primary text-white"
                  : "text-secondary hover:text-primary hover:bg-hover-bg"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-base ${
                filter === "unread"
                  ? "bg-accent-primary text-white"
                  : "text-secondary hover:text-primary hover:bg-hover-bg"
              }`}
            >
              Unread
            </button>
          </div>
        </div>

        {/* Notifications */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-primary border-t-transparent"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-info-bg text-info-text mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-primary mb-2">
              No Notifications
            </h3>
            <p className="text-secondary">
              {filter === "unread"
                ? "You have no unread notifications"
                : "You have no notifications yet"}
            </p>
          </div>
        ) : (
          <div className="card divide-y divide-border">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start space-x-4 p-4 hover:bg-hover-bg transition-base ${
                  !notification.read ? "bg-base-secondary" : ""
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    !notification.read
                      ? "bg-accent-primary text-white"
                      : "bg-base-secondary text-secondary"
                  }`}
                >
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-primary">
                        <Link
                          to={`/profile/${notification.actor.id}`}
                          className="font-medium hover:text-accent transition-base"
                        >
                          {notification.actor.username}
                        </Link>{" "}
                        {notification.message}
                      </p>
                      <p className="text-sm text-secondary mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-sm text-accent hover:text-accent -secondary transition-base"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                  {notification.content && (
                    <p className="mt-2 text-secondary line-clamp-2">
                      {notification.content}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default NotificationList;
