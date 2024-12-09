const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    representative: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Representative",
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      enum: ["suggestion", "complaint", "question", "appreciation"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "inProgress", "resolved", "rejected"],
      default: "pending",
    },
    response: {
      content: String,
      respondedAt: Date,
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
  },
  { timestamps: true }
);

feedbackSchema.index({ representative: 1, createdAt: -1 });
feedbackSchema.index({ author: 1, createdAt: -1 });
feedbackSchema.index({ category: 1 });
feedbackSchema.index({ status: 1 });

module.exports = mongoose.model("Feedback", feedbackSchema);
