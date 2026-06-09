const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
  },
  quantity: {
    type: Number,
    required: true,
  },
  available: {
    type: Number,
    required: true,
  },
  condition: {
    type: String,
    enum: ['good', 'maintenance', 'broken'],
    default: 'good',
  },
  photoUrl: {
    type: String,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Equipment', equipmentSchema);
