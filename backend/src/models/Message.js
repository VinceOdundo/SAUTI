const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
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
      maxlength: 5000,
    },
    type: {
      type: String,
      enum: ["announcement", "update", "newsletter"],
      required: true,
    },
    audience: {
      county: String,
      constituency: String,
      ward: String,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    metrics: {
      views: { type: Number, default: 0 },
      engagements: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

messageSchema.index({ representative: 1, createdAt: -1 });
messageSchema.index({ "audience.county": 1 });
messageSchema.index({ "audience.constituency": 1 });
messageSchema.index({ "audience.ward": 1 });

module.exports = mongoose.model("Message", messageSchema);
