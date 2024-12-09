const mongoose = require("mongoose");

const representativeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    position: {
      type: String,
      required: true,
      enum: ["MP", "Senator", "Governor", "MCA"],
    },
    party: {
      type: String,
      required: true,
    },
    county: {
      type: String,
      required: true,
    },
    constituency: String,
    ward: String,
    bio: {
      type: String,
      maxlength: 1000,
    },
    officeContact: {
      address: String,
      phone: String,
      email: String,
    },
    socialMedia: {
      twitter: String,
      facebook: String,
      instagram: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationDocuments: {
      idCard: {
        url: String,
        verified: {
          type: Boolean,
          default: false,
        },
      },
      certificate: {
        url: String,
        verified: {
          type: Boolean,
          default: false,
        },
      },
      additionalDocs: [
        {
          name: String,
          url: String,
          verified: {
            type: Boolean,
            default: false,
          },
        },
      ],
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    verificationNotes: String,
    term: {
      startDate: Date,
      endDate: Date,
    },
    stats: {
      constituentsCount: {
        type: Number,
        default: 0,
      },
      messageResponseRate: {
        type: Number,
        default: 0,
      },
      forumParticipation: {
        type: Number,
        default: 0,
      },
      lastActive: Date,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Indexes for efficient querying
representativeSchema.index({ county: 1, position: 1 });
representativeSchema.index({ constituency: 1 });
representativeSchema.index({ ward: 1 });
representativeSchema.index({ verificationStatus: 1 });
representativeSchema.index({ "stats.constituentsCount": -1 });
representativeSchema.index({ "stats.messageResponseRate": -1 });

// Virtual for follower count
representativeSchema.virtual("followerCount").get(function () {
  return this.followers.length;
});

// Virtual for following count
representativeSchema.virtual("followingCount").get(function () {
  return this.following.length;
});

// Method to check if a user is followed by this representative
representativeSchema.methods.isFollowing = function (userId) {
  return this.following.includes(userId);
};

// Method to check if this representative is followed by a user
representativeSchema.methods.isFollowedBy = function (userId) {
  return this.followers.includes(userId);
};

// Method to update stats
representativeSchema.methods.updateStats = async function () {
  // Update constituents count
  const User = mongoose.model("User");
  const constituentsCount = await User.countDocuments({
    county: this.county,
    ...(this.constituency && { constituency: this.constituency }),
    ...(this.ward && { ward: this.ward }),
  });

  // Update message response rate
  const Message = mongoose.model("Message");
  const messages = await Message.find({ recipient: this.user });
  const respondedMessages = messages.filter((msg) => msg.responded);
  const messageResponseRate =
    messages.length > 0
      ? (respondedMessages.length / messages.length) * 100
      : 0;

  // Update forum participation
  const Post = mongoose.model("Post");
  const forumParticipation = await Post.countDocuments({
    author: this.user,
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
  });

  this.stats = {
    ...this.stats,
    constituentsCount,
    messageResponseRate,
    forumParticipation,
    lastActive: new Date(),
  };

  await this.save();
};

module.exports = mongoose.model("Representative", representativeSchema);
