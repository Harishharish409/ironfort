const express = require('express');
const router = express.Router();
const {
  addEquipment,
  getAllEquipment,
  updateEquipment,
  deleteEquipment,
} = require('../controllers/equipment.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router.post('/', protect, authorize('admin'), addEquipment);
router.get('/', getAllEquipment);
router.patch('/:id', protect, authorize('admin'), updateEquipment);
router.delete('/:id', protect, authorize('admin'), deleteEquipment);

module.exports = router;
