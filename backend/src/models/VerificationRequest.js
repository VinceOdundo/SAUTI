const mongoose = require("mongoose");

const verificationRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    documentType: {
      type: String,
      required: true,
      enum: ["id", "business_license", "other"],
    },
    document: {
      url: {
        type: String,
        required: true,
      },
      key: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
      path: {
        type: String,
        required: true,
      },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: Date,
    reviewNotes: String,
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
verificationRequestSchema.index({ user: 1, status: 1 });
verificationRequestSchema.index({ status: 1, createdAt: -1 });

// Clean up files when document is deleted
verificationRequestSchema.pre("remove", async function (next) {
  try {
    const { deleteFromLocal } = require("../services/storageService");
    await deleteFromLocal(this.document.key);
    next();
  } catch (error) {
    console.error("Error deleting document file:", error);
    next(error);
  }
});

module.exports = mongoose.model(
  "VerificationRequest",
  verificationRequestSchema
);
