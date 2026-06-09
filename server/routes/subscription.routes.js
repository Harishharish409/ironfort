const express = require('express');
const router = express.Router();
const {
  createPlan,
  getPlans,
  updatePlan,
  deletePlan,
  assignPlan,
  getMemberSubscription,
  requestRenewal,
  paymentDone,
  requestPlanSwitch,
  confirmSubscription,
  getAllSubscriptions,
} = require('../controllers/subscription.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router.post('/plans', protect, authorize('admin'), createPlan);
router.get('/plans', getPlans);
router.patch('/plans/:id', protect, authorize('admin'), updatePlan);
router.delete('/plans/:id', protect, authorize('admin'), deletePlan);
router.post('/assign', protect, authorize('admin'), assignPlan);
router.get('/member/:memberId', protect, getMemberSubscription);
router.post('/renew-request', protect, authorize('member'), requestRenewal);
router.post('/payment-done', protect, authorize('member'), paymentDone);
router.post('/switch-plan', protect, authorize('member'), requestPlanSwitch);
router.patch('/:id/confirm', protect, authorize('admin'), confirmSubscription);
router.get('/', protect, authorize('admin'), getAllSubscriptions);

module.exports = router;
