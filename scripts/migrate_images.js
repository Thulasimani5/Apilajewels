// migrate_images.js – one‑time migration script
// ----------------------------------------------------
// This script reads all jewellery and category documents, finds any image URLs that point to the old local
// `uploads/` folder (e.g. http://localhost:5000/uploads/abc.jpg), uploads the corresponding file to Cloudinary,
// and replaces the stored URL with the Cloudinary URL. It is intended to be run locally where the original files exist.
// ----------------------------------------------------

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();

// Cloudinary configuration – same as backend
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Load Mongoose models (paths are relative to project root)
const Jewellery = require('../backend/models/jewellery');
const Category = require('../backend/models/category');
const dbConfig = require('../backend/config/db');

// Helper: upload a file to Cloudinary and return the secure URL
async function uploadToCloudinary(localPath) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(localPath, { folder: 'apila_jewels' }, (error, result) => {
      if (error) return reject(error);
      resolve(result.secure_url);
    });
  });
}

// Helper: extract the filename from the old localhost URL
function filenameFromUrl(url) {
  // Expected format: http://localhost:5000/uploads/<filename>
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
        const localPath = path.resolve(__dirname, '..', 'backend', 'uploads', filename);
        if (fs.existsSync(localPath)) {
          try {
            const cloudUrl = await uploadToCloudinary(localPath);
            item.images[i].url = cloudUrl;
            changed = true;
            console.log(`✔ Uploaded jewellery image ${filename} → ${cloudUrl}`);
          } catch (e) {
            console.error(`⚠ Failed to upload ${filename}:`, e.message);
          }
        } else {
          console.warn(`⚠ Local file not found: ${localPath}`);
        }
      }
    }
    if (changed) await item.save();
  }
}

async function migrateCategories() {
  const cats = await Category.find({ image: { $regex: /localhost/ } });
  console.log(`Found ${cats.length} categories with local images`);

  for (const cat of cats) {
    const filename = filenameFromUrl(cat.image);
    const localPath = path.resolve(__dirname, '..', 'backend', 'uploads', filename);
    if (fs.existsSync(localPath)) {
      try {
        const cloudUrl = await uploadToCloudinary(localPath);
        cat.image = cloudUrl;
        await cat.save();
        console.log(`✔ Uploaded category image ${filename} → ${cloudUrl}`);
      } catch (e) {
        console.error(`⚠ Failed to upload ${filename}:`, e.message);
      }
    } else {
      console.warn(`⚠ Local file not found for category ${cat.name}: ${localPath}`);
    }
  }
}

async function main() {
  try {
    await dbConfig.connectDB(); // ensure connection (lazy implementation works in serverless too)
    await migrateJewellery();
    await migrateCategories();
    console.log('✅ Migration completed');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

main();
