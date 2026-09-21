const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');
const Jewellery = require('../models/Jewellery');

const searchDirs = [
  '/Users/archana-11724/Downloads/Edited images',
  '/Users/archana-11724/Downloads/zips',
  '/Users/archana-11724/Documents/ApilaJewels/backend/uploads'
];

// Map of 5 Cloudinary accounts credentials
const accounts = {
  1: {
    cloud_name: process.env.CLOUDINARY_1_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_1_API_KEY,
    api_secret: process.env.CLOUDINARY_1_API_SECRET,
    name: 'Account 1 (l1taixkl - AD Jewels)'
  },
  2: {
    cloud_name: process.env.CLOUDINARY_2_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_2_API_KEY,
    api_secret: process.env.CLOUDINARY_2_API_SECRET,
    name: 'Account 2 (wz6zmdta - victorian-moissinate)'
  },
  3: {
    cloud_name: process.env.CLOUDINARY_3_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_3_API_KEY,
    api_secret: process.env.CLOUDINARY_3_API_SECRET,
    name: 'Account 3 (ibt4lpq6 - Gold Antique Jewels)'
  },
  4: {
    cloud_name: process.env.CLOUDINARY_4_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_4_API_KEY,
    api_secret: process.env.CLOUDINARY_4_API_SECRET,
    name: 'Account 4 (ay9ixzta - Kundan Jewels)'
  },
  5: {
    cloud_name: process.env.CLOUDINARY_5_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_5_API_KEY,
    api_secret: process.env.CLOUDINARY_5_API_SECRET,
    name: 'Account 5 (x10uudea - Bangles & Accessories)'
  }
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

// Index local image files by jewelId
const buildLocalFileMap = () => {
  const fileMap = new Map();

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        walk(filePath);
      } else if (file.match(/\.(jpg|jpeg|png|webp|gif|mp4|mov)$/i)) {
        const match = file.match(/^([A-Z]{1,4}\d{1,4})/i);
        if (match) {
          const jewelId = match[1].toUpperCase();
          if (!fileMap.has(jewelId)) fileMap.set(jewelId, []);
          fileMap.get(jewelId).push({ file, filePath });
        }
      }
    });
  }

  searchDirs.forEach(walk);

  // Sort files for each jewelId by the number inside parenthesis e.g. (1), (2), (3)
  for (const [id, files] of fileMap.entries()) {
    files.sort((a, b) => {
      const numA = (a.file.match(/\((\d+)\)/) || [])[1] || 0;
      const numB = (b.file.match(/\((\d+)\)/) || [])[1] || 0;
      return parseInt(numA, 10) - parseInt(numB, 10);
    });
  }

  return fileMap;
};

const uploadLocalFile = async (account, filePath) => {
  return new Promise((resolve, reject) => {
    const isVideo = filePath.match(/\.(mp4|mov|avi)$/i);
    cloudinary.uploader.upload(
      filePath,
      {
        cloud_name: account.cloud_name,
        api_key: account.api_key,
        api_secret: account.api_secret,
        folder: 'apila_jewels',
        resource_type: isVideo ? 'video' : 'image'
      },
      (err, result) => {
        if (err) return reject(err);
        resolve({
          type: isVideo ? 'video' : 'image',
          url: result.secure_url
        });
      }
    );
  });
};

const runMigration = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB Atlas...');

    const fileMap = buildLocalFileMap();
    console.log(`Indexed local files for ${fileMap.size} unique jewel IDs.`);

    const allJewels = await Jewellery.find({});
    console.log(`Starting migration for ${allJewels.length} MongoDB jewellery items across 5 Cloudinary accounts...\n`);

    const stats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, totalUploadedImages: 0, skipped: 0, errors: 0 };

    for (let i = 0; i < allJewels.length; i++) {
      const item = allJewels[i];
      const accountIdx = getTargetAccountIndex(item);
      const account = accounts[accountIdx];

      let rawId = item.jewelId ? item.jewelId.toUpperCase() : '';
      let normId = rawId;
      if (/^[A-Z]{2}0[1-9]\d$/.test(rawId)) {
        normId = `${rawId.slice(0, 2)}0${rawId.slice(2)}`;
      }

      const localFiles = fileMap.get(rawId) || fileMap.get(normId) || [];

      console.log(`[${i + 1}/${allJewels.length}] ${item.jewelId} (${item.name}) -> ${account.name}`);

      // Check if images are already updated on the target Cloudinary account
      const alreadyMigrated = item.images && item.images.length > 0 && item.images.every(img => img.url && img.url.includes(`res.cloudinary.com/${account.cloud_name}/`));

      if (alreadyMigrated) {
        console.log(`  Already migrated on ${account.cloud_name}. Skipping.`);
        stats[accountIdx]++;
        continue;
      }

      if (localFiles.length === 0) {
        console.warn(`  WARNING: No local files found for ${item.jewelId}`);
        stats.skipped++;
        continue;
      }

      console.log(`  Found ${localFiles.length} local files for ${item.jewelId}. Uploading to ${account.cloud_name}...`);

      const newImages = [];
      for (const f of localFiles) {
        try {
          const uploadedMedia = await uploadLocalFile(account, f.filePath);
          newImages.push(uploadedMedia);
          stats.totalUploadedImages++;
        } catch (uploadErr) {
          console.error(`    Upload failed for ${f.file}:`, uploadErr.message);
          stats.errors++;
        }
      }

      if (newImages.length > 0) {
        // ONLY update the images array in MongoDB
        await Jewellery.updateOne(
          { _id: item._id },
          { $set: { images: newImages } }
        );
        console.log(`  Updated MongoDB images array with ${newImages.length} new URLs for ${item.jewelId}`);
      }

      stats[accountIdx]++;
    }

    console.log('\n=============================================');
    console.log('--- MIGRATION COMPLETE SUMMARY ---');
    console.log(`Account 1 (l1taixkl - AD Jewels): ${stats[1]} items`);
    console.log(`Account 2 (wz6zmdta - victorian-moissinate): ${stats[2]} items`);
    console.log(`Account 3 (ibt4lpq6 - Gold Antique Jewels): ${stats[3]} items`);
    console.log(`Account 4 (ay9ixzta - Kundan Jewels): ${stats[4]} items`);
    console.log(`Account 5 (x10uudea - Bangles & Accessories): ${stats[5]} items`);
    console.log(`Total New Images Uploaded: ${stats.totalUploadedImages}`);
    console.log(`Skipped / Not found: ${stats.skipped}`);
    console.log(`Upload Errors: ${stats.errors}`);
    console.log('=============================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

runMigration();
