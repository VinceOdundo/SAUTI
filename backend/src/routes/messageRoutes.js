const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/authMiddleware");
const { upload, handleUploadError } = require("../middleware/uploadMiddleware");
const {
  sendMessage,
  getConversation,
  getConversationsList,
  markAsRead,
  deleteMessage,
  getUnreadCount,
} = require("../controllers/messageController");

// All routes require authentication
router.use(authenticateUser);

// Configure multer for file uploads
const uploadFields = upload.fields([
  { name: "images", maxCount: 5 },
  { name: "documents", maxCount: 3 },
]);

// Send message
router.post("/send", uploadFields, handleUploadError, sendMessage);

// Get conversation with a user
router.get("/conversation/:userId", getConversation);

// Get list of conversations
router.get("/conversations", getConversationsList);

// Mark message as read
router.post("/read/:messageId", markAsRead);

// Delete message
router.delete("/:messageId", deleteMessage);

// Get unread messages count
router.get("/unread/count", getUnreadCount);

module.exports = router;
