const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Jewellery = require('./models/Jewellery');

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const res = await Jewellery.deleteMany({ jewelId: { $ne: 'AD001' } });
    console.log(`Successfully deleted ${res.deletedCount} jewellery items, keeping only AD001.`);
    process.exit(0);
  } catch (error) {
    console.error('Error deleting data:', error);
    process.exit(1);
  }
});
