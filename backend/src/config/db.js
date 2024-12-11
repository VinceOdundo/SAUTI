const mongoose = require("mongoose");
const logger = require("./logger");
const config = require("./env");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on("connected", () => {
  logger.info("MongoDB connection established");
});

mongoose.connection.on("error", (err) => {
  logger.error(`MongoDB connection error: ${err}`);
});

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB connection disconnected");
});

// Handle application termination
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    logger.info("MongoDB connection closed through app termination");
    process.exit(0);
  } catch (err) {
    logger.error(`Error closing MongoDB connection: ${err}`);
    process.exit(1);
  }
});

module.exports = connectDB;
