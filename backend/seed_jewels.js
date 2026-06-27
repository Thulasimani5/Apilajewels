const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();
const Jewellery = require('./models/Jewellery');

// Helper to parse numbers from string, handling formats like "1740+1550+1600= 4890"
function parseAmount(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    // Check if it has an equal sign
    if (val.includes('=')) {
      const parts = val.split('=');
      val = parts[parts.length - 1];
    }
    // Remove non-digit characters except decimal point
    const cleaned = val.replace(/[^\d.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
  return null;
}

// Function to extract color from name if possible
function inferColour(name) {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('emerald')) return 'Green';
  if (lowerName.includes('ruby')) return 'Red';
  if (lowerName.includes('white')) return 'White';
  if (lowerName.includes('pink') || lowerName.includes('morganit')) return 'Pink';
  if (lowerName.includes('jade')) return 'Green';
  if (lowerName.includes('amethyst')) return 'Purple';
  if (lowerName.includes('gold')) return 'Gold';
  if (lowerName.includes('silver')) return 'Silver';
  if (lowerName.includes('kemp')) return 'Red/Green';
  return 'Multi';
}

async function seedData() {
  try {
    console.log('Reading data...');
    const rawData = fs.readFileSync('./datas/jewels.json', 'utf8');
    const jewels = JSON.parse(rawData);

    const formattedJewels = jewels.map((item, index) => {
      // Validate and extract required fields
      if (!item.id) {
        console.warn(`Item at index ${index} missing ID. Skipping.`);
        return null;
      }

      return {
        jewelId: item.id,
        name: item.name || 'Unknown Jewel',
        description: item.description || 'Premium Jewellery',
        category: Array.isArray(item.category) ? item.category : [],
        type: Array.isArray(item.type) ? item.type : [],
        occasion: Array.isArray(item.occasion) ? item.occasion : [],
        price: parseAmount(item.price) || 0,
        deposit: parseAmount(item.deposit) || 0,
        purchaseAmount: parseAmount(item.costPrice),
        salesAmount: parseAmount(item.sellingPrice),
        colour: inferColour(item.name || ''),
        // Defaults for other required/common fields
        availability: true,
        showPrice: true,
        popularity: 0,
        images: [],
        stoneName: [],
        stoneColour: []
      };
    }).filter(item => item !== null);

    // Save formatted data to a new JSON file
    fs.writeFileSync('./datas/jewels_formatted.json', JSON.stringify(formattedJewels, null, 2));
    console.log(`Formatted ${formattedJewels.length} items and saved to datas/jewels_formatted.json`);

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    // Seed the database
    let inserted = 0;
    let updated = 0;
    
    for (const jewel of formattedJewels) {
      const existing = await Jewellery.findOne({ jewelId: jewel.jewelId });
      if (existing) {
        // Skip description update to preserve the one currently in the DB
        delete jewel.description;
        await Jewellery.updateOne({ jewelId: jewel.jewelId }, { $set: jewel });
        updated++;
      } else {
        await Jewellery.create(jewel);
        inserted++;
      }
    }

    console.log(`Seeding complete! Inserted: ${inserted}, Updated: ${updated}`);
    
    // Add unique categories to Category collection
    const Category = require('./models/Category');
    if (Category) {
      const allCategories = new Set();
      formattedJewels.forEach(j => {
        j.category.forEach(c => allCategories.add(c));
      });
      
      for (const catName of allCategories) {
        const catExists = await Category.findOne({ name: catName });
        if (!catExists) {
          await Category.create({ name: catName });
          console.log(`Created new category: ${catName}`);
        }
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Error during seeding:', err);
    process.exit(1);
  }
}

seedData();
