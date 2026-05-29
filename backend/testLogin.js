require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI);

(async () => {
  try {
    const user = await User.findOne({ email: 'apila.jewels@gmail.com' }).select('+password');
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }
    
    console.log(`Found user: ${user.email}, ${user.phone}`);
    const isMatch = await user.matchPassword('apilajewels');
    console.log(`Password match for 'apilajewels': ${isMatch}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
