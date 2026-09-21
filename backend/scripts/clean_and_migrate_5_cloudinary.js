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
  '/Users/archana-11724/Documents/ApilaJewels/backend/uploads'
];

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

// Strict matching for jewelId e.g. AS001 matches AS001(1).jpg, AS001.jpg but NOT AS0017.jpg
function getStrictJewelFiles(jewelId) {
  if (!jewelId) return [];
  const normTarget = jewelId.toUpperCase();
  const matched = [];
  const pattern = new RegExp('^' + normTarget + '(?:[^0-9]|$)', 'i');

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(file => {
      const p = path.join(dir, file);
      if (fs.statSync(p).isDirectory()) {
        walk(p);
      } else if (pattern.test(file) && file.match(/\.(jpg|jpeg|png|webp|gif|mp4|mov)$/i)) {
        matched.push({ file, filePath: p });
      }
    });
  }

  searchDirs.forEach(walk);

  // Deduplicate by filename
  const unique = new Map();
  matched.forEach(m => {
    if (!unique.has(m.file)) unique.set(m.file, m);
  });

  return Array.from(unique.values()).sort((a, b) => {
    const numA = (a.file.match(/\((\d+)\)/) || [])[1] || 0;
    const numB = (b.file.match(/\((\d+)\)/) || [])[1] || 0;
    return parseInt(numA, 10) - parseInt(numB, 10);
  });
}

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

const runCleanAndMigrate = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB Atlas...');

    const allJewels = await Jewellery.find({});
    console.log(`Starting clean migration & deduplication for ${allJewels.length} MongoDB items...\n`);

    const stats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, totalUploaded: 0, cleanedItems: 0 };

    for (let i = 0; i < allJewels.length; i++) {
      const item = allJewels[i];
      const accountIdx = getTargetAccountIndex(item);
      const account = accounts[accountIdx];

      console.log(`[${i + 1}/${allJewels.length}] ${item.jewelId} (${item.name}) -> ${account.name}`);

      let rawId = item.jewelId ? item.jewelId.toUpperCase() : '';
      let normId = rawId;
      if (/^[A-Z]{2}0[1-9]\d$/.test(rawId)) {
        normId = `${rawId.slice(0, 2)}0${rawId.slice(2)}`;
      }

      const localFiles = getStrictJewelFiles(rawId).length > 0 ? getStrictJewelFiles(rawId) : getStrictJewelFiles(normId);

      // Deduplicate any existing images on target account
      if (item.images && item.images.length > 0) {
        const uniqueUrls = new Set();
        const dedupedImages = [];
        for (const img of item.images) {
          if (img.url && !uniqueUrls.has(img.url)) {
            uniqueUrls.add(img.url);
            dedupedImages.push(img);
          }
        }

        // If duplicate image entries were in MongoDB, clean them up
        if (dedupedImages.length !== item.images.length) {
          console.log(`  Deduplicating MongoDB images array: reduced from ${item.images.length} to ${dedupedImages.length} unique images.`);
          await Jewellery.updateOne({ _id: item._id }, { $set: { images: dedupedImages } });
          item.images = dedupedImages;
          stats.cleanedItems++;
        }
      }

      // Check if item already has images on target Cloudinary account
      const hasTargetImages = item.images && item.images.length > 0 && item.images.some(img => img.url && img.url.includes(`res.cloudinary.com/${account.cloud_name}/`));

      if (hasTargetImages) {
        console.log(`  Already updated with unique images on ${account.cloud_name} (${item.images.length} images). Skipping.`);
        stats[accountIdx]++;
        continue;
      }

      if (localFiles.length === 0) {
        console.log(`  No local files found for ${item.jewelId}. Keeping existing configuration.`);
        stats[accountIdx]++;
        continue;
      }

      console.log(`  Uploading ${localFiles.length} unique files for ${item.jewelId} to ${account.cloud_name}...`);

      const newImages = [];
      for (const f of localFiles) {
        try {
          const uploadedMedia = await uploadLocalFile(account, f.filePath);
          newImages.push(uploadedMedia);
          stats.totalUploaded++;
        } catch (uploadErr) {
          console.error(`    Upload failed for ${f.file}:`, uploadErr.message);
        }
      }

      if (newImages.length > 0) {
        // ONLY update images array in MongoDB
        await Jewellery.updateOne(
          { _id: item._id },
          { $set: { images: newImages } }
        );
        console.log(`  Successfully updated ${item.jewelId} with ${newImages.length} unique image URLs.`);
      }

      stats[accountIdx]++;
    }

    console.log('\n=============================================');
    console.log('--- DEDUPLICATION & MIGRATION COMPLETE ---');
    console.log(`Cleaned Items: ${stats.cleanedItems}`);
    console.log(`Total New Uploaded: ${stats.totalUploaded}`);
    console.log('=============================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Clean & migrate failed:', err);
    process.exit(1);
  }
};

runCleanAndMigrate();
