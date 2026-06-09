const Attendance = require('../models/Attendance');
const BodyMeasurement = require('../models/BodyMeasurement');
const Diet = require('../models/Diet');
const MemberSubscription = require('../models/MemberSubscription');
const ProgressPhoto = require('../models/ProgressPhoto');
const Workout = require('../models/Workout');
const {
  ensureTraineeAccess,
  findMemberByIdentifier,
  getAssignedTrainees,
} = require('../utils/profileAccess');

const getMyTrainees = async (req, res) => {
  try {
    const trainees = await getAssignedTrainees(req.user._id);

    res.json(trainees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTraineeDetails = async (req, res) => {
  try {
    const member = await findMemberByIdentifier(req.params.memberId);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const hasAccess = await ensureTraineeAccess(req, member);
    if (!hasAccess || req.user.role !== 'trainer') {
      return res.status(403).json({ message: 'Not authorized for this trainee' });
    }

    const memberUserId = member.user._id;
    const [
      workouts,
      diets,
      measurements,
      progressPhotos,
      subscription,
      attendance,
    ] = await Promise.all([
      Workout.find({ assignedTo: memberUserId }).populate('assignedBy', 'username').sort({ createdAt: -1 }),
      Diet.find({ assignedTo: memberUserId }).populate('assignedBy', 'username').sort({ createdAt: -1 }),
      BodyMeasurement.find({ member: memberUserId }).populate('recordedBy', 'username').sort({ date: -1 }),
      ProgressPhoto.find({ member: memberUserId }).sort({ uploadedAt: -1 }),
      MemberSubscription.findOne({ member: memberUserId }).populate('plan').sort({ createdAt: -1 }),
      Attendance.find({ user: memberUserId }).sort({ date: -1 }).limit(30),
    ]);

    res.json({
      member,
      workouts,
      diets,
      measurements,
      progressPhotos,
      subscription,
      attendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMyTrainees,
  getTraineeDetails,
};
