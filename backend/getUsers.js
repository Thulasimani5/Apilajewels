require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI);

(async () => {
  try {
    const users = await User.find({}).select('+password');
    console.log('--- ALL USERS ---');
    users.forEach(u => {
      console.log(`ID: ${u._id}`);
      console.log(`Email: ${u.email}`);
      console.log(`Phone: ${u.phone}`);
      console.log(`Role: ${u.role}`);
      console.log(`Password (hashed): ${u.password}`);
      console.log('-----------------');
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
