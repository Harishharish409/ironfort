const SubscriptionPlan = require('../models/SubscriptionPlan');
const MemberSubscription = require('../models/MemberSubscription');
const Member = require('../models/Member');
const {
  ensureTraineeAccess,
  findMemberByIdentifier,
} = require('../utils/profileAccess');

// @desc    Create a subscription plan
// @route   POST /api/subscriptions/plans
// @access  Admin
const createPlan = async (req, res) => {
  try {
    const { name, duration, price, discount, offer, features } = req.body;

    const plan = await SubscriptionPlan.create({
      name,
      duration,
      price,
      discount: discount || 0,
      offer,
      features: features || [],
    });

    res.status(201).json(plan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all subscription plans
// @route   GET /api/subscriptions/plans
// @access  All
const getPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(plans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a subscription plan
// @route   PATCH /api/subscriptions/plans/:id
// @access  Admin
const updatePlan = async (req, res) => {
  try {
    const { name, duration, price, discount, offer, features } = req.body;

    const plan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id,
      { name, duration, price, discount, offer, features },
      { new: true, runValidators: true }
    );

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    res.json(plan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Deactivate a subscription plan
// @route   DELETE /api/subscriptions/plans/:id
// @access  Admin
const deletePlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    res.json({ message: 'Plan deactivated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Assign plan to member
// @route   POST /api/subscriptions/assign
// @access  Admin
const assignPlan = async (req, res) => {
  try {
    const { memberId, planId } = req.body;

    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.duration);

    const subscription = await MemberSubscription.create({
      member: member.user,
      plan: planId,
      startDate,
      endDate,
      status: 'active',
      paymentStatus: 'confirmed',
    });

    res.status(201).json(subscription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get member's subscription
// @route   GET /api/subscriptions/member/:memberId
// @access  Admin/Trainer
const getMemberSubscription = async (req, res) => {
  try {
    const member = await findMemberByIdentifier(req.params.memberId);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const hasAccess = await ensureTraineeAccess(req, member);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Not authorized for this member' });
    }

    const subscription = await MemberSubscription.findOne({ member: member.user._id })
      .populate('plan')
      .sort({ createdAt: -1 });

    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    res.json(subscription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Request renewal
// @route   POST /api/subscriptions/renew-request
// @access  Member
const requestRenewal = async (req, res) => {
  try {
    const subscription = await MemberSubscription.findOne({ member: req.user._id })
      .sort({ createdAt: -1 });

    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    subscription.renewalRequested = true;
    subscription.renewalNotifiedAt = new Date();
    subscription.status = 'pending_renewal';
    await subscription.save();

    res.json({ message: 'Renewal requested successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Payment done notification
// @route   POST /api/subscriptions/payment-done
// @access  Member
const paymentDone = async (req, res) => {
  try {
    const subscription = await MemberSubscription.findOne({ member: req.user._id })
      .sort({ createdAt: -1 });

    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    subscription.paymentStatus = 'pending';
    await subscription.save();

    res.json({ message: 'Payment notification sent to admin' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Request plan switch
// @route   POST /api/subscriptions/switch-plan
// @access  Member
const requestPlanSwitch = async (req, res) => {
  try {
    const { newPlanId } = req.body;

    const subscription = await MemberSubscription.findOne({ member: req.user._id })
      .sort({ createdAt: -1 });

    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    const newPlan = await SubscriptionPlan.findById(newPlanId);
    if (!newPlan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    subscription.planSwitchRequest = newPlanId;
    await subscription.save();

    res.json({ message: 'Plan switch requested successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Confirm subscription
// @route   PATCH /api/subscriptions/:id/confirm
// @access  Admin
const confirmSubscription = async (req, res) => {
  try {
    const subscription = await MemberSubscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    const plan = await SubscriptionPlan.findById(subscription.plan);

    if (subscription.planSwitchRequest) {
      // Handle plan switch
      const newPlan = await SubscriptionPlan.findById(subscription.planSwitchRequest);
      subscription.plan = subscription.planSwitchRequest;
      subscription.planSwitchRequest = null;
      
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + newPlan.duration);
      
      subscription.startDate = startDate;
      subscription.endDate = endDate;
    } else {
      // Handle renewal
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + plan.duration);
      
      subscription.startDate = startDate;
      subscription.endDate = endDate;
    }

    subscription.status = 'active';
    subscription.paymentStatus = 'confirmed';
    subscription.renewalRequested = false;
    await subscription.save();

    res.json({ message: 'Subscription confirmed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all subscriptions (for admin dashboard)
// @route   GET /api/subscriptions
// @access  Admin
const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await MemberSubscription.find()
      .populate('member', 'username')
      .populate('plan')
      .sort({ endDate: 1 });

    res.json(subscriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
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
};
