const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const { rbac, ROLES } = require("../middlewares/rbacMiddleware");
const {
  upload,
  handleUploadError,
} = require("../middlewares/uploadMiddleware");
const {
  registerOrganization,
  verifyOrganization,
  getOrganization,
  updateOrganization,
  addRepresentative,
} = require("../controllers/organizationController");

// Organization registration with file upload
router.post(
  "/register",
  authenticateUser,
  upload.single("certificate"),
  handleUploadError,
  registerOrganization
);

// Get organization details
router.get("/:organizationId", authenticateUser, getOrganization);

// Update organization
router.patch(
  "/:organizationId",
  authenticateUser,
  upload.single("certificate"),
  handleUploadError,
  updateOrganization
);

// Verify organization (admin only)
router.post(
  "/:organizationId/verify",
  authenticateUser,
  rbac([ROLES.ADMIN]),
  verifyOrganization
);

// Add representative
router.post(
  "/:organizationId/representatives",
  authenticateUser,
  addRepresentative
);

module.exports = router;
