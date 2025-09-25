const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event is required']
  },
  registration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration',
    required: [true, 'Registration is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  attendanceStatus: {
    type: String,
    enum: ['present', 'absent', 'late'],
    default: 'absent'
  },
  checkInTime: {
    type: Date
  },
  checkOutTime: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: [200, 'Notes cannot exceed 200 characters']
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Marked by admin is required']
  },
  markedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
attendanceSchema.index({ event: 1 });
attendanceSchema.index({ registration: 1 });
attendanceSchema.index({ user: 1 });
attendanceSchema.index({ attendanceStatus: 1 });

// Compound indexes
attendanceSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
