const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { verifyToken, extractTokens } = require("../utils/tokenUtils");

// Protect routes - Authentication middleware
const protect = async (req, res, next) => {
  try {
    // Get tokens from request
    const { accessToken, refreshToken } = extractTokens(req);

    if (!accessToken) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      // Verify access token
      const decoded = verifyToken(accessToken);
      
      // Get user from token
      const user = await User.findById(decoded.userId).select("-password");
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Check if user is active
      if (user.status !== "active") {
        return res.status(403).json({ message: "Account is not active" });
      }

      // Check session version
      if (user.sessionVersion !== decoded.sessionVersion) {
        return res.status(401).json({ message: "Session has expired. Please login again" });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      if (error.message === "Token has expired" && refreshToken) {
        // Token expired but refresh token exists - let the refresh token endpoint handle it
        return res.status(401).json({ 
          message: "Access token expired",
          code: "TOKEN_EXPIRED"
        });
      }

      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Email verification middleware
const requireEmailVerification = (req, res, next) => {
  if (!req.user.emailVerified) {
    return res.status(403).json({
      message: "Email verification required",
      code: "EMAIL_NOT_VERIFIED"
    });
  }
  next();
};

module.exports = { protect, authorize, requireEmailVerification };
