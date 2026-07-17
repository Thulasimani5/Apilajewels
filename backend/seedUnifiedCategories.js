const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Category = require('./models/Category');

dotenv.config();

const defaultTypes = [
  "Semi Bridal & Combo Sets",
  "Full Bridal Set",
  "Choker & Necklace",
  "Long Haram",
  "Bangles & Bracelets",
  "Accessories"
];

const seedUnifiedCategories = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Add all default jewellery types (including Bangles & Bracelets) under 'type'
    for (const typeName of defaultTypes) {
      const existing = await Category.findOne({ name: typeName });
      if (!existing) {
        await Category.create({
          name: typeName,
          subtext: `${typeName} collection`,
          showInSection: 'type'
        });
        console.log(`✅ Created category/type: ${typeName}`);
      } else {
        // If it exists, make sure it is marked as 'type'
        existing.showInSection = 'type';
        await existing.save();
        console.log(`⚠️  Updated existing category/type to type section: ${typeName}`);
      }
    }

    console.log('\nUnified categories seeding & migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error migrating/seeding:', error.message);
    process.exit(1);
  }
};

seedUnifiedCategories();
