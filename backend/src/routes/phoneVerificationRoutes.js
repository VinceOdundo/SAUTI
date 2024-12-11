const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/authMiddleware");
const {
  sendPhoneVerification,
  verifyPhone,
} = require("../controllers/phoneVerificationController");

router.use(authenticateUser);

router.post("/send", sendPhoneVerification);
router.post("/verify", verifyPhone);

module.exports = router;
