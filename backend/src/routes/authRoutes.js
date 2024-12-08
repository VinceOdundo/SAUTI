const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getCurrentUser,
} = require("../controllers/authController");
const { registerValidator, loginValidator } = require("../utils/validators");
const { authenticateUser } = require("../middlewares/authMiddleware");

router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);
router.get("/me", authenticateUser, getCurrentUser);

module.exports = router;
