const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getNotifications,
  markAsRead,
  createSystemNotification,
} = require("../controllers/notificationController");
const {
  getPreferences,
  updatePreferences,
  resetPreferences,
} = require("../controllers/notificationPreferenceController");

// All routes are protected
router.use(protect);

// Notification routes
router.get("/", getNotifications);
router.put("/:id/read", markAsRead);
router.post("/system", createSystemNotification);

// Preference routes
router.get("/preferences", getPreferences);
router.put("/preferences", updatePreferences);
router.post("/preferences/reset", resetPreferences);

module.exports = router;
