const express = require('express');
const router = express.Router();
const {
  recordMeasurement,
  getMemberMeasurements,
  updateMeasurement,
} = require('../controllers/measurement.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router.post('/', protect, authorize('trainer'), recordMeasurement);
router.get('/member/:memberId', protect, getMemberMeasurements);
router.patch('/:id', protect, authorize('trainer'), updateMeasurement);

module.exports = router;
