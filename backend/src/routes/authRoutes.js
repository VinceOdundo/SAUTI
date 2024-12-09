const express = require("express");
const router = express.Router();
const {
  register,
  login,
  verifyEmail,
  resendVerification,
  getCurrentUser,
} = require("../controllers/authController");
const { registerValidator, loginValidator } = require("../utils/validators");
const { authenticateUser } = require("../middlewares/authMiddleware");

router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);
router.post("/verify-email/:token", verifyEmail);
router.post("/resend-verification", authenticateUser, resendVerification);
router.get("/me", authenticateUser, getCurrentUser);

module.exports = router;
