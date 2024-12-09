const mongoose = require("mongoose");

const metricValueSchema = new mongoose.Schema({
  indicator: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  unit: String,
  previousValue: Number,
  changePercentage: Number,
  target: Number,
  notes: String,
});

const impactMetricSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    category: {
      type: String,
      enum: [
        "Education",
        "Health",
        "Economic",
        "Environmental",
        "Social",
        "Infrastructure",
        "Governance",
        "Other",
      ],
      required: true,
    },
    location: {
      county: {
        type: String,
        required: true,
      },
      constituency: String,
      ward: String,
    },
    date: {
      type: Date,
      required: true,
    },
    period: {
      type: String,
      enum: ["daily", "weekly", "monthly", "quarterly", "yearly"],
      required: true,
    },
    metrics: [metricValueSchema],
    beneficiaries: {
      total: Number,
      demographics: {
        gender: {
          male: Number,
          female: Number,
          other: Number,
        },
        ageGroups: {
          under18: Number,
          "18-24": Number,
          "25-34": Number,
          "35-44": Number,
          "45-54": Number,
          "55+": Number,
        },
      },
    },
    resources: {
      financial: {
        allocated: Number,
        spent: Number,
        currency: {
          type: String,
          default: "KES",
        },
      },
      human: {
        staff: Number,
        volunteers: Number,
      },
    },
    outcomes: [
      {
        description: String,
        achieved: Boolean,
        evidence: String,
        impact: {
          type: String,
          enum: ["low", "medium", "high"],
        },
      },
    ],
    challenges: [
      {
        description: String,
        status: {
          type: String,
          enum: ["identified", "addressing", "resolved"],
        },
        solution: String,
      },
    ],
    sustainability: {
      environmental: {
        type: String,
        enum: ["negative", "neutral", "positive"],
      },
      financial: {
        type: String,
        enum: ["dependent", "partially_sustainable", "sustainable"],
      },
      social: {
        type: String,
        enum: ["low", "medium", "high"],
      },
    },
    verification: {
      status: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
      },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      verificationDate: Date,
      evidence: [
        {
          type: String,
          url: String,
          description: String,
        },
      ],
    },
    feedback: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        comment: String,
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    attachments: [
      {
        name: String,
        url: String,
        type: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    tags: [String],
    metadata: {
      dataSource: String,
      methodology: String,
      limitations: String,
      notes: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
impactMetricSchema.index({ organization: 1, date: -1 });
impactMetricSchema.index({ "location.county": 1, "location.constituency": 1 });
impactMetricSchema.index({ category: 1 });
impactMetricSchema.index({ project: 1 });
impactMetricSchema.index({ tags: 1 });
impactMetricSchema.index({ "verification.status": 1 });

// Virtual for impact score
impactMetricSchema.virtual("impactScore").get(function () {
  let score = 0;
  const weights = {
    beneficiaries: 0.3,
    outcomes: 0.3,
    sustainability: 0.2,
    resources: 0.2,
  };

  // Calculate beneficiaries score
  if (this.beneficiaries?.total) {
    score += (this.beneficiaries.total / 1000) * weights.beneficiaries; // Normalize per 1000 beneficiaries
  }

  // Calculate outcomes score
  if (this.outcomes?.length) {
    const achievedOutcomes = this.outcomes.filter((o) => o.achieved).length;
    score += (achievedOutcomes / this.outcomes.length) * weights.outcomes;
  }

  // Calculate sustainability score
  if (this.sustainability) {
    let sustainabilityScore = 0;
    if (this.sustainability.environmental === "positive") sustainabilityScore++;
    if (this.sustainability.financial === "sustainable") sustainabilityScore++;
    if (this.sustainability.social === "high") sustainabilityScore++;
    score += (sustainabilityScore / 3) * weights.sustainability;
  }

  // Calculate resource utilization score
  if (this.resources?.financial) {
    const utilizationRate =
      this.resources.financial.spent / this.resources.financial.allocated;
    score += Math.min(utilizationRate, 1) * weights.resources;
  }

  return Math.round(score * 100) / 100; // Round to 2 decimal places
});

// Method to calculate progress towards targets
impactMetricSchema.methods.calculateProgress = function () {
  return this.metrics.map((metric) => {
    if (!metric.target) return null;
    return {
      indicator: metric.indicator,
      progress: (metric.value / metric.target) * 100,
      remaining: metric.target - metric.value,
    };
  });
};

// Method to compare with previous period
impactMetricSchema.methods.periodComparison = function (previousMetric) {
  if (!previousMetric) return null;

  return {
    beneficiariesChange:
      ((this.beneficiaries?.total - previousMetric.beneficiaries?.total) /
        previousMetric.beneficiaries?.total) *
      100,
    resourceUtilization:
      (this.resources?.financial?.spent /
        this.resources?.financial?.allocated) *
      100,
    outcomesAchieved: this.outcomes?.filter((o) => o.achieved).length,
    challengesResolved: this.challenges?.filter((c) => c.status === "resolved")
      .length,
  };
};

module.exports = mongoose.model("ImpactMetric", impactMetricSchema);
