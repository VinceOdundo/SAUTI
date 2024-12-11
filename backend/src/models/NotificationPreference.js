const mongoose = require("mongoose");

const notificationPreferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    preferences: {
      profile_update: {
        enabled: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
      },
      email_verified: {
        enabled: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
      },
      role_update: {
        enabled: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
      },
      system_notification: {
        enabled: { type: Boolean, default: true },
        email: { type: Boolean, default: false },
        push: { type: Boolean, default: true },
      },
      mention: {
        enabled: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
      },
      comment: {
        enabled: { type: Boolean, default: true },
        email: { type: Boolean, default: false },
        push: { type: Boolean, default: true },
      },
    },
    emailDigest: {
      enabled: { type: Boolean, default: false },
      frequency: {
        type: String,
        enum: ["daily", "weekly", "never"],
        default: "never",
      },
    },
    doNotDisturb: {
      enabled: { type: Boolean, default: false },
      startTime: { type: String, default: "22:00" },
      endTime: { type: String, default: "08:00" },
    },
  },
  {
    timestamps: true,
  }
);

// Create default preferences for new users
notificationPreferenceSchema.statics.createDefault = async function (userId) {
  try {
    const preferences = new this({ user: userId });
    await preferences.save();
    return preferences;
  } catch (error) {
    console.error("Error creating default notification preferences:", error);
    throw error;
  }
};

module.exports = mongoose.model(
  "NotificationPreference",
  notificationPreferenceSchema
);
