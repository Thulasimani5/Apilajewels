/**
 * Script: update_descriptions.js
 * Purpose: Update only the 'description' field on existing jewellery documents
 *          by matching jewelId with the id in jewel_descriptions.json.
 *          IDs that don't exist in the DB are silently skipped.
 *
 * Usage: node scripts/update_descriptions.js
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const descriptions = require('../datas/jewel_descriptions.json');
const Jewellery = require('../models/Jewellery');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`✅ Connected to MongoDB: ${mongoose.connection.host}`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const item of descriptions) {
    const { id, description } = item;

    try {
      const result = await Jewellery.updateOne(
        { jewelId: id },
        { $set: { description } }
      );

      if (result.matchedCount === 0) {
        console.log(`  ⚠️  No match for id: ${id} — skipped`);
        skipped++;
      } else if (result.modifiedCount === 0) {
        console.log(`  ℹ️  ${id} — already up to date`);
      } else {
        console.log(`  ✅  ${id} — description updated`);
        updated++;
      }
    } catch (err) {
      console.error(`  ❌  ${id} — error: ${err.message}`);
      errors++;
    }
  }

  console.log('\n========== SUMMARY ==========');
  console.log(`  Total entries in file : ${descriptions.length}`);
  console.log(`  Updated               : ${updated}`);
  console.log(`  Skipped (no DB match) : ${skipped}`);
  console.log(`  Errors                : ${errors}`);
  console.log('==============================\n');

  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
}

run().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
