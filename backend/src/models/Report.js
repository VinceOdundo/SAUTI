const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    contentType: {
      type: String,
      enum: ["post", "comment", "user"],
      required: true,
    },
    content: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "contentType",
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: [
        "inappropriate",
        "spam",
        "harassment",
        "misinformation",
        "violence",
        "other",
      ],
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "resolved", "ignored"],
      default: "pending",
    },
    moderatorNotes: {
      type: String,
      maxlength: 500,
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    moderatedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
reportSchema.index({ contentType: 1, status: 1 });
reportSchema.index({ reportedBy: 1 });
reportSchema.index({ content: 1 });

module.exports = mongoose.model("Report", reportSchema);
