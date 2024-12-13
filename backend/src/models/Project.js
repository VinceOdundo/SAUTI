const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'suspended', 'deleted'],
    default: 'draft'
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  location: {
    county: String,
    constituency: String,
    ward: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  budget: {
    amount: Number,
    currency: {
      type: String,
      default: 'KES'
    }
  },
  team: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  objectives: [{
    description: String,
    completed: {
      type: Boolean,
      default: false
    }
  }],
  impact: {
    beneficiaries: Number,
    metrics: [{
      name: String,
      value: Number,
      unit: String
    }]
  },
  documents: [{
    title: String,
    url: String,
    type: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  updates: [{
    title: String,
    description: String,
    date: {
      type: Date,
      default: Date.now
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  visibility: {
    type: String,
    enum: ['public', 'private', 'registered'],
    default: 'public'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
projectSchema.index({ organization: 1, status: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ 'location.county': 1, 'location.constituency': 1 });
projectSchema.index({ startDate: 1, endDate: 1 });

// Virtual for project duration
projectSchema.virtual('duration').get(function() {
  if (!this.endDate) return null;
  return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
});

// Virtual for completion percentage
projectSchema.virtual('completionPercentage').get(function() {
  if (!this.objectives || this.objectives.length === 0) return 0;
  const completed = this.objectives.filter(obj => obj.completed).length;
  return Math.round((completed / this.objectives.length) * 100);
});

// Method to check if project is active
projectSchema.methods.isActive = function() {
  return this.status === 'active' && 
         this.startDate <= new Date() && 
         (!this.endDate || this.endDate >= new Date());
};

// Method to add team member
projectSchema.methods.addTeamMember = async function(userId) {
  if (!this.team.includes(userId)) {
    this.team.push(userId);
    await this.save();
  }
};

// Method to remove team member
projectSchema.methods.removeTeamMember = async function(userId) {
  this.team = this.team.filter(id => id.toString() !== userId.toString());
  await this.save();
};

// Method to add project update
projectSchema.methods.addUpdate = async function(update) {
  this.updates.push(update);
  await this.save();
  return this.updates[this.updates.length - 1];
};

// Pre-save middleware to ensure endDate is after startDate
projectSchema.pre('save', function(next) {
  if (this.endDate && this.startDate > this.endDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
