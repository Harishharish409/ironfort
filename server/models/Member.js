const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  memberId: {
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
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  address: {
    type: String,
  },
  assignedTrainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  emergencyContact: {
    name: String,
    phone: String,
  },
  joinDate: {
    type: Date,
    default: Date.now,
  },
  removalReason: {
    type: String,
  },
  removedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Member', memberSchema);
