const mongoose = require('mongoose');

const prizeSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event is required']
  },
  prizeName: {
    type: String,
    required: [true, 'Prize name is required'],
    trim: true,
    maxlength: [100, 'Prize name cannot exceed 100 characters']
  },
  prizeDescription: {
    type: String,
    maxlength: [500, 'Prize description cannot exceed 500 characters']
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    enum: ['1st', '2nd', '3rd', 'participation', 'special', 'consolation'],
    trim: true
  },
  prizeValue: {
    type: Number,
    min: [0, 'Prize value cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR',
    trim: true
  },
  // Winner can be individual user or team
  winner: {
    type: {
      type: String,
      enum: ['individual', 'team'],
      required: true
    },
    // For individual winners
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    // For team winners
    teamName: {
      type: String,
      trim: true
    },
    teamMembers: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      email: {
        type: String,
        trim: true,
        lowercase: true
      },
      phone: {
        type: String,
        trim: true
      }
    }],
    // Reference to registration
    registration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration'
    }
  },
  // Prize details
  prizeImage: {
    public_id: String,
    url: String
  },
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateNumber: {
    type: String,
    trim: true
  },
  // Admin details
  awardedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Awarded by admin is required']
  },
  awardedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: [300, 'Notes cannot exceed 300 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
prizeSchema.index({ event: 1 });
prizeSchema.index({ position: 1 });
prizeSchema.index({ 'winner.user': 1 });
prizeSchema.index({ 'winner.registration': 1 });

// Compound indexes
prizeSchema.index({ event: 1, position: 1 });

module.exports = mongoose.model('Prize', prizeSchema);
