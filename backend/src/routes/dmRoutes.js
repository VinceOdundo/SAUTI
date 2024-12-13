const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/authMiddleware");
const {
  sendMessage,
  getConversations,
  getMessages,
} = require("../controllers/dmController");

router.use(authenticateUser);

router.post("/send", sendMessage);
router.get("/conversations", getConversations);
router.get("/:userId", getMessages);

module.exports = router;
