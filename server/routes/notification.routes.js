const express = require('express');
const router = express.Router();
const {
  createNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notification.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router.post('/', protect, authorize('admin', 'trainer'), createNotification);
router.get('/me', protect, getMyNotifications);
router.patch('/:id/read', protect, markAsRead);
router.patch('/read-all', protect, markAllAsRead);

module.exports = router;
