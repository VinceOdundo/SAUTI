const Message = require("../models/Message");
const { uploadToS3 } = require("../utils/s3Utils");

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, content, replyToId, clientMessageId } = req.body;

    // Create message object
    const messageData = {
      sender: req.user._id,
      recipient: recipientId,
      content,
      replyTo: replyToId || null,
      metadata: {
        clientMessageId,
      },
    };

    // Handle attachments
    if (req.files) {
      messageData.attachments = [];

      // Handle images
      if (req.files.images) {
        for (const image of req.files.images) {
          const url = await uploadToS3(
            image,
            `messages/${req.user._id}/images/${Date.now()}`
          );
          messageData.attachments.push({
            url,
            type: "image",
            name: image.originalname,
            size: image.size,
          });
        }
      }

      // Handle documents
      if (req.files.documents) {
        for (const doc of req.files.documents) {
          const url = await uploadToS3(
            doc,
            `messages/${req.user._id}/documents/${Date.now()}`
          );
          messageData.attachments.push({
            url,
            type: "document",
            name: doc.originalname,
            size: doc.size,
          });
        }
      }
    }

    const message = new Message(messageData);
    await message.save();

    // Populate sender and recipient details
    await message.populate("sender", "name avatar");
    await message.populate("recipient", "name avatar");
    if (message.replyTo) {
      await message.populate("replyTo", "content");
    }

    // TODO: Emit socket event for real-time messaging
    // socketIO.to(recipientId).emit("newMessage", message);

    res.status(201).json({ message });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      message: "Error sending message",
      error: error.message,
    });
  }
};

// Get conversation with another user
exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.getConversation(req.user._id, userId, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    // Mark messages as delivered
    const undeliveredMessages = messages.filter(
      (msg) =>
        msg.recipient.toString() === req.user._id.toString() &&
        msg.status === "sent"
    );
    await Promise.all(undeliveredMessages.map((msg) => msg.markAsDelivered()));

    res.json({ messages });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching conversation",
      error: error.message,
    });
  }
};

// Get list of conversations
exports.getConversationsList = async (req, res) => {
  try {
    const conversations = await Message.getConversationsList(req.user._id);
    res.json({ conversations });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching conversations",
      error: error.message,
    });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findOne({
      _id: messageId,
      recipient: req.user._id,
    });

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    await message.markAsRead();

    // TODO: Emit socket event for real-time status update
    // socketIO.to(message.sender).emit("messageRead", messageId);

    res.json({ message });
  } catch (error) {
    res.status(500).json({
      message: "Error marking message as read",
      error: error.message,
    });
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findOne({
      _id: messageId,
      $or: [{ sender: req.user._id }, { recipient: req.user._id }],
    });

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    await message.softDelete(req.user._id);
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting message",
      error: error.message,
    });
  }
};

// Get unread messages count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user._id,
      status: "delivered",
    });

    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching unread count",
      error: error.message,
    });
  }
};
