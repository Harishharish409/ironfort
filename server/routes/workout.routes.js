const express = require('express');
const router = express.Router();
const {
  assignWorkout,
  getMemberWorkouts,
  updateWorkout,
  deleteWorkout,
  markExerciseDone,
} = require('../controllers/workout.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router.post('/', protect, authorize('trainer'), assignWorkout);
router.get('/member/:memberId', protect, getMemberWorkouts);
router.patch('/:id', protect, authorize('trainer'), updateWorkout);
router.delete('/:id', protect, authorize('trainer'), deleteWorkout);
router.patch('/:workoutId/exercise/:exerciseId/done', protect, authorize('member'), markExerciseDone);

module.exports = router;
