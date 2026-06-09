const mongoose = require('mongoose');

const supplementBookingSchema = new mongoose.Schema({
  supplement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplement',
    required: true,
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  },
  bookedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('SupplementBooking', supplementBookingSchema);
