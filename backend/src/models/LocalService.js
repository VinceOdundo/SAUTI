const mongoose = require("mongoose");

const operatingHoursSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    required: true,
  },
  open: {
    type: String,
    required: true,
  },
  close: {
    type: String,
    required: true,
  },
  closed: {
    type: Boolean,
    default: false,
  },
});

const localServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Healthcare",
        "Education",
        "Social Services",
        "Legal Aid",
        "Youth Programs",
        "Women's Services",
        "Environmental",
        "Business Support",
        "Emergency Services",
        "Other",
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      address: {
        street: String,
        city: String,
        county: {
          type: String,
          required: true,
        },
        constituency: String,
        ward: String,
        postalCode: String,
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    contact: {
      phone: {
        type: String,
        required: true,
      },
      email: String,
      website: String,
    },
    operatingHours: [operatingHoursSchema],
    availability: {
      type: String,
      enum: ["available", "limited", "unavailable", "by_appointment"],
      default: "available",
    },
    capacity: {
      current: Number,
      maximum: Number,
    },
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    cost: {
      type: String,
      enum: ["free", "subsidized", "paid"],
      default: "free",
    },
    costDetails: String,
    targetBeneficiaries: [String],
    languages: [String],
    accessibility: {
      wheelchairAccessible: {
        type: Boolean,
        default: false,
      },
      signLanguage: {
        type: Boolean,
        default: false,
      },
      brailleMaterials: {
        type: Boolean,
        default: false,
      },
      other: [String],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    images: [
      {
        url: String,
        caption: String,
      },
    ],
    documents: [
      {
        name: String,
        url: String,
        type: String,
      },
    ],
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        review: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    tags: [String],
    metadata: {
      establishedDate: Date,
      lastVerified: Date,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      notes: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
localServiceSchema.index({
  "location.address.county": 1,
  "location.address.constituency": 1,
});
localServiceSchema.index({ category: 1 });
localServiceSchema.index({ status: 1, verificationStatus: 1 });
localServiceSchema.index({ organization: 1 });
localServiceSchema.index({ tags: 1 });
localServiceSchema.index({
  name: "text",
  description: "text",
  requirements: "text",
});

// Virtual for average rating
localServiceSchema.virtual("averageRating").get(function () {
  if (!this.ratings.length) return null;
  const sum = this.ratings.reduce((acc, curr) => acc + curr.rating, 0);
  return (sum / this.ratings.length).toFixed(1);
});

// Method to check if service is currently open
localServiceSchema.methods.isCurrentlyOpen = function () {
  if (this.status !== "active") return false;

  const now = new Date();
  const currentDay = now
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
  const currentTime = now.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });

  const todayHours = this.operatingHours.find(
    (hours) => hours.day.toLowerCase() === currentDay
  );

  if (!todayHours || todayHours.closed) return false;

  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};

// Method to check if service is available for user
localServiceSchema.methods.isAvailableForUser = function (user) {
  if (this.status !== "active") return false;

  // Check location match
  const isLocationMatch =
    user.county === this.location.address.county &&
    (!this.location.address.constituency ||
      user.constituency === this.location.address.constituency);

  // Check capacity
  const hasCapacity =
    !this.capacity.maximum || this.capacity.current < this.capacity.maximum;

  return isLocationMatch && hasCapacity;
};

module.exports = mongoose.model("LocalService", localServiceSchema);
