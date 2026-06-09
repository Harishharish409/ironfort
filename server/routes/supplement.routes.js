const express = require('express');
const router = express.Router();
const {
  addSupplement,
  getAllSupplements,
  updateSupplement,
  deleteSupplement,
  bookSupplement,
  getAllBookings,
  confirmBooking,
} = require('../controllers/supplement.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router.post('/', protect, authorize('admin'), addSupplement);
router.get('/', getAllSupplements);
router.patch('/:id', protect, authorize('admin'), updateSupplement);
router.delete('/:id', protect, authorize('admin'), deleteSupplement);
router.post('/book', protect, authorize('member', 'trainer'), bookSupplement);
router.get('/bookings', protect, authorize('admin'), getAllBookings);
router.patch('/bookings/:id/confirm', protect, authorize('admin'), confirmBooking);

module.exports = router;
