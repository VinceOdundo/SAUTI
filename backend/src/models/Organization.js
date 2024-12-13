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
      enum: ["NGO", "CBO", "Foundation", "Trust", "Association"],
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
        verifiedAt: Date,
        verifiedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }
      },
      additionalDocs: [
        {
          name: String,
          url: String,
          uploadedAt: {
            type: Date,
            default: Date.now
          }
        },
      ],
    },
    verificationNotes: String,
    contact: {
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
        coordinates: {
          latitude: Number,
          longitude: Number
        }
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
      website: String,
      socialMedia: {
        facebook: String,
        twitter: String,
        linkedin: String,
        instagram: String
      }
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
          enum: ["admin", "manager", "member"],
          default: "member",
        },
        title: String,
        permissions: [{
          type: String,
          enum: [
            "manage_projects",
            "manage_representatives",
            "manage_settings",
            "view_analytics",
            "manage_interactions"
          ]
        }],
        joinedAt: {
          type: Date,
          default: Date.now
        }
      },
    ],
    areas: [
      {
        county: String,
        constituency: String,
        ward: String,
        priority: {
          type: String,
          enum: ['primary', 'secondary'],
          default: 'primary'
        }
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
          "Agriculture",
          "Technology",
          "Economic Empowerment",
          "Disability Rights",
          "Mental Health",
          "Child Protection",
          "Elder Care",
          "Other",
        ],
      },
    ],
    description: {
      type: String,
      required: [true, "Organization description is required"],
      maxlength: 2000,
    },
    mission: {
      type: String,
      maxlength: 1000
    },
    vision: {
      type: String,
      maxlength: 1000
    },
    projects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    }],
    settings: {
      notifications: {
        type: Boolean,
        default: true
      },
      privacy: {
        projectVisibility: {
          type: String,
          enum: ['public', 'private', 'registered'],
          default: 'public'
        },
        contactVisibility: {
          type: String,
          enum: ['public', 'private', 'registered'],
          default: 'registered'
        }
      },
      language: {
        type: String,
        enum: ['en', 'sw'],
        default: 'en'
      }
    },
    metrics: {
      projectsCompleted: {
        type: Number,
        default: 0
      },
      beneficiariesReached: {
        type: Number,
        default: 0
      },
      interactionsCount: {
        type: Number,
        default: 0
      },
      lastActivityAt: Date
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'inactive'],
      default: 'active'
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
organizationSchema.index({ 'contact.county': 1, verified: 1 });
organizationSchema.index({ focus: 1 });
organizationSchema.index({ status: 1 });
organizationSchema.index({ 'representatives.user': 1 });

// Virtual for active projects count
organizationSchema.virtual('activeProjectsCount').get(function() {
  return this.projects.length;
});

// Method to check if user is representative
organizationSchema.methods.isRepresentative = function(userId) {
  return this.representatives.some(rep => rep.user.toString() === userId.toString());
};

// Method to get representative role
organizationSchema.methods.getRepresentativeRole = function(userId) {
  const rep = this.representatives.find(rep => rep.user.toString() === userId.toString());
  return rep ? rep.role : null;
};

// Method to check representative permission
organizationSchema.methods.hasPermission = function(userId, permission) {
  const rep = this.representatives.find(rep => rep.user.toString() === userId.toString());
  return rep && rep.permissions.includes(permission);
};

// Method to update metrics
organizationSchema.methods.updateMetrics = async function(updates) {
  Object.assign(this.metrics, updates);
  this.metrics.lastActivityAt = new Date();
  await this.save();
};

// Pre-save middleware
organizationSchema.pre('save', function(next) {
  if (this.isModified('projects')) {
    this.metrics.projectsCompleted = this.projects.length;
  }
  next();
});

const Organization = mongoose.model("Organization", organizationSchema);

module.exports = Organization;
