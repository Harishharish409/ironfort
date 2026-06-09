require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB...');

    // Delete existing admin so we can re-seed cleanly
    await User.deleteMany({ role: 'admin' });
    console.log('Cleared old admin(s)...');

    const admin = await User.create({
      username: 'admin',
      password: 'admin123', // The pre-save hook in User model will hash this
      role: 'admin',
      isActive: true,
    });

    console.log('Default Admin Created!');
    console.log('Username: admin');
    console.log('Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
