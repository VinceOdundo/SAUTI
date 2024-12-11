const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/authMiddleware");
const {
  getStats,
  getRecentActivity,
  getFollowedOrganizations,
  getNearbyOrganizations,
  toggleFollowOrganization,
  getSavedPosts,
  toggleSavePost,
  getLocalServices,
  getSurveys,
  submitSurvey,
  getImpactData,
  getNotifications,
  markNotificationRead,
  updateNotificationPreferences,
} = require("../controllers/citizenController");

// All routes require authentication
router.use(authenticateUser);

// Dashboard stats and activity
router.get("/stats", getStats);
router.get("/activity", getRecentActivity);

// Organization management
router.get("/organizations/following", getFollowedOrganizations);
router.get("/organizations/nearby", getNearbyOrganizations);
router.post("/organizations/:organizationId/follow", toggleFollowOrganization);

// Post management
router.get("/posts/saved", getSavedPosts);
router.post("/posts/:postId/save", toggleSavePost);

// Local services
router.get("/services", getLocalServices);

// Surveys
router.get("/surveys", getSurveys);
router.post("/surveys/:surveyId/submit", submitSurvey);

// Impact tracking
router.get("/impact", getImpactData);

// Notifications
router.get("/notifications", getNotifications);
router.post("/notifications/:notificationId/read", markNotificationRead);
router.put("/notifications/preferences", updateNotificationPreferences);

module.exports = router;
