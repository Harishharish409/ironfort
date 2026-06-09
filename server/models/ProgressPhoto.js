const mongoose = require('mongoose');

const progressPhotoSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  photoUrl: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ProgressPhoto', progressPhotoSchema);
