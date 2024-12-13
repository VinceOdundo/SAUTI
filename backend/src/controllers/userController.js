const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const emailService = require("../utils/emailService");
const multer = require("multer");
const path = require("path");
const { validateUser } = require("../validators/userValidator");
const { hashPassword, comparePassword } = require("../utils/auth.js");

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/avatars");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
  },
}).single("avatar");

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update allowed fields
    const allowedUpdates = [
      "name",
      "county",
      "constituency",
      "ward",
      "phoneNumber",
      "avatar",
      "bio",
    ];

    allowedUpdates.forEach((update) => {
      if (req.body[update] !== undefined) {
        user[update] = req.body[update];
      }
    });

    await user.save();
    res.json({ user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching user profile",
      error: error.message,
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating password", error: error.message });
  }
};

const toggleNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.settings.notifications = req.body.enabled;
    await user.save();
    
    res.json({ message: "Notification settings updated", enabled: user.settings.notifications });
  } catch (error) {
    res.status(500).json({ message: "Error updating notification settings", error: error.message });
  }
};

const updatePrivacySettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { profileVisibility, messagePrivacy } = req.body;
    
    user.settings.privacy = {
      ...user.settings.privacy,
      profileVisibility: profileVisibility || user.settings.privacy.profileVisibility,
      messagePrivacy: messagePrivacy || user.settings.privacy.messagePrivacy
    };
    
    await user.save();
    res.json({ message: "Privacy settings updated", settings: user.settings.privacy });
  } catch (error) {
    res.status(500).json({ message: "Error updating privacy settings", error: error.message });
  }
};

const deactivateAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.status = 'inactive';
    user.deactivatedAt = new Date();
    await user.save();
    
    res.json({ message: "Account deactivated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deactivating account", error: error.message });
  }
};

const register = async (req, res) => {
  try {
    const { email, password, username, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    // Create new user
    const user = new User({
      email,
      username,
      password: hashedPassword,
      role: role || "citizen",
      emailVerificationToken,
      emailVerificationExpire: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Send verification email
    const verificationUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/auth/verify-email/${verificationToken}`;

    await emailService.sendVerificationEmail(email, verificationUrl);
    await emailService.sendWelcomeEmail(email, username);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with that email",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/auth/reset-password/${resetToken}`;

    // Send email with reset URL
    // TODO: Implement email sending functionality

    res.json({
      success: true,
      message: "Password reset email sent",
      resetUrl, // Remove in production
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sending password reset email",
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error resetting password",
      error: error.message,
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Get hashed token
    const emailVerificationToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    // Update user
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error verifying email",
      error: error.message,
    });
  }
};

const uploadAvatar = async (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: "File upload error",
        error: err.message,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload a file",
        });
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Update user avatar
      user.avatar = `/uploads/avatars/${req.file.filename}`;
      await user.save();

      res.json({
        success: true,
        message: "Avatar uploaded successfully",
        avatar: user.avatar,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error uploading avatar",
        error: error.message,
      });
    }
  });
};

const updateProfile = async (req, res, next) => {
  try {
    const { error } = validateUser(req.body);
    if (error) {
      return res.sendError(error.details[0].message);
    }

    const updates = { ...req.body };
    delete updates.password; // Don't allow password updates through this endpoint

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.sendError("User not found", 404);
    }

    res.sendSuccess(user, "Profile updated successfully");
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("constituency", "name");

    if (!user) {
      return res.sendError("User not found", 404);
    }

    res.sendSuccess(user);
  } catch (err) {
    next(err);
  }
};

// Add verification status check middleware
const checkVerificationStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isVerified) {
      return res.sendError("Account not verified", 403);
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  updateUserProfile,
  getUserProfile,
  updatePassword,
  toggleNotifications,
  updatePrivacySettings,
  deactivateAccount,
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyEmail,
  uploadAvatar,
  updateProfile,
  getProfile,
  checkVerificationStatus
};
