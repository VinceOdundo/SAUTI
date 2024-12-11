const winston = require("winston");
const { createLogger, format, transports } = winston;

// Configure logger
const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    })
  );
}

// Error types
const ErrorTypes = {
  VALIDATION_ERROR: "ValidationError",
  AUTHENTICATION_ERROR: "AuthenticationError",
  AUTHORIZATION_ERROR: "AuthorizationError",
  NOT_FOUND_ERROR: "NotFoundError",
  CONFLICT_ERROR: "ConflictError",
  RATE_LIMIT_ERROR: "RateLimitError",
  INTERNAL_ERROR: "InternalError",
};

// Error status codes
const ErrorStatusCodes = {
  [ErrorTypes.VALIDATION_ERROR]: 400,
  [ErrorTypes.AUTHENTICATION_ERROR]: 401,
  [ErrorTypes.AUTHORIZATION_ERROR]: 403,
  [ErrorTypes.NOT_FOUND_ERROR]: 404,
  [ErrorTypes.CONFLICT_ERROR]: 409,
  [ErrorTypes.RATE_LIMIT_ERROR]: 429,
  [ErrorTypes.INTERNAL_ERROR]: 500,
};

// Custom error class
class AppError extends Error {
  constructor(message, type = ErrorTypes.INTERNAL_ERROR, details = null) {
    super(message);
    this.name = type;
    this.details = details;
    this.status = ErrorStatusCodes[type] || 500;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Main error handler
const handleError = (err, res) => {
  const error = err instanceof AppError ? err : new AppError(err.message);

  // Log error
  logger.error({
    message: error.message,
    stack: error.stack,
    details: error.details,
    timestamp: new Date().toISOString(),
  });

  // Send response
  const response = {
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? getPublicErrorMessage(error)
        : error.message,
    ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
    ...(error.details && { details: error.details }),
  };

  res.status(error.status).json(response);
};

// Get user-friendly error message
const getPublicErrorMessage = (error) => {
  switch (error.name) {
    case ErrorTypes.VALIDATION_ERROR:
      return "Invalid input data provided";
    case ErrorTypes.AUTHENTICATION_ERROR:
      return "Authentication failed";
    case ErrorTypes.AUTHORIZATION_ERROR:
      return "You do not have permission to perform this action";
    case ErrorTypes.NOT_FOUND_ERROR:
      return "The requested resource was not found";
    case ErrorTypes.CONFLICT_ERROR:
      return "The request conflicts with existing data";
    case ErrorTypes.RATE_LIMIT_ERROR:
      return "Too many requests, please try again later";
    default:
      return "An unexpected error occurred";
  }
};

// Validation error creator
const createValidationError = (details) => {
  return new AppError(
    "Validation failed",
    ErrorTypes.VALIDATION_ERROR,
    details
  );
};

// Not found error creator
const createNotFoundError = (resource) => {
  return new AppError(`${resource} not found`, ErrorTypes.NOT_FOUND_ERROR);
};

// Authorization error creator
const createAuthorizationError = (message = "Unauthorized access") => {
  return new AppError(message, ErrorTypes.AUTHORIZATION_ERROR);
};

// Conflict error creator
const createConflictError = (message) => {
  return new AppError(message, ErrorTypes.CONFLICT_ERROR);
};

module.exports = {
  handleError,
  AppError,
  ErrorTypes,
  createValidationError,
  createNotFoundError,
  createAuthorizationError,
  createConflictError,
  logger,
};
