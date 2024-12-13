const jwt = require("jsonwebtoken");

/**
 * Create a JWT token with the given payload and expiration
 * @param {Object} payload - Data to be encoded in the token
 * @param {string} expiresIn - Token expiration time (e.g., "7d", "24h")
 * @returns {string} JWT token
 */
const createToken = (payload, expiresIn = "15m") => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
    algorithm: "HS256"
  });
};

/**
 * Create a refresh token with extended expiration
 * @param {Object} payload - Data to be encoded in the token
 * @param {string} expiresIn - Token expiration time (default: "7d")
 * @returns {string} Refresh token
 */
const createRefreshToken = (payload, expiresIn = "7d") => {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("REFRESH_TOKEN_SECRET is not defined in environment variables");
  }

  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn,
    algorithm: "HS256"
  });
};

/**
 * Verify and decode a JWT access token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Token has expired");
    }
    if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid token");
    }
    throw error;
  }
};

/**
 * Verify and decode a JWT refresh token
 * @param {string} token - Refresh token to verify
 * @returns {Object} Decoded token payload
 */
const verifyRefreshToken = (token) => {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("REFRESH_TOKEN_SECRET is not defined in environment variables");
  }

  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Refresh token has expired");
    }
    if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid refresh token");
    }
    throw error;
  }
};

/**
 * Extract token from request headers or cookies
 * @param {Object} req - Express request object
 * @returns {Object} Object containing access and refresh tokens
 */
const extractTokens = (req) => {
  let accessToken = null;
  let refreshToken = null;

  // Check Authorization header
  if (req.headers.authorization?.startsWith("Bearer ")) {
    accessToken = req.headers.authorization.split(" ")[1];
  }

  // Check cookies
  if (req.cookies) {
    accessToken = accessToken || req.cookies.accessToken;
    refreshToken = req.cookies.refreshToken;
  }

  return { accessToken, refreshToken };
};

module.exports = {
  createToken,
  createRefreshToken,
  verifyToken,
  verifyRefreshToken,
  extractTokens
};
