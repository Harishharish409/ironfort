const Attendance = require('../models/Attendance');

// @desc    Mark attendance
// @route   POST /api/attendance/mark
// @access  Trainer/Member
const markAttendance = async (req, res) => {
  try {
    const { note } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if attendance already marked for today
    const existingAttendance = await Attendance.findOne({
      user: req.user._id,
      date: today,
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already marked for today' });
    }

    const attendance = await Attendance.create({
      user: req.user._id,
      role: req.user.role,
      date: today,
      status: 'present',
      note,
    });

    res.status(201).json(attendance);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Attendance already marked for today' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get own attendance history
// @route   GET /api/attendance/me
// @access  Trainer/Member
const getMyAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(30);

    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all attendance (admin)
// @route   GET /api/attendance
// @access  Admin
const getAllAttendance = async (req, res) => {
  try {
    const { userId, role, from, to } = req.query;

    const query = {};

    if (userId) {
      query.user = userId;
    }

    if (role) {
      query.role = role;
    }

    if (from || to) {
      query.date = {};

      // Ensure date filtering works by using local-day boundaries.
      // `from` from <input type="date"> comes as YYYY-MM-DD.
      // Without normalization it can shift depending on timezone.
      if (from) {
        const fromDate = new Date(from);
        fromDate.setHours(0, 0, 0, 0);
        query.date.$gte = fromDate;
      }

      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        query.date.$lte = toDate;
      }
    }

    const attendance = await Attendance.find(query)
      .populate('user', 'username role')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Check if attendance is marked for today
// @route   GET /api/attendance/check-today
// @access  Trainer/Member
const checkTodayAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      user: req.user._id,
      date: today,
    });

    res.json({ marked: !!attendance, attendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  markAttendance,
  getMyAttendance,
  getAllAttendance,
  checkTodayAttendance,
};
