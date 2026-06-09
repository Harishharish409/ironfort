const Supplement = require('../models/Supplement');
const SupplementBooking = require('../models/SupplementBooking');

// @desc    Add supplement
// @route   POST /api/supplements
// @access  Admin
const addSupplement = async (req, res) => {
  try {
    const { name, description, category, price, stock, photoUrl } = req.body;

    const supplement = await Supplement.create({
      name,
      description,
      category,
      price,
      stock,
      photoUrl,
      isAvailable: stock > 0,
    });

    res.status(201).json(supplement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all supplements
// @route   GET /api/supplements
// @access  All
const getAllSupplements = async (req, res) => {
  try {
    const supplements = await Supplement.find().sort({ createdAt: -1 });
    res.json(supplements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update supplement
// @route   PATCH /api/supplements/:id
// @access  Admin
const updateSupplement = async (req, res) => {
  try {
    const { stock, price, photoUrl } = req.body;

    const isAvailable = stock !== undefined ? stock > 0 : undefined;

    const supplement = await Supplement.findByIdAndUpdate(
      req.params.id,
      { stock, price, photoUrl, isAvailable, lastUpdated: Date.now() },
      { new: true, runValidators: true }
    );

    if (!supplement) {
      return res.status(404).json({ message: 'Supplement not found' });
    }

    res.json(supplement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove supplement
// @route   DELETE /api/supplements/:id
// @access  Admin
const deleteSupplement = async (req, res) => {
  try {
    const supplement = await Supplement.findByIdAndDelete(req.params.id);

    if (!supplement) {
      return res.status(404).json({ message: 'Supplement not found' });
    }

    res.json({ message: 'Supplement removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Book a supplement
// @route   POST /api/supplements/book
// @access  Member/Trainer
const bookSupplement = async (req, res) => {
  try {
    const { supplementId, quantity } = req.body;

    const supplement = await Supplement.findById(supplementId);
    if (!supplement) {
      return res.status(404).json({ message: 'Supplement not found' });
    }

    if (!supplement.isAvailable || supplement.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    const booking = await SupplementBooking.create({
      supplement: supplementId,
      bookedBy: req.user._id,
      quantity,
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all bookings (admin)
// @route   GET /api/supplements/bookings
// @access  Admin
const getAllBookings = async (req, res) => {
  try {
    const bookings = await SupplementBooking.find()
      .populate('supplement', 'name price')
      .populate('bookedBy', 'username role')
      .sort({ bookedAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Confirm booking
// @route   PATCH /api/supplements/bookings/:id/confirm
// @access  Admin
const confirmBooking = async (req, res) => {
  try {
    const booking = await SupplementBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Booking already processed' });
    }

    const supplement = await Supplement.findById(booking.supplement);
    if (supplement.stock < booking.quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Update supplement stock
    supplement.stock -= booking.quantity;
    supplement.isAvailable = supplement.stock > 0;
    await supplement.save();

    // Update booking status
    booking.status = 'confirmed';
    await booking.save();

    res.json({ message: 'Booking confirmed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addSupplement,
  getAllSupplements,
  updateSupplement,
  deleteSupplement,
  bookSupplement,
  getAllBookings,
  confirmBooking,
};
