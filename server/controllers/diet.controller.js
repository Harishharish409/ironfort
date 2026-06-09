const Diet = require('../models/Diet');
const {
  ensureTraineeAccess,
  findMemberByIdentifier,
} = require('../utils/profileAccess');

const resolveAccessibleMember = async (req, identifier) => {
  const member = await findMemberByIdentifier(identifier);

  if (!member) {
    const error = new Error('Member not found');
    error.statusCode = 404;
    throw error;
  }

  const hasAccess = await ensureTraineeAccess(req, member);
  if (!hasAccess) {
    const error = new Error('Not authorized for this member');
    error.statusCode = 403;
    throw error;
  }

  return member;
};

// @desc    Assign diet to a member
// @route   POST /api/diets
// @access  Trainer
const assignDiet = async (req, res) => {
  try {
    const { assignedTo, title, frequency, startDate, endDate, meals, notes } = req.body;
    const member = await resolveAccessibleMember(req, assignedTo);

    const diet = await Diet.create({
      assignedTo: member.user._id,
      assignedBy: req.user._id,
      title,
      frequency,
      startDate,
      endDate,
      meals,
      notes,
    });

    res.status(201).json(diet);
  } catch (error) {
    console.error(error);
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get member's diets
// @route   GET /api/diets/member/:memberId
// @access  Trainer/Member
const getMemberDiets = async (req, res) => {
  try {
    const member = await resolveAccessibleMember(req, req.params.memberId);

    const diets = await Diet.find({ assignedTo: member.user._id })
      .populate('assignedBy', 'username')
      .sort({ createdAt: -1 });

    res.json(diets);
  } catch (error) {
    console.error(error);
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update diet
// @route   PATCH /api/diets/:id
// @access  Trainer
const updateDiet = async (req, res) => {
  try {
    const existingDiet = await Diet.findById(req.params.id);

    if (!existingDiet) {
      return res.status(404).json({ message: 'Diet not found' });
    }

    const member = await resolveAccessibleMember(req, existingDiet.assignedTo);
    const updates = { ...req.body, assignedTo: member.user._id, assignedBy: req.user._id };
    const diet = await Diet.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json(diet);
  } catch (error) {
    console.error(error);
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete diet
// @route   DELETE /api/diets/:id
// @access  Trainer
const deleteDiet = async (req, res) => {
  try {
    const diet = await Diet.findById(req.params.id);

    if (!diet) {
      return res.status(404).json({ message: 'Diet not found' });
    }

    await resolveAccessibleMember(req, diet.assignedTo);
    await diet.deleteOne();

    res.json({ message: 'Diet deleted successfully' });
  } catch (error) {
    console.error(error);
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  assignDiet,
  getMemberDiets,
  updateDiet,
  deleteDiet,
};
