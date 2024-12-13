const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['request', 'response', 'update', 'note', 'resolution'],
    default: 'request'
  },
  attachments: [{
    url: String,
    type: String,
    name: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

const interactionSchema = new mongoose.Schema({
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  representative: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  category: {
    type: String,
    enum: [
      'general',
      'complaint',
      'suggestion',
      'inquiry',
      'emergency',
      'feedback',
      'collaboration',
      'resource',
      'other'
    ],
    default: 'general'
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'closed', 'escalated', 'reopened'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  messages: [messageSchema],
  metadata: {
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      },
      address: {
        county: String,
        constituency: String,
        ward: String
      }
    },
    device: String,
    browser: String,
    platform: String,
    ipAddress: String
  },
  tags: [String],
  escalation: {
    level: {
      type: Number,
      default: 0
    },
    reason: String,
    escalatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    escalatedAt: Date,
    history: [{
      level: Number,
      reason: String,
      escalatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      escalatedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  resolution: {
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    summary: String,
    actions: [{
      description: String,
      completedAt: Date,
      completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    aspects: {
      responsiveness: {
        type: Number,
        min: 1,
        max: 5
      },
      effectiveness: {
        type: Number,
        min: 1,
        max: 5
      },
      professionalism: {
        type: Number,
        min: 1,
        max: 5
      }
    },
    comment: String,
    givenAt: Date,
    followUp: Boolean
  },
  timeline: [{
    action: String,
    description: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
interactionSchema.index({ citizen: 1, status: 1 });
interactionSchema.index({ representative: 1, status: 1 });
interactionSchema.index({ organization: 1, status: 1 });
interactionSchema.index({ category: 1 });
interactionSchema.index({ 'metadata.location': '2dsphere' });
interactionSchema.index({ createdAt: -1 });
interactionSchema.index({ 'metadata.location.address.county': 1 });

// Virtual for response time
interactionSchema.virtual('responseTime').get(function() {
  if (this.messages.length < 2) return null;
  const firstResponse = this.messages.find(m => m.type === 'response');
  if (!firstResponse) return null;
  return firstResponse.createdAt - this.createdAt;
});

// Virtual for resolution time
interactionSchema.virtual('resolutionTime').get(function() {
  if (!this.resolution.resolvedAt) return null;
  return this.resolution.resolvedAt - this.createdAt;
});

// Virtual for unread messages count
interactionSchema.virtual('unreadCount').get(function() {
  return this.messages.reduce((count, message) => {
    return count + (message.readBy.length === 0 ? 1 : 0);
  }, 0);
});

// Static method to find nearby interactions
interactionSchema.statics.findNearby = async function(coordinates, maxDistance = 5000) {
  return this.find({
    'metadata.location': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance
      }
    }
  });
};

// Instance method to escalate interaction
interactionSchema.methods.escalate = async function(reason, escalatedBy) {
  this.escalation.level += 1;
  this.escalation.reason = reason;
  this.escalation.escalatedBy = escalatedBy;
  this.escalation.escalatedAt = new Date();
  this.escalation.history.push({
    level: this.escalation.level,
    reason,
    escalatedBy,
  });
  this.status = 'escalated';
  
  // Add to timeline
  this.timeline.push({
    action: 'escalated',
    description: `Escalated to level ${this.escalation.level}: ${reason}`,
    performedBy: escalatedBy
  });
  
  await this.save();
  return this;
};

// Instance method to resolve interaction
interactionSchema.methods.resolve = async function(summary, resolvedBy) {
  this.status = 'resolved';
  this.resolution.resolvedBy = resolvedBy;
  this.resolution.resolvedAt = new Date();
  this.resolution.summary = summary;
  
  // Add to timeline
  this.timeline.push({
    action: 'resolved',
    description: summary,
    performedBy: resolvedBy
  });
  
  await this.save();
  return this;
};

// Instance method to reopen interaction
interactionSchema.methods.reopen = async function(reason, reopenedBy) {
  this.status = 'reopened';
  
  // Add to timeline
  this.timeline.push({
    action: 'reopened',
    description: reason,
    performedBy: reopenedBy
  });
  
  await this.save();
  return this;
};

// Pre-save middleware to update timeline
interactionSchema.pre('save', function(next) {
  if (this.isNew) {
    this.timeline.push({
      action: 'created',
      description: 'Interaction created',
      performedBy: this.citizen
    });
  }
  next();
});

const Interaction = mongoose.model('Interaction', interactionSchema);

module.exports = Interaction;
