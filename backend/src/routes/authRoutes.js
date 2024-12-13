const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  verifyEmail,
  resendVerification,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  refreshToken
} = require("../controllers/authController");
const { registerValidator, loginValidator } = require("../utils/validators");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);
router.post("/refresh-token", refreshToken);
router.post("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Protected routes
router.use(protect);
router.post("/logout", logout);
router.post("/resend-verification", resendVerification);
router.get("/me", getCurrentUser);

module.exports = router;
