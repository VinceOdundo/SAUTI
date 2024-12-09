const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const { rbac, ROLES } = require("../middlewares/rbacMiddleware");
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
router.use(authenticateUser, rbac([ROLES.ADMIN]));

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
