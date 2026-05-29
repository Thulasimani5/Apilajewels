require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

(async () => {
  try {
    const existingAdmin = await User.findOne({ phone: '1234567890' });
    if (existingAdmin) {
      console.log('✅ Admin user found. Updating password...');
      
      // Update password (triggers pre-save hook to hash password)
      existingAdmin.password = 'apilajewels';
      await existingAdmin.save();
      
      console.log('✅ Admin password updated successfully for 1234567890.');
      process.exit(0);
    }

    const admin = new User({
      name: 'Admin',
      email: 'admin_1234567890@apila.com',
      password: 'apilajewels',
      role: 'admin',
      phone: '1234567890',
    });

    await admin.save();
    console.log('🚀 Admin user created successfully with phone 1234567890.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding admin user:', err);
    process.exit(1);
  }
})();
