const User = require("../models/User");
const { createToken } = require("../utils/tokenUtils");
const { validationResult } = require("express-validator");
const {
  generateVerificationToken,
  sendVerificationEmail,
  sendWelcomeEmail,
} = require("../services/emailService");

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Create user with basic info first
    const user = await User.create({
      name,
      email,
      password,
    });

    const token = createToken({ userId: user._id });
    res.status(201).json({
      user: {
        name: user.name,
        email: user.email,
        isProfileComplete: false,
      },
      token,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: "Invalid verification token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user);

    res.json({
      message: "Email verified successfully",
      user: { name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error verifying email",
      error: error.message,
    });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const verificationToken = generateVerificationToken();
    user.verificationToken = verificationToken;
    await user.save();

    const emailSent = await sendVerificationEmail(user, verificationToken);
    if (!emailSent) {
      return res.status(500).json({
        message: "Error sending verification email",
      });
    }

    res.json({ message: "Verification email sent successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error resending verification",
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create a long-lived token (30 days)
    const token = createToken(
      {
        userId: user._id,
        role: user.role,
      },
      "30d"
    );

    // Set HTTP-only cookie with token
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: "strict",
    });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      token,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  res.json({ user: req.user });
};
