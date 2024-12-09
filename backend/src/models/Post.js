const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    votes: {
      upvotes: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      downvotes: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    status: {
      type: String,
      enum: ["active", "hidden", "deleted"],
      default: "active",
    },
    reports: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reason: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 300,
    },
    content: {
      type: String,
      required: true,
      maxlength: 40000,
    },
    category: {
      type: String,
      enum: [
        "general",
        "policy",
        "development",
        "education",
        "health",
        "environment",
        "governance",
        "other",
      ],
      required: true,
    },
    tags: [String],
    location: {
      county: String,
      constituency: String,
      ward: String,
    },
    media: {
      images: [
        {
          url: String,
          caption: String,
        },
      ],
      videos: [
        {
          url: String,
          caption: String,
          duration: Number, // in seconds
          thumbnail: String,
        },
      ],
      documents: [
        {
          url: String,
          name: String,
          type: String,
          size: Number, // in bytes
        },
      ],
    },
    poll: {
      question: String,
      options: [
        {
          text: String,
          votes: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
          ],
        },
      ],
      endDate: Date,
      allowMultipleVotes: {
        type: Boolean,
        default: false,
      },
    },
    votes: {
      upvotes: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      downvotes: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    comments: [commentSchema],
    status: {
      type: String,
      enum: ["draft", "published", "hidden", "deleted"],
      default: "published",
    },
    visibility: {
      type: String,
      enum: ["public", "county", "constituency", "ward"],
      default: "public",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    reports: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reason: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    moderationLog: [
      {
        action: {
          type: String,
          enum: ["hidden", "restored", "deleted", "featured", "unfeatured"],
          required: true,
        },
        moderator: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        reason: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    analytics: {
      views: {
        type: Number,
        default: 0,
      },
      shares: {
        type: Number,
        default: 0,
      },
      uniqueViewers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for vote count
postSchema.virtual("voteCount").get(function () {
  return this.votes.upvotes.length - this.votes.downvotes.length;
});

// Virtual for comment count
postSchema.virtual("commentCount").get(function () {
  return this.comments.filter((comment) => comment.status === "active").length;
});

// Virtual for poll total votes
postSchema.virtual("pollTotalVotes").get(function () {
  if (!this.poll) return 0;
  return this.poll.options.reduce(
    (total, option) => total + option.votes.length,
    0
  );
});

// Method to check if poll is active
postSchema.methods.isPollActive = function () {
  if (!this.poll) return false;
  return new Date() < new Date(this.poll.endDate);
};

// Method to check if user has voted on poll
postSchema.methods.hasUserVotedOnPoll = function (userId) {
  if (!this.poll) return false;
  return this.poll.options.some((option) =>
    option.votes.some((vote) => vote.toString() === userId.toString())
  );
};

// Method to check if user has voted on post
postSchema.methods.getUserVote = function (userId) {
  const upvoted = this.votes.upvotes.some(
    (id) => id.toString() === userId.toString()
  );
  const downvoted = this.votes.downvotes.some(
    (id) => id.toString() === userId.toString()
  );
  return upvoted ? "up" : downvoted ? "down" : null;
};

// Method to check if user has reported post
postSchema.methods.hasUserReported = function (userId) {
  return this.reports.some(
    (report) => report.user.toString() === userId.toString()
  );
};

// Indexes for efficient querying
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ "location.county": 1 });
postSchema.index({ "location.constituency": 1 });
postSchema.index({ "location.ward": 1 });
postSchema.index({ category: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ status: 1 });
postSchema.index({ featured: 1 });
postSchema.index({ "analytics.views": -1 });
postSchema.index({ "votes.upvotes": 1 });
postSchema.index({ "votes.downvotes": 1 });

// Text index for search
postSchema.index(
  {
    title: "text",
    content: "text",
    tags: "text",
  },
  {
    weights: {
      title: 10,
      content: 5,
      tags: 3,
    },
  }
);

module.exports = mongoose.model("Post", postSchema);
