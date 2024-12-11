import React, { useState, useEffect, useContext } from "react";
import { ToastContext } from "../../contexts/ToastContext";
import { useSocket } from "../../contexts/SocketContext";

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useContext(ToastContext);
  const { socket } = useSocket();

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Listen for new notifications
    socket.on("notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      showToast(notification.title, "info");
    });

    // Listen for system notifications
    socket.on("system_notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      showToast(notification.title, "info");
    });

    return () => {
      socket.off("notification");
      socket.off("system_notification");
    };
  }, [socket, showToast]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications);
      } else {
        showToast(data.message || "Failed to fetch notifications", "error");
      }
    } catch (error) {
      showToast("Error fetching notifications", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === id ? { ...notif, read: true } : notif
          )
        );
      }
    } catch (error) {
      showToast("Error marking notification as read", "error");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "profile_update":
        return "👤";
      case "email_verified":
        return "✉️";
      case "role_update":
        return "🔑";
      case "system_notification":
        return "🔔";
      case "mention":
        return "📢";
      case "comment":
        return "💬";
      default:
        return "📌";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Notifications</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No notifications yet
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 hover:bg-gray-50 ${
                !notification.read ? "bg-blue-50" : ""
              }`}
              onClick={() => !notification.read && markAsRead(notification._id)}
            >
              <div className="flex items-start space-x-3">
                <div className="text-xl">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-sm text-gray-600">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationList;
