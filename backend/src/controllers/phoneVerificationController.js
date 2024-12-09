const User = require("../models/User");
const {
  generateOTP,
  sendVerificationSMS,
  sendWelcomeSMS,
} = require("../services/smsService");

const sendPhoneVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.phoneVerified) {
      return res.status(400).json({ message: "Phone already verified" });
    }

    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP expires in 10 minutes

    user.phoneOTP = {
      code: otp,
      expiresAt,
    };
    await user.save();

    const smsSent = await sendVerificationSMS(user.phone, otp);
    if (!smsSent) {
      return res.status(500).json({
        message: "Error sending verification SMS",
      });
    }

    res.json({ message: "Verification code sent successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error sending verification",
      error: error.message,
    });
  }
};

const verifyPhone = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.phoneVerified) {
      return res.status(400).json({ message: "Phone already verified" });
    }

    if (!user.phoneOTP || !user.phoneOTP.code) {
      return res.status(400).json({ message: "No verification code found" });
    }

    if (new Date() > user.phoneOTP.expiresAt) {
      return res.status(400).json({ message: "Verification code expired" });
    }

    if (user.phoneOTP.code !== otp) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    user.phoneVerified = true;
    user.phoneOTP = undefined;
    await user.save();

    await sendWelcomeSMS(user.phone);

    res.json({
      message: "Phone number verified successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        phoneVerified: true,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error verifying phone",
      error: error.message,
    });
  }
};

module.exports = {
  sendPhoneVerification,
  verifyPhone,
};
