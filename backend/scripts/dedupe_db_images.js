const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');
const Jewellery = require('../models/Jewellery');

const dedupeDatabaseImages = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB Atlas...');

    const allJewels = await Jewellery.find({});
    console.log(`Checking ${allJewels.length} jewellery documents for duplicate image URLs...`);

    let cleanedCount = 0;
    let totalImagesRemoved = 0;

    for (const item of allJewels) {
      if (!item.images || item.images.length === 0) continue;

      const seenUrls = new Set();
      const uniqueImages = [];

      for (const img of item.images) {
        if (!img || !img.url) continue;
        // Normalize URL to detect identical image uploads
        const cleanUrl = img.url.trim();
        if (!seenUrls.has(cleanUrl)) {
          seenUrls.add(cleanUrl);
          uniqueImages.push({ type: img.type || 'image', url: cleanUrl });
        }
      }

      if (uniqueImages.length !== item.images.length) {
        const removed = item.images.length - uniqueImages.length;
        console.log(`[DEDUP] ${item.jewelId}: Reduced images from ${item.images.length} to ${uniqueImages.length} (removed ${removed} duplicates).`);
        await Jewellery.updateOne(
          { _id: item._id },
          { $set: { images: uniqueImages } }
        );
        cleanedCount++;
        totalImagesRemoved += removed;
      }
    }

    console.log('\n--- DEDUPLICATION COMPLETE ---');
    console.log(`Cleaned Items: ${cleanedCount}`);
    console.log(`Total Duplicate Image Entries Removed: ${totalImagesRemoved}\n`);

    process.exit(0);
  } catch (err) {
    console.error('Deduplication failed:', err);
    process.exit(1);
  }
};

dedupeDatabaseImages();
