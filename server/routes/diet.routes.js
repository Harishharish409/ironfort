const express = require('express');
const router = express.Router();
const {
  assignDiet,
  getMemberDiets,
  updateDiet,
  deleteDiet,
} = require('../controllers/diet.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router.post('/', protect, authorize('trainer'), assignDiet);
router.get('/member/:memberId', protect, getMemberDiets);
router.patch('/:id', protect, authorize('trainer'), updateDiet);
router.delete('/:id', protect, authorize('trainer'), deleteDiet);

module.exports = router;
