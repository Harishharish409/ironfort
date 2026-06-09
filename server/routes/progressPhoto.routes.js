const express = require('express');
const router = express.Router();
const {
  uploadProgressPhoto,
  getMyProgressPhotos,
  getMemberProgressPhotos,
} = require('../controllers/progressPhoto.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router.post('/', protect, authorize('member'), uploadProgressPhoto);
router.get('/me', protect, authorize('member'), getMyProgressPhotos);
router.get('/member/:memberId', protect, authorize('trainer'), getMemberProgressPhotos);

module.exports = router;
