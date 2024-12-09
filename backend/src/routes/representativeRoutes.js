const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const { rbac, ROLES } = require("../middlewares/rbacMiddleware");
const {
  upload,
  handleUploadError,
} = require("../middlewares/uploadMiddleware");
const {
  registerRepresentative,
  verifyRepresentative,
  getRepresentative,
  updateRepresentative,
  followRepresentative,
  unfollowRepresentative,
  getRepresentativeStats,
} = require("../controllers/representativeController");

// Configure multer for multiple file uploads
const uploadFields = upload.fields([
  { name: "idCard", maxCount: 1 },
  { name: "certificate", maxCount: 1 },
  { name: "additionalDocs", maxCount: 5 },
]);

// Representative registration
router.post(
  "/register",
  authenticateUser,
  uploadFields,
  handleUploadError,
  registerRepresentative
);

// Get representative details
router.get("/:representativeId", authenticateUser, getRepresentative);

// Update representative
router.patch(
  "/:representativeId",
  authenticateUser,
  uploadFields,
  handleUploadError,
  updateRepresentative
);

// Verify representative (admin only)
router.post(
  "/:representativeId/verify",
  authenticateUser,
  rbac([ROLES.ADMIN]),
  verifyRepresentative
);

// Follow/unfollow routes
router.post(
  "/:representativeId/follow",
  authenticateUser,
  followRepresentative
);

router.post(
  "/:representativeId/unfollow",
  authenticateUser,
  unfollowRepresentative
);

// Get representative stats
router.get(
  "/stats",
  authenticateUser,
  rbac([ROLES.REPRESENTATIVE]),
  getRepresentativeStats
);

module.exports = router;
