const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getMyAttendance,
  getAllAttendance,
  checkTodayAttendance,
} = require('../controllers/attendance.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router.post('/mark', protect, authorize('trainer', 'member'), markAttendance);
router.get('/me', protect, authorize('trainer', 'member'), getMyAttendance);
router.get('/check-today', protect, authorize('trainer', 'member'), checkTodayAttendance);
router.get('/', protect, authorize('admin'), getAllAttendance);

module.exports = router;
