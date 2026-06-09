const express = require('express');
const router = express.Router();
const {
  registerTrainer,
  registerMember,
  removeTrainer,
  removeMember,
  hardDeleteTrainer,
  hardDeleteMember,
  resetCredentials,
  assignTrainer,
  getAllMembers,
  getAllTrainers,
  getMemberById,
  getTrainerById,
} = require('../controllers/admin.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router.post('/register-trainer', protect, authorize('admin'), registerTrainer);
router.post('/register-member', protect, authorize('admin'), registerMember);

// Soft remove (deactivate)
router.delete('/trainers/:id', protect, authorize('admin'), removeTrainer);
router.delete('/members/:id', protect, authorize('admin'), removeMember);

// Hard delete (remove from DB)
router.delete('/trainers/:id/hard', protect, authorize('admin'), hardDeleteTrainer);
router.delete('/members/:id/hard', protect, authorize('admin'), hardDeleteMember);

router.patch('/users/:userId/reset-credentials', protect, authorize('admin'), resetCredentials);
router.patch('/members/:memberId/assign-trainer', protect, authorize('admin'), assignTrainer);
router.get('/members', protect, authorize('admin'), getAllMembers);
router.get('/trainers', protect, authorize('admin'), getAllTrainers);
router.get('/members/:id', protect, authorize('admin'), getMemberById);
router.get('/trainers/:id', protect, authorize('admin'), getTrainerById);

module.exports = router;

