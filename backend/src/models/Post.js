const mongoose = require("mongoose");

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
    location: {
      county: String,
      constituency: String,
      ward: String,
    },
    media: {
      images: [
        {
          type: String,
          maxlength: 4,
        },
      ],
      video: {
        url: String,
        duration: {
          type: Number,
          max: 30, // 30 seconds max
        },
      },
    },
    poll: {
      question: String,
      options: [
        {
          text: String,
          votes: {
            type: Number,
            default: 0,
          },
        },
      ],
      endDate: Date,
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
    tags: [String],
    analytics: {
      views: {
        type: Number,
        default: 0,
      },
      shares: {
        type: Number,
        default: 0,
      },
    },
    parentPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    isRepost: {
      type: Boolean,
      default: false,
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

// Index for efficient queries
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ "location.county": 1 });
postSchema.index({ tags: 1 });

module.exports = mongoose.model("Post", postSchema);
