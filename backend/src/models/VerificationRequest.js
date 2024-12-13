const mongoose = require('mongoose');

const verificationRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documentType: {
    type: String,
    required: true,
    enum: ['nationalId', 'passport', 'driverLicense']
  },
  documentNumber: {
    type: String,
    required: true
  },
  documentUrl: {
    type: String,
    required: true
  },
  selfieUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  notes: String,
  rejectionReason: String,
  attempts: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Prevent multiple pending requests
verificationRequestSchema.pre('save', async function(next) {
  if (this.isNew) {
    const pendingRequest = await this.constructor.findOne({
      user: this.user,
      status: 'pending'
    });

    if (pendingRequest) {
      throw new Error('You already have a pending verification request');
    }

    const previousRequests = await this.constructor.find({ user: this.user });
    this.attempts = previousRequests.length + 1;
  }
  next();
});

const VerificationRequest = mongoose.model('VerificationRequest', verificationRequestSchema);

module.exports = VerificationRequest;
