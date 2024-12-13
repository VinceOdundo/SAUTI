const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getAllUsers,
  updateUserRole,
  deleteUser,
} = require("../controllers/adminController");
const {
  updateUserProfile,
  getUserProfile,
  updatePassword,
  toggleNotifications,
  updatePrivacySettings,
  deactivateAccount
} = require("../controllers/userController");

// Public routes
router.get("/:userId", getUserProfile);

// Protected routes
router.use(protect);

// User routes
router.route("/profile")
  .put(updateUserProfile)
  .delete(deactivateAccount);

router.put("/password", updatePassword);
router.put("/notifications", toggleNotifications);
router.put("/privacy", updatePrivacySettings);

// Admin only routes
router.use(authorize('admin'));
router.get("/", getAllUsers);
router.put("/:userId/role", updateUserRole);
router.delete("/:userId", deleteUser);

module.exports = router;
