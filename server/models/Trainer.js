const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  trainerId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  phone: {
    type: String,
  },
  specialization: [{
    type: String,
  }],
  experience: {
    type: Number, // years
  },
  certifications: [{
    type: String,
  }],
  assignedMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  removalReason: {
    type: String,
  },
  removedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Trainer', trainerSchema);
