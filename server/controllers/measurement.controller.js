const BodyMeasurement = require('../models/BodyMeasurement');
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

// @desc    Record measurement for member
// @route   POST /api/measurements
// @access  Trainer
const recordMeasurement = async (req, res) => {
  try {
    const { memberId, date, weight, height, chest, waist, hips, arms, thighs, bodyFat, notes } = req.body;
    const member = await resolveAccessibleMember(req, memberId);

    // Calculate BMI if weight and height are provided
    let bmi = null;
    if (weight && height) {
      const heightInMeters = height / 100;
      bmi = weight / (heightInMeters * heightInMeters);
    }

    const measurement = await BodyMeasurement.create({
      member: member.user._id,
      recordedBy: req.user._id,
      date: date || new Date(),
      weight,
      height,
      bmi,
      chest,
      waist,
      hips,
      arms,
      thighs,
      bodyFat,
      notes,
    });

    res.status(201).json(measurement);
  } catch (error) {
    console.error(error);
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get measurement history for member
// @route   GET /api/measurements/member/:memberId
// @access  Trainer/Member
const getMemberMeasurements = async (req, res) => {
  try {
    const member = await resolveAccessibleMember(req, req.params.memberId);

    const measurements = await BodyMeasurement.find({ member: member.user._id })
      .populate('recordedBy', 'username')
      .sort({ date: -1 });

    res.json(measurements);
  } catch (error) {
    console.error(error);
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update measurement
// @route   PATCH /api/measurements/:id
// @access  Trainer
const updateMeasurement = async (req, res) => {
  try {
    const { weight, height, chest, waist, hips, arms, thighs, bodyFat, notes } = req.body;
    const existingMeasurement = await BodyMeasurement.findById(req.params.id);

    if (!existingMeasurement) {
      return res.status(404).json({ message: 'Measurement not found' });
    }

    await resolveAccessibleMember(req, existingMeasurement.member);

    // Recalculate BMI if weight or height is updated
    let bmi = undefined;
    if (weight && height) {
      const heightInMeters = height / 100;
      bmi = weight / (heightInMeters * heightInMeters);
    }

    const measurement = await BodyMeasurement.findByIdAndUpdate(
      req.params.id,
      { weight, height, bmi, chest, waist, hips, arms, thighs, bodyFat, notes },
      { new: true, runValidators: true }
    );

    if (!measurement) {
      return res.status(404).json({ message: 'Measurement not found' });
    }

    res.json(measurement);
  } catch (error) {
    console.error(error);
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  recordMeasurement,
  getMemberMeasurements,
  updateMeasurement,
};
