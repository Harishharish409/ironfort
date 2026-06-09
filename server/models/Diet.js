const mongoose = require('mongoose');

const dietSchema = new mongoose.Schema({
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  meals: [{
    mealTime: {
      type: String,
      required: true,
    },
    items: [{
      type: String,
    }],
    calories: {
      type: Number,
    },
    protein: {
      type: Number,
    },
    carbs: {
      type: Number,
    },
    fat: {
      type: Number,
    },
    notes: {
      type: String,
    },
  }],
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Diet', dietSchema);
