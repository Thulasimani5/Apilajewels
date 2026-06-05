// backend/scripts/migrate_images.js – one‑time migration script
// ----------------------------------------------------
// This script reads all jewellery and category documents, finds any image URLs that point to the old local
// `uploads/` folder (e.g. http://localhost:5000/uploads/abc.jpg), uploads the corresponding file to Cloudinary,
// and replaces the stored URL with the Cloudinary URL. It is intended to be run locally where the original files exist.
// ----------------------------------------------------

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const fs = require('fs');
const mongoose = require('mongoose'); // from backend's node_modules

// Cloudinary configuration – same as backend
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// DB connection (reuse existing lazy connection logic)
const connectDB = require('../config/db');

// Models
const Jewellery = require('../models/Jewellery');
const Category = require('../models/Category');

// Helper: decide whether a URL needs migration
function needsMigration(url) {
  if (!url) return false;
  // If the URL already points to Cloudinary, skip it
  return !(url.includes('cloudinary.com') || url.startsWith('https://'));
}

// Helper: upload a file to Cloudinary and return the secure URL
async function uploadFile(localPath) {
  try {
    const result = await cloudinary.uploader.upload(localPath, {
      folder: 'apila_jewels',
      resource_type: 'auto',
    });
    return result.secure_url;
  } catch (err) {
    console.error('Cloudinary upload failed for', localPath, err);
    return null;
  }
}

// Helper: extract filename from a localhost URL (e.g. http://localhost:5000/uploads/abc.jpg)
function filenameFromUrl(url) {
  const parts = url.split('/');
  return parts[parts.length - 1];
}

async function migrateJewellery() {
  const items = await Jewellery.find({ 'images.url': { $regex: /localhost/ } });
  console.log(`Found ${items.length} jewellery items with local images`);
  for (const item of items) {
    let changed = false;
    for (let i = 0; i < item.images.length; i++) {
      const img = item.images[i];
      if (img.url && img.url.includes('localhost')) {
        const filename = filenameFromUrl(img.url);
        const localPath = path.resolve(__dirname, '..', 'uploads', filename);
        if (fs.existsSync(localPath)) {
          const cloudUrl = await uploadFile(localPath);
          if (cloudUrl) {
            item.images[i].url = cloudUrl;
            changed = true;
            console.log(`✔ Uploaded jewellery image ${filename} → ${cloudUrl}`);
          }
        } else {
          console.warn('⚠ Local file not found:', localPath);
        }
      }
    }
    if (changed) await item.save({ validateBeforeSave: false });
  }
}

async function migrateCategories() {
  const cats = await Category.find({ image: { $regex: /localhost/ } });
  console.log(`Found ${cats.length} categories with local images`);
  for (const cat of cats) {
    if (cat.image && cat.image.includes('localhost')) {
      const filename = filenameFromUrl(cat.image);
      const localPath = path.resolve(__dirname, '..', 'uploads', filename);
      if (fs.existsSync(localPath)) {
        const cloudUrl = await uploadFile(localPath);
        if (cloudUrl) {
          cat.image = cloudUrl;
          await cat.save();
          console.log(`✔ Uploaded category image ${filename} → ${cloudUrl}`);
        }
      } else {
        console.warn('⚠ Category local file not found:', localPath);
      }
    }
  }
}

async function run() {
  try {
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI not set in environment. Exiting migration.');
      process.exit(1);
    }
    await connectDB();
    await migrateJewellery();
    await migrateCategories();
    console.log('✅ Migration complete');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

run();
