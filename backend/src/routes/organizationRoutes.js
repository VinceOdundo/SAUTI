const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");
const {
  registerOrganization,
  verifyOrganization,
  getOrganization,
  updateOrganization,
  addRepresentative,
  removeRepresentative,
  getOrganizationProjects,
  createProject,
  updateProject,
  deleteProject,
  getOrganizationStats,
  getOrganizationInteractions,
  updateOrganizationSettings,
  getVerificationStatus,
  deleteOrganization
} = require("../controllers/organizationController");

// Public routes
router.get("/:organizationId", getOrganization);
router.get("/:organizationId/projects", getOrganizationProjects);

// Protected routes
router.use(protect);

// Organization registration and verification
router.post("/register", upload.single("certificate"), registerOrganization);
router.get("/verification-status/:organizationId", getVerificationStatus);

// Organization management (requires organization role)
router.route("/:organizationId")
  .put(authorize("organization"), upload.single("certificate"), updateOrganization)
  .delete(authorize("admin"), deleteOrganization);

// Representatives management
router.route("/:organizationId/representatives")
  .post(authorize("organization"), addRepresentative)
  .delete(authorize("organization"), removeRepresentative);

// Project management
router.route("/:organizationId/projects")
  .post(authorize("organization"), createProject);

router.route("/:organizationId/projects/:projectId")
  .put(authorize("organization"), updateProject)
  .delete(authorize("organization"), deleteProject);

// Organization insights
router.get("/:organizationId/stats", authorize("organization"), getOrganizationStats);
router.get("/:organizationId/interactions", authorize("organization"), getOrganizationInteractions);

// Organization settings
router.put("/:organizationId/settings", authorize("organization"), updateOrganizationSettings);

// Organization verification (admin only)
router.post("/:organizationId/verify", authorize("admin"), verifyOrganization);

module.exports = router;
