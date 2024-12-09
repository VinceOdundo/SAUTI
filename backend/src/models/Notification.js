const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "organization_update",
        "forum_mention",
        "forum_reply",
        "post_like",
        "new_message",
        "survey_invitation",
        "service_update",
        "impact_report",
        "verification_status",
        "system_alert",
        "event_reminder",
        "other",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "low",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    relatedContent: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "contentType",
    },
    contentType: {
      type: String,
      enum: ["Post", "Message", "Survey", "LocalService", "ImpactMetric"],
    },
    action: {
      type: {
        type: String,
        enum: ["link", "button", "modal"],
      },
      text: String,
      url: String,
      data: mongoose.Schema.Types.Mixed,
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    expiresAt: Date,
    deliveryStatus: {
      type: String,
      enum: ["pending", "sent", "delivered", "failed"],
      default: "pending",
    },
    channels: {
      inApp: {
        type: Boolean,
        default: true,
      },
      email: {
        type: Boolean,
        default: false,
      },
      sms: {
        type: Boolean,
        default: false,
      },
      push: {
        type: Boolean,
        default: false,
      },
    },
    metadata: {
      deviceInfo: String,
      location: String,
      userAgent: String,
      ipAddress: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
notificationSchema.index({ type: 1, priority: 1 });
notificationSchema.index({ organization: 1 });

// Virtual for age of notification
notificationSchema.virtual("age").get(function () {
  return Math.round((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Method to mark notification as read
notificationSchema.methods.markAsRead = async function () {
  if (!this.read) {
    this.read = true;
    this.readAt = new Date();
    await this.save();
  }
  return this;
};

// Method to check if notification is expired
notificationSchema.methods.isExpired = function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// Method to format notification for display
notificationSchema.methods.formatForDisplay = function () {
  return {
    id: this._id,
    title: this.title,
    message: this.message,
    type: this.type,
    priority: this.priority,
    read: this.read,
    createdAt: this.createdAt,
    age: this.age,
    action: this.action,
    isExpired: this.isExpired(),
  };
};

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = async function (userId) {
  return this.countDocuments({
    user: userId,
    read: false,
    expiresAt: { $gt: new Date() },
  });
};

// Static method to mark all as read for user
notificationSchema.statics.markAllAsRead = async function (userId) {
  const now = new Date();
  return this.updateMany(
    {
      user: userId,
      read: false,
    },
    {
      $set: {
        read: true,
        readAt: now,
      },
    }
  );
};

// Static method to clean up expired notifications
notificationSchema.statics.cleanupExpired = async function () {
  return this.deleteMany({
    expiresAt: { $lt: new Date() },
  });
};

module.exports = mongoose.model("Notification", notificationSchema);
