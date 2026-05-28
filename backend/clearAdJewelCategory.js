const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Jewellery = require('./models/Jewellery');

(async () => {
  try {
    await connectDB();
    const result = await Jewellery.deleteMany({ category: /ad jewel/i });
    console.log(`Deleted ${result.deletedCount} jewellery items from 'Ad Jewel' category.`);
    process.exit(0);
  } catch (err) {
    console.error('Error clearing Ad Jewel category:', err);
    process.exit(1);
  }
})();
