const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const path = require("path");
const http = require("http");
const timeout = require("connect-timeout");

// Route imports
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const representativeRoutes = require("./routes/representativeRoutes");
const forumRoutes = require("./routes/forumRoutes");
const messageRoutes = require("./routes/messageRoutes");
const communicationRoutes = require("./routes/communicationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const citizenRoutes = require("./routes/citizenRoutes");
const locationRoutes = require("./routes/locationRoutes");
const phoneVerificationRoutes = require("./routes/phoneVerificationRoutes");
const postRoutes = require("./routes/postRoutes");
const statsRoutes = require("./routes/statsRoutes");

// Middleware and utilities
const createDefaultAdmin = require("./utils/createDefaultAdmin");
const { limiter, speedLimiter } = require("./middleware/rateLimiter");
const { createIndexes } = require("./config/mongoIndexes");
const { initializeWebSocket } = require("./services/websocket");
const { uploadDir } = require("./middleware/uploadMiddleware");

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

// Define haltOnTimedout before using it
function haltOnTimedout(req, res, next) {
  if (!req.timedout) next();
}

app.use(haltOnTimedout);

// Initialize WebSocket
const server = http.createServer(app);
const { wss, clients } = initializeWebSocket(server);

// Initialize MongoDB indexes
createIndexes(mongoose);

// API Routes
const apiRouter = express.Router();

// Auth routes
apiRouter.use("/auth", authRoutes);

// User management routes
apiRouter.use("/users", userRoutes);
apiRouter.use("/admin", adminRoutes);
apiRouter.use("/citizen", citizenRoutes);

// Forum routes
apiRouter.use("/forum", forumRoutes);

// Organization and representative routes
apiRouter.use("/organizations", organizationRoutes);
apiRouter.use("/representatives", representativeRoutes);

// Communication routes
apiRouter.use("/messages", messageRoutes); // Direct messaging
apiRouter.use("/communications", communicationRoutes); // Official communications

// Content routes
apiRouter.use("/locations", locationRoutes);

// Utility routes
apiRouter.use("/phone-verification", phoneVerificationRoutes);

// Post routes
apiRouter.use("/posts", postRoutes);

// Stats routes
apiRouter.use("/stats", statsRoutes);

// Mount all API routes under /api
app.use("/api", apiRouter);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Sauti API" });
});

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
