const mongoose = require('mongoose');

const memberSubscriptionSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'pending_renewal'],
    default: 'active',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'confirmed'],
    default: 'pending',
  },
  renewalRequested: {
    type: Boolean,
    default: false,
  },
  renewalNotifiedAt: {
    type: Date,
  },
  planSwitchRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('MemberSubscription', memberSubscriptionSchema);
