const mongoose = require("mongoose");

const surveyQuestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["text", "singleChoice", "multipleChoice", "rating", "boolean"],
    required: true,
  },
  options: [String], // For single/multiple choice questions
  required: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    required: true,
  },
});

const surveyResponseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  answers: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      answer: mongoose.Schema.Types.Mixed, // Can be String, Number, Boolean, or Array
    },
  ],
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const surveySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Community Development",
        "Education",
        "Health",
        "Environment",
        "Governance",
        "Infrastructure",
        "Other",
      ],
      required: true,
    },
    targetAudience: {
      counties: [String],
      constituencies: [String],
      demographics: {
        ageGroups: [String],
        gender: [String],
        occupation: [String],
      },
    },
    questions: [surveyQuestionSchema],
    responses: [surveyResponseSchema],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "active", "closed", "archived"],
      default: "draft",
    },
    visibility: {
      type: String,
      enum: ["public", "private", "targeted"],
      default: "public",
    },
    responseLimit: {
      type: Number,
      default: null,
    },
    allowAnonymous: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    metadata: {
      purpose: String,
      expectedOutcomes: String,
      followUpActions: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
surveySchema.index({ organization: 1, status: 1 });
surveySchema.index({ "targetAudience.counties": 1 });
surveySchema.index({ "targetAudience.constituencies": 1 });
surveySchema.index({ category: 1 });
surveySchema.index({ startDate: 1, endDate: 1 });
surveySchema.index({ tags: 1 });

// Virtual for response count
surveySchema.virtual("responseCount").get(function () {
  return this.responses.length;
});

// Virtual for completion percentage
surveySchema.virtual("completionPercentage").get(function () {
  if (!this.responseLimit) return null;
  return (this.responses.length / this.responseLimit) * 100;
});

// Method to check if survey is active
surveySchema.methods.isActive = function () {
  const now = new Date();
  return (
    this.status === "active" &&
    now >= this.startDate &&
    now <= this.endDate &&
    (!this.responseLimit || this.responses.length < this.responseLimit)
  );
};

// Method to check if user is eligible
surveySchema.methods.isUserEligible = function (user) {
  if (this.visibility === "public") return true;

  if (this.visibility === "targeted") {
    // Check location criteria
    const isLocationMatch =
      !this.targetAudience.counties.length ||
      this.targetAudience.counties.includes(user.county);

    const isConstituencyMatch =
      !this.targetAudience.constituencies.length ||
      this.targetAudience.constituencies.includes(user.constituency);

    // Check demographic criteria
    const isDemographicMatch =
      (!this.targetAudience.demographics.ageGroups.length ||
        this.targetAudience.demographics.ageGroups.includes(
          user.demographics?.ageGroup
        )) &&
      (!this.targetAudience.demographics.gender.length ||
        this.targetAudience.demographics.gender.includes(
          user.demographics?.gender
        )) &&
      (!this.targetAudience.demographics.occupation.length ||
        this.targetAudience.demographics.occupation.includes(
          user.demographics?.occupation
        ));

    return isLocationMatch && isConstituencyMatch && isDemographicMatch;
  }

  return false;
};

module.exports = mongoose.model("Survey", surveySchema);
