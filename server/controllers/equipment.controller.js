const Equipment = require('../models/Equipment');

// @desc    Add equipment
// @route   POST /api/equipment
// @access  Admin
const addEquipment = async (req, res) => {
  try {
    const { name, description, category, quantity, available, condition, photoUrl } = req.body;

    const equipment = await Equipment.create({
      name,
      description,
      category,
      quantity,
      available: available || quantity,
      condition: condition || 'good',
      photoUrl,
    });

    res.status(201).json(equipment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all equipment
// @route   GET /api/equipment
// @access  All
const getAllEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find().sort({ createdAt: -1 });
    res.json(equipment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update equipment
// @route   PATCH /api/equipment/:id
// @access  Admin
const updateEquipment = async (req, res) => {
  try {
    const { quantity, available, condition, photoUrl } = req.body;

    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      { quantity, available, condition, photoUrl, lastUpdated: Date.now() },
      { new: true, runValidators: true }
    );

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    res.json(equipment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove equipment
// @route   DELETE /api/equipment/:id
// @access  Admin
const deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndDelete(req.params.id);

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    res.json({ message: 'Equipment removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addEquipment,
  getAllEquipment,
  updateEquipment,
  deleteEquipment,
};
