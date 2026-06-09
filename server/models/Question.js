const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  askedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['diet', 'workout', 'equipment', 'subscription', 'general'],
    default: 'general',
  },
  answer: {
    type: String,
  },
  answeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  answeredAt: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['pending', 'answered'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Question', questionSchema);
