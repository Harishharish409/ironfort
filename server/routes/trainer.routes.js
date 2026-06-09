const express = require('express');
const router = express.Router();
const {
  getMyTrainees,
  getTraineeDetails,
} = require('../controllers/trainer.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router.get('/trainees', protect, authorize('trainer'), getMyTrainees);
router.get('/trainees/:memberId', protect, authorize('trainer'), getTraineeDetails);

module.exports = router;
