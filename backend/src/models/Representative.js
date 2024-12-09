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
    term: {
      startDate: Date,
      endDate: Date,
    },
  },
  { timestamps: true }
);

// Indexes for efficient querying
representativeSchema.index({ county: 1, position: 1 });
representativeSchema.index({ constituency: 1 });
representativeSchema.index({ ward: 1 });

module.exports = mongoose.model("Representative", representativeSchema);
