const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getStats,
  getActivityTrends,
  getVerificationRequests,
  verifyDocument,
  getReportedContent,
  moderateContent,
  getUsers,
  manageUser,
} = require("../controllers/adminController");

// All routes require authentication and admin role
router.use(protect);
router.use(authorize("admin"));

// Dashboard stats and activity
router.get("/stats", getStats);
router.get("/activity", getActivityTrends);

// Verification management
router.get("/verification-requests", getVerificationRequests);
router.post("/verify-document", verifyDocument);

// Content moderation
router.get("/reported-content", getReportedContent);
router.post("/moderate", moderateContent);

// User management
router.get("/users", getUsers);
router.post("/manage-user", manageUser);

module.exports = router;
