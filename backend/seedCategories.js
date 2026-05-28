const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

const categories = [
  { name: "Moissanite" },
  { name: "Temple Jewellery" },
  { name: "Antique Jewel" },
  { name: "Kundan" },
  { name: "AD Jewellery" },
  { name: "Polki" }
];

const seedCategories = async () => {
  try {
    // Check if there are any existing categories to avoid duplicates
    const count = await Category.countDocuments();
    if (count === 0) {
      await Category.insertMany(categories);
      console.log('Categories seeded successfully');
    } else {
      console.log('Categories already exist, skipping seed.');
    }
    process.exit();
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
