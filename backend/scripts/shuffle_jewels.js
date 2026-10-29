const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');
const Jewellery = require('../models/Jewellery');

async function run() {
  try {
    await connectDB();
    console.log('Connected to MongoDB. Fetching all jewellery items...');

    const items = await Jewellery.find({}).select('_id jewelId name');
    console.log(`Found ${items.length} jewels. Shuffling order once to establish static order...`);

    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    console.log('Writing sortOrder (1 to ' + shuffled.length + ') to database...');
    const bulkOps = shuffled.map((item, index) => ({
      updateOne: {
        filter: { _id: item._id },
        update: { $set: { sortOrder: index + 1 } }
      }
    }));

    if (bulkOps.length > 0) {
      await Jewellery.bulkWrite(bulkOps);
    }

    console.log(`\n=============================================`);
    console.log(`Successfully assigned static sortOrder to ${shuffled.length} jewels.`);
    console.log(`Catalog order is now permanently static in MongoDB.`);
    console.log(`First 5 static items:`);
    shuffled.slice(0, 5).forEach((item, idx) => {
      console.log(`  ${idx + 1}. [${item.jewelId}] ${item.name}`);
    });
    console.log(`=============================================\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Failed to shuffle jewels:', err);
    process.exit(1);
  }
}

run();
