const Notification = require("../models/Notification");
const socketService = require("../services/socketService");

// Get user notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.read = true;
    await notification.save();

    res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error marking notification as read",
      error: error.message,
    });
  }
};

// Create notification utility function
exports.createNotification = async (data) => {
  try {
    const notification = new Notification(data);
    await notification.save();

    // Send real-time notification
    socketService.sendNotification(data.recipient.toString(), notification);

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Create system notification
exports.createSystemNotification = async (req, res) => {
  try {
    const { title, message, priority = "low" } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    const notification = new Notification({
      type: "system_notification",
      title,
      message,
      priority,
    });

    await notification.save();

    // Broadcast to all connected users
    socketService.broadcastSystemNotification(notification);

    res.json({
      success: true,
      notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating system notification",
      error: error.message,
    });
  }
};
