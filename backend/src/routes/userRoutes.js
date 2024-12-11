const express = require("express");
const router = express.Router();
const { rbac, ROLES } = require("../middleware/rbacMiddleware");
const { authenticateUser } = require("../middleware/authMiddleware");
const {
  getAllUsers,
  updateUserRole,
  deleteUser,
} = require("../controllers/adminController");
const {
  updateUserProfile,
  getUserProfile,
} = require("../controllers/userController");

// User routes
router.patch("/profile", authenticateUser, updateUserProfile);
router.get("/:userId", getUserProfile);

// Admin only routes
router.use(authenticateUser);
router.get("/", rbac([ROLES.ADMIN]), getAllUsers);
router.patch("/:userId/role", rbac([ROLES.ADMIN]), updateUserRole);
router.delete("/:userId", rbac([ROLES.ADMIN]), deleteUser);

module.exports = router;
