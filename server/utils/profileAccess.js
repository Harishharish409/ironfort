const mongoose = require('mongoose');
const Member = require('../models/Member');
const Trainer = require('../models/Trainer');

const normalizeCode = (value) => String(value || '').trim().toUpperCase();

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const findMemberByIdentifier = async (identifier) => {
  const code = normalizeCode(identifier);

  if (!code) {
    return null;
  }

  const query = { memberId: code };

  if (isObjectId(identifier)) {
    query.$or = [
      { memberId: code },
      { user: identifier },
      { _id: identifier },
    ];
    delete query.memberId;
  }

  return Member.findOne(query).populate('user', 'username role isActive profilePhoto');
};

const findTrainerByIdentifier = async (identifier) => {
  const code = normalizeCode(identifier);

  if (!code) {
    return null;
  }

  const query = { trainerId: code };

  if (isObjectId(identifier)) {
    query.$or = [
      { trainerId: code },
      { user: identifier },
      { _id: identifier },
    ];
    delete query.trainerId;
  }

  return Trainer.findOne(query).populate('user', 'username role isActive profilePhoto');
};

const trainerHasMember = async (trainerUserId, memberUserId) => (
  !!await Trainer.exists({
    user: trainerUserId,
    assignedMembers: memberUserId,
  })
);

const ensureTraineeAccess = async (req, member) => {
  if (!member?.user) {
    return false;
  }

  const memberUserId = member.user._id || member.user;

  if (req.user.role === 'admin') {
    return true;
  }

  if (req.user.role === 'member') {
    return memberUserId.toString() === req.user._id.toString();
  }

  if (req.user.role === 'trainer') {
    return trainerHasMember(req.user._id, memberUserId);
  }

  return false;
};

const getAssignedTrainees = async (trainerUserId) => {
  const trainer = await Trainer.findOne({ user: trainerUserId }).select('assignedMembers');

  if (!trainer) {
    return [];
  }

  return Member.find({ user: { $in: trainer.assignedMembers } })
    .populate('user', 'username role isActive profilePhoto')
    .populate('assignedTrainer', 'username role isActive profilePhoto')
    .sort({ fullName: 1 });
};

module.exports = {
  ensureTraineeAccess,
  findMemberByIdentifier,
  findTrainerByIdentifier,
  getAssignedTrainees,
  normalizeCode,
  trainerHasMember,
};
