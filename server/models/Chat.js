const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  participantsKey: {
    type: String,
    required: true,
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {},
  },
}, {
  timestamps: true,
});

chatSchema.pre('validate', function(next) {
  if (this.participants?.length) {
    const participantIds = [...new Set(this.participants.map((id) => id.toString()))].sort();
    this.participants = participantIds;
    this.participantsKey = participantIds.join(':');
  }

  next();
});

// Ensure only one direct chat exists for the same two users.
chatSchema.index({ participantsKey: 1 }, { unique: true });
chatSchema.index({ participants: 1, updatedAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);
