const express = require("express");
const router = express.Router();
const { rbac, ROLES } = require("../middlewares/rbacMiddleware");
const { authenticateUser } = require("../middlewares/authMiddleware");
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
router.patch("/:id/role", rbac([ROLES.ADMIN]), updateUserRole);
router.delete("/:id", rbac([ROLES.ADMIN]), deleteUser);

module.exports = router;
