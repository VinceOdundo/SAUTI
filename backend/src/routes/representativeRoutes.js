const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const { rbac, ROLES } = require("../middlewares/rbacMiddleware");
const {
  getRepresentatives,
  getRepresentativeProfile,
  updateRepresentativeProfile,
  getRepresentativeAnalytics,
} = require("../controllers/representativeController");

// Public routes
router.get("/", getRepresentatives);
router.get("/:id", getRepresentativeProfile);

// Protected routes
router.use(authenticateUser);
router.patch("/:id", rbac([ROLES.REPRESENTATIVE]), updateRepresentativeProfile);
router.get(
  "/:id/analytics",
  rbac([ROLES.REPRESENTATIVE]),
  getRepresentativeAnalytics
);

module.exports = router;
