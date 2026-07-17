const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Category = require('./models/Category');

dotenv.config();

const fix = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    const result = await Category.findOneAndUpdate(
      { name: 'Bangles & Bracelets' },
      { showInSection: 'type' },
      { new: true }
    );

    if (result) {
      console.log(`✅ Updated "Bangles & Bracelets" showInSection → '${result.showInSection}'`);
    } else {
      console.log('❌ "Bangles & Bracelets" not found in the database.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

fix();
