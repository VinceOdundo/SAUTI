import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
  Divider,
  Button,
} from "@mui/material";
import {
  NotificationsOutlined,
  NotificationsActive,
  CheckCircleOutline,
  Delete,
} from "@mui/icons-material";
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../store/slices/notificationSlice";
import { formatDistanceToNow } from "date-fns";

const NotificationBell = () => {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const { notifications, unreadCount, loading } = useSelector(
    (state) => state.notifications
  );
  const menuRef = useRef(null);

  useEffect(() => {
    if (anchorEl) {
      dispatch(fetchNotifications({ page: 1, limit: 10 }));
    }
  }, [anchorEl, dispatch]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (notificationId) => {
    await dispatch(markAsRead(notificationId));
  };

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllAsRead());
  };

  const handleDelete = async (notificationId) => {
    await dispatch(deleteNotification(notificationId));
  };

  const renderNotificationContent = (notification) => {
    const { type, content, createdAt } = notification;
    const timeAgo = formatDistanceToNow(new Date(createdAt), {
      addSuffix: true,
    });

    return (
      <Box sx={{ width: "100%" }}>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          {content}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {timeAgo}
        </Typography>
      </Box>
    );
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label={`${unreadCount} unread notifications`}
      >
        <Badge badgeContent={unreadCount} color="error">
          {unreadCount > 0 ? (
            <NotificationsActive />
          ) : (
            <NotificationsOutlined />
          )}
        </Badge>
      </IconButton>

      <Menu
        ref={menuRef}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 400,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ p: 2, display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              startIcon={<CheckCircleOutline />}
            >
              Mark all as read
            </Button>
          )}
        </Box>
        <Divider />

        {loading ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary">No notifications</Typography>
          </Box>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              sx={{
                py: 1.5,
                px: 2,
                backgroundColor: notification.read ? "inherit" : "action.hover",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  width: "100%",
                  alignItems: "flex-start",
                }}
              >
                {renderNotificationContent(notification)}
                <Box sx={{ ml: 1, display: "flex", gap: 1 }}>
                  {!notification.read && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id);
                      }}
                      sx={{ color: "primary.main" }}
                    >
                      <CheckCircleOutline fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notification.id);
                    }}
                    sx={{ color: "error.main" }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;
