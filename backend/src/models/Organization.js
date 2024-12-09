const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
      maxlength: 100,
    },
    type: {
      type: String,
      enum: ["NGO", "CBO"],
      required: true,
    },
    registrationNumber: {
      type: String,
      required: [true, "Registration number is required"],
      unique: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationDocuments: {
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
        },
      ],
    },
    contact: {
      address: {
        street: String,
        city: String,
        county: {
          type: String,
          required: true,
        },
        postalCode: String,
      },
      phone: {
        type: String,
        required: [true, "Phone number is required"],
        match: [/^\+254\d{9}$/, "Please provide valid Kenyan phone number"],
      },
      email: {
        type: String,
        required: [true, "Email is required"],
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide valid email"],
      },
    },
    representatives: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["admin", "member"],
          default: "member",
        },
        title: String,
      },
    ],
    areas: [
      {
        county: String,
        constituency: String,
        ward: String,
      },
    ],
    focus: [
      {
        type: String,
        enum: [
          "Education",
          "Health",
          "Environment",
          "Human Rights",
          "Youth",
          "Women",
          "Governance",
          "Other",
        ],
      },
    ],
    description: {
      type: String,
      required: [true, "Organization description is required"],
      maxlength: 1000,
    },
    website: String,
    socialMedia: {
      facebook: String,
      twitter: String,
      linkedin: String,
      instagram: String,
    },
    status: {
      type: String,
      enum: ["active", "suspended", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
organizationSchema.index({ "contact.county": 1, type: 1 });
organizationSchema.index({ registrationNumber: 1 });
organizationSchema.index({ focus: 1 });
organizationSchema.index({ verified: 1 });

module.exports = mongoose.model("Organization", organizationSchema);
