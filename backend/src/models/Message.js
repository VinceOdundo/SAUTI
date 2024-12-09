const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    attachments: [
      {
        url: String,
        type: {
          type: String,
          enum: ["image", "document"],
        },
        name: String,
        size: Number,
      },
    ],
    readAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read", "deleted"],
      default: "sent",
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    metadata: {
      clientMessageId: String, // For handling offline/sync scenarios
      deliveredAt: Date,
      deletedAt: Date,
      deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ recipient: 1, readAt: 1 });
messageSchema.index({ status: 1 });
messageSchema.index({ createdAt: -1 });

// Virtual for checking if message is read
messageSchema.virtual("isRead").get(function () {
  return this.status === "read";
});

// Method to mark message as read
messageSchema.methods.markAsRead = async function () {
  if (!this.readAt) {
    this.readAt = new Date();
    this.status = "read";
    await this.save();
  }
  return this;
};

// Method to mark message as delivered
messageSchema.methods.markAsDelivered = async function () {
  if (this.status === "sent") {
    this.status = "delivered";
    this.metadata.deliveredAt = new Date();
    await this.save();
  }
  return this;
};

// Method to soft delete message
messageSchema.methods.softDelete = async function (userId) {
  this.status = "deleted";
  this.metadata.deletedAt = new Date();
  this.metadata.deletedBy = userId;
  await this.save();
  return this;
};

// Static method to get conversation between two users
messageSchema.statics.getConversation = async function (
  user1Id,
  user2Id,
  options = {}
) {
  const { page = 1, limit = 50 } = options;
  const skip = (page - 1) * limit;

  const messages = await this.find({
    $or: [
      { sender: user1Id, recipient: user2Id },
      { sender: user2Id, recipient: user1Id },
    ],
    status: { $ne: "deleted" },
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("sender", "name avatar")
    .populate("recipient", "name avatar")
    .populate("replyTo", "content");

  return messages;
};

// Static method to get user's conversations list
messageSchema.statics.getConversationsList = async function (userId) {
  const conversations = await this.aggregate([
    {
      $match: {
        $or: [{ sender: userId }, { recipient: userId }],
        status: { $ne: "deleted" },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: {
          $cond: [{ $eq: ["$sender", userId] }, "$recipient", "$sender"],
        },
        lastMessage: { $first: "$$ROOT" },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$recipient", userId] },
                  { $eq: ["$status", "delivered"] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $project: {
        user: {
          _id: 1,
          name: 1,
          avatar: 1,
        },
        lastMessage: 1,
        unreadCount: 1,
      },
    },
    {
      $sort: { "lastMessage.createdAt": -1 },
    },
  ]);

  return conversations;
};

module.exports = mongoose.model("Message", messageSchema);
