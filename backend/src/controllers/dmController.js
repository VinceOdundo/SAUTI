const Message = require("../models/Message");
const User = require("../models/User");
const Follow = require("../models/Follow");
const io = require("../socket"); // Assuming you have a socket.io setup in a separate file

const sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const senderId = req.user.id;

    // Check if users follow each other
    const [senderFollows, recipientFollows] = await Promise.all([
      Follow.findOne({ follower: senderId, following: recipientId }),
      Follow.findOne({ follower: recipientId, following: senderId })
    ]);

    if (!senderFollows || !recipientFollows) {
      return res.status(403).json({
        success: false,
        message: "You can only message users who mutually follow you"
      });
    }

    const message = await Message.create({
      sender: senderId,
      recipient: recipientId,
      content,
    });

    // Emit real-time event
    io.to(recipientId).emit('new_message', {
      message,
      sender: req.user
    });

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sending message",
      error: error.message
    });
  }
};

const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get latest message from each conversation
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$sender", userId] }, "$receiver", "$sender"],
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiver", userId] },
                    { $eq: ["$read", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // Populate user details
    const populatedConversations = await User.populate(conversations, {
      path: "_id",
      select: "name avatar",
    });

    res.json({ conversations: populatedConversations });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching conversations",
      error: error.message,
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name avatar")
      .populate("receiver", "name avatar");

    // Mark messages as read
    await Message.updateMany(
      {
        sender: userId,
        receiver: currentUserId,
        read: false,
      },
      { read: true }
    );

    res.json({ messages });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching messages",
      error: error.message,
    });
  }
};

module.exports = {
  sendMessage,
  getConversations,
  getMessages,
};
