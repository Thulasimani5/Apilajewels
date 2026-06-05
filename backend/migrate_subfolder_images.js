// migrate_subfolder_images.js
// Scans all subdirectories under backend/uploads/, extracts jewelId from filenames
// like AM001(1).jpg, uploads to Cloudinary, and saves URLs to MongoDB.

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const fs = require('fs');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const Jewellery = require('./models/Jewellery');
const connectDB = require('./config/db');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const UPLOADS_DIR = path.resolve(__dirname, 'uploads');

// Extract jewelId from filename like "AM001(1).jpg" → "AM001"
function extractJewelId(filename) {
  const match = filename.match(/^([A-Z]+\d+)/i);
  return match ? match[1].toUpperCase() : null;
}

async function uploadFile(filePath) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'apila_jewels',
      resource_type: 'auto',
    });
    return result.secure_url;
  } catch (err) {
    console.error(`  ❌ Upload failed for ${filePath}: ${err.message}`);
    return null;
  }
}

async function run() {
  await connectDB();

  // Get all subdirectories
  const entries = fs.readdirSync(UPLOADS_DIR, { withFileTypes: true });
  const subDirs = entries.filter(e => e.isDirectory()).map(e => path.join(UPLOADS_DIR, e.name));

  // Collect all image files from all subdirectories
  const filesByJewelId = {};
  for (const dir of subDirs) {
    const files = fs.readdirSync(dir).filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
    for (const file of files) {
      const jewelId = extractJewelId(file);
      if (!jewelId) continue;
      if (!filesByJewelId[jewelId]) filesByJewelId[jewelId] = [];
      filesByJewelId[jewelId].push(path.join(dir, file));
    }
  }

  // Sort files per jewelId so images are in order (1), (2), (3)...
  for (const id of Object.keys(filesByJewelId)) {
    filesByJewelId[id].sort();
  }

  const jewelIds = Object.keys(filesByJewelId);
  console.log(`\nFound image groups for ${jewelIds.length} jewel IDs`);

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const jewelId of jewelIds) {
    const item = await Jewellery.findOne({ jewelId: { $regex: new RegExp(`^${jewelId}$`, 'i') } });

    if (!item) {
      console.log(`⚠ No DB entry for jewelId: ${jewelId}`);
      notFound++;
      continue;
    }

    // Skip if already has Cloudinary images
    const hasCloudinary = item.images && item.images.some(img => img.url && img.url.includes('cloudinary.com'));
    if (hasCloudinary) {
      console.log(`⏭ ${jewelId} already has Cloudinary images, skipping`);
      skipped++;
      continue;
    }

    console.log(`\n📦 Processing ${jewelId} (${item.name})...`);
    const newImages = [];
    for (const filePath of filesByJewelId[jewelId]) {
      const url = await uploadFile(filePath);
      if (url) {
        newImages.push({ type: 'image', url });
        console.log(`  ✔ ${path.basename(filePath)} → ${url}`);
      }
    }

    if (newImages.length > 0) {
      item.images = newImages;
      await item.save({ validateBeforeSave: false });
      console.log(`  💾 Saved ${newImages.length} images for ${jewelId}`);
      updated++;
    }
  }

  console.log(`\n✅ Done! Updated: ${updated}, Skipped: ${skipped}, Not in DB: ${notFound}`);
  process.exit(0);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
