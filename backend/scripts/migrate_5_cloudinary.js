const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cloudinary = require('cloudinary').v2;

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');
const Jewellery = require('../models/Jewellery');

// Configure 5 distinct Cloudinary instances
const instances = {
  1: cloudinary.v2 || require('cloudinary').v2,
  2: new (require('cloudinary').v2.constructor)(),
  3: new (require('cloudinary').v2.constructor)(),
  4: new (require('cloudinary').v2.constructor)(),
  5: new (require('cloudinary').v2.constructor)()
};

instances[1].config({
  cloud_name: process.env.CLOUDINARY_1_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_1_API_KEY,
  api_secret: process.env.CLOUDINARY_1_API_SECRET
});

instances[2].config({
  cloud_name: process.env.CLOUDINARY_2_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_2_API_KEY,
  api_secret: process.env.CLOUDINARY_2_API_SECRET
});

instances[3].config({
  cloud_name: process.env.CLOUDINARY_3_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_3_API_KEY,
  api_secret: process.env.CLOUDINARY_3_API_SECRET
});

instances[4].config({
  cloud_name: process.env.CLOUDINARY_4_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_4_API_KEY,
  api_secret: process.env.CLOUDINARY_4_API_SECRET
});

instances[5].config({
  cloud_name: process.env.CLOUDINARY_5_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_5_API_KEY,
  api_secret: process.env.CLOUDINARY_5_API_SECRET
});

const cloudNames = {
  1: process.env.CLOUDINARY_1_CLOUD_NAME,
  2: process.env.CLOUDINARY_2_CLOUD_NAME,
  3: process.env.CLOUDINARY_3_CLOUD_NAME,
  4: process.env.CLOUDINARY_4_CLOUD_NAME,
  5: process.env.CLOUDINARY_5_CLOUD_NAME
};

const getTargetAccountIndex = (item) => {
  const cats = Array.isArray(item.category) ? item.category : [item.category || ''];
  const accType = item.accessoryType;

  if (cats.includes('AD Jewels')) return 1;
  if (cats.includes('victorian-moissinate')) return 2;
  if (cats.includes('Gold Antique Jewels')) return 3;
  if (cats.includes('Kundan Jewels')) return 4;
  if (cats.includes('Bangles & Bracelets') || (accType && accType !== '' && accType !== 'null')) return 5;

  return 5;
};

const uploadWithRetry = async (instance, url, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await instance.uploader.upload(url, {
        folder: 'apila_jewels',
        resource_type: 'auto'
      });
      return res.secure_url;
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`    Retry ${attempt}/${retries} failed for URL: ${url} (${err.message}). Retrying...`);
      await new Promise(r => setTimeout(r, 1500));
    }
  }
};

const runMigration = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB...');

    const allJewels = await Jewellery.find({});
    console.log(`Starting migration for ${allJewels.length} jewellery items across 5 Cloudinary accounts...\n`);

    const stats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, totalImagesUploaded: 0, errors: 0 };
    const allCloudNames = Object.values(cloudNames);

    for (let i = 0; i < allJewels.length; i++) {
      const item = allJewels[i];
      const accountIdx = getTargetAccountIndex(item);
      const instance = instances[accountIdx];
      const targetCloudName = cloudNames[accountIdx];

      console.log(`[${i + 1}/${allJewels.length}] ${item.jewelId} (${item.name}) -> Account ${accountIdx} (${targetCloudName})`);

      if (!item.images || item.images.length === 0) {
        console.log(`  - No images found for ${item.jewelId}`);
        stats[accountIdx]++;
        continue;
      }

      let updated = false;
      const newImages = [];

      for (const img of item.images) {
        if (!img.url) continue;

        // Check if image is already on the target Cloudinary account
        if (img.url.includes(`res.cloudinary.com/${targetCloudName}/`)) {
          newImages.push(img);
          continue;
        }

        try {
          console.log(`  Uploading image to ${targetCloudName}...`);
          const secureUrl = await uploadWithRetry(instance, img.url);
          newImages.push({
            type: img.type || 'image',
            url: secureUrl
          });
          stats.totalImagesUploaded++;
          updated = true;
        } catch (err) {
          console.error(`  ERROR uploading image for ${item.jewelId}:`, err.message);
          stats.errors++;
          // Keep old image URL if upload fails so data is not lost
          newImages.push(img);
        }
      }

      if (updated) {
        // ONLY update the images field in MongoDB
        await Jewellery.updateOne(
          { _id: item._id },
          { $set: { images: newImages } }
        );
        console.log(`  Updated MongoDB images array for ${item.jewelId}`);
      } else {
        console.log(`  Images already up-to-date on ${targetCloudName}`);
      }

      stats[accountIdx]++;
    }

    console.log('\n--- MIGRATION SUMMARY ---');
    console.log(`Account 1 (${cloudNames[1]} - AD Jewels): ${stats[1]} items`);
    console.log(`Account 2 (${cloudNames[2]} - victorian-moissinate): ${stats[2]} items`);
    console.log(`Account 3 (${cloudNames[3]} - Gold Antique Jewels): ${stats[3]} items`);
    console.log(`Account 4 (${cloudNames[4]} - Kundan Jewels): ${stats[4]} items`);
    console.log(`Account 5 (${cloudNames[5]} - Bangles & Bracelets & Accessories): ${stats[5]} items`);
    console.log(`Total New Images Uploaded: ${stats.totalImagesUploaded}`);
    console.log(`Errors: ${stats.errors}`);

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

runMigration();
