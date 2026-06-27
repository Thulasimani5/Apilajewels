const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./models/Category');
const Jewellery = require('./models/Jewellery');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    const categoriesWithCount = await Promise.all(categories.map(async (cat) => {
      const count = await Jewellery.countDocuments({ category: cat.name });
      return { ...cat.toObject(), jewelCount: count };
    }));
    console.log('Success:', categoriesWithCount.length);
  } catch (err) {
    console.error('Error:', err);
  }
  mongoose.disconnect();
}
run();
