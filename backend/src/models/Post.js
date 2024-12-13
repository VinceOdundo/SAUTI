const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      maxlength: 310,
      required: false,
    },
    status: {
      type: String,
      enum: ["active", "hidden", "deleted"],
      default: "active",
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
      default: "general",
      required: true,
    },
    tags: [String],
    media: {
      url: String,
      type: String,
    },
    location: {
      latitude: Number,
      longitude: Number,
      placeName: String,
    },
    votes: {
      upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    reshares: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
