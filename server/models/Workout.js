const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
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
  exercises: [{
    name: {
      type: String,
      required: true,
    },
    sets: {
      type: Number,
      required: true,
    },
    reps: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
    },
    restTime: {
      type: String,
    },
    videoUrl: {
      type: String,
    },
    notes: {
      type: String,
    },
    doneStatus: {
      type: Boolean,
      default: false,
    },
    doneMarkedAt: {
      type: Date,
    },
  }],
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Workout', workoutSchema);
