const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  sendPhoneVerification,
  verifyPhone,
} = require("../controllers/phoneVerificationController");

router.use(protect);

router.post("/send", sendPhoneVerification);
router.post("/verify", verifyPhone);

module.exports = router;
