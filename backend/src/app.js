const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const representativeRoutes = require("./routes/representativeRoutes");
const forumRoutes = require("./routes/forumRoutes");
const messageRoutes = require("./routes/messageRoutes");
const adminRoutes = require("./routes/adminRoutes");
const citizenRoutes = require("./routes/citizenRoutes");
const locationRoutes = require("./routes/locationRoutes");
const createDefaultAdmin = require("./utils/createDefaultAdmin");
const phoneVerificationRoutes = require("./routes/phoneVerificationRoutes");
const { limiter, speedLimiter } = require("./middleware/rateLimiter");
const { createIndexes } = require("./config/mongoIndexes");
const { initializeWebSocket } = require("./services/websocket");
const { uploadDir } = require("./middleware/uploadMiddleware");
const timeout = require("connect-timeout");
const http = require("http");

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
  exposedHeaders: ["Authorization"],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: [
          "'self'",
          process.env.FRONTEND_URL || "http://localhost:3000",
        ],
      },
    },
  })
);
app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(uploadDir));

// Apply rate limiting
app.use(limiter);
app.use(speedLimiter);

// Request timeout
app.use(timeout("15s"));
app.use(haltOnTimedout);

// Initialize WebSocket
const server = http.createServer(app);
const { wss, clients } = initializeWebSocket(server);

// Initialize MongoDB indexes
createIndexes(mongoose);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/representatives", representativeRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/citizen", citizenRoutes);
app.use("/api/phone-verification", phoneVerificationRoutes);
app.use("/api/locations", locationRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Sauti API" });
});

function haltOnTimedout(req, res, next) {
  if (!req.timedout) next();
}

// Add global error handler
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Handle specific error types
  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: "error",
      message: err.message,
      errors: err.errors,
    });
  }

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized access",
    });
  }

  // Default error
  res.status(500).json({
    status: "error",
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
};

// Add after routes setup
app.use(errorHandler);

// Add response standardization middleware
app.use((req, res, next) => {
  res.sendSuccess = (data, message = "Success") => {
    res.json({
      status: "success",
      message,
      data,
    });
  };

  res.sendError = (message, statusCode = 400) => {
    res.status(statusCode).json({
      status: "error",
      message,
    });
  };

  next();
});

// Export the app to be used by server.js
module.exports = app;
