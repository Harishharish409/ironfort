const User = require('../models/User');
const Member = require('../models/Member');
const Trainer = require('../models/Trainer');
const { findTrainerByIdentifier, normalizeCode } = require('../utils/profileAccess');

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const syncTrainerMemberAssignment = async (member, trainerIdentifier) => {
  if (member.assignedTrainer) {
    await Trainer.findOneAndUpdate(
      { user: member.assignedTrainer },
      { $pull: { assignedMembers: member.user } }
    );
  }

  if (!trainerIdentifier) {
    member.assignedTrainer = undefined;
    await member.save();
    return null;
  }

  const trainer = await findTrainerByIdentifier(trainerIdentifier);
  if (!trainer) {
    const error = new Error('Trainer not found');
    error.statusCode = 404;
    throw error;
  }

  member.assignedTrainer = trainer.user._id;
  await member.save();

  await Trainer.findByIdAndUpdate(
    trainer._id,
    { $addToSet: { assignedMembers: member.user } }
  );

  return trainer;
};

// @desc    Register a new trainer
// @route   POST /api/admin/register-trainer
// @access  Admin
const registerTrainer = async (req, res) => {
  try {
    const {
      username,
      password,
      trainerId,
      fullName,
      email,
      phone,
      specialization,
      experience,
      certifications,
    } = req.body;

    // Check if username already exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const normalizedTrainerId = normalizeCode(trainerId);
    if (!normalizedTrainerId) {
      return res.status(400).json({ message: 'Trainer ID is required' });
    }

    const trainerIdExists = await Trainer.findOne({ trainerId: normalizedTrainerId });
    if (trainerIdExists) {
      return res.status(400).json({ message: 'Trainer ID already exists' });
    }

    // Validate unique email/phone (prevents using same email/phone for another account)
    if (email) {
      const emailExists = await Trainer.findOne({ email: normalizeEmail(email) });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    if (phone) {
      const phoneExists = await Trainer.findOne({ phone });
      if (phoneExists) {
        return res.status(400).json({ message: 'Mobile number already exists' });
      }
    }

    // Create user
    const user = await User.create({
      username,
      password,
      role: 'trainer',
      createdBy: req.user._id,
      mustChangePassword: true,
    });

    // Create trainer profile
    const trainer = await Trainer.create({
      user: user._id,
      trainerId: normalizedTrainerId,
      fullName,
      email: normalizeEmail(email),
      phone,
      specialization: specialization || [],
      experience: experience || 0,
      certifications: certifications || [],
    });

    res.status(201).json({
      message: 'Trainer registered successfully',
      trainer: {
        _id: trainer._id,
        user: {
          _id: user._id,
          username: user.username,
          role: user.role,
        },
        trainerId: trainer.trainerId,
        fullName: trainer.fullName,
        email: trainer.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Register a new member
// @route   POST /api/admin/register-member
// @access  Admin
const registerMember = async (req, res) => {
  try {
    const {
      username,
      password,
      memberId,
      fullName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      assignedTrainer,
    } = req.body;

    // Check if username already exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const normalizedMemberId = normalizeCode(memberId);
    if (!normalizedMemberId) {
      return res.status(400).json({ message: 'Member ID is required' });
    }

    const memberIdExists = await Member.findOne({ memberId: normalizedMemberId });
    if (memberIdExists) {
      return res.status(400).json({ message: 'Member ID already exists' });
    }

    if (assignedTrainer) {
      const trainer = await findTrainerByIdentifier(assignedTrainer);
      if (!trainer) {
        return res.status(404).json({ message: 'Trainer not found' });
      }
    }

    // Validate unique email/phone (prevents using same email/phone for another account)
    if (email) {
      const emailExists = await Member.findOne({ email: normalizeEmail(email) });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    if (phone) {
      const phoneExists = await Member.findOne({ phone });
      if (phoneExists) {
        return res.status(400).json({ message: 'Mobile number already exists' });
      }
    }

    // Create user
    const user = await User.create({
      username,
      password,
      role: 'member',
      createdBy: req.user._id,
      mustChangePassword: true,
    });

    // Create member profile
    const member = await Member.create({
      user: user._id,
      memberId: normalizedMemberId,
      fullName,
      email: normalizeEmail(email),
      phone,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
    });

    if (assignedTrainer) {
      await syncTrainerMemberAssignment(member, assignedTrainer);
    }

    res.status(201).json({
      message: 'Member registered successfully',
      member: {
        _id: member._id,
        memberId: member.memberId,
        user: {
          _id: user._id,
          username: user.username,
          role: user.role,
        },
        fullName: member.fullName,
        email: member.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove a trainer (soft delete)
// @route   DELETE /api/admin/trainers/:id
// @access  Admin
const removeTrainer = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Reason is required' });
    }

    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    // Deactivate user
    await User.findByIdAndUpdate(trainer.user, { isActive: false });

    // Update trainer profile
    trainer.removalReason = reason;
    trainer.removedAt = new Date();
    await trainer.save();

    res.json({ message: 'Trainer removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove a member (soft delete)
// @route   DELETE /api/admin/members/:id
// @access  Admin
const removeMember = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Reason is required' });
    }

    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Deactivate user
    await User.findByIdAndUpdate(member.user, { isActive: false });

    // Update member profile
    member.removalReason = reason;
    member.removedAt = new Date();
    await member.save();

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reset user credentials
// @route   PATCH /api/admin/users/:userId/reset-credentials
// @access  Admin
const resetCredentials = async (req, res) => {
  try {
    const { newUsername, newPassword } = req.body;

    if (!newUsername && !newPassword) {
      return res.status(400).json({ message: 'Provide at least one field to update' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (newUsername) {
      const usernameExists = await User.findOne({ username: newUsername });
      if (usernameExists) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      user.username = newUsername;
    }

    if (newPassword) {
      user.password = newPassword;
      user.mustChangePassword = true;
    }

    await user.save();

    res.json({ message: 'Credentials updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Assign trainer to member
// @route   PATCH /api/admin/members/:memberId/assign-trainer
// @access  Admin
const assignTrainer = async (req, res) => {
  try {
    const { trainerId } = req.body;

    const member = await Member.findById(req.params.memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    await syncTrainerMemberAssignment(member, trainerId);

    res.json({ message: trainerId ? 'Trainer assigned successfully' : 'Trainer removed successfully' });
  } catch (error) {
    console.error(error);
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all members
// @route   GET /api/admin/members
// @access  Admin
const getAllMembers = async (req, res) => {
  try {
    const members = await Member.find()
      .populate('user', 'username role isActive profilePhoto')
      .populate('assignedTrainer', 'username role isActive profilePhoto')
      .sort({ createdAt: -1 });

    res.json(members);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all trainers
// @route   GET /api/admin/trainers
// @access  Admin
const getAllTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find()
      .populate('user', 'username role isActive profilePhoto')
      .populate('assignedMembers', 'username')
      .sort({ createdAt: -1 });

    res.json(trainers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get member by ID
// @route   GET /api/admin/members/:id
// @access  Admin
const getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id)
      .populate('user', 'username role isActive profilePhoto')
      .populate('assignedTrainer', 'username role isActive profilePhoto');

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json(member);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get trainer by ID
// @route   GET /api/admin/trainers/:id
// @access  Admin
const getTrainerById = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id)
      .populate('user', 'username role isActive profilePhoto')
      .populate('assignedMembers', 'username role isActive profilePhoto');

    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    const trainerObject = trainer.toObject();
    const memberProfiles = await Member.find({ user: { $in: trainer.assignedMembers.map((member) => member._id) } })
      .populate('user', 'username role isActive profilePhoto')
      .sort({ fullName: 1 });

    trainerObject.assignedMembers = memberProfiles;

    res.json(trainerObject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Hard delete a trainer (remove from DB)
// @route   DELETE /api/admin/trainers/:id/hard
// @access  Admin
const hardDeleteTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    // Pull trainer from any member assignment arrays
    await Member.updateMany(
      { assignedTrainer: trainer.user },
      { $unset: { assignedTrainer: '' } }
    );

    // Delete role-specific documents first
    await Trainer.findByIdAndDelete(trainer._id);
    await User.findByIdAndDelete(trainer.user);

    res.json({ message: 'Trainer hard deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Hard delete a member (remove from DB)
// @route   DELETE /api/admin/members/:id/hard
// @access  Admin
const hardDeleteMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Remove member from any trainer assignedMembers arrays
    await Trainer.updateMany(
      { assignedMembers: member.user },
      { $pull: { assignedMembers: member.user } }
    );

    // Delete role-specific documents first
    await Member.findByIdAndDelete(member._id);
    await User.findByIdAndDelete(member.user);

    res.json({ message: 'Member hard deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerTrainer,
  registerMember,
  removeTrainer,
  removeMember,
  hardDeleteTrainer,
  hardDeleteMember,
  resetCredentials,
  assignTrainer,
  getAllMembers,
  getAllTrainers,
  getMemberById,
  getTrainerById,
};
