const User = require("../models/User");
const { createToken } = require("../utils/tokenUtils");
const { validationResult } = require("express-validator");
const {
  generateVerificationToken,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
} = require("../services/emailService");
const { validatePassword } = require("../utils/passwordUtils");
const { rateLimit } = require("express-rate-limit");
const crypto = require("crypto");

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

    console.log("JWT_SECRET during login:", process.env.JWT_SECRET);

    const token = createToken(
      {
        userId: user._id,
        role: user.role,
      },
      "30d"
    );

    console.log("Created token:", token);

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
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
    console.error("Login error:", error);
    res.status(400).json({ message: error.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  res.json({ user: req.user });
};

// Rate limiter for password reset attempts
exports.passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per IP
  message: { message: "Too many reset attempts. Please try again in an hour." },
});

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        message: "If an account exists, a reset link will be sent.",
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Hash token before saving
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = resetTokenExpiry;
    await user.save();

    // Send reset email
    await sendPasswordResetEmail(user.email, resetToken);

    res.json({ message: "If an account exists, a reset link will be sent." });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Error processing request" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Validate password strength
    const validationResult = validatePassword(password);
    if (!validationResult.isValid) {
      return res.status(400).json({ message: validationResult.message });
    }

    // Hash token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Password reset token is invalid or has expired",
      });
    }

    // Update password and clear reset token
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // Add to password history
    if (!user.passwordHistory) user.passwordHistory = [];
    user.passwordHistory.unshift(password);
    if (user.passwordHistory.length > 5) user.passwordHistory.pop();

    await user.save();

    // Invalidate all existing sessions
    user.sessionVersion = (user.sessionVersion || 0) + 1;
    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Error resetting password" });
  }
};
