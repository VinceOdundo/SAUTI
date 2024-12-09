const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const representativeRoutes = require("./routes/representativeRoutes");
const forumRoutes = require("./routes/forumRoutes");
const messageRoutes = require("./routes/messageRoutes");
const adminRoutes = require("./routes/adminRoutes");
const citizenRoutes = require("./routes/citizenRoutes");
const createDefaultAdmin = require("./utils/createDefaultAdmin");
const phoneVerificationRoutes = require("./routes/phoneVerificationRoutes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create default admin user
createDefaultAdmin();

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/representatives", representativeRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/citizen", citizenRoutes);
app.use("/api/phone-verification", phoneVerificationRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Sauti API" });
});

module.exports = app;
