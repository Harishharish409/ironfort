const mongoose = require('mongoose');

const bodyMeasurementSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  weight: {
    type: Number, // kg
  },
  height: {
    type: Number, // cm
  },
  bmi: {
    type: Number, // calculated
  },
  chest: {
    type: Number,
  },
  waist: {
    type: Number,
  },
  hips: {
    type: Number,
  },
  arms: {
    type: Number,
  },
  thighs: {
    type: Number,
  },
  bodyFat: {
    type: Number,
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('BodyMeasurement', bodyMeasurementSchema);
