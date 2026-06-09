const Workout = require('../models/Workout');
const Notification = require('../models/Notification');
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

// @desc    Assign workout to a member
// @route   POST /api/workouts
// @access  Trainer
const assignWorkout = async (req, res) => {
  try {
    const { assignedTo, title, frequency, startDate, endDate, exercises, notes } = req.body;
    const member = await resolveAccessibleMember(req, assignedTo);

    const workout = await Workout.create({
      assignedTo: member.user._id,
      assignedBy: req.user._id,
      title,
      frequency,
      startDate,
      endDate,
      exercises,
      notes,
    });

    res.status(201).json(workout);
  } catch (error) {
    console.error(error);
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get member's workouts
// @route   GET /api/workouts/member/:memberId
// @access  Trainer/Member
const getMemberWorkouts = async (req, res) => {
  try {
    const member = await resolveAccessibleMember(req, req.params.memberId);

    const workouts = await Workout.find({ assignedTo: member.user._id })
      .populate('assignedBy', 'username')
      .sort({ createdAt: -1 });

    res.json(workouts);
  } catch (error) {
    console.error(error);
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update workout
// @route   PATCH /api/workouts/:id
// @access  Trainer
const updateWorkout = async (req, res) => {
  try {
    const existingWorkout = await Workout.findById(req.params.id);

    if (!existingWorkout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    const member = await resolveAccessibleMember(req, existingWorkout.assignedTo);
    const updates = { ...req.body, assignedTo: member.user._id, assignedBy: req.user._id };
    const workout = await Workout.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json(workout);
  } catch (error) {
    console.error(error);
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Trainer
const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    await resolveAccessibleMember(req, workout.assignedTo);
    await workout.deleteOne();

    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error(error);
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark exercise as done
// @route   PATCH /api/workouts/:workoutId/exercise/:exerciseId/done
// @access  Member
const markExerciseDone = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.workoutId);

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    const member = await resolveAccessibleMember(req, workout.assignedTo);
    if (member.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the assigned member can mark exercises done' });
    }

    // Enforce: member can only mark workouts for the assigned date (not future dates)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(workout.startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(workout.endDate);
    end.setHours(23, 59, 59, 999);

    const canMarkForToday = today >= start && new Date() <= end;

    if (!canMarkForToday) {
      return res.status(400).json({
        message: "You can only complete exercises for today's assigned workout date",
      });
    }

    const exercise = workout.exercises.id(req.params.exerciseId);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    exercise.doneStatus = true;
    exercise.doneMarkedAt = new Date();
    await workout.save();

    // Update trainer with detailed completion status (notification)
    // workout.assignedBy is the trainer's user id
    await Notification.create({
      recipient: workout.assignedBy,
      title: 'Workout completed',
      message: `Member ${member.user.username} marked "${workout.title}" - exercise "${exercise.name}" as done on ${exercise.doneMarkedAt.toLocaleDateString()}.`,
      type: 'success',
      link: `/trainer/trainees/${member.user._id}`,
    });

    res.json(workout);
  } catch (error) {
    console.error(error);
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  assignWorkout,
  getMemberWorkouts,
  updateWorkout,
  deleteWorkout,
  markExerciseDone,
};
