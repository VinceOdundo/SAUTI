const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      enum: ["citizen", "representative", "admin"],
      default: "citizen",
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    verificationStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
    verifiedAt: Date,
    lastVerificationRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VerificationRequest",
    },
    profile: {
      avatar: String,
      bio: String,
      location: {
        county: String,
        constituency: String,
        ward: String,
      },
      socialLinks: {
        twitter: String,
        facebook: String,
        linkedin: String,
      },
    },
    profileCompletion: {
      type: Number,
      default: 0,
    },
    settings: {
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        push: {
          type: Boolean,
          default: true,
        },
      },
      privacy: {
        showEmail: {
          type: Boolean,
          default: false,
        },
        showLocation: {
          type: Boolean,
          default: true,
        },
      },
    },
    status: {
      type: String,
      enum: ["active", "suspended", "banned"],
      default: "active",
    },
    lastActive: Date,
    sessionVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
userSchema.index({ email: 1 });
userSchema.index({
  "profile.location.county": 1,
  "profile.location.constituency": 1,
});
userSchema.index({ role: 1, status: 1 });
userSchema.index({ verificationStatus: 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    this.profileCompletion = this.calculateProfileCompletion();
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Error comparing passwords");
  }
};

// Method to check if user can perform representative actions
userSchema.methods.canActAsRepresentative = function () {
  return (
    this.role === "representative" &&
    this.verificationStatus === "approved" &&
    this.status === "active"
  );
};

// Method to check if user is verified
userSchema.methods.isVerified = function () {
  return this.emailVerified && this.verificationStatus === "approved";
};

// Calculate profile completion percentage
userSchema.methods.calculateProfileCompletion = function () {
  const requiredFields = ["name", "email", "phoneNumber"];
  const optionalFields = ["bio", "avatar", "location"];
  const representativeFields = ["county", "constituency", "ward", "partyAffiliation"];
  
  let totalFields = requiredFields.length + optionalFields.length;
  let completedFields = 0;

  // Check required fields
  requiredFields.forEach(field => {
    if (this[field]) completedFields++;
  });

  // Check optional fields
  optionalFields.forEach(field => {
    if (this[field]) completedFields++;
  });

  // Additional fields for representatives
  if (this.role === "representative") {
    totalFields += representativeFields.length;
    representativeFields.forEach(field => {
      if (this.profile.location[field]) completedFields++;
    });
  }

  return Math.round((completedFields / totalFields) * 100);
};

// Clean response for client
userSchema.methods.toClientJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    emailVerified: this.emailVerified,
    verificationStatus: this.verificationStatus,
    profile: this.profile,
    profileCompletion: this.profileCompletion,
    settings: {
      notifications: this.settings.notifications,
      privacy: this.settings.privacy,
    },
    status: this.status,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("User", userSchema);
