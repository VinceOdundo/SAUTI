const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createMessage,
  getMessages,
  updateMessage,
} = require("../controllers/communicationController");

// Routes for official communications from representatives
router.use(protect);
router.use(authorize("representative"));

// Create an official communication
router.post("/official", createMessage);

// Get official communications
router.get("/official", getMessages);

// Update an official communication
router.patch("/official/:id", updateMessage);

module.exports = router;
