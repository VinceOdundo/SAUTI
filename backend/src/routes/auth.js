const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/authMiddleware");
const { rbac } = require("../middleware/rbacMiddleware");
const {
  register,
  login,
  updateUserProfile,
  getUserProfile,
  forgotPassword,
  resetPassword,
  verifyEmail,
  uploadAvatar,
} = require("../controllers/userController");

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/verify-email/:token", verifyEmail);

// Protected routes
router.use(authenticateUser);

// Profile routes
router.route("/profile").get(getUserProfile).put(updateUserProfile);

router.post("/profile/avatar", uploadAvatar);

// Admin only routes
router.get("/users", rbac("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
});

module.exports = router;
