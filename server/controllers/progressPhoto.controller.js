const ProgressPhoto = require('../models/ProgressPhoto');
const {
  ensureTraineeAccess,
  findMemberByIdentifier,
} = require('../utils/profileAccess');

// @desc    Upload progress photo
// @route   POST /api/progress-photos
// @access  Member
const uploadProgressPhoto = async (req, res) => {
  try {
    const { photoUrl, caption, sharedWith } = req.body;

    const photo = await ProgressPhoto.create({
      member: req.user._id,
      photoUrl,
      caption,
      sharedWith: sharedWith || [],
    });

    res.status(201).json(photo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get own progress photos
// @route   GET /api/progress-photos/me
// @access  Member
const getMyProgressPhotos = async (req, res) => {
  try {
    const photos = await ProgressPhoto.find({ member: req.user._id })
      .populate('sharedWith', 'username')
      .sort({ uploadedAt: -1 });

    res.json(photos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get member's progress photos (for trainer)
// @route   GET /api/progress-photos/member/:memberId
// @access  Trainer
const getMemberProgressPhotos = async (req, res) => {
  try {
    const member = await findMemberByIdentifier(req.params.memberId);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const hasAccess = await ensureTraineeAccess(req, member);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Not authorized for this member' });
    }

    const photos = await ProgressPhoto.find({ member: member.user._id })
      .populate('sharedWith', 'username')
      .sort({ uploadedAt: -1 });

    res.json(photos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  uploadProgressPhoto,
  getMyProgressPhotos,
  getMemberProgressPhotos,
};
